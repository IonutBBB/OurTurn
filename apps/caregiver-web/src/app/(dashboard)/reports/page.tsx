import { createClient as createServerClient } from '@/lib/supabase/server';
import ReportsClient from './reports-client';
import { getServerTranslations } from '@/lib/server-i18n';

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
  const patient = Array.isArray(household?.patients) ? household?.patients?.[0] : household?.patients;

  const translations = await getServerTranslations(household?.language);
  const t = translations.caregiverApp;

  if (!caregiver || !household || !patient) {
    return (
      <div className="page-enter space-y-6">
        <div>
          <h1 className="heading-display text-2xl">
            <span className="heading-accent">{t.reports.pageTitle}</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1">{t.reports.pageSubtitleGeneric}</p>
        </div>
        <div className="card-paper p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-100/60 dark:bg-brand-100/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">📄</span>
          </div>
          <h2 className="text-lg font-display font-bold text-text-primary mb-2">{t.reports.completeSetupFirst}</h2>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            {t.reports.setupDesc}
          </p>
          <a href="/onboarding" className="btn-primary inline-flex items-center">
            {t.reports.startOnboarding}
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
          <span className="heading-accent">{t.reports.pageTitle}</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">{t.reports.pageSubtitle.replace('{{name}}', patient.name)}</p>
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
