import { createClient as createServerClient } from '@/lib/supabase/server';
import LocationClient from './location-client';
import { getServerTranslations } from '@/lib/server-i18n';

export default async function LocationPage() {
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

  const translations = await getServerTranslations(household?.language);
  const t = translations.caregiverApp;

  if (!household || !patient) {
    return (
      <div className="page-enter space-y-6">
        <div>
          <h1 className="heading-display text-2xl">
            <span className="heading-accent">{t.location.pageTitle}</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1">{t.location.pageSubtitle}</p>
        </div>
        <div className="card-paper p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-100/60 dark:bg-brand-100/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">📍</span>
          </div>
          <h2 className="text-lg font-display font-bold text-text-primary mb-2">{t.location.completeSetupFirst}</h2>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            {t.location.setupDesc}
          </p>
          <a href="/onboarding" className="btn-primary inline-flex items-center">
            {t.location.startOnboarding}
          </a>
        </div>
      </div>
    );
  }

  // Get latest location
  const { data: latestLocation } = await supabase
    .from('location_logs')
    .select('*')
    .eq('household_id', household.id)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  // Get today's location history
  const today = new Date().toISOString().split('T')[0];
  const { data: locationHistory } = await supabase
    .from('location_logs')
    .select('*')
    .eq('household_id', household.id)
    .gte('timestamp', `${today}T00:00:00.000Z`)
    .lte('timestamp', `${today}T23:59:59.999Z`)
    .order('timestamp', { ascending: true });

  // Get safe zones
  const { data: safeZones } = await supabase
    .from('safe_zones')
    .select('*')
    .eq('household_id', household.id)
    .eq('active', true)
    .order('created_at', { ascending: true });

  // Get recent alerts (last 24 hours)
  const yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - 24);
  const { data: recentAlerts } = await supabase
    .from('location_alerts')
    .select('*')
    .eq('household_id', household.id)
    .gte('triggered_at', yesterday.toISOString())
    .order('triggered_at', { ascending: false });

  return (
    <LocationClient
      householdId={household.id}
      patientName={patient.name}
      homeAddress={patient.home_address_formatted}
      homeLatitude={patient.home_latitude}
      homeLongitude={patient.home_longitude}
      latestLocation={latestLocation}
      locationHistory={locationHistory || []}
      safeZones={safeZones || []}
      recentAlerts={recentAlerts || []}
      caregiverId={caregiver.id}
    />
  );
}
