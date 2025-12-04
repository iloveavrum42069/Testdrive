-- RATE LIMITING: 1 registration per email per hour
-- Run this in Supabase SQL Editor

-- Create the rate limit check function
CREATE OR REPLACE FUNCTION check_email_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM registrations 
    WHERE email = NEW.email 
    AND registered_at > NOW() - INTERVAL '1 hour'
  ) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before registering again.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop first if exists)
DROP TRIGGER IF EXISTS email_rate_limit_trigger ON registrations;
CREATE TRIGGER email_rate_limit_trigger
  BEFORE INSERT ON registrations
  FOR EACH ROW EXECUTE FUNCTION check_email_rate_limit();

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
