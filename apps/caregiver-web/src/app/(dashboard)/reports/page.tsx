import { createClient as createServerClient } from '@/lib/supabase/server';
import ReportsClient from './reports-client';

export default async function ReportsPage() {
  const supabase = await createServerClient();

  // Get user and caregiver data
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

  if (!caregiver || !household || !patient) {
    return (
      <div className="page-enter space-y-6">
        <div>
          <h1 className="heading-display text-2xl">
            Doctor <span className="heading-accent">Reports</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1">Generate visit summaries for healthcare providers</p>
        </div>
        <div className="card-paper p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-100/60 dark:bg-brand-100/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">📄</span>
          </div>
          <h2 className="text-lg font-display font-bold text-text-primary mb-2">Complete Setup First</h2>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            Set up your care profile to generate detailed reports for doctor visits.
          </p>
          <a href="/onboarding" className="btn-primary inline-flex items-center">
            Start Onboarding
          </a>
        </div>
      </div>
    );
  }

  // Get existing reports
  const { data: reports } = await supabase
    .from('doctor_visit_reports')
    .select('*')
    .eq('household_id', household.id)
    .order('generated_at', { ascending: false })
    .limit(20);

  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 className="heading-display text-2xl">
          Doctor <span className="heading-accent">Reports</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">Generate visit summaries for {patient.name}&apos;s healthcare providers</p>
      </div>
      <ReportsClient
        householdId={household.id}
        caregiverId={caregiver.id}
        patientName={patient.name}
        patientDateOfBirth={patient.date_of_birth}
        initialReports={reports || []}
      />
    </div>
  );
}
