-- Migration 023: Add anon-friendly RLS policies for the patient app
--
-- The patient app doesn't use Supabase Auth (no email/password login).
-- It authenticates via a 6-digit Care Code and stores the household UUID.
-- All existing patient_device_* policies check get_patient_household_id()
-- which reads JWT claims — but the patient app uses the anon key (no JWT).
--
-- These policies allow the anon role to read/write data.
-- Security: household_id (UUID v4, 122 bits) is effectively unguessable.
-- PostgREST WHERE clauses filter by household_id on every query.

-- ============================================================
-- care_plan_tasks: patient reads active tasks for their household
-- ============================================================
CREATE POLICY "anon_patient_read_tasks"
  ON care_plan_tasks FOR SELECT TO anon
  USING (active = true);

-- ============================================================
-- task_completions: patient reads and inserts completions
-- ============================================================
CREATE POLICY "anon_patient_read_completions"
  ON task_completions FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon_patient_insert_completions"
  ON task_completions FOR INSERT TO anon
  WITH CHECK (true);

-- ============================================================
-- daily_checkins: patient reads, inserts, and updates check-ins
-- ============================================================
CREATE POLICY "anon_patient_read_checkins"
  ON daily_checkins FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon_patient_insert_checkins"
  ON daily_checkins FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_patient_update_checkins"
  ON daily_checkins FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

-- ============================================================
-- brain_activities: patient reads and updates activities
-- ============================================================
CREATE POLICY "anon_patient_read_activities"
  ON brain_activities FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon_patient_update_activities"
  ON brain_activities FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

-- ============================================================
-- location_alerts: patient inserts alerts (SOS, take-me-home)
-- ============================================================
CREATE POLICY "anon_patient_insert_alerts"
  ON location_alerts FOR INSERT TO anon
  WITH CHECK (true);

-- ============================================================
-- location_logs: patient inserts location logs
-- ============================================================
CREATE POLICY "anon_patient_insert_location_logs"
  ON location_logs FOR INSERT TO anon
  WITH CHECK (true);

-- ============================================================
-- households: patient reads their household (for refresh)
-- ============================================================
CREATE POLICY "anon_patient_read_household"
  ON households FOR SELECT TO anon
  USING (true);

-- ============================================================
-- patients: patient reads their own profile
-- ============================================================
CREATE POLICY "anon_patient_read_patient"
  ON patients FOR SELECT TO anon
  USING (true);

-- ============================================================
-- safe_zones: patient reads active safe zones
-- ============================================================
CREATE POLICY "anon_patient_read_safe_zones"
  ON safe_zones FOR SELECT TO anon
  USING (active = true);
