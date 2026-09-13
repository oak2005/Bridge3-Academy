-- Bridge3 Academy — Phase 8: Assessments (quizzes + capstone)
-- Run this once in Supabase → SQL Editor → New Query → paste → Run.

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null unique references modules(id) on delete cascade,
  title text not null,
  passing_score integer not null default 70,
  created_at timestamptz not null default now()
);

create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  question text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references quiz_questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  order_index integer not null default 0
);

create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  score integer not null,
  passed boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_quiz_questions_quiz on quiz_questions (quiz_id);
create index if not exists idx_quiz_options_question on quiz_options (question_id);
create index if not exists idx_quiz_attempts_student on quiz_attempts (student_id);

alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_options enable row level security;
alter table quiz_attempts enable row level security;

-- IMPORTANT SECURITY DECISION: quizzes, quiz_questions, and quiz_options
-- get NO select policy for anon or authenticated at all — not even for
-- reading questions. Row Level Security only restricts which ROWS a
-- policy allows, not which COLUMNS a client requests, so if we granted
-- any direct read access to quiz_options, a curious student could use
-- their own browser devtools to call Supabase's REST API directly and
-- read every is_correct flag, regardless of what our own front-end code
-- asks for. Instead, ALL quiz reading and grading goes through two
-- server-side API routes using the service role key:
--   GET  /api/quiz/by-module/[moduleId]  — returns questions+options
--                                           with is_correct stripped out
--   POST /api/quiz/submit                — grades server-side and records
--                                           the attempt
-- Only quiz_attempts gets a policy, and only for reading your own past
-- results — never for writing, since only the server can record a
-- result.
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'quiz_attempts' and policyname = 'students can view their own quiz attempts') then
    create policy "students can view their own quiz attempts"
      on quiz_attempts for select to authenticated
      using (auth.uid() = student_id);
  end if;
end $$;

-- Capstone: same insert-only-history pattern as assignment submissions.
create table if not exists capstone_submissions (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references tracks(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  file_path text,
  github_link text,
  portfolio_description text,
  status text not null default 'submitted' check (status in ('submitted', 'under_review', 'needs_revision', 'approved')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_capstone_track on capstone_submissions (track_id);
create index if not exists idx_capstone_student on capstone_submissions (student_id);

alter table capstone_submissions enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'capstone_submissions' and policyname = 'students can view their own capstone submissions') then
    create policy "students can view their own capstone submissions"
      on capstone_submissions for select to authenticated
      using (auth.uid() = student_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'capstone_submissions' and policyname = 'students can create their own capstone submissions') then
    create policy "students can create their own capstone submissions"
      on capstone_submissions for insert to authenticated
      with check (auth.uid() = student_id);
  end if;
end $$;

-- Mark which tracks actually require a capstone to be considered
-- complete. Only General Track requires one for now — this is an
-- illustrative default, easy to change per-track later via the Admin
-- Panel (Phase 11) without a schema change.
alter table tracks add column if not exists requires_capstone boolean not null default false;
update tracks set requires_capstone = true where slug = 'general-track';

-- Storage: private, per-student folders — same isolation pattern as
-- assignment submissions.
insert into storage.buckets (id, name, public)
values ('capstone-submissions', 'capstone-submissions', false)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'students can upload to their own capstone folder'
  ) then
    create policy "students can upload to their own capstone folder"
      on storage.objects for insert to authenticated
      with check (
        bucket_id = 'capstone-submissions'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'students can read their own capstone files'
  ) then
    create policy "students can read their own capstone files"
      on storage.objects for select to authenticated
      using (
        bucket_id = 'capstone-submissions'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;

-- Seed one real quiz on Level 1 — Foundations, so there's something to
-- test. 3 questions, 70% passing threshold — note that with only 3
-- questions, 2/3 correct rounds to 67%, which is BELOW 70%, so all 3
-- must be answered correctly to pass. This is correct, expected rounding
-- behavior, not a bug.
do $$
declare
  level1_module_id uuid;
  new_quiz_id uuid;
  q1_id uuid;
  q2_id uuid;
  q3_id uuid;
begin
  select id into level1_module_id from modules where title = 'Level 1 — Foundations' limit 1;

  if level1_module_id is not null and not exists (select 1 from quizzes where module_id = level1_module_id) then
    insert into quizzes (module_id, title, passing_score)
    values (level1_module_id, 'Level 1 Foundations Quiz', 70)
    returning id into new_quiz_id;

    insert into quiz_questions (quiz_id, question, order_index)
    values (new_quiz_id, 'What is a blockchain best described as?', 1)
    returning id into q1_id;
    insert into quiz_options (question_id, option_text, is_correct, order_index) values
      (q1_id, 'A single centralized database', false, 1),
      (q1_id, 'A shared, tamper-resistant ledger distributed across many computers', true, 2),
      (q1_id, 'A type of cryptocurrency', false, 3),
      (q1_id, 'A web browser', false, 4);

    insert into quiz_questions (quiz_id, question, order_index)
    values (new_quiz_id, 'What does "decentralized" mean in the context of Bitcoin?', 2)
    returning id into q2_id;
    insert into quiz_options (question_id, option_text, is_correct, order_index) values
      (q2_id, 'Controlled by one central bank', false, 1),
      (q2_id, 'No single entity controls the network', true, 2),
      (q2_id, 'Only available in one country', false, 3),
      (q2_id, 'Requires a login password', false, 4);

    insert into quiz_questions (quiz_id, question, order_index)
    values (new_quiz_id, 'What is a smart contract?', 3)
    returning id into q3_id;
    insert into quiz_options (question_id, option_text, is_correct, order_index) values
      (q3_id, 'A legal document signed on paper', false, 1),
      (q3_id, 'Self-executing code that runs automatically when conditions are met', true, 2),
      (q3_id, 'A contract only lawyers can write', false, 3),
      (q3_id, 'A type of wallet', false, 4);
  end if;
end $$;
