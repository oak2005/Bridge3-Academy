-- Bridge3 Academy — Phase 4: Auth & Profiles schema
-- Run this once in Supabase → SQL Editor → New Query → paste → Run.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  university text,
  role_interest text check (role_interest in ('developer', 'growth', 'creative', 'operations')),
  role text not null default 'student' check (role in ('student', 'mentor', 'admin')),
  level text check (level in ('beginner', 'intermediate', 'advanced')),
  track text check (track in ('growth', 'creative', 'operations', 'engineering')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Every signed-in person can see and edit their own profile row — and only
-- their own. Nobody can read anyone else's name, university, or role.
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'users can view their own profile') then
    create policy "users can view their own profile"
      on profiles for select
      to authenticated
      using (auth.uid() = id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'users can update their own profile') then
    create policy "users can update their own profile"
      on profiles for update
      to authenticated
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end $$;

-- Auto-create a profile the moment someone signs in with Google for the
-- first time. This runs as a trusted database function (bypassing RLS),
-- so the app never has to worry about "did the profile row get created" —
-- it always exists by the time the person lands on our callback page.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
