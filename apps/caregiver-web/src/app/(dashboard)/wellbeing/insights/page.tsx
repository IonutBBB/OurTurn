import { createClient as createServerClient } from '@/lib/supabase/server';
import { InsightsTab } from './insights-tab';

export default async function InsightsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: caregiver } = await supabase
    .from('caregivers')
    .select('id, name, household_id')
    .eq('id', user?.id)
    .single();

  if (!caregiver) return null;

  const { data: patient } = await supabase
    .from('patients')
    .select('id, name')
    .eq('household_id', caregiver.household_id)
    .single();

  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  const dateStr = fourWeeksAgo.toISOString().split('T')[0];

  const [wellbeingResult, incidentsResult] = await Promise.all([
    supabase
      .from('caregiver_wellbeing_logs')
      .select('*')
      .eq('caregiver_id', caregiver.id)
      .gte('date', dateStr)
      .order('date', { ascending: true }),
    supabase
      .from('behaviour_incidents')
      .select('*')
      .eq('household_id', caregiver.household_id)
      .gte('logged_at', fourWeeksAgo.toISOString())
      .order('logged_at', { ascending: true }),
  ]);

  return (
    <InsightsTab
      caregiverId={caregiver.id}
      caregiverName={caregiver.name}
      householdId={caregiver.household_id}
      patientName={patient?.name || ''}
      wellbeingLogs={wellbeingResult.data || []}
      behaviourIncidents={incidentsResult.data || []}
    />
  );
}
