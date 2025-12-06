-- Event Management System Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- Step 1: Create events table
-- ============================================
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Step 2: Add event_id to registrations
-- ============================================
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id);

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);

-- ============================================
-- Step 3: Enable RLS on events table
-- ============================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for registration form to check active event)
CREATE POLICY "Enable read for all" ON events
    FOR SELECT USING (true);

-- Allow authenticated users (admins) to manage events
CREATE POLICY "Enable insert for authenticated users" ON events
    FOR INSERT TO authenticated WITH CHECK (true);
    
CREATE POLICY "Enable update for authenticated users" ON events
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for authenticated users" ON events
    FOR DELETE TO authenticated USING (true);

-- ============================================
-- Step 4: Create trigger to update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Step 5: Create default event for existing data
-- ============================================
-- Insert a "Legacy" event for any existing registrations
INSERT INTO events (name, status, start_date, end_date)
VALUES ('Legacy Registrations', 'archived', NULL, NULL)
ON CONFLICT DO NOTHING;

-- Assign existing registrations to the Legacy event
UPDATE registrations 
SET event_id = (SELECT id FROM events WHERE name = 'Legacy Registrations' LIMIT 1)
WHERE event_id IS NULL;

-- ============================================
-- Done! Your events table is ready.
-- ============================================
