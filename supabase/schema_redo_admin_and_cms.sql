-- ==============================================================================
-- Bridge3 Academy — Master Fix & Redo: Admin Security, Site CMS, & Waitlist Tasks
-- Run this once in Supabase → SQL Editor → New Query → paste → Run.
-- ==============================================================================

-- 1. PERMANENTLY REMOVE FAULTY TRIGGER CAUSING ROLE/STATUS REVERSIONS
-- The previous trigger used a SECURITY DEFINER function with a role check that
-- failed under connection pooling, silently undoing updates to role & is_active.
drop trigger if exists protect_profile_privileges on profiles;
drop function if exists public.protect_privileged_profile_columns();

-- Ensure profiles has is_active flag
alter table profiles add column if not exists is_active boolean not null default true;

-- 2. SITE SETTINGS & BRANDING CMS TABLE
create table if not exists site_settings (
  id text primary key default 'default_settings',
  logo_text text not null default 'Bridge3 Academy',
  logo_url text,
  hero_headline text not null default 'Africa’s first structured Web3 education Platform.',
  hero_subheadline text not null default 'From zero knowledge to verified certification. Learn blockchain, DeFi, smart contracts, and career-ready Web3 skills without tutorial chaos.',
  hero_cta_text text not null default 'Join Early Access',
  hero_announcement text not null default 'Early members receive priority verification and scholarship consideration.',
  illustration_url text,
  illustration_caption text default 'Web3 Academy Ecosystem',
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles(id) on delete set null
);

-- Seed default site settings if not present
insert into site_settings (id, logo_text, hero_headline, hero_subheadline, hero_cta_text, hero_announcement)
values (
  'default_settings',
  'Bridge3 Academy',
  'Africa’s first structured Web3 education Platform.',
  'From zero knowledge to verified certification. Learn blockchain, DeFi, smart contracts, and career-ready Web3 skills without tutorial chaos.',
  'Join Early Access',
  'Early members receive priority verification and scholarship consideration.'
)
on conflict (id) do nothing;

alter table site_settings enable row level security;

-- Allow public read of site settings
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'site_settings' and policyname = 'public can read site settings') then
    create policy "public can read site settings" on site_settings for select using (true);
  end if;
end $$;

-- 3. DYNAMIC WAITLIST TASKS TABLE
create table if not exists waitlist_tasks (
  id text primary key,
  title text not null,
  description text not null,
  action_url text,
  action_label text,
  input_type text not null default 'username', -- 'username', 'url', 'screenshot', 'none'
  input_placeholder text,
  weight integer not null default 25,
  is_active boolean not null default true,
  is_system boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table waitlist_tasks enable row level security;

-- Allow public read of active waitlist tasks
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'waitlist_tasks' and policyname = 'public can read active waitlist tasks') then
    create policy "public can read active waitlist tasks" on waitlist_tasks for select using (is_active = true);
  end if;
end $$;

-- Seed default verification tasks
insert into waitlist_tasks (id, title, description, action_url, action_label, input_type, input_placeholder, weight, is_active, is_system, display_order)
values
  ('confirm_email', 'Confirm email', 'Check your inbox for the confirmation link — automatic verification.', null, null, 'none', null, 25, true, true, 1),
  ('telegram', 'Join Telegram community', 'Connect with fellow scholars, mentors, and receive official announcements.', 'https://t.me/Bridge3Academy', 'Open Telegram Channel', 'username', '@your_telegram_username', 25, true, false, 2),
  ('x_twitter', 'Follow X (Twitter)', 'Follow @Bridge3Academy on X for announcements and ecosystem updates.', 'https://x.com/Bridge3Academy', 'Follow on X', 'username', '@your_x_handle', 25, true, false, 3),
  ('referral', 'Share with 3 friends', 'Invite fellow learners. Generates your personal invite code and counts verified signups.', null, null, 'none', null, 25, true, true, 4)
on conflict (id) do nothing;

-- 4. WAITLIST SUBMISSIONS: RELAX TASK TYPE CONSTRAINT
-- Allow submissions for any dynamic task (e.g. discord, youtube, custom)
alter table waitlist_verification_submissions drop constraint if exists waitlist_verification_submissions_task_type_check;

-- Ensure indexes exist
create index if not exists idx_waitlist_tasks_order on waitlist_tasks (display_order asc);
create index if not exists idx_verification_submissions_task_type on waitlist_verification_submissions (task_type);
