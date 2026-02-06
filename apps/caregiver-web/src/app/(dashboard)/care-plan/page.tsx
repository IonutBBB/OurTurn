import { createClient as createServerClient } from '@/lib/supabase/server';
import { CarePlanClient } from './care-plan-client';
import en from '../../../../locales/en.json';

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
  const patient = Array.isArray(household?.patients) ? household?.patients?.[0] : household?.patients;

  const t = en.caregiverApp;

  if (!household || !patient) {
    return (
      <div className="page-enter space-y-6">
        <div>
          <h1 className="heading-display text-2xl">
            Care <span className="heading-accent">Plan</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1">{t.carePlan.pageSubtitleGeneric}</p>
        </div>
        <div className="card-paper p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-100/60 dark:bg-brand-100/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">📋</span>
          </div>
          <h2 className="text-lg font-display font-bold text-text-primary mb-2">{t.carePlan.completeSetupFirst}</h2>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            {t.carePlan.setupDesc}
          </p>
          <a href="/onboarding" className="btn-primary inline-flex items-center">
            {t.carePlan.startOnboarding}
          </a>
        </div>
      </div>
    );
  }

  // Get all tasks for this household
  const { data: tasks } = await supabase
    .from('care_plan_tasks')
    .select('*')
    .eq('household_id', household.id)
    .eq('active', true)
    .order('time', { ascending: true });

  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 className="heading-display text-2xl">
          Care <span className="heading-accent">Plan</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">{t.carePlan.pageSubtitle.replace('{{name}}', patient.name)}</p>
      </div>
      <CarePlanClient
        householdId={household.id}
        patientName={patient.name}
        initialTasks={tasks || []}
      />
    </div>
  );
}
