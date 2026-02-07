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
    crisisEntriesResult,
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

    // Crisis journal entries (last 30 days)
    supabase
      .from('care_journal_entries')
      .select('id, content, created_at, author_id, caregivers!care_journal_entries_author_id_fkey(name)')
      .eq('household_id', household.id)
      .eq('entry_type', 'crisis')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10),

    // Family caregivers
    supabase
      .from('caregivers')
      .select('id, name, email, role')
      .eq('household_id', household.id),
  ]);

  // Transform crisis entries to include author name
  const crisisEntries = (crisisEntriesResult.data || []).map((entry: any) => {
    const authorData = entry.caregivers;
    const authorName = Array.isArray(authorData)
      ? authorData[0]?.name || 'Unknown'
      : authorData?.name || 'Unknown';
    return {
      id: entry.id,
      content: entry.content,
      created_at: entry.created_at,
      author_name: authorName,
    };
  });

  // Find primary caregiver (not current user) for remote mode
  const familyCaregivers = (familyCaregiversResult.data || []) as { id: string; name: string; email: string; role: string }[];
  const primaryCaregiver = familyCaregivers.find(
    (c) => c.role === 'primary' && c.id !== caregiver.id
  ) || familyCaregivers.find((c) => c.id !== caregiver.id) || null;

  return (
    <CrisisClient
      caregiverId={caregiver.id}
      householdId={household.id}
      country={householdCountry}
      patientName={patient.name}
      latestLocation={latestLocationResult.data}
      initialAlerts={recentAlertsResult.data || []}
      crisisEntries={crisisEntries}
      familyCaregivers={familyCaregivers}
      primaryCaregiver={primaryCaregiver}
    />
  );
}
