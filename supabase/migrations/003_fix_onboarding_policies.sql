-- Fix RLS policies for onboarding flow
-- Allow authenticated users to create households and their initial records

-- Allow authenticated users to INSERT a new household (for onboarding)
CREATE POLICY "authenticated_users_can_create_household" ON households
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to INSERT themselves as a caregiver
CREATE POLICY "authenticated_users_can_create_caregiver" ON caregivers
  FOR INSERT WITH CHECK (id = auth.uid());

-- Allow caregivers to INSERT a patient for their household
CREATE POLICY "caregivers_can_create_patient" ON patients
  FOR INSERT WITH CHECK (
    household_id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );

-- Allow caregivers to INSERT care plan tasks for their household
CREATE POLICY "caregivers_can_create_tasks" ON care_plan_tasks
  FOR INSERT WITH CHECK (
    household_id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );
