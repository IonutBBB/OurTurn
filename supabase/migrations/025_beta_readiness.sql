-- Migration 025: Beta-readiness fixes
--
-- 1. Fix subscription_status CHECK constraint to allow 'past_due'
-- 2. Update GDPR delete functions for tables added in migrations 011-024
-- 3. Add location data retention cleanup function (30-day policy)
-- 4. Add ai_safety_audit_log retention cleanup function (90-day policy)
-- 5. Add missing indexes for common query patterns
-- 6. Drop duplicate index on households.care_code (UNIQUE already creates one)

-- ============================================================
-- 1. Fix subscription_status CHECK constraint
-- The Stripe webhook writes 'past_due' on payment failure,
-- which would violate the original constraint.
-- ============================================================
ALTER TABLE households DROP CONSTRAINT households_subscription_status_check;
ALTER TABLE households ADD CONSTRAINT households_subscription_status_check
  CHECK (subscription_status IN ('free', 'plus', 'cancelled', 'past_due'));

-- ============================================================
-- 2. Update GDPR delete functions for new tables
-- Tables with ON DELETE CASCADE on household_id are auto-cleaned
-- when the household row is deleted, but we explicitly delete
-- them here for safety and auditability.
-- ============================================================
CREATE OR REPLACE FUNCTION delete_household_data(p_household_id UUID, p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- New tables from migrations 011-024
  DELETE FROM activity_content_cache WHERE household_id = p_household_id;
  DELETE FROM activity_difficulty WHERE household_id = p_household_id;
  DELETE FROM activity_sessions WHERE household_id = p_household_id;
  DELETE FROM resource_journey_progress WHERE household_id = p_household_id;
  DELETE FROM ai_safety_audit_log WHERE user_id = p_user_id;
  DELETE FROM care_network_members WHERE household_id = p_household_id;
  DELETE FROM behaviour_incidents WHERE household_id = p_household_id;
  DELETE FROM alert_escalations WHERE alert_id IN (
    SELECT id FROM location_alerts WHERE household_id = p_household_id
  );
  -- Original tables (same order as migration 008)
  DELETE FROM ai_conversations WHERE household_id = p_household_id;
  DELETE FROM caregiver_wellbeing_logs WHERE caregiver_id = p_user_id;
  DELETE FROM weekly_insights WHERE household_id = p_household_id;
  DELETE FROM doctor_visit_reports WHERE household_id = p_household_id;
  DELETE FROM brain_activities WHERE household_id = p_household_id;
  DELETE FROM location_alerts WHERE household_id = p_household_id;
  DELETE FROM safe_zones WHERE household_id = p_household_id;
  DELETE FROM location_logs WHERE household_id = p_household_id;
  DELETE FROM care_journal_entries WHERE household_id = p_household_id;
  DELETE FROM daily_checkins WHERE household_id = p_household_id;
  DELETE FROM task_completions WHERE household_id = p_household_id;
  DELETE FROM care_plan_tasks WHERE household_id = p_household_id;
  DELETE FROM caregivers WHERE id = p_user_id;
  DELETE FROM patients WHERE household_id = p_household_id;
  DELETE FROM households WHERE id = p_household_id;
  -- Note: auth.users deletion handled separately via admin API
END;
$$;

CREATE OR REPLACE FUNCTION delete_caregiver_data(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- New tables from migrations 011-024
  DELETE FROM ai_safety_audit_log WHERE user_id = p_user_id;
  DELETE FROM relief_activities WHERE caregiver_id = p_user_id;
  DELETE FROM resource_journey_progress WHERE caregiver_id = p_user_id;
  DELETE FROM behaviour_incidents WHERE caregiver_id = p_user_id;
  -- Original tables (same order as migration 008)
  DELETE FROM ai_conversations WHERE caregiver_id = p_user_id;
  DELETE FROM caregiver_wellbeing_logs WHERE caregiver_id = p_user_id;
  DELETE FROM caregivers WHERE id = p_user_id;
  -- Note: auth.users deletion handled separately via admin API
END;
$$;

-- ============================================================
-- 3. Location data retention: auto-delete after 30 days
-- Privacy policy claims this; now it actually happens.
-- Schedule via pg_cron: SELECT cron.schedule('cleanup-location-logs', '0 3 * * *', 'SELECT cleanup_old_location_logs()');
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_old_location_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM location_logs WHERE recorded_at < NOW() - INTERVAL '30 days';
END;
$$;

-- ============================================================
-- 4. AI safety audit log retention: auto-delete after 90 days
-- Schedule via pg_cron: SELECT cron.schedule('cleanup-audit-logs', '0 4 * * *', 'SELECT cleanup_old_audit_logs()');
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM ai_safety_audit_log WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- ============================================================
-- 5. Missing indexes for common query patterns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_care_journal_entries_author
  ON care_journal_entries(author_id);

CREATE INDEX IF NOT EXISTS idx_doctor_visit_reports_generated_by
  ON doctor_visit_reports(generated_by);

CREATE INDEX IF NOT EXISTS idx_location_alerts_acknowledged_by
  ON location_alerts(acknowledged_by);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_updated_at
  ON ai_conversations(updated_at DESC);

-- ============================================================
-- 6. Drop duplicate index on households.care_code
-- The UNIQUE constraint already creates an implicit index.
-- ============================================================
DROP INDEX IF EXISTS idx_households_care_code;
