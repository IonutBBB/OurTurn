import { createClient as createServerClient } from '@/lib/supabase/server';
import { CoachTabs } from './components/coach-tabs';
import { CoachHeader } from './components/coach-header';
import { CoachSetupPrompt } from './components/coach-setup-prompt';

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    return (
      <div className="page-enter space-y-6">
        <CoachHeader />
        <CoachSetupPrompt />
      </div>
    );
  }

  return (
    <div className="page-enter space-y-6">
      <CoachHeader patientName={patient.name} />

      <CoachTabs />

      {children}
    </div>
  );
}
