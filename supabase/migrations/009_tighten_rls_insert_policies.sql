-- Tighten permissive INSERT policies to require authentication
-- Previously WITH CHECK (true) allowed anonymous inserts
-- Now requires auth.uid() IS NOT NULL (still allows onboarding flow)

-- Households: only authenticated users can create
DROP POLICY IF EXISTS "anyone_can_create_household" ON households;
CREATE POLICY "authenticated_create_household" ON households
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Patients: only authenticated users can create
DROP POLICY IF EXISTS "patients_insert" ON patients;
CREATE POLICY "patients_insert_authenticated" ON patients
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Care plan tasks: only authenticated users can create
DROP POLICY IF EXISTS "tasks_insert" ON care_plan_tasks;
CREATE POLICY "tasks_insert_authenticated" ON care_plan_tasks
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
