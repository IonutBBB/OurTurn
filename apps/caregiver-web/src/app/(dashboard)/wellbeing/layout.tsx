import { createClient as createServerClient } from '@/lib/supabase/server';
import { getServerTranslations } from '@/lib/server-i18n';
import { ToolkitTabs } from './components/toolkit-tabs';
import { SosButton } from './components/sos-button';

export default async function ToolkitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: caregiver } = await supabase
    .from('caregivers')
    .select('id, name, household_id')
    .eq('id', user?.id)
    .single();

  const translations = await getServerTranslations(caregiver?.household_id ? (await supabase.from('households').select('language').eq('id', caregiver.household_id).single()).data?.language : null);
  const t = translations.caregiverApp;

  if (!caregiver) {
    return (
      <div className="page-enter space-y-6">
        <div>
          <h1 className="heading-display text-2xl">
            {t.toolkit.pageTitle}
          </h1>
          <p className="text-text-secondary text-sm mt-1">{t.toolkit.pageSubtitle}</p>
        </div>
        <div className="card-paper p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-100/60 dark:bg-brand-100/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">🧰</span>
          </div>
          <h2 className="text-lg font-display font-bold text-text-primary mb-2">{t.toolkit.completeSetupFirst}</h2>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            {t.toolkit.setupDesc}
          </p>
          <a href="/onboarding" className="btn-primary inline-flex items-center">
            {t.toolkit.startOnboarding}
          </a>
        </div>
      </div>
    );
  }

  // Get patient info for SOS modal
  const { data: patient } = await supabase
    .from('patients')
    .select('id, name')
    .eq('household_id', caregiver.household_id)
    .single();

  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 className="heading-display text-2xl">
          {t.toolkit.pageTitle}
        </h1>
        <p className="text-text-secondary text-sm mt-1">{t.toolkit.pageSubtitle}</p>
      </div>

      <ToolkitTabs />

      {children}

      <SosButton
        caregiverId={caregiver.id}
        householdId={caregiver.household_id}
        patientId={patient?.id || ''}
      />
    </div>
  );
}
