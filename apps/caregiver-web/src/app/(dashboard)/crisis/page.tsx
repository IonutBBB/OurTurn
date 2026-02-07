import { createClient as createServerClient } from '@/lib/supabase/server';
import CrisisClient from './crisis-client';
import en from '../../../../locales/en.json';

export default async function CrisisPage() {
  const supabase = await createServerClient();
  const t = en.caregiverApp;

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
        <div>
          <h1 className="heading-display text-2xl">
            Crisis <span className="heading-accent">Hub</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1">{t.crisis.pageSubtitle}</p>
        </div>
        <div className="card-paper p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-100/60 dark:bg-brand-100/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">🚨</span>
          </div>
          <h2 className="text-lg font-display font-bold text-text-primary mb-2">{t.crisis.completeSetupFirst}</h2>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            {t.crisis.setupDesc}
          </p>
          <a href="/onboarding" className="btn-primary inline-flex items-center">
            {t.crisis.startOnboarding}
          </a>
        </div>
      </div>
    );
  }

  const householdCountry = household.country || 'US';

  // Parallel data fetches
  const yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - 24);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    latestLocationResult,
    recentAlertsResult,
    behaviourIncidentsResult,
    familyCaregiversResult,
  ] = await Promise.all([
    // Latest location
    supabase
      .from('location_logs')
      .select('*')
      .eq('household_id', household.id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single(),

    // Recent alerts (last 24h)
    supabase
      .from('location_alerts')
      .select('*')
      .eq('household_id', household.id)
      .gte('triggered_at', yesterday.toISOString())
      .order('triggered_at', { ascending: false }),

    // Behaviour incidents (last 30 days) for pattern insight + crisis logging
    supabase
      .from('behaviour_incidents')
      .select('*')
      .eq('household_id', household.id)
      .gte('logged_at', thirtyDaysAgo.toISOString())
      .order('logged_at', { ascending: false }),

    // Family caregivers
    supabase
      .from('caregivers')
      .select('id, name, email, role')
      .eq('household_id', household.id),
  ]);

  const familyCaregivers = (familyCaregiversResult.data || []) as { id: string; name: string; email: string; role: string }[];

  return (
    <CrisisClient
      caregiverId={caregiver.id}
      householdId={household.id}
      patientId={patient.id}
      country={householdCountry}
      patientName={patient.name}
      calmingStrategies={patient.calming_strategies || null}
      latestLocation={latestLocationResult.data}
      initialAlerts={recentAlertsResult.data || []}
      behaviourIncidents={behaviourIncidentsResult.data || []}
      familyCaregivers={familyCaregivers}
    />
  );
}
