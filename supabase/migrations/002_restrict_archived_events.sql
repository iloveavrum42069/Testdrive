-- Secure Archival Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- Step 1: Drop existing broad policy
-- ============================================
DROP POLICY IF EXISTS "Enable read for all" ON events;

-- ============================================
-- Step 2: Create strict Visibility Policies
-- ============================================
-- Regular Admins: Can ONLY see Active events
CREATE POLICY "Regular admins see active events" ON events
    FOR SELECT TO authenticated
    USING (status = 'active');

-- Super Admins: Can see ALL events (Active + Archived)
-- Note: Requires `raw_user_meta_data->>'role' = 'super_admin'`
CREATE POLICY "Super admins see all events" ON events
    FOR SELECT TO authenticated
    USING (
        auth.jwt() -> 'user_metadata' ->> 'role' = 'super_admin'
        OR
        status = 'active'
    );

-- Public (Unauthenticated): Can ONLY see Active events (for landing page)
CREATE POLICY "Public sees active events" ON events
    FOR SELECT TO anon
    USING (status = 'active');

-- ============================================
-- Step 3: Prevent Modification of Archived Events
-- ============================================
-- Ensure even Super Admins cannot UPDATE/DELETE archived events directly
-- They must un-archive (set status='active') first.
CREATE POLICY "Prevent modification of archived events" ON events
    FOR UPDATE TO authenticated
    USING (status = 'active')
    WITH CHECK (status = 'active' OR status = 'archived'); -- Allow archiving, but not editing once archived

-- ============================================
-- Verification
-- ============================================
-- RLS should now be enforced.
