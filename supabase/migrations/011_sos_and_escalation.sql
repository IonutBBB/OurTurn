-- Migration 011: SOS Emergency Button & Escalation Protocol

-- 1. Extend location_alerts.type CHECK to include 'sos_triggered'
ALTER TABLE location_alerts DROP CONSTRAINT IF EXISTS location_alerts_type_check;
ALTER TABLE location_alerts ADD CONSTRAINT location_alerts_type_check
  CHECK (type IN ('left_safe_zone', 'inactive', 'night_movement', 'take_me_home_tapped', 'sos_triggered'));

-- 2. Add acknowledged_at timestamp to location_alerts
ALTER TABLE location_alerts ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ;

-- 3. Add escalation_minutes to households (default 5 minutes)
ALTER TABLE households ADD COLUMN IF NOT EXISTS escalation_minutes INTEGER DEFAULT 5;

-- 4. Create alert_escalations table
CREATE TABLE IF NOT EXISTS alert_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES location_alerts(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  escalation_level INTEGER NOT NULL DEFAULT 0,
  escalated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_escalation_at TIMESTAMPTZ NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES caregivers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_alert_escalations_household ON alert_escalations(household_id);
CREATE INDEX IF NOT EXISTS idx_alert_escalations_unresolved ON alert_escalations(resolved, next_escalation_at)
  WHERE resolved = false;

-- 5. RLS for alert_escalations
ALTER TABLE alert_escalations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can read own household escalations"
  ON alert_escalations FOR SELECT
  USING (household_id IN (
    SELECT household_id FROM caregivers WHERE id = auth.uid()
  ));

CREATE POLICY "Caregivers can update own household escalations"
  ON alert_escalations FOR UPDATE
  USING (household_id IN (
    SELECT household_id FROM caregivers WHERE id = auth.uid()
  ));

-- Allow service role to insert (for triggers and edge functions)
CREATE POLICY "Service role can insert escalations"
  ON alert_escalations FOR INSERT
  WITH CHECK (true);

-- 6. DB trigger: auto-create escalation when sos_triggered or left_safe_zone alert is inserted
CREATE OR REPLACE FUNCTION create_alert_escalation()
RETURNS TRIGGER AS $$
DECLARE
  esc_minutes INTEGER;
BEGIN
  IF NEW.type IN ('sos_triggered', 'left_safe_zone') THEN
    SELECT escalation_minutes INTO esc_minutes
    FROM households
    WHERE id = NEW.household_id;

    IF esc_minutes IS NULL THEN
      esc_minutes := 5;
    END IF;

    INSERT INTO alert_escalations (alert_id, household_id, escalation_level, next_escalation_at)
    VALUES (NEW.id, NEW.household_id, 0, now() + (esc_minutes || ' minutes')::interval);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_create_alert_escalation ON location_alerts;
CREATE TRIGGER trigger_create_alert_escalation
  AFTER INSERT ON location_alerts
  FOR EACH ROW
  EXECUTE FUNCTION create_alert_escalation();
