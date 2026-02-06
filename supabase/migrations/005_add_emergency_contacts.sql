-- Add emergency_contacts field to patients table
-- This stores a list of emergency contacts (name, phone, relationship)
-- that appear in the patient app's Help tab

ALTER TABLE patients
ADD COLUMN emergency_contacts JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN patients.emergency_contacts IS 'Array of emergency contacts with shape: [{name: string, phone: string, relationship: string}]';
