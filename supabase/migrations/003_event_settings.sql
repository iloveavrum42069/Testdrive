-- Event-Specific Settings Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- Step 1: Create event_settings table
-- ============================================
-- Each event can have its own settings (cars, dates, time slots, etc.)
CREATE TABLE IF NOT EXISTS event_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    hero_title TEXT,
    hero_subtitle TEXT,
    footer_text TEXT,
    waiver_text TEXT,
    parental_consent_text TEXT,
    event_dates TEXT[] DEFAULT '{}',
    time_slots TEXT[] DEFAULT '{}',
    cars JSONB DEFAULT '[]',
    completion_sms_enabled BOOLEAN DEFAULT false,
    completion_sms_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id)
);

-- ============================================
-- Step 2: Add is_primary column to events
-- ============================================
-- Only one event can be primary at a time (the "active" event users see)
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;

-- Create partial unique index to ensure only one primary event
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_single_primary 
ON events (is_primary) WHERE is_primary = true;

-- ============================================
-- Step 3: Add folder column to registrations
-- ============================================
-- Virtual folders for organizing registrations
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS folder TEXT;
CREATE INDEX IF NOT EXISTS idx_registrations_folder ON registrations(folder);

-- ============================================
-- Step 4: Enable RLS on event_settings
-- ============================================
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read event_settings (needed for public registration page)
CREATE POLICY "Enable read for all" ON event_settings
    FOR SELECT USING (true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Enable insert for authenticated" ON event_settings
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated" ON event_settings
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for authenticated" ON event_settings
    FOR DELETE TO authenticated USING (true);

-- ============================================
-- Step 5: Prevent deletion of archived registrations
-- ============================================
-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Prevent delete of archived registrations" ON registrations;

CREATE POLICY "Prevent delete of archived registrations" ON registrations
    FOR DELETE TO authenticated
    USING (
        -- Allow delete only if the event is NOT archived
        NOT EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = registrations.event_id 
            AND events.status = 'archived'
        )
        -- Also allow if no event_id (legacy registrations)
        OR event_id IS NULL
    );

-- ============================================
-- Step 6: Prevent updates to archived registrations
-- ============================================
DROP POLICY IF EXISTS "Prevent update of archived registrations" ON registrations;

CREATE POLICY "Prevent update of archived registrations" ON registrations
    FOR UPDATE TO authenticated
    USING (
        NOT EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = registrations.event_id 
            AND events.status = 'archived'
        )
        OR event_id IS NULL
    );

-- ============================================
-- Step 7: Create trigger to update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_event_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_event_settings_updated_at ON event_settings;
CREATE TRIGGER update_event_settings_updated_at
    BEFORE UPDATE ON event_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_event_settings_updated_at();

-- ============================================
-- Step 8: Migrate existing global settings to first active event
-- ============================================
-- Copy current global settings to the first active event's event_settings
DO $$
DECLARE
    active_event_id UUID;
    current_settings RECORD;
BEGIN
    -- Get first active event
    SELECT id INTO active_event_id FROM events WHERE status = 'active' LIMIT 1;
    
    -- If we have an active event, copy global settings
    IF active_event_id IS NOT NULL THEN
        -- Get current global settings (only the columns that exist)
        SELECT 
            hero_title,
            hero_subtitle,
            footer_text,
            waiver_text,
            parental_consent_text,
            event_dates,
            time_slots,
            cars
        INTO current_settings FROM settings LIMIT 1;
        
        IF current_settings IS NOT NULL THEN
            INSERT INTO event_settings (
                event_id,
                hero_title,
                hero_subtitle,
                footer_text,
                waiver_text,
                parental_consent_text,
                event_dates,
                time_slots,
                cars
            ) VALUES (
                active_event_id,
                current_settings.hero_title,
                current_settings.hero_subtitle,
                current_settings.footer_text,
                current_settings.waiver_text,
                current_settings.parental_consent_text,
                -- Convert JSONB array to TEXT[] array
                ARRAY(SELECT jsonb_array_elements_text(current_settings.event_dates)),
                ARRAY(SELECT jsonb_array_elements_text(current_settings.time_slots)),
                current_settings.cars
            )
            ON CONFLICT (event_id) DO NOTHING;
            
            -- Set this event as primary
            UPDATE events SET is_primary = true WHERE id = active_event_id;
        END IF;
    END IF;
END $$;

-- ============================================
-- Done! Event settings are now per-event.
-- ============================================
