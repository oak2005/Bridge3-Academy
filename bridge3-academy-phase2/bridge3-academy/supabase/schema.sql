-- Bridge3 Academy — Phase 2: Waitlist & Verification schema
-- Run this once in Supabase → SQL Editor → New Query → paste → Run.

create extension if not exists "pgcrypto";

-- One row per waitlist signup.
create table if not exists waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  email_confirmed boolean not null default false,
  confirmation_token uuid not null default gen_random_uuid(),
  referred_by uuid references waitlist_signups(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_waitlist_signups_referred_by
  on waitlist_signups (referred_by);

-- Safety net: if you already ran an earlier version of this script before
-- referrals existed, this adds the column without touching anything else.
alter table waitlist_signups
  add column if not exists referred_by uuid references waitlist_signups(id);

-- One row per verification task submission. "Share with 3 friends" is NOT
-- stored here — it's tracked automatically by counting confirmed signups
-- with referred_by = this person's id (see /api/waitlist/status), since
-- that's objectively verifiable from our own data with no manual review
-- and no external API needed. Only Telegram and X still need a human to
-- check them, since we can't verify those for free.
create table if not exists waitlist_verification_submissions (
  id uuid primary key default gen_random_uuid(),
  waitlist_signup_id uuid not null references waitlist_signups(id) on delete cascade,
  task_type text not null check (task_type in ('telegram', 'x_twitter')),
  submission_text text,
  screenshot_path text,
  status text not null default 'pending_review' check (status in ('pending_review', 'verified', 'rejected')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_verification_submissions_signup
  on waitlist_verification_submissions (waitlist_signup_id);

-- Row Level Security: locked down by default. Every read and write to
-- these two tables happens through server-side API routes using the
-- service role key (which bypasses RLS), never directly from the browser.
-- That means we deliberately add NO policies here — the tables are fully
-- closed to the public anon key, which is the safest default for anything
-- holding email addresses and review status.
alter table waitlist_signups enable row level security;
alter table waitlist_verification_submissions enable row level security;

-- Storage: the browser DOES upload screenshots directly to Supabase
-- Storage (not through our server), so this one policy allows that —
-- uploads only, no public listing or reading of other people's files.
-- Create the "waitlist-verification" bucket first (see README), then run:
insert into storage.buckets (id, name, public)
values ('waitlist-verification', 'waitlist-verification', false)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'anon can upload waitlist verification files'
  ) then
    create policy "anon can upload waitlist verification files"
      on storage.objects for insert
      to anon
      with check (bucket_id = 'waitlist-verification');
  end if;
end $$;
