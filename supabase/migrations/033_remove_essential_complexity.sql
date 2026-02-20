-- Remove 'essential' app complexity mode, keeping only 'full' and 'simplified'
-- Convert any existing 'essential' patients to 'simplified'
UPDATE patients SET app_complexity = 'simplified' WHERE app_complexity = 'essential';

-- Update the CHECK constraint to only allow 'full' and 'simplified'
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_app_complexity_check;
ALTER TABLE patients ADD CONSTRAINT patients_app_complexity_check
  CHECK (app_complexity IN ('full', 'simplified'));
