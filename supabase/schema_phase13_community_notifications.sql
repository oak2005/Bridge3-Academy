-- Bridge3 Academy — Phase 13: Community & Notifications
-- Run this once in Supabase → SQL Editor → New Query → paste → Run.

-- 1. Notifications Table: records real-time alerts for students when
-- assignments are reviewed, capstones approved, certificates issued,
-- or platform announcements posted.
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('mentor_approval', 'mentor_revision', 'certificate_issued', 'announcement', 'system')),
  link_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_lookup
  on notifications (user_id, is_read, created_at desc);

-- 2. Community Announcements Table: broadcasts from team and mentors.
create table if not exists community_announcements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete set null,
  title text not null,
  content text not null,
  category text not null default 'general' check (category in ('general', 'workshop', 'hackathon', 'ama', 'update')),
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_announcements_ordering
  on community_announcements (pinned desc, created_at desc);

-- 3. Row Level Security
alter table notifications enable row level security;
alter table community_announcements enable row level security;

-- Notifications: users can only see and update their own notifications
drop policy if exists "Users can view own notifications" on notifications;
create policy "Users can view own notifications"
  on notifications for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on notifications;
create policy "Users can update own notifications"
  on notifications for update
  to authenticated
  using (auth.uid() = user_id);

-- Announcements: everyone signed in can read announcements
drop policy if exists "Anyone can read announcements" on community_announcements;
create policy "Anyone can read announcements"
  on community_announcements for select
  to authenticated
  using (true);

-- Mentors and admins can post announcements
drop policy if exists "Mentors and admins can insert announcements" on community_announcements;
create policy "Mentors and admins can insert announcements"
  on community_announcements for insert
  to authenticated
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('mentor', 'admin')
    )
  );

-- 4. Automated Database Triggers for Instant Notifications

-- A. Trigger: Notify student on assignment review (approval or revision request)
create or replace function public.notify_assignment_review()
returns trigger as $$
declare
  v_assignment_title text;
begin
  if (old.status is distinct from new.status) and (new.status in ('approved', 'needs_revision')) then
    select title into v_assignment_title from assignments where id = new.assignment_id;
    insert into notifications (user_id, title, message, type, link_url)
    values (
      new.student_id,
      case when new.status = 'approved' then 'Assignment Approved! 🎉' else 'Assignment Feedback Received 📝' end,
      case when new.status = 'approved'
        then 'Your submission for "' || coalesce(v_assignment_title, 'Assignment') || '" was approved by a mentor.'
        else 'A mentor requested revisions on "' || coalesce(v_assignment_title, 'Assignment') || '". Check your feedback.'
      end,
      case when new.status = 'approved' then 'mentor_approval' else 'mentor_revision' end,
      '/dashboard/workshops/' || new.assignment_id
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_notify_assignment_review on assignment_submissions;
create trigger trg_notify_assignment_review
  after update on assignment_submissions
  for each row execute procedure public.notify_assignment_review();

-- B. Trigger: Notify student on capstone review
create or replace function public.notify_capstone_review()
returns trigger as $$
declare
  v_track_title text;
begin
  if (old.status is distinct from new.status) and (new.status in ('approved', 'needs_revision')) then
    select title into v_track_title from tracks where id = new.track_id;
    insert into notifications (user_id, title, message, type, link_url)
    values (
      new.student_id,
      case when new.status = 'approved' then 'Capstone Approved! 🏆' else 'Capstone Revision Needed 📝' end,
      case when new.status = 'approved'
        then 'Your capstone project for "' || coalesce(v_track_title, 'Track') || '" was approved by a mentor.'
        else 'Your capstone project for "' || coalesce(v_track_title, 'Track') || '" requires revisions. Check feedback.'
      end,
      case when new.status = 'approved' then 'mentor_approval' else 'mentor_revision' end,
      '/dashboard/assessments/capstone/' || new.track_id
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_notify_capstone_review on capstone_submissions;
create trigger trg_notify_capstone_review
  after update on capstone_submissions
  for each row execute procedure public.notify_capstone_review();

-- C. Trigger: Notify student on certificate issuance
create or replace function public.notify_certificate_issued()
returns trigger as $$
declare
  v_track_title text;
begin
  select title into v_track_title from tracks where id = new.track_id;
  insert into notifications (user_id, title, message, type, link_url)
  values (
    new.student_id,
    'Certificate Issued! 🎓',
    'Congratulations! Your official certificate for "' || coalesce(v_track_title, 'Track') || '" is now available to view, share, and print.',
    'certificate_issued',
    '/certificates/' || new.id
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_notify_certificate_issued on certificates;
create trigger trg_notify_certificate_issued
  after insert on certificates
  for each row execute procedure public.notify_certificate_issued();

-- 5. Seed initial welcome announcements
insert into community_announcements (title, content, category, pinned)
values
  (
    'Welcome to Bridge3 Academy Community!',
    'Connect with fellow African Web3 builders, share your assignment progress, and join our weekly live sessions. Check out the study groups below!',
    'general',
    true
  ),
  (
    'Weekly Twitter Space & Mentor AMA',
    'Join us every Thursday at 6:00 PM UTC on X Spaces for live walkthroughs on Clarity smart contracts, wallet security, and developer Q&A.',
    'ama',
    false
  )
on conflict do nothing;
