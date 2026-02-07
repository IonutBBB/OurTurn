// Escalate Alerts Edge Function
// Cron every 2 minutes: processes unresolved alert escalations through 3 levels
// Level 0: Push + email to all caregivers
// Level 1: Email to emergency contacts as fallback
// Level 2: No further auto-escalation, just log

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = 'OurTurn <alerts@ourturn.app>';

interface AlertEscalation {
  id: string;
  alert_id: string;
  household_id: string;
  escalation_level: number;
  escalated_at: string;
  next_escalation_at: string;
  resolved: boolean;
}

interface LocationAlert {
  id: string;
  household_id: string;
  type: 'left_safe_zone' | 'inactive' | 'night_movement' | 'take_me_home_tapped' | 'sos_triggered';
  triggered_at: string;
  latitude: number | null;
  longitude: number | null;
  location_label: string | null;
}

interface Caregiver {
  id: string;
  name: string;
  email: string;
  device_tokens: string[];
  notification_preferences: {
    safety_alerts: boolean;
    email_notifications: boolean;
  };
}

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  email?: string;
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
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Query unresolved escalations where next_escalation_at has passed
    const { data: escalations, error: escalationsError } = await supabase
      .from('alert_escalations')
      .select('*')
      .eq('resolved', false)
      .lt('next_escalation_at', new Date().toISOString());

    if (escalationsError) {
      console.error('Error fetching escalations:', escalationsError);
      throw escalationsError;
    }

    if (!escalations || escalations.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No escalations to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${escalations.length} escalation(s)`);

    let processed = 0;

    for (const escalation of escalations as AlertEscalation[]) {
      try {
        await processEscalation(supabase, escalation);
        processed++;
      } catch (err) {
        console.error(`Error processing escalation ${escalation.id}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ success: true, escalations_processed: processed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in escalate-alerts:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processEscalation(supabase: any, escalation: AlertEscalation): Promise<void> {
  // Fetch the original alert
  const { data: alert } = await supabase
    .from('location_alerts')
    .select('*')
    .eq('id', escalation.alert_id)
    .single();

  if (!alert) {
    console.error(`Alert ${escalation.alert_id} not found for escalation ${escalation.id}`);
    return;
  }

  // Get patient name
  const { data: patient } = await supabase
    .from('patients')
    .select('name, emergency_contacts')
    .eq('household_id', escalation.household_id)
    .single();

  const patientName = patient?.name || 'Your loved one';

  // Get household escalation_minutes
  const { data: household } = await supabase
    .from('households')
    .select('escalation_minutes')
    .eq('id', escalation.household_id)
    .single();

  const escalationMinutes = household?.escalation_minutes || 5;

  const currentLevel = escalation.escalation_level;

  if (currentLevel === 0) {
    // Level 0: Send push notification + email to ALL caregivers
    await escalateLevel0(supabase, escalation, alert as LocationAlert, patientName);
  } else if (currentLevel === 1) {
    // Level 1: Send email to emergency contacts as fallback
    await escalateLevel1(supabase, escalation, alert as LocationAlert, patientName, patient?.emergency_contacts);
  } else {
    // Level 2+: No further auto-escalation, just log
    console.log(`Escalation ${escalation.id} reached level ${currentLevel} — no further auto-escalation`);
  }

  // Increment escalation_level and update next_escalation_at
  const nextEscalationAt = new Date(Date.now() + escalationMinutes * 60 * 1000).toISOString();

  const { error: updateError } = await supabase
    .from('alert_escalations')
    .update({
      escalation_level: currentLevel + 1,
      next_escalation_at: nextEscalationAt,
      escalated_at: new Date().toISOString(),
    })
    .eq('id', escalation.id);

  if (updateError) {
    console.error(`Failed to update escalation ${escalation.id}:`, updateError);
  }
}

async function escalateLevel0(
  supabase: any,
  escalation: AlertEscalation,
  alert: LocationAlert,
  patientName: string
): Promise<void> {
  console.log(`Level 0 escalation for alert ${alert.id}: notifying all caregivers`);

  // Get all caregivers in the household
  const { data: caregivers } = await supabase
    .from('caregivers')
    .select('id, name, email, device_tokens, notification_preferences')
    .eq('household_id', escalation.household_id);

  if (!caregivers || caregivers.length === 0) {
    console.log(`No caregivers found for household ${escalation.household_id}`);
    return;
  }

  const { title, body } = buildEscalationContent(alert, patientName, 0);

  // Send push notifications to all caregivers with device tokens
  const tokens: string[] = [];
  caregivers.forEach((caregiver: Caregiver) => {
    if (caregiver.device_tokens && Array.isArray(caregiver.device_tokens)) {
      tokens.push(...caregiver.device_tokens);
    }
  });

  if (tokens.length > 0) {
    const messages: ExpoPushMessage[] = tokens.map((token) => ({
      to: token,
      title,
      body,
      sound: 'default',
      priority: 'high' as const,
      channelId: 'safety-alerts',
      data: {
        alertId: alert.id,
        alertType: alert.type,
        escalationId: escalation.id,
        escalationLevel: 0,
        householdId: escalation.household_id,
      },
    }));

    try {
      const pushResponse = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(messages),
      });

      if (!pushResponse.ok) {
        console.error('Expo push error:', await pushResponse.text());
      } else {
        console.log(`Sent push notifications to ${tokens.length} token(s)`);
      }
    } catch (err) {
      console.error('Failed to send push notifications:', err);
    }
  }

  // Send email to all caregivers
  const { subject, htmlBody } = buildEscalationEmail(alert, patientName, 0);
  const emailRecipients = caregivers.filter(
    (c: Caregiver) => c.email
  );

  for (const caregiver of emailRecipients) {
    try {
      await sendEmail(caregiver.email, subject, htmlBody);
      console.log(`Sent escalation email to ${caregiver.email}`);
    } catch (err) {
      console.error(`Failed to send email to ${caregiver.email}:`, err);
    }
  }
}

