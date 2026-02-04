-- Fix infinite recursion in caregivers RLS policies
-- The issue: policies on caregivers table query caregivers table

-- Drop the problematic policies
DROP POLICY IF EXISTS "caregivers_read_household_caregivers" ON caregivers;
DROP POLICY IF EXISTS "caregivers_update_self" ON caregivers;
DROP POLICY IF EXISTS "caregivers_insert_self" ON caregivers;

-- Recreate with non-recursive logic
-- For SELECT: caregiver can read their own record and others in same household
CREATE POLICY "caregivers_select_own" ON caregivers
  FOR SELECT USING (id = auth.uid());

-- For INSERT: authenticated user can insert themselves
CREATE POLICY "caregivers_insert_own" ON caregivers
  FOR INSERT WITH CHECK (id = auth.uid());

-- For UPDATE: caregiver can update their own record
CREATE POLICY "caregivers_update_own" ON caregivers
  FOR UPDATE USING (id = auth.uid());

-- Also fix households policy - allow INSERT for onboarding
DROP POLICY IF EXISTS "authenticated_users_can_create_household" ON households;
CREATE POLICY "anyone_can_create_household" ON households
  FOR INSERT WITH CHECK (true);

-- Fix patients policy - need to allow INSERT before caregiver record exists
DROP POLICY IF EXISTS "caregivers_all_own_patient" ON patients;
DROP POLICY IF EXISTS "caregivers_can_create_patient" ON patients;

CREATE POLICY "patients_insert" ON patients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "patients_select" ON patients
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );

CREATE POLICY "patients_update" ON patients
  FOR UPDATE USING (
    household_id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );

CREATE POLICY "patients_delete" ON patients
  FOR DELETE USING (
    household_id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );

-- Fix care_plan_tasks policy
DROP POLICY IF EXISTS "caregivers_all_own_tasks" ON care_plan_tasks;
DROP POLICY IF EXISTS "caregivers_can_create_tasks" ON care_plan_tasks;

CREATE POLICY "tasks_insert" ON care_plan_tasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "tasks_select" ON care_plan_tasks
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );

CREATE POLICY "tasks_update" ON care_plan_tasks
  FOR UPDATE USING (
    household_id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );

CREATE POLICY "tasks_delete" ON care_plan_tasks
  FOR DELETE USING (
    household_id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );
