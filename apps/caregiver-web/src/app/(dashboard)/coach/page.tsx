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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">AI Care Coach</h1>
          <p className="text-text-secondary mt-2">Get personalized guidance and support</p>
        </div>
        <div className="card-elevated rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🤖</span>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">Complete Setup First</h2>
          <p className="text-text-secondary mb-6">
            Set up your care profile to get personalized AI coaching tailored to your situation.
          </p>
          <a
            href="/onboarding"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold rounded-xl shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            Start Onboarding
          </a>
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">AI Care Coach</h1>
        <p className="text-text-secondary mt-2">Get personalized guidance and support for {patient.name}</p>
      </div>
      <CoachClient
        householdId={household.id}
        patientName={patient.name}
        caregiverName={caregiver.name}
        initialConversationId={latestConversation?.id}
      />
    </div>
  );
}
