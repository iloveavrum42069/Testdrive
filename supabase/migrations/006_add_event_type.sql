-- Event Types Migration
-- Add event_type column to support timed and non-timed events
-- Run this in Supabase SQL Editor

-- Add event_type column with default 'timed' for backward compatibility
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'timed' 
CHECK (event_type IN ('timed', 'non_timed'));

-- Update any existing events to be 'timed' (they already have time slots)
UPDATE events SET event_type = 'timed' WHERE event_type IS NULL;

-- Verify the migration
SELECT id, name, status, event_type FROM events;
