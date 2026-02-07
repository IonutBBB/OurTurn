import { createClient as createServerClient } from '@/lib/supabase/server';
import { BehavioursTab } from './behaviours-tab';

export default async function BehavioursPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: caregiver } = await supabase
    .from('caregivers')
    .select('id, household_id')
    .eq('id', user?.id)
    .single();

  if (!caregiver) return null;

  const { data: patient } = await supabase
    .from('patients')
    .select('id, name')
    .eq('household_id', caregiver.household_id)
    .single();

  const [playbooksResult, incidentsResult] = await Promise.all([
    supabase
      .from('behaviour_playbooks')
      .select('*')
      .eq('language', 'en')
      .order('behaviour_type'),
    supabase
      .from('behaviour_incidents')
      .select('*')
      .eq('household_id', caregiver.household_id)
      .order('logged_at', { ascending: false })
      .limit(50),
  ]);

  return (
    <BehavioursTab
      caregiverId={caregiver.id}
      householdId={caregiver.household_id}
      patientId={patient?.id || ''}
      patientName={patient?.name || ''}
      playbooks={playbooksResult.data || []}
      incidents={incidentsResult.data || []}
    />
  );
}
