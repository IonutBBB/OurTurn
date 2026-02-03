import { createServerClient } from '@/lib/supabase';
import { CarePlanClient } from './care-plan-client';

export default async function CarePlanPage() {
  const supabase = await createServerClient();

  // Get user and household data
  const { data: { user } } = await supabase.auth.getUser();

  const { data: caregiver } = await supabase
    .from('caregivers')
    .select(`
      *,
      households (
        *,
        patients (*)
      )
    `)
    .eq('id', user?.id)
    .single();

  const household = caregiver?.households;
  const patient = household?.patients?.[0];

  // Get all tasks for this household
  const { data: tasks } = await supabase
    .from('care_plan_tasks')
    .select('*')
    .eq('household_id', household?.id)
    .eq('active', true)
    .order('time', { ascending: true });

  return (
    <CarePlanClient
      householdId={household?.id || ''}
      patientName={patient?.name || 'Your loved one'}
      initialTasks={tasks || []}
    />
  );
}
