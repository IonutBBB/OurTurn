import { createClient as createServerClient } from '@/lib/supabase/server';
import LocationClient from './location-client';

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
  const patient = household?.patients?.[0];

  if (!household || !patient) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Location & Safety</h1>
          <p className="text-text-secondary mt-2">Monitor location and set up safe zones</p>
        </div>
        <div className="card-elevated rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📍</span>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">Complete Setup First</h2>
          <p className="text-text-secondary mb-6">
            Set up your care profile to enable location tracking and safety features.
          </p>
          <a
            href="/onboarding"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold rounded-xl shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            Start Onboarding
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
      homeAddress={household.home_address}
      homeLatitude={household.home_latitude}
      homeLongitude={household.home_longitude}
      latestLocation={latestLocation}
      locationHistory={locationHistory || []}
      safeZones={safeZones || []}
      recentAlerts={recentAlerts || []}
      caregiverId={caregiver.id}
    />
  );
}
