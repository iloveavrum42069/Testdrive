-- Quick fix for event_settings RLS policies
-- Run this in Supabase SQL Editor

-- First, check if RLS is enabled and drop existing policies
DO $$
BEGIN
    -- Drop any existing policies that might be conflicting
    DROP POLICY IF EXISTS "Enable read for all" ON event_settings;
    DROP POLICY IF EXISTS "Enable insert for authenticated" ON event_settings;
    DROP POLICY IF EXISTS "Enable update for authenticated" ON event_settings;
    DROP POLICY IF EXISTS "Enable delete for authenticated" ON event_settings;
END $$;

-- Ensure RLS is enabled
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;

-- Create very permissive policies to fix the 406 error
-- Allow everyone to read
CREATE POLICY "event_settings_select_all" ON event_settings
    FOR SELECT USING (true);

-- Allow authenticated users to do everything
CREATE POLICY "event_settings_insert_auth" ON event_settings
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "event_settings_update_auth" ON event_settings
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "event_settings_delete_auth" ON event_settings
    FOR DELETE TO authenticated USING (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'event_settings';
