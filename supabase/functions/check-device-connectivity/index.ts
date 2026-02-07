// Check Device Connectivity Edge Function
// Cron every 10 minutes: detects patient devices that have gone offline
// during waking hours and alerts caregivers via push notification

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface Patient {
  id: string;
  name: string;
  household_id: string;
  last_seen_at: string | null;
  wake_time: string;
  sleep_time: string;
}

interface Household {
  id: string;
  offline_alert_minutes: number;
  timezone: string;
}

interface Caregiver {
  id: string;
  name: string;
  device_tokens: string[];
  notification_preferences: {
    safety_alerts: boolean;
  };
}

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // Get all households with their offline_alert_minutes
    const { data: households, error: householdsError } = await supabase
      .from('households')
      .select('id, offline_alert_minutes, timezone');

    if (householdsError) {
      console.error('Error fetching households:', householdsError);
      throw householdsError;
    }

    if (!households || households.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No households found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let alertsSent = 0;

    for (const household of households as Household[]) {
      try {
        const result = await checkHouseholdConnectivity(supabase, household, now, currentTime);
        if (result) alertsSent++;
      } catch (err) {
        console.error(`Error checking connectivity for household ${household.id}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ success: true, alerts_sent: alertsSent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in check-device-connectivity:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function checkHouseholdConnectivity(
  supabase: any,
  household: Household,
  now: Date,
  currentTime: string
): Promise<boolean> {
  const offlineMinutes = household.offline_alert_minutes || 30;

  // Get the patient for this household
  const { data: patient } = await supabase
    .from('patients')
    .select('id, name, household_id, last_seen_at, wake_time, sleep_time')
    .eq('household_id', household.id)
    .single();

  if (!patient) return false;

  // Check if patient is within waking hours
  const wakeTime = patient.wake_time || '08:00';
  const sleepTime = patient.sleep_time || '21:00';

  if (!isWithinWakeHours(currentTime, wakeTime, sleepTime)) {
    return false;
  }

  // Check if last_seen_at is older than offline_alert_minutes
  if (!patient.last_seen_at) {
    // No last_seen_at recorded — skip (device may not have connected yet)
    return false;
  }

  const lastSeenAt = new Date(patient.last_seen_at);
  const offlineThreshold = new Date(now.getTime() - offlineMinutes * 60 * 1000);

  if (lastSeenAt >= offlineThreshold) {
    // Patient device is still within the acceptable window
    return false;
  }

  // Deduplicate: check if an 'inactive' alert was sent in the last hour
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

  const { data: recentAlerts } = await supabase
    .from('location_alerts')
    .select('id')
    .eq('household_id', household.id)
    .eq('type', 'inactive')
    .gte('triggered_at', oneHourAgo)
    .limit(1);

  if (recentAlerts && recentAlerts.length > 0) {
    console.log(`Skipping household ${household.id}: inactive alert already sent within the last hour`);
    return false;
  }

  console.log(`Patient ${patient.name} (household ${household.id}) has been offline since ${patient.last_seen_at}`);

  // Insert a location_alert with type 'inactive'
  const { error: insertError } = await supabase
    .from('location_alerts')
    .insert({
      household_id: household.id,
      type: 'inactive',
      triggered_at: now.toISOString(),
      location_label: 'Device offline',
    });

  if (insertError) {
    console.error(`Failed to insert inactive alert for household ${household.id}:`, insertError);
    return false;
  }

  // Send push notification to caregivers
  await notifyCaregivers(supabase, household.id, patient.name);

  return true;
}

async function notifyCaregivers(
  supabase: any,
  householdId: string,
  patientName: string
): Promise<void> {
  // Get all caregivers who want safety alerts and have device tokens
  const { data: caregivers } = await supabase
    .from('caregivers')
    .select('id, name, device_tokens, notification_preferences')
    .eq('household_id', householdId);

  if (!caregivers || caregivers.length === 0) {
    console.log(`No caregivers found for household ${householdId}`);
    return;
  }

  // Collect all device tokens from caregivers who want safety alerts
  const tokens: string[] = [];
  caregivers.forEach((caregiver: Caregiver) => {
    if (
      caregiver.notification_preferences?.safety_alerts !== false &&
      caregiver.device_tokens &&
      Array.isArray(caregiver.device_tokens)
    ) {
      tokens.push(...caregiver.device_tokens);
    }
  });

  if (tokens.length === 0) {
    console.log(`No device tokens found for household ${householdId}`);
    return;
  }

  const messages: ExpoPushMessage[] = tokens.map((token) => ({
    to: token,
    title: 'Device Connectivity Alert',
    body: `No recent activity from ${patientName}'s device. The device may be offline or not with them.`,
    sound: 'default',
    priority: 'high' as const,
    channelId: 'safety-alerts',
    data: {
      type: 'device_connectivity',
      householdId,
    },
  }));

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(messages),
    });

    if (response.ok) {
      console.log(`Sent connectivity alert to ${tokens.length} token(s) for household ${householdId}`);
    } else {
      console.error('Expo push error:', await response.text());
    }
  } catch (err) {
    console.error('Failed to send push notifications:', err);
  }
}

function isWithinWakeHours(currentTime: string, wakeTime: string, sleepTime: string): boolean {
  // Default wake/sleep times if not set
  const wake = wakeTime || '08:00';
  const sleep = sleepTime || '21:00';

  // Simple comparison (assumes same day, doesn't handle midnight crossing)
  return currentTime >= wake && currentTime <= sleep;
}
