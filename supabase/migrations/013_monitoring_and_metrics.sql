-- Migration 013: Connectivity Monitoring, Engagement Metrics & Burnout Detection

-- 1. Add last_seen_at to patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- 2. Add offline_alert_minutes to households
ALTER TABLE households ADD COLUMN IF NOT EXISTS offline_alert_minutes INTEGER DEFAULT 30;

-- 3. Create engagement_metrics table
CREATE TABLE IF NOT EXISTS engagement_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tasks_total INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  tasks_skipped INTEGER NOT NULL DEFAULT 0,
  checkin_completed BOOLEAN NOT NULL DEFAULT false,
  checkin_mood INTEGER,
  checkin_sleep INTEGER,
  brain_activity_completed BOOLEAN NOT NULL DEFAULT false,
  brain_activity_duration_seconds INTEGER DEFAULT 0,
  location_alerts_count INTEGER NOT NULL DEFAULT 0,
  sos_triggered BOOLEAN NOT NULL DEFAULT false,
  patient_active_minutes INTEGER DEFAULT 0,
  UNIQUE (household_id, date)
);

CREATE INDEX IF NOT EXISTS idx_engagement_metrics_household_date ON engagement_metrics(household_id, date);

-- RLS for engagement_metrics
ALTER TABLE engagement_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers read own household metrics"
  ON engagement_metrics FOR SELECT
  USING (household_id IN (
    SELECT household_id FROM caregivers WHERE id = auth.uid()
  ));

-- Service role can upsert
CREATE POLICY "Service role can insert metrics"
  ON engagement_metrics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update metrics"
  ON engagement_metrics FOR UPDATE
  USING (true);

-- 4. Create caregiver_burnout_alerts table
CREATE TABLE IF NOT EXISTS caregiver_burnout_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  average_mood NUMERIC,
  consecutive_low_days INTEGER NOT NULL DEFAULT 0,
  message_key TEXT,
  dismissed BOOLEAN NOT NULL DEFAULT false,
  dismissed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_burnout_alerts_caregiver ON caregiver_burnout_alerts(caregiver_id);

-- RLS for caregiver_burnout_alerts
ALTER TABLE caregiver_burnout_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers full access own burnout alerts"
  ON caregiver_burnout_alerts FOR ALL
  USING (caregiver_id = auth.uid());

-- Service role can insert
CREATE POLICY "Service role can insert burnout alerts"
  ON caregiver_burnout_alerts FOR INSERT
  WITH CHECK (true);
