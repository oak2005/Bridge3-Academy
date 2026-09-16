-- Bridge3 Academy — Phase 11 (Part 1): Admin panel foundations
-- Run this once in Supabase → SQL Editor → New Query → paste → Run.

-- Deactivation: a soft flag rather than deleting the account, so a
-- deactivated student's submissions and history stay intact.
alter table profiles add column if not exists is_active boolean not null default true;

-- Audit log: every role change and (later) content deletion is recorded
-- here with who did it and when. Insert-only by design — nothing in the
-- app ever updates or deletes these rows.
create table if not exists admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references profiles(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  details text,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_created on admin_audit_log (created_at desc);

alter table admin_audit_log enable row level security;
-- No policies at all: only server-side routes using the service role key
-- can read or write the audit log. A compromised student session can't
-- read it, and nothing client-side can forge an entry.

-- CRITICAL SECURITY FIX: profiles already had a policy letting a user
-- update their own row (added in Phase 4 so students could save their
-- own onboarding answers). That policy would also let a student set
-- their OWN role to 'admin' by calling Supabase directly from their
-- browser — a real privilege-escalation hole.
--
-- The fix is a trigger rather than a stricter RLS policy: an RLS check
-- can't reliably compare a row's OLD vs NEW values, but a trigger can.
-- This silently preserves the existing role/is_active on any update
-- that doesn't come from the service role, so a student editing their
-- own profile simply cannot change those two columns no matter what
-- they send.
create or replace function public.protect_privileged_profile_columns()
returns trigger as $$
begin
  -- The service role (used only by our server-side admin routes)
  -- bypasses this check; everyone else keeps their existing values.
  if current_setting('role', true) is distinct from 'service_role' then
    new.role := old.role;
    new.is_active := old.is_active;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists protect_profile_privileges on profiles;
create trigger protect_profile_privileges
  before update on profiles
  for each row execute procedure public.protect_privileged_profile_columns();

-- To create your FIRST admin (there's deliberately no way to do this
-- through the app — see README), run this once with your own user id:
--   update profiles set role = 'admin' where id = 'YOUR-USER-ID-HERE';
