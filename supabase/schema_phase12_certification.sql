-- Bridge3 Academy — Phase 12: Verifiable Certificates & Certification
-- Run this once in Supabase → SQL Editor → New Query → paste → Run.

-- 1. Certificates table: records each issued credential with a unique
-- verification hash and human-readable certificate number.
create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_number text not null unique,
  student_id uuid not null references profiles(id) on delete cascade,
  track_id uuid not null references tracks(id) on delete cascade,
  issued_at timestamptz not null default now(),
  verification_hash text not null unique,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  -- A student can only earn one certificate per track.
  unique(student_id, track_id)
);

-- Fast lookup indexes
create index if not exists idx_certificates_student on certificates (student_id);
create index if not exists idx_certificates_track on certificates (track_id);
create index if not exists idx_certificates_number on certificates (certificate_number);
create index if not exists idx_certificates_hash on certificates (verification_hash);

-- 2. Row Level Security
alter table certificates enable row level security;

-- Students can view their own certificates in their dashboard.
drop policy if exists "Students can view own certificates" on certificates;
create policy "Students can view own certificates"
  on certificates for select
  to authenticated
  using (auth.uid() = student_id);

-- Strangers CANNOT list all certificates. Public verification queries
-- are executed via the secure server-side route or direct ID lookups.
-- No INSERT, UPDATE, or DELETE policies for authenticated or anon roles:
-- certificates can ONLY be issued or altered through the server-side
-- service role key after verifying track completion.
