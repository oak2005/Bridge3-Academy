-- Bridge3 Academy — Round 2: Guided Tour Migration (Phase 7)
-- Run this in Supabase SQL Editor

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tour_completed_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_profiles_tour_completed ON profiles(tour_completed_at);