async function escalateLevel1(
  _supabase: any,
  escalation: AlertEscalation,
  alert: LocationAlert,
  patientName: string,
  emergencyContacts: EmergencyContact[] | null
): Promise<void> {
  console.log(`Level 1 escalation for alert ${alert.id}: notifying emergency contacts`);

  const contacts = Array.isArray(emergencyContacts) ? emergencyContacts : [];

  if (contacts.length === 0) {
    console.log(`No emergency contacts found for household ${escalation.household_id}`);
    return;
  }

  const { subject, htmlBody } = buildEscalationEmail(alert, patientName, 1);

  // Send email to emergency contacts that have an email address
  for (const contact of contacts) {
    if (contact.email) {
      try {
        await sendEmail(contact.email, subject, htmlBody);
        console.log(`Sent emergency escalation email to ${contact.name} (${contact.email})`);
      } catch (err) {
        console.error(`Failed to send email to emergency contact ${contact.name}:`, err);
      }
    } else {
      console.log(`Emergency contact ${contact.name} has no email — skipping (phone: ${contact.phone})`);
    }
  }
}

function buildEscalationContent(
  alert: LocationAlert,
  patientName: string,
  level: number
): { title: string; body: string } {
  const levelLabel = level === 0 ? 'URGENT' : 'CRITICAL';

  switch (alert.type) {
    case 'sos_triggered':
      return {
        title: `${levelLabel}: SOS Alert — No Response`,
        body: `${patientName}'s SOS alert has not been acknowledged. Please respond immediately.`,
      };
    case 'left_safe_zone':
      return {
        title: `${levelLabel}: Safe Zone Alert — No Response`,
        body: `${patientName} left a safe zone and no caregiver has responded. Please check on them.`,
      };
    default:
      return {
        title: `${levelLabel}: Alert Escalation`,
        body: `An alert for ${patientName} has not been acknowledged. Please respond.`,
      };
  }
}

function buildEscalationEmail(
  alert: LocationAlert,
  patientName: string,
  level: number
): { subject: string; htmlBody: string } {
  const time = new Date(alert.triggered_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const locationInfo = alert.location_label || (alert.latitude && alert.longitude
    ? `Location: ${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}`
    : 'Location unavailable');

  const urgencyColor = level === 0 ? '#DC2626' : '#991B1B';
  const urgencyLabel = level === 0 ? 'URGENT — Escalation' : 'CRITICAL — Emergency Contact Notification';
  const alertTypeLabel = alert.type === 'sos_triggered' ? 'SOS Emergency' : 'Safe Zone Departure';

  const subject = level === 0
    ? `URGENT: ${patientName}'s ${alertTypeLabel} alert has not been acknowledged`
    : `CRITICAL: Emergency notification for ${patientName} — ${alertTypeLabel}`;

  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${urgencyColor}; color: white; padding: 16px 24px; border-radius: 12px 12px 0 0;">
        <h2 style="margin: 0; font-size: 22px;">${urgencyLabel}</h2>
      </div>
      <div style="padding: 24px; border: 2px solid ${urgencyColor}; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 18px;">
          <strong>${patientName}</strong> triggered a <strong>${alertTypeLabel}</strong> alert at <strong>${time}</strong>
          and no caregiver has acknowledged it yet.
        </p>
        <p style="font-size: 16px;">${locationInfo}</p>
        ${alert.latitude && alert.longitude ? `
        <p style="margin-top: 24px;">
          <a href="https://maps.google.com/?q=${alert.latitude},${alert.longitude}"
             style="display: inline-block; background: ${urgencyColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            View Location on Map
          </a>
        </p>
        ` : ''}
        <p style="font-size: 16px; color: ${urgencyColor}; font-weight: bold; margin-top: 16px;">
          Please check on ${patientName} immediately.
        </p>
        <hr style="border: none; border-top: 1px solid #E7E5E4; margin: 24px 0;">
        <p style="font-size: 12px; color: #A8A29E;">
          This is an automated escalation alert from OurTurn.
          ${level === 1 ? ' You are receiving this because you are listed as an emergency contact.' : ''}
        </p>
      </div>
    </div>
  `;

  return { subject, htmlBody };
}

async function sendEmail(to: string, subject: string, htmlBody: string): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject: subject,
      html: htmlBody,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Failed to send email to ${to}:`, error);
    throw new Error(`Failed to send email: ${error}`);
  }
}
