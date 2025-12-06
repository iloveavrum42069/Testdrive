-- ============================================
-- BASELINE DATABASE SCHEMA
-- Test Drive Registration System
-- ============================================
-- This file documents all core database tables needed for a fresh setup.
-- Run this FIRST before any numbered migrations if setting up a new database.
-- 
-- For existing databases, this is for REFERENCE ONLY - do not run if tables already exist.
-- ============================================

-- ============================================
-- 1. REGISTRATIONS TABLE (Core)
-- ============================================
-- Stores all test drive registration records
CREATE TABLE IF NOT EXISTS registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    registration_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    date TEXT,  -- Nullable for non-timed events
    time_slot TEXT,  -- Nullable for non-timed events
    has_valid_license BOOLEAN DEFAULT false,
    signature TEXT,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    completed BOOLEAN DEFAULT false,
    communication_opt_in BOOLEAN DEFAULT false,
    license_verified BOOLEAN DEFAULT false,
    license_verified_by TEXT,
    license_verified_at TIMESTAMPTZ,
    agreed_to_tos BOOLEAN DEFAULT false,
    waiver_pdf_url TEXT,
    car_data JSONB,
    additional_passengers JSONB,
    event_id UUID,
    folder TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for registrations
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_folder ON registrations(folder);
CREATE INDEX IF NOT EXISTS idx_registrations_registered_at ON registrations(registered_at);

-- ============================================
-- 2. SLOT_HOLDS TABLE (Real-time slot locking)
-- ============================================
-- Temporary holds to prevent double-booking during registration
CREATE TABLE IF NOT EXISTS slot_holds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    car_id TEXT NOT NULL,
    date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '6 minutes'),
    UNIQUE(car_id, date, time_slot)
);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_slot_holds_expires_at ON slot_holds(expires_at);

-- ============================================
-- 3. SETTINGS TABLE (Global app settings)
-- ============================================
-- Stores global application settings (fallback when no event-specific settings)
CREATE TABLE IF NOT EXISTS settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hero_title TEXT DEFAULT 'Test Drive Experience',
    hero_subtitle TEXT DEFAULT 'Schedule your exclusive test drive today',
    waiver_text TEXT,
    footer_text TEXT,
    parental_consent_text TEXT,
    event_dates JSONB DEFAULT '[]',
    time_slots JSONB DEFAULT '[]',
    cars JSONB DEFAULT '[]',
    completion_sms_enabled BOOLEAN DEFAULT false,
    completion_sms_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. EVENTS TABLE (Event management)
-- ============================================
-- Manages multiple events with their own registrations
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    event_type TEXT DEFAULT 'timed' CHECK (event_type IN ('timed', 'non_timed')),
    is_primary BOOLEAN DEFAULT false,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only one event can be primary
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_single_primary 
ON events (is_primary) WHERE is_primary = true;

-- Add foreign key to registrations
ALTER TABLE registrations 
ADD CONSTRAINT fk_registrations_event 
FOREIGN KEY (event_id) REFERENCES events(id);

-- ============================================
-- 5. EVENT_SETTINGS TABLE (Per-event settings)
-- ============================================
-- Each event has its own settings (cars, dates, time slots)
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
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;

-- REGISTRATIONS policies
CREATE POLICY "Enable read for authenticated" ON registrations
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for all" ON registrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated" ON registrations
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for authenticated" ON registrations
    FOR DELETE TO authenticated USING (true);

-- SLOT_HOLDS policies (public access for reservation system)
CREATE POLICY "Enable all for slot_holds" ON slot_holds
    FOR ALL USING (true);

-- SETTINGS policies
CREATE POLICY "Enable read for all settings" ON settings
    FOR SELECT USING (true);

CREATE POLICY "Enable write for authenticated settings" ON settings
    FOR ALL TO authenticated USING (true);

-- EVENTS policies
CREATE POLICY "Enable read for all events" ON events
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated events" ON events
    FOR INSERT TO authenticated WITH CHECK (true);
    
CREATE POLICY "Enable update for authenticated events" ON events
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for authenticated events" ON events
    FOR DELETE TO authenticated USING (true);

-- EVENT_SETTINGS policies
CREATE POLICY "Enable read for all event_settings" ON event_settings
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated event_settings" ON event_settings
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated event_settings" ON event_settings
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for authenticated event_settings" ON event_settings
    FOR DELETE TO authenticated USING (true);

-- ============================================
-- 7. UTILITY FUNCTIONS & TRIGGERS
-- ============================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to events table
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply to settings table
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply to event_settings table
CREATE TRIGGER update_event_settings_updated_at
    BEFORE UPDATE ON event_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. RATE LIMITING TRIGGER (Optional)
-- ============================================
-- Prevents duplicate registrations from same email within 1 hour
CREATE OR REPLACE FUNCTION check_registration_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    recent_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO recent_count
    FROM registrations
    WHERE email = NEW.email
    AND registered_at > NOW() - INTERVAL '1 hour';
    
    IF recent_count > 0 THEN
        RAISE EXCEPTION 'Rate limit exceeded. Please wait before registering again.';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER check_rate_limit_before_insert
    BEFORE INSERT ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION check_registration_rate_limit();

-- ============================================
-- 9. CLEANUP FUNCTION FOR EXPIRED SLOT HOLDS
-- ============================================
-- Run this periodically or set up a cron job
CREATE OR REPLACE FUNCTION cleanup_expired_slot_holds()
RETURNS void AS $$
BEGIN
    DELETE FROM slot_holds WHERE expires_at < NOW();
END;
$$ language 'plpgsql';

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- After running this, you should:
-- 1. Enable Realtime for: registrations, event_settings
-- 2. Create your first event via the admin dashboard
-- 3. Configure event settings (cars, dates, time slots)
-- ============================================
