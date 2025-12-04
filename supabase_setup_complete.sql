-- COMPLETE SUPABASE SETUP SCRIPT
-- Run this script in the Supabase SQL Editor to set up the entire project.

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS settings (
  id bigint PRIMARY KEY,
  hero_title text,
  hero_subtitle text,
  event_dates jsonb,
  time_slots jsonb,
  cars jsonb,
  admin_password text,
  waiver_text text,
  footer_text text,
  parental_consent_text text
);

CREATE TABLE IF NOT EXISTS registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  registration_id text,
  first_name text,
  last_name text,
  email text,
  phone text,
  car_data jsonb,
  date text,
  time_slot text,
  completed boolean DEFAULT false,
  license_verified boolean DEFAULT false,
  license_verified_by text,
  license_verified_at text,
  signature text,
  registered_at text,
  agreed_to_tos boolean DEFAULT false,
  communication_opt_in boolean DEFAULT false,
  additional_passengers jsonb DEFAULT '[]'::jsonb,
  waiver_pdf_url text
);

-- 2. Add columns if they are missing (for updates to existing tables)
-- This block ensures that if you run this on an existing DB, it adds the new columns
DO $$
BEGIN
    ALTER TABLE settings ADD COLUMN IF NOT EXISTS waiver_text text;
    ALTER TABLE settings ADD COLUMN IF NOT EXISTS footer_text text;
    ALTER TABLE settings ADD COLUMN IF NOT EXISTS parental_consent_text text;
    ALTER TABLE registrations ADD COLUMN IF NOT EXISTS additional_passengers jsonb DEFAULT '[]'::jsonb;
    ALTER TABLE registrations ADD COLUMN IF NOT EXISTS waiver_pdf_url text;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column already exists';
END $$;

-- 3. Insert Default Settings
INSERT INTO settings (id, hero_title, hero_subtitle, admin_password, waiver_text, footer_text, parental_consent_text)
VALUES (
  1,
  'Experience the Future of Driving',
  'Book your exclusive test drive today.',
  'admin123',
  'I hereby acknowledge that I am participating in a test drive event at my own risk.',
  '© 2025 Traxion Events. All rights reserved.',
  'I, the undersigned, am the parent or legal guardian of the minor named above. I hereby give my consent for them to participate in the test drive event as a passenger.'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage Setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('waivers', 'waivers', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Security Policies (RLS)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts (Clean Slate)
DROP POLICY IF EXISTS "Enable read access for all users" ON settings;
DROP POLICY IF EXISTS "Enable insert access for all users" ON settings;
DROP POLICY IF EXISTS "Enable update access for all users" ON settings;
DROP POLICY IF EXISTS "Allow public read" ON settings;
DROP POLICY IF EXISTS "Allow public insert" ON settings;
DROP POLICY IF EXISTS "Allow public update" ON settings;

DROP POLICY IF EXISTS "Enable read access for all users" ON registrations;
DROP POLICY IF EXISTS "Enable insert access for all users" ON registrations;
DROP POLICY IF EXISTS "Enable update access for all users" ON registrations;
DROP POLICY IF EXISTS "Allow public read" ON registrations;
DROP POLICY IF EXISTS "Allow public insert" ON registrations;
DROP POLICY IF EXISTS "Allow public update" ON registrations;

-- Create permissive policies
CREATE POLICY "Enable read access for all users" ON settings FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON settings FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON registrations FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON registrations FOR UPDATE USING (true);

-- Storage Policies
DROP POLICY IF EXISTS "Public Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public Read" ON storage.objects;

CREATE POLICY "Public Uploads" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'waivers' );
CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING ( bucket_id = 'waivers' );

-- 6. Reload Schema
NOTIFY pgrst, 'reload schema';
