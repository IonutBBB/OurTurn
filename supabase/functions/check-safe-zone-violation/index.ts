// Check Safe Zone Violation Edge Function
// Triggered by DB webhook on location_logs INSERT.
// Checks whether the logged location falls outside all active safe zones
// for the household. If so, and no recent left_safe_zone alert exists
// (30-min dedup window), inserts a location_alert which triggers the
// existing escalation pipeline (DB trigger → email → push → escalation).

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SafeZone {
  id: string;
  household_id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  active: boolean;
}

interface LocationLogRecord {
  id: string;
  patient_id: string;
  household_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy_meters: number | null;
}

// Haversine distance in meters (duplicated from packages/shared/types/location.ts
// because Edge Functions cannot import from monorepo packages)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function isInsideSafeZone(
  lat: number,
  lon: number,
  zone: SafeZone
): boolean {
  const distance = calculateDistance(lat, lon, zone.latitude, zone.longitude);
  return distance <= zone.radius_meters;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Parse webhook payload
    const payload = await req.json();
    const record: LocationLogRecord = payload.record;

    if (!record || !record.household_id || record.latitude == null || record.longitude == null) {
      return new Response(
        JSON.stringify({ message: 'Invalid payload — missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { household_id, latitude, longitude } = record;

    // 1. Fetch active safe zones for this household
    const { data: safeZones, error: zonesError } = await supabase
      .from('safe_zones')
      .select('*')
      .eq('household_id', household_id)
      .eq('active', true);

    if (zonesError) {
      console.error('Error fetching safe zones:', zonesError);
      throw zonesError;
    }

    // No safe zones configured — nothing to check
    if (!safeZones || safeZones.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active safe zones for household' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Check if the location is inside any safe zone
    const insideAnyZone = (safeZones as SafeZone[]).some((zone) =>
      isInsideSafeZone(latitude, longitude, zone)
    );

    if (insideAnyZone) {
      return new Response(
        JSON.stringify({ message: 'Location is within a safe zone' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Dedup: check if a left_safe_zone alert was already created in the last 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: recentAlerts } = await supabase
      .from('location_alerts')
      .select('id')
      .eq('household_id', household_id)
      .eq('type', 'left_safe_zone')
      .gte('triggered_at', thirtyMinutesAgo)
      .limit(1);

    if (recentAlerts && recentAlerts.length > 0) {
      console.log(`Skipping household ${household_id}: left_safe_zone alert already sent within 30 minutes`);
      return new Response(
        JSON.stringify({ message: 'Recent alert exists — dedup skip' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Patient is outside all safe zones — create alert
    console.log(`Patient outside safe zones for household ${household_id} at (${latitude}, ${longitude})`);

    const { error: insertError } = await supabase
      .from('location_alerts')
      .insert({
        household_id,
        type: 'left_safe_zone',
        latitude,
        longitude,
        triggered_at: new Date().toISOString(),
        location_label: 'Outside safe zone',
      });

    if (insertError) {
      console.error(`Failed to insert left_safe_zone alert for household ${household_id}:`, insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Safe zone violation alert created' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in check-safe-zone-violation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
