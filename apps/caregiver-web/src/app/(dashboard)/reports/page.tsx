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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Doctor Visit Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Generate comprehensive reports for healthcare providers</p>
        </div>
        <div className="bg-white dark:bg-[#1E1E1E] shadow-lg dark:shadow-black/20 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📋</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Complete Setup First</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Set up your care profile to generate detailed reports for doctor visits.
          </p>
          <a
            href="/onboarding"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 dark:from-teal-500 dark:to-teal-400 text-white font-semibold rounded-xl shadow-lg shadow-teal-600/25 dark:shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-600/30 dark:hover:shadow-teal-500/30 transition-all duration-200 hover:-translate-y-0.5"
          >
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Doctor Visit Reports</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Generate comprehensive reports for {patient.name}&apos;s healthcare providers</p>
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
