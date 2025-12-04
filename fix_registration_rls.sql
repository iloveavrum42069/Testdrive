-- FINAL RLS FIX FOR REGISTRATIONS
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on registrations table (if not already)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable insert for everyone" ON registrations;
DROP POLICY IF EXISTS "Enable read for everyone" ON registrations;
DROP POLICY IF EXISTS "Allow public insert registrations" ON registrations;
DROP POLICY IF EXISTS "Allow public read registrations" ON registrations;
DROP POLICY IF EXISTS "Public Insert" ON registrations;
DROP POLICY IF EXISTS "Public Read" ON registrations;

-- 3. Create permissive policies for registrations
-- Allow anyone to insert a new registration
CREATE POLICY "Allow public insert registrations"
ON registrations FOR INSERT
WITH CHECK (true);

-- Allow anyone to read registrations (needed for duplicate checks/admin)
CREATE POLICY "Allow public read registrations"
ON registrations FOR SELECT
USING (true);

-- Allow anyone to update registrations (needed for admin dashboard)
CREATE POLICY "Allow public update registrations"
ON registrations FOR UPDATE
USING (true);

-- Allow anyone to delete registrations (needed for admin dashboard)
CREATE POLICY "Allow public delete registrations"
ON registrations FOR DELETE
USING (true);

-- 4. Notify schema reload
NOTIFY pgrst, 'reload schema';
