-- Migration 029: Patient Self-Created Reminders
-- Allows patients (anon role) to create their own tasks marked as patient_created

-- Add patient_created flag to care_plan_tasks
ALTER TABLE care_plan_tasks
  ADD COLUMN patient_created BOOLEAN NOT NULL DEFAULT false;

-- Allow anon (patient app) to INSERT tasks marked as patient_created
CREATE POLICY "anon_patient_insert_tasks"
  ON care_plan_tasks FOR INSERT TO anon
  WITH CHECK (patient_created = true);

-- Allow anon to UPDATE their own patient-created tasks (edit/soft-delete)
CREATE POLICY "anon_patient_update_own_tasks"
  ON care_plan_tasks FOR UPDATE TO anon
  USING (patient_created = true)
  WITH CHECK (patient_created = true);
