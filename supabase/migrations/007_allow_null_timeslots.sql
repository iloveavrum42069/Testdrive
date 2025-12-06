-- Allow NULL values for date and time_slot in registrations table
-- This enables non-timed events where registrations don't have scheduled time slots
-- Run this in Supabase SQL Editor

-- Make date column nullable
ALTER TABLE registrations ALTER COLUMN date DROP NOT NULL;

-- Make time_slot column nullable  
ALTER TABLE registrations ALTER COLUMN time_slot DROP NOT NULL;

-- Verify the changes
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'registrations' 
  AND column_name IN ('date', 'time_slot');
