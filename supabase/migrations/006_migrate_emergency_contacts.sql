-- Migrate existing emergency_number data to emergency_contacts array
-- This populates the new emergency_contacts field for existing patients

UPDATE patients
SET emergency_contacts =
  CASE
    WHEN emergency_number IS NOT NULL AND emergency_number != '' THEN
      jsonb_build_array(
        jsonb_build_object(
          'name', 'Emergency Contact',
          'phone', emergency_number,
          'relationship', 'Primary Contact'
        )
      )
    ELSE '[]'::jsonb
  END
WHERE emergency_contacts = '[]'::jsonb OR emergency_contacts IS NULL;
