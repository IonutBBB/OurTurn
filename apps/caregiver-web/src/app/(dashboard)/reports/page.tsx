import { createServerClient } from '@/lib/supabase';
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
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-6">Doctor Visit Reports</h1>
        <div className="bg-surface-card rounded-xl border border-surface-border p-8 text-center">
          <p className="text-text-muted">Please complete onboarding first.</p>
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
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Doctor Visit Reports</h1>
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
