-- SLOT HOLD SYSTEM - Run this in Supabase SQL Editor
-- This adds a temporary hold system to prevent double bookings

-- 1. Create slot_holds table for temporary reservations
CREATE TABLE IF NOT EXISTS slot_holds (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id text NOT NULL,
  date text NOT NULL,
  time_slot text NOT NULL,
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- 2. Create unique index to prevent duplicate holds
CREATE UNIQUE INDEX IF NOT EXISTS idx_slot_holds_unique 
ON slot_holds (car_id, date, time_slot);

-- 3. Create unique index on registrations to prevent duplicate bookings
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_unique_slot 
ON registrations ((car_data->>'id'), date, time_slot);

-- 4. Enable RLS on slot_holds
ALTER TABLE slot_holds ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for slot_holds
DROP POLICY IF EXISTS "Allow public read slot_holds" ON slot_holds;
DROP POLICY IF EXISTS "Allow public insert slot_holds" ON slot_holds;
DROP POLICY IF EXISTS "Allow public delete slot_holds" ON slot_holds;

CREATE POLICY "Allow public read slot_holds" ON slot_holds FOR SELECT USING (true);
CREATE POLICY "Allow public insert slot_holds" ON slot_holds FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete slot_holds" ON slot_holds FOR DELETE USING (true);

-- 6. Create function to clean up expired holds automatically
CREATE OR REPLACE FUNCTION cleanup_expired_holds()
RETURNS void AS $$
BEGIN
  DELETE FROM slot_holds WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- 7. Reload schema
NOTIFY pgrst, 'reload schema';
