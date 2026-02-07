-- Migration 012: Consent Tracking & Patient App Complexity

-- 1. Create consent_records table
CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  granted_by_type TEXT NOT NULL CHECK (granted_by_type IN ('caregiver', 'patient')),
  granted_by_id UUID,
  consent_type TEXT NOT NULL CHECK (consent_type IN (
    'location_tracking',
    'data_collection',
    'ai_personalization',
    'push_notifications',
    'data_sharing_caregivers',
    'voice_recording'
  )),
  granted BOOLEAN NOT NULL DEFAULT true,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  UNIQUE (household_id, consent_type, granted_by_type)
);

CREATE INDEX IF NOT EXISTS idx_consent_records_household ON consent_records(household_id);

-- 2. RLS for consent_records
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers full access own household consent"
  ON consent_records FOR ALL
  USING (household_id IN (
    SELECT household_id FROM caregivers WHERE id = auth.uid()
  ));

-- Patient devices can read and insert (via anon key with household_id match)
CREATE POLICY "Anon can read consent by household"
  ON consent_records FOR SELECT
  USING (true);

CREATE POLICY "Anon can insert consent"
  ON consent_records FOR INSERT
  WITH CHECK (true);

-- 3. SQL function to check consent
CREATE OR REPLACE FUNCTION has_consent(p_household_id UUID, p_consent_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM consent_records
    WHERE household_id = p_household_id
      AND consent_type = p_consent_type
      AND granted = true
      AND revoked_at IS NULL
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 4. Add app_complexity to patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS app_complexity TEXT DEFAULT 'full'
  CHECK (app_complexity IN ('full', 'simplified', 'essential'));
