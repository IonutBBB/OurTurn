// Send Push Notification for Safety Alerts
// This Edge Function is triggered by database webhooks when a location_alert is inserted

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface LocationAlert {
  id: string;
  household_id: string;
  type: 'left_safe_zone' | 'inactive' | 'night_movement' | 'take_me_home_tapped';
  triggered_at: string;
  latitude: number | null;
  longitude: number | null;
  location_label: string | null;
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
  data?: Record<string, any>;
  sound?: 'default' | null;
  badge?: number;
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

    // Get the alert from request body (from database webhook)
    const { record } = await req.json();
    const alert = record as LocationAlert;

    if (!alert || !alert.household_id) {
      throw new Error('Invalid alert data');
    }

    // Get patient name
    const { data: patient } = await supabase
      .from('patients')
      .select('name')
      .eq('household_id', alert.household_id)
      .single();

    // Get all caregivers who want safety alerts and have device tokens
    const { data: caregivers } = await supabase
      .from('caregivers')
      .select('id, name, device_tokens, notification_preferences')
      .eq('household_id', alert.household_id);

    if (!caregivers || caregivers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No caregivers found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const patientName = patient?.name || 'Your loved one';

    // Build notification content
    const { title, body } = buildNotificationContent(alert, patientName);

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
      return new Response(
        JSON.stringify({ message: 'No device tokens found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send push notifications
    const messages: ExpoPushMessage[] = tokens.map((token) => ({
      to: token,
      title,
      body,
      sound: 'default',
      priority: 'high',
      channelId: 'safety-alerts',
      data: {
        alertId: alert.id,
        alertType: alert.type,
        householdId: alert.household_id,
        latitude: alert.latitude,
        longitude: alert.longitude,
      },
    }));

    // Send to Expo push notification service
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Expo push error:', error);
      throw new Error(`Failed to send push notifications: ${error}`);
    }

    const result = await response.json();
    console.log('Push notification result:', result);

    return new Response(
      JSON.stringify({ success: true, sent_to: tokens.length, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildNotificationContent(
  alert: LocationAlert,
  patientName: string
): { title: string; body: string } {
  switch (alert.type) {
    case 'take_me_home_tapped':
      return {
        title: 'Take Me Home Alert',
        body: `${patientName} tapped "Take Me Home" and may need help finding their way.`,
      };

    case 'left_safe_zone':
      return {
        title: 'Safe Zone Alert',
        body: `${patientName} has left a designated safe zone.`,
      };

    case 'night_movement':
      return {
        title: 'Night Movement',
        body: `Unusual activity detected for ${patientName} during night hours.`,
      };

    case 'inactive':
      return {
        title: 'Inactivity Alert',
        body: `No recent activity from ${patientName}'s device.`,
      };

    default:
      return {
        title: 'OurTurn Alert',
        body: `An alert was triggered for ${patientName}.`,
      };
  }
}
