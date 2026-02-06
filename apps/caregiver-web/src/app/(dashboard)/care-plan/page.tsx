import { createClient as createServerClient } from '@/lib/supabase/server';
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

  if (!household || !patient) {
    return (
      <div className="page-enter space-y-6">
        <div>
          <h1 className="heading-display text-2xl">
            Care <span className="heading-accent">Plan</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1">Manage your loved one&apos;s daily schedule and routines</p>
        </div>
        <div className="card-paper p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-100/60 dark:bg-brand-100/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">📋</span>
          </div>
          <h2 className="text-lg font-display font-bold text-text-primary mb-2">Complete Setup First</h2>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            Set up your care profile to create a personalized daily plan.
          </p>
          <a href="/onboarding" className="btn-primary inline-flex items-center">
            Start Onboarding
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
        <p className="text-text-secondary text-sm mt-1">Manage {patient.name}&apos;s daily schedule and routines</p>
      </div>
      <CarePlanClient
        householdId={household.id}
        patientName={patient.name}
        initialTasks={tasks || []}
      />
    </div>
  );
}
