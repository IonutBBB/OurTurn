import { createClient as createServerClient } from '@/lib/supabase/server';
import CoachClient from './coach-client';

export default async function CoachPage() {
  const supabase = await createServerClient();

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
  const patient = Array.isArray(household?.patients) ? household?.patients?.[0] : household?.patients;

  if (!household || !patient) {
    return null; // Layout handles the setup fallback
  }

  return (
    <CoachClient
      householdId={household.id}
      patientName={patient.name}
      caregiverName={caregiver.name}
      subscriptionStatus={household.subscription_status || 'free'}
    />
  );
}
