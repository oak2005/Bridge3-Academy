-- Bridge3 Academy — Round 2: Lesson Audio Support (Phase 4)
-- Run this in Supabase SQL Editor

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS audio_path text;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS audio_generated_at timestamptz;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS audio_notes_hash text;

-- Storage bucket for lesson audio
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-audio', 'lesson-audio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy to allow anyone authenticated/public to read audio files
CREATE POLICY "Public read for lesson audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-audio');

-- Policy for admin/service-role to upload/modify audio
CREATE POLICY "Admin upload for lesson audio"
ON storage.objects FOR ALL
USING (bucket_id = 'lesson-audio');
