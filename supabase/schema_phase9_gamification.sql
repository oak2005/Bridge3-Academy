-- Bridge3 Academy — Phase 9: Portfolio links
-- Run this once in Supabase → SQL Editor → New Query → paste → Run.

-- Students fully own and curate this list themselves — unlike submission
-- history, these are just links they choose to display publicly, so full
-- create/update/delete by the owner is appropriate here (not insert-only).
create table if not exists portfolio_links (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  label text not null,
  url text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_portfolio_links_student on portfolio_links (student_id);

alter table portfolio_links enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'portfolio_links' and policyname = 'students can view their own portfolio links') then
    create policy "students can view their own portfolio links"
      on portfolio_links for select to authenticated
      using (auth.uid() = student_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'portfolio_links' and policyname = 'students can create their own portfolio links') then
    create policy "students can create their own portfolio links"
      on portfolio_links for insert to authenticated
      with check (auth.uid() = student_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'portfolio_links' and policyname = 'students can update their own portfolio links') then
    create policy "students can update their own portfolio links"
      on portfolio_links for update to authenticated
      using (auth.uid() = student_id)
      with check (auth.uid() = student_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'portfolio_links' and policyname = 'students can delete their own portfolio links') then
    create policy "students can delete their own portfolio links"
      on portfolio_links for delete to authenticated
      using (auth.uid() = student_id);
  end if;
end $$;

-- Note: the PUBLIC portfolio page (anyone, no login) and the leaderboard
-- both need to show OTHER students' names, badges, and XP — which the RLS
-- policies throughout this project deliberately do not allow directly.
-- Both are served through server-side API routes using the service role
-- key instead (see app/api/portfolio and app/api/leaderboard), which
-- return only the specific, deliberately-public fields — never raw
-- submission content, emails, or anything else private.
