-- Bridge3 Academy — Phase 10: Mentor feedback
-- Run this once in Supabase → SQL Editor → New Query → paste → Run.

alter table assignment_submissions add column if not exists feedback text;
alter table capstone_submissions add column if not exists feedback text;

-- No new RLS policies needed here. Mentor routes read and write across
-- ALL students' submissions, which would require loosening the existing
-- "students can only see their own rows" policies — instead, every
-- mentor action goes through server-side API routes using the service
-- role key (which bypasses RLS entirely), after verifying the caller's
-- profile.role is actually 'mentor' or 'admin'. See
-- lib/auth/verifyMentor.ts and app/api/mentor/*.
--
-- To promote a test account to mentor (no admin panel exists yet, so this
-- is manual and deliberate):
--   1. Table Editor → profiles → find the row for the account you want
--      to promote (match by full_name, or open auth.users to find the
--      email → id mapping if needed).
--   2. Edit that row's "role" column from "student" to "mentor".
-- Or run this directly, replacing the id:
--   update profiles set role = 'mentor' where id = '00000000-0000-0000-0000-000000000000';
