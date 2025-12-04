-- COMPREHENSIVE RLS FIX
-- Run this in Supabase SQL Editor

-- 1. WAIVERS BUCKET FIX
INSERT INTO storage.buckets (id, name, public)
VALUES ('waivers', 'waivers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop all existing policies for waivers to start fresh
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Give me access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;

-- Create permissive policies for waivers
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'waivers' );

CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
USING ( bucket_id = 'waivers' );

CREATE POLICY "Allow public updates"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'waivers' );

-- 2. REGISTRATIONS TABLE FIX (Just in case)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for everyone" ON registrations;
DROP POLICY IF EXISTS "Enable read for everyone" ON registrations;

CREATE POLICY "Enable insert for everyone"
ON registrations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable read for everyone"
ON registrations FOR SELECT
USING (true);

-- 3. EDGE FUNCTION PERMISSIONS
-- Allow anon key to invoke edge functions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
