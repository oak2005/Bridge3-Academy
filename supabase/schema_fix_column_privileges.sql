-- Bridge3 Academy — Fix: replace trigger-based protection with column
-- privileges (more reliable under Supabase's connection pooling)
-- Run this once in Supabase → SQL Editor → New Query → paste → Run.
--
-- WHY: the previous fix used a trigger that tried to detect "is this
-- request coming from a real end user, or from our trusted admin code"
-- by checking the database session's current role. That detection can
-- behave inconsistently depending on how Supabase's connection pooling
-- handles a given request — which is very likely why role changes were
-- silently reverting even when made through the admin panel.
--
-- This replaces that guesswork with something Postgres enforces
-- directly and unambiguously: a REAL permission rule saying "the
-- 'authenticated' and 'anon' database roles are not allowed to modify
-- these two specific columns, full stop" — regardless of pooling,
-- regardless of session state. Our admin routes use the separate
-- 'service_role' identity, which was never restricted, so they're
-- completely unaffected by this and keep working normally.

drop trigger if exists protect_profile_privileges on profiles;
drop function if exists public.protect_privileged_profile_columns();

revoke update (role, is_active) on public.profiles from authenticated;
revoke update (role, is_active) on public.profiles from anon;

-- After this, a student's own profile update (from onboarding, settings,
-- etc.) still works normally for every other column — only role and
-- is_active are now genuinely unchangeable by anyone except server-side
-- admin routes using the service role key.
