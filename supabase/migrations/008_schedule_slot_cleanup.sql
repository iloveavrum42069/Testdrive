-- ============================================
-- MIGRATION: Set up pg_cron for slot hold cleanup
-- ============================================
-- This migration enables and configures automatic cleanup of expired slot holds.
-- Slot holds expire after 6 minutes, cleanup runs every 5 minutes.
-- ============================================

-- Step 1: Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Step 2: Schedule the cleanup job to run every 5 minutes
-- This removes any slot_holds where expires_at < NOW()
SELECT cron.schedule(
  'cleanup-expired-slot-holds',           -- Unique job name
  '*/5 * * * *',                          -- Cron expression: every 5 minutes
  'SELECT cleanup_expired_slot_holds();'  -- Function to execute
);

-- ============================================
-- VERIFICATION QUERIES (run manually after migration)
-- ============================================
-- View all scheduled jobs:
--   SELECT * FROM cron.job;
--
-- View recent job executions:
--   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
--
-- To remove this job if needed:
--   SELECT cron.unschedule('cleanup-expired-slot-holds');
-- ============================================
