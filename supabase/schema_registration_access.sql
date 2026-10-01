-- ==============================================================================
-- Bridge3 Academy — Registration Gate & Access Control Setup
-- Run this once in Supabase → SQL Editor → New Query → paste → Run.
-- ==============================================================================

-- 1. Create site_settings table if it doesn't already exist
CREATE TABLE IF NOT EXISTS site_settings (
  id text PRIMARY KEY DEFAULT 'default_settings',
  logo_text text NOT NULL DEFAULT 'Bridge3 Academy',
  logo_url text,
  hero_headline text NOT NULL DEFAULT 'Africa’s first structured Web3 education Platform.',
  hero_subheadline text NOT NULL DEFAULT 'From zero knowledge to verified certification. Learn blockchain, DeFi, smart contracts, and career-ready Web3 skills without tutorial chaos.',
  hero_cta_text text NOT NULL DEFAULT 'Join Early Access',
  hero_announcement text NOT NULL DEFAULT 'Early members receive priority verification and scholarship consideration.',
  illustration_url text,
  illustration_caption text DEFAULT 'Web3 Academy Ecosystem',
  registration_open boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- 2. Add registration_open column if table already existed without it
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS registration_open BOOLEAN NOT NULL DEFAULT false;

-- 3. Seed default_settings row with registration_open = false
INSERT INTO site_settings (id, logo_text, hero_headline, hero_subheadline, hero_cta_text, hero_announcement, registration_open)
VALUES (
  'default_settings',
  'Bridge3 Academy',
  'Africa’s first structured Web3 education Platform.',
  'From zero knowledge to verified certification. Learn blockchain, DeFi, smart contracts, and career-ready Web3 skills without tutorial chaos.',
  'Join Early Access',
  'Early members receive priority verification and scholarship consideration.',
  false
)
ON CONFLICT (id) DO UPDATE SET
  registration_open = COALESCE(site_settings.registration_open, false);

-- 4. Enable Row Level Security and allow public read
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'public can read site settings') THEN
    CREATE POLICY "public can read site settings" ON site_settings FOR SELECT USING (true);
  END IF;
END $$;
