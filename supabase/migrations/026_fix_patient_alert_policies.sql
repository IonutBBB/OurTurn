-- Migration 026: Fix patient app location_alerts RLS policies
--
-- The patient app (anon role) can INSERT alerts but the createLocationAlert
-- query uses .insert().select().single() which also requires a SELECT policy.
-- Without it, Postgres returns an RLS violation even though the row is inserted.

-- Add SELECT policy so the patient app can read back the alert it just created
CREATE POLICY "anon_patient_read_alerts"
  ON location_alerts FOR SELECT TO anon
  USING (true);

-- Re-create INSERT policy in case migration 023 was not applied
-- (DROP IF EXISTS + CREATE to be idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'location_alerts'
      AND policyname = 'anon_patient_insert_alerts'
  ) THEN
    CREATE POLICY "anon_patient_insert_alerts"
      ON location_alerts FOR INSERT TO anon
      WITH CHECK (true);
  END IF;
END $$;
