-- Bridge3 Academy — Security hardening for Supabase Security Advisor warnings
-- Run this once in Supabase → SQL Editor → New Query → paste → Run.
--
-- CONTEXT: Supabase's Security Advisor flags our two SECURITY DEFINER
-- functions as "publicly executable." Both genuinely NEED to be
-- SECURITY DEFINER to do their jobs:
--   - handle_new_user() creates a profile row on signup
--   - protect_privileged_profile_columns() blocks role/is_active edits
-- The valid part of the warning is that nothing should be able to CALL
-- them directly. They're only ever meant to fire as triggers, which
-- happens regardless of these permissions. So we revoke direct execute
-- access from everyone — the triggers keep working exactly as before.

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

revoke all on function public.protect_privileged_profile_columns() from public;
revoke all on function public.protect_privileged_profile_columns() from anon;
revoke all on function public.protect_privileged_profile_columns() from authenticated;

-- After running this, go back to Security Advisor and click "Rerun
-- linter" — those four warnings should clear.
--
-- The fifth warning, "Leaked Password Protection Disabled," does NOT
-- apply to this project: it's about Supabase checking passwords against
-- known-breached password lists. Bridge3 Academy uses Google sign-in
-- only — no passwords are ever created or stored here — so there's
-- nothing for that feature to protect. Safe to ignore, or enable it
-- anyway under Authentication → Policies if you'd rather silence the
-- warning (it costs nothing either way).
