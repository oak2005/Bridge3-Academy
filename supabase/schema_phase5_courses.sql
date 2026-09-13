-- Bridge3 Academy — Phase 5: Course Data Model + Seed Data
-- Run this once in Supabase → SQL Editor → New Query → paste → Run.

create table if not exists tracks (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  track_type text not null check (track_type in ('general', 'ecosystem_support', 'skill_set')),
  order_index integer not null default 0,
  -- Lets a future sponsor-specific track (Phase 14) be added or flagged
  -- without any schema change — nothing uses these columns yet.
  is_sponsor_track boolean not null default false,
  sponsor_name text,
  sponsor_logo_url text,
  -- Matches the marketing site's honest "planned partnership" framing for
  -- the Builder Track — it exists in the catalog but isn't enrollable yet.
  coming_soon boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references tracks(id) on delete cascade,
  title text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  title text not null,
  video_url text,
  duration_minutes integer,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_modules_track on modules (track_id);
create index if not exists idx_lessons_module on lessons (module_id);

alter table tracks enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;

-- Course catalog isn't sensitive — any signed-in student can browse it.
-- Nobody except an admin (Phase 11, via service role) can create, edit, or
-- delete tracks/modules/lessons — there are deliberately no write policies
-- here for regular users.
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'tracks' and policyname = 'authenticated can view tracks') then
    create policy "authenticated can view tracks" on tracks for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'modules' and policyname = 'authenticated can view modules') then
    create policy "authenticated can view modules" on modules for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'lessons' and policyname = 'authenticated can view lessons') then
    create policy "authenticated can view lessons" on lessons for select to authenticated using (true);
  end if;
end $$;

-- Seed data — matches the curriculum described on the marketing site.
-- Safe to re-run: each insert is guarded so running this twice won't
-- create duplicates.
do $$
declare
  general_id uuid;
  ecosystem_id uuid;
  designer_id uuid;
  creator_id uuid;
  community_id uuid;
  builder_id uuid;
  mod_id uuid;
begin
  if not exists (select 1 from tracks where slug = 'general-track') then
    insert into tracks (slug, title, description, track_type, order_index)
    values ('general-track', 'General Track', 'From blockchain fundamentals to practical Web3 usage.', 'general', 1)
    returning id into general_id;

    insert into modules (track_id, title, description, order_index)
    values (general_id, 'Level 1 — Foundations', 'Blockchain, Bitcoin, Web3, smart contracts, NFTs, DeFi, AI, and the crypto economy.', 1)
    returning id into mod_id;
    insert into lessons (module_id, title, duration_minutes, order_index) values
      (mod_id, 'What is Blockchain?', 12, 1),
      (mod_id, 'Bitcoin Basics', 15, 2),
      (mod_id, 'Smart Contracts 101', 14, 3);

    insert into modules (track_id, title, description, order_index)
    values (general_id, 'Level 2 — Practical Usage', 'Essential tools, ecosystem participation, security, communication, real-world application.', 2)
    returning id into mod_id;
    insert into lessons (module_id, title, duration_minutes, order_index) values
      (mod_id, 'Setting Up a Wallet Safely', 10, 1),
      (mod_id, 'Navigating a dApp', 13, 2);
  end if;

  if not exists (select 1 from tracks where slug = 'ecosystem-support-track') then
    insert into tracks (slug, title, description, track_type, order_index)
    values ('ecosystem-support-track', 'Ecosystem Support Track', 'How blockchain ecosystems work, and how decentralized applications operate.', 'ecosystem_support', 2)
    returning id into ecosystem_id;

    insert into modules (track_id, title, description, order_index)
    values (ecosystem_id, 'How Ecosystems Work', 'Ecosystem infrastructure and language basics.', 1)
    returning id into mod_id;
    insert into lessons (module_id, title, duration_minutes, order_index) values
      (mod_id, 'Understanding Decentralized Applications', 11, 1),
      (mod_id, 'Ecosystem Infrastructure Basics', 12, 2);
  end if;

  if not exists (select 1 from tracks where slug = 'designer-track') then
    insert into tracks (slug, title, description, track_type, order_index)
    values ('designer-track', 'Designer Track', 'Design skills for Web3 products and brands.', 'skill_set', 3)
    returning id into designer_id;
    insert into modules (track_id, title, order_index) values (designer_id, 'Design Fundamentals for Web3', 1) returning id into mod_id;
    insert into lessons (module_id, title, duration_minutes, order_index) values (mod_id, 'Designing for Trust and Clarity', 12, 1);
  end if;

  if not exists (select 1 from tracks where slug = 'creator-track') then
    insert into tracks (slug, title, description, track_type, order_index)
    values ('creator-track', 'Creator Track', 'Content and storytelling for Web3 audiences.', 'skill_set', 4)
    returning id into creator_id;
    insert into modules (track_id, title, order_index) values (creator_id, 'Content Fundamentals', 1) returning id into mod_id;
    insert into lessons (module_id, title, duration_minutes, order_index) values (mod_id, 'Explaining Complex Ideas Simply', 12, 1);
  end if;

  if not exists (select 1 from tracks where slug = 'community-growth-track') then
    insert into tracks (slug, title, description, track_type, order_index)
    values ('community-growth-track', 'Community & Growth Track', 'Community building and ecosystem outreach.', 'skill_set', 5)
    returning id into community_id;
    insert into modules (track_id, title, order_index) values (community_id, 'Community Fundamentals', 1) returning id into mod_id;
    insert into lessons (module_id, title, duration_minutes, order_index) values (mod_id, 'Growing a Real Community', 12, 1);
  end if;

  if not exists (select 1 from tracks where slug = 'builder-track') then
    insert into tracks (slug, title, description, track_type, order_index, coming_soon)
    values ('builder-track', 'Builder Track', 'Development-focused learning — planned partnership.', 'skill_set', 6, true)
    returning id into builder_id;
  end if;
end $$;
