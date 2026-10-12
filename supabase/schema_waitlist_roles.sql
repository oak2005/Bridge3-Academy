-- ==============================================================================
-- Bridge3 Academy — Waitlist Role Assignment (Admin & Mentor in Supabase)
-- Run this in Supabase → SQL Editor → New Query → paste → Run.
-- ==============================================================================

-- 1. Add 'role' column to waitlist_signups with allowed values ('student', 'mentor', 'admin')
ALTER TABLE waitlist_signups 
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'student' 
CHECK (role IN ('student', 'mentor', 'admin'));

-- 2. Index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_signups_role ON waitlist_signups(role);

-- 3. Update the handle_new_user trigger so that when a waitlist user logs in
-- with Google for the first time, their profile automatically inherits any
-- admin or mentor role you assigned them in Supabase waitlist_signups.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  matching_waitlist_id uuid;
  matching_waitlist_role text;
BEGIN
  -- Look for matching waitlist signup by normalized email
  SELECT id, role INTO matching_waitlist_id, matching_waitlist_role
  FROM public.waitlist_signups
  WHERE LOWER(email) = LOWER(new.email)
  ORDER BY created_at ASC
  LIMIT 1;

  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, waitlist_signup_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Student'),
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(matching_waitlist_role, 'student'),
    matching_waitlist_id
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    role = CASE 
      -- Keep existing staff role if already admin or mentor
      WHEN profiles.role IN ('admin', 'mentor') THEN profiles.role
      -- Otherwise inherit whatever role was set in waitlist_signups
      WHEN matching_waitlist_role IN ('admin', 'mentor') THEN matching_waitlist_role
      ELSE profiles.role 
    END,
    waitlist_signup_id = COALESCE(profiles.waitlist_signup_id, matching_waitlist_id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Sync existing waitlist roles to profiles for any users who already signed in
UPDATE profiles p
SET role = w.role
FROM waitlist_signups w
WHERE LOWER(p.email) = LOWER(w.email)
  AND w.role IN ('admin', 'mentor')
  AND p.role = 'student';
