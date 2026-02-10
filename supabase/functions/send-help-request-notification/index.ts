// Send Push Notification for Help Requests
// Triggered by database webhook on caregiver_help_requests INSERT
// Notifies all household caregivers except the requester

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || '*';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface HelpRequest {
  id: string;
  requester_id: string;
  household_id: string;
  message: string;
  template_key: string | null;
}

interface Caregiver {
  id: string;
  name: string;
  device_tokens: string[];
  notification_preferences: {
    safety_alerts?: boolean;
    help_requests?: boolean;
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get the help request from database webhook
    const { record } = await req.json();
    const helpRequest = record as HelpRequest;

    if (!helpRequest || !helpRequest.household_id) {
      throw new Error('Invalid help request data');
    }

    // Get requester's name
    const { data: requester } = await supabase
      .from('caregivers')
      .select('name')
      .eq('id', helpRequest.requester_id)
      .single();

    const requesterName = requester?.name || 'A family member';

    // Get all caregivers in household EXCEPT the requester
    const { data: caregivers } = await supabase
      .from('caregivers')
      .select('id, name, device_tokens, notification_preferences')
      .eq('household_id', helpRequest.household_id)
      .neq('id', helpRequest.requester_id);

    if (!caregivers || caregivers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No other caregivers found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Collect device tokens from caregivers who accept help request notifications
    const tokens: string[] = [];
    caregivers.forEach((caregiver: Caregiver) => {
      // Default to true if preference not explicitly set to false
      if (
        caregiver.notification_preferences?.help_requests !== false &&
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

    // Truncate message for push notification body
    const messagePreview = helpRequest.message.length > 100
      ? helpRequest.message.substring(0, 97) + '...'
      : helpRequest.message;

    // Send push notifications (normal priority, not high like safety alerts)
    const messages: ExpoPushMessage[] = tokens.map((token) => ({
      to: token,
      title: 'Help Needed',
      body: `${requesterName}: ${messagePreview}`,
      sound: 'default',
      priority: 'normal',
      channelId: 'help-requests',
      data: {
        type: 'help_request',
        requestId: helpRequest.id,
        householdId: helpRequest.household_id,
      },
    }));

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
    console.log('Help request notification result:', result);

    return new Response(
      JSON.stringify({ success: true, sent_to: tokens.length, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending help request notification:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
