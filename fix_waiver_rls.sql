-- FIX WAIVER UPLOAD RLS
-- Run this in Supabase SQL Editor

-- 1. Create waivers bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('waivers', 'waivers', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- 3. Create correct policies for waivers bucket
-- Allow anyone to upload a waiver PDF
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'waivers' );

-- Allow anyone to read waivers (needed for admin dashboard)
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
USING ( bucket_id = 'waivers' );

-- 4. Notify schema reload
NOTIFY pgrst, 'reload schema';
