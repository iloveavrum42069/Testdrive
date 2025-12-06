-- Fix for existing "ford 2025" event
-- Run this in Supabase SQL Editor

-- Step 1: Set "ford 2025" as the primary event
UPDATE events 
SET is_primary = true 
WHERE name ILIKE '%ford%2025%' AND status = 'active';

-- Step 2: Unset primary on any other events
UPDATE events 
SET is_primary = false 
WHERE name NOT ILIKE '%ford%2025%' OR status != 'active';

-- Step 3: Create event_settings for ford 2025 if it doesn't exist
INSERT INTO event_settings (
    event_id,
    hero_title,
    hero_subtitle,
    footer_text,
    event_dates,
    time_slots,
    cars
)
SELECT 
    id,
    'Test Drive Experience',
    'Register for your exclusive test drive',
    '© 2025 Traxion Events. All rights reserved.',
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    '[]'::JSONB
FROM events 
WHERE name ILIKE '%ford%2025%' AND status = 'active'
ON CONFLICT (event_id) DO NOTHING;

-- Verify: Show current events and their primary status
SELECT id, name, status, is_primary, created_at 
FROM events 
ORDER BY created_at DESC;

-- Verify: Show event_settings
SELECT es.*, e.name as event_name 
FROM event_settings es 
JOIN events e ON e.id = es.event_id;
