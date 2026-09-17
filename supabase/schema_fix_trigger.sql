-- Bridge3 Academy — Fix: privilege-escalation trigger was too strict
-- Run this once in Supabase → SQL Editor → New Query → paste → Run.
--
-- BUG: the original trigger (schema_phase11_admin.sql) only recognized
-- the app's own service_role connections as "safe" and reset role/
-- is_active on anything else — including your own manual updates run
-- directly in the SQL Editor, since that runs as Postgres's superuser
-- ("postgres"), a different identity than "service_role". That silently
-- reverted your own admin promotion.
--
-- FIX: only block the specific case this trigger actually needs to
-- block — an update arriving through the app as a logged-in end user
-- (Postgres role "authenticated", the identity Supabase's API layer
-- assigns to every signed-in request). Anything else — the SQL Editor,
-- the service role, etc. — is left alone, exactly as intended.

create or replace function public.protect_privileged_profile_columns()
returns trigger as $$
begin
  if current_setting('role', true) = 'authenticated' then
    new.role := old.role;
    new.is_active := old.is_active;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- The trigger itself doesn't need to change, just the function it calls
-- — but this confirms it's still attached correctly.
drop trigger if exists protect_profile_privileges on profiles;
create trigger protect_profile_privileges
  before update on profiles
  for each row execute procedure public.protect_privileged_profile_columns();

-- Now retry making yourself admin — this will actually stick this time:
--   update profiles set role = 'admin' where id = 'PASTE-YOUR-ID-HERE';
