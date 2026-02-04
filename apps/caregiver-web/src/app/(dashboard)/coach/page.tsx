import { createClient as createServerClient } from '@/lib/supabase/server';
import CoachClient from './coach-client';

export default async function CoachPage() {
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

  if (!household || !patient) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-6">AI Care Coach</h1>
        <div className="bg-surface-card rounded-xl border border-surface-border p-8 text-center">
          <p className="text-text-muted">Please complete onboarding first.</p>
        </div>
      </div>
    );
  }

  // Get most recent conversation for this household
  const { data: latestConversation } = await supabase
    .from('ai_conversations')
    .select('id')
    .eq('household_id', household.id)
    .eq('caregiver_id', caregiver.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">AI Care Coach</h1>
      <CoachClient
        householdId={household.id}
        patientName={patient.name}
        caregiverName={caregiver.name}
        initialConversationId={latestConversation?.id}
      />
    </div>
  );
}
