-- Bridge3 Academy — Round 2: Waitlist Referrals & XP Bridge (Phase 6)
-- Run this in Supabase SQL Editor

-- 1. Add referral_code and normalized_email to waitlist_signups
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS normalized_email text;

-- 2. Backfill referral codes for existing rows
UPDATE waitlist_signups 
SET referral_code = 'B3-' || UPPER(SUBSTRING(MD5(id::text || email) FROM 1 FOR 6))
WHERE referral_code IS NULL;

-- 3. Backfill normalized email for existing rows
UPDATE waitlist_signups
SET normalized_email = LOWER(email)
WHERE normalized_email IS NULL;

-- Create indexes on waitlist_signups
CREATE INDEX IF NOT EXISTS idx_waitlist_referral_code ON waitlist_signups(referral_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_normalized_email ON waitlist_signups(normalized_email);
CREATE INDEX IF NOT EXISTS idx_waitlist_referred_by ON waitlist_signups(referred_by);

-- 4. Ensure email and waitlist_signup_id columns exist on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS waitlist_signup_id uuid REFERENCES waitlist_signups(id);

-- Backfill profile email from auth.users if currently null
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND p.email IS NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_waitlist_signup ON profiles(waitlist_signup_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 5. Backfill profiles with waitlist_signup_id matching by email
UPDATE profiles p
SET waitlist_signup_id = w.id
FROM waitlist_signups w
WHERE LOWER(p.email) = LOWER(w.email)
  AND p.waitlist_signup_id IS NULL;

-- 6. Enhance handle_new_user trigger function to auto-link waitlist_signup_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  matching_waitlist_id uuid;
BEGIN
  -- Look for matching waitlist signup by normalized email
  SELECT id INTO matching_waitlist_id
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
    'student',
    matching_waitlist_id
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    waitlist_signup_id = COALESCE(profiles.waitlist_signup_id, matching_waitlist_id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
