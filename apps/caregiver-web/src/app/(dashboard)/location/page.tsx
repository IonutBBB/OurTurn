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
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-6">Location & Safety</h1>
        <div className="bg-surface-card rounded-xl border border-surface-border p-8 text-center">
          <p className="text-text-muted">Please complete onboarding first.</p>
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
