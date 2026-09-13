-- Bridge3 Academy — Phase 7: Workshop (assignments, submissions, comments)
-- Run this once in Supabase → SQL Editor → New Query → paste → Run.

create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  title text not null,
  description text,
  submission_format text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_assignments_module on assignments (module_id);

-- Each row is one submission attempt. Students only ever INSERT here —
-- never update or delete — so a resubmission creates a new row and the
-- full history is preserved. The UI always shows the most recent row as
-- "current." Status only ever changes via a mentor/admin (later phases),
-- which is why there's no update policy for students below.
create table if not exists assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  submission_text text,
  file_path text,
  status text not null default 'submitted' check (status in ('submitted', 'under_review', 'needs_revision', 'approved')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_submissions_assignment on assignment_submissions (assignment_id);
create index if not exists idx_submissions_student on assignment_submissions (student_id);

-- Peer discussion — visible to every signed-in student, not just the
-- assignment's own submitter. Genuinely public within the platform, unlike
-- submissions themselves.
create table if not exists assignment_comments (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_comments_assignment on assignment_comments (assignment_id);

alter table assignments enable row level security;
alter table assignment_submissions enable row level security;
alter table assignment_comments enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'assignments' and policyname = 'authenticated can view assignments') then
    create policy "authenticated can view assignments"
      on assignments for select to authenticated using (true);
  end if;

  -- Submissions: a student can see and create only their OWN rows. This
  -- is the important privacy boundary — nobody can read another
  -- student's actual submitted work.
  if not exists (select 1 from pg_policies where tablename = 'assignment_submissions' and policyname = 'students can view their own submissions') then
    create policy "students can view their own submissions"
      on assignment_submissions for select to authenticated
      using (auth.uid() = student_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'assignment_submissions' and policyname = 'students can create their own submissions') then
    create policy "students can create their own submissions"
      on assignment_submissions for insert to authenticated
      with check (auth.uid() = student_id);
  end if;

  -- Comments: readable by everyone signed in (genuine peer discussion),
  -- but you can only ever post as yourself.
  if not exists (select 1 from pg_policies where tablename = 'assignment_comments' and policyname = 'authenticated can view comments') then
    create policy "authenticated can view comments"
      on assignment_comments for select to authenticated using (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'assignment_comments' and policyname = 'students can post their own comments') then
    create policy "students can post their own comments"
      on assignment_comments for insert to authenticated
      with check (auth.uid() = student_id);
  end if;
end $$;

-- Storage: private bucket, and each student can only read/write inside
-- their OWN folder (path must start with their own user id) — this is
-- stricter than the earlier buckets, since assignment work is personal.
insert into storage.buckets (id, name, public)
values ('assignment-submissions', 'assignment-submissions', false)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'students can upload to their own submission folder'
  ) then
    create policy "students can upload to their own submission folder"
      on storage.objects for insert to authenticated
      with check (
        bucket_id = 'assignment-submissions'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'students can read their own submission files'
  ) then
    create policy "students can read their own submission files"
      on storage.objects for select to authenticated
      using (
        bucket_id = 'assignment-submissions'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;

-- Seed two sample assignments so there's something real to test against.
do $$
declare
  level1_module_id uuid;
  level2_module_id uuid;
begin
  select id into level1_module_id from modules where title = 'Level 1 — Foundations' limit 1;
  select id into level2_module_id from modules where title = 'Level 2 — Practical Usage' limit 1;

  if level1_module_id is not null and not exists (select 1 from assignments where title = 'Reflect on What You Learned') then
    insert into assignments (module_id, title, description, submission_format, order_index)
    values (
      level1_module_id,
      'Reflect on What You Learned',
      'In your own words, explain one concept from Level 1 that made the most sense to you, and one that''s still confusing.',
      'Write a short reflection (150+ words), or share a link to notes you took.',
      1
    );
  end if;

  if level2_module_id is not null and not exists (select 1 from assignments where title = 'Set Up Your Wallet') then
    insert into assignments (module_id, title, description, submission_format, order_index)
    values (
      level2_module_id,
      'Set Up Your Wallet',
      'Set up a wallet following safe practices from this module, and describe the steps you took.',
      'Describe your process in text, or upload a screenshot of your wallet (with no sensitive info visible).',
      1
    );
  end if;
end $$;
