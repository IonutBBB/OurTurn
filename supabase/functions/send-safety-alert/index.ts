// Send Safety Alert Email
// This Edge Function is triggered by database webhooks when a location_alert is inserted

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || (Deno.env.get('ENVIRONMENT') === 'production' ? 'https://app.ourturn.com' : '*');

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = 'OurTurn Care <alerts@ourturn.app>';

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
  notification_preferences: {
    safety_alerts: boolean;
    email_notifications: boolean;
  };
}

interface Patient {
  name: string;
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

    // Get all caregivers who want safety alerts
    const { data: caregivers } = await supabase
      .from('caregivers')
      .select('id, name, email, notification_preferences')
      .eq('household_id', alert.household_id);

    if (!caregivers || caregivers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No caregivers found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const patientName = patient?.name || 'Your loved one';

    // Build email content based on alert type
    const { subject, body } = buildEmailContent(alert, patientName);

    // Filter caregivers who want safety alerts via email
    const recipients = caregivers.filter(
      (c: Caregiver) =>
        c.notification_preferences?.safety_alerts !== false &&
        c.notification_preferences?.email_notifications !== false
    );

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No recipients opted in for safety alerts' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send email to each recipient
    const emailPromises = recipients.map((caregiver: Caregiver) =>
      sendEmail(caregiver.email, caregiver.name, subject, body)
    );

    await Promise.all(emailPromises);

    return new Response(
      JSON.stringify({ success: true, sent_to: recipients.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error sending safety alert:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildEmailContent(alert: LocationAlert, patientName: string): { subject: string; body: string } {
  const time = new Date(alert.triggered_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const locationInfo = alert.location_label || (alert.latitude && alert.longitude
    ? `Location: ${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}`
    : 'Location unavailable');

  switch (alert.type) {
    case 'sos_triggered':
      return {
        subject: `URGENT: ${patientName} has triggered an SOS alert`,
        body: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #DC2626; color: white; padding: 16px 24px; border-radius: 12px 12px 0 0;">
              <h2 style="margin: 0; font-size: 24px;">🆘 SOS Emergency Alert</h2>
            </div>
            <div style="padding: 24px; border: 2px solid #DC2626; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 18px;"><strong>${patientName}</strong> has triggered an SOS emergency alert at <strong>${time}</strong>.</p>
              <p style="font-size: 16px;">${locationInfo}</p>
              <p style="font-size: 16px; color: #DC2626; font-weight: bold;">Please check on them immediately.</p>
              ${alert.latitude && alert.longitude ? `
              <p style="margin-top: 24px;">
                <a href="https://maps.google.com/?q=${alert.latitude},${alert.longitude}" style="display: inline-block; background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Location on Map</a>
              </p>
              ` : ''}
              <hr style="border: none; border-top: 1px solid #E7E5E4; margin: 24px 0;">
              <p style="font-size: 12px; color: #A8A29E;">
                This is an urgent automated alert from OurTurn Care.
              </p>
            </div>
          </div>
        `,
      };

    case 'take_me_home_tapped':
      return {
        subject: `${patientName} tapped "Take Me Home"`,
        body: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0D9488;">Take Me Home Alert</h2>
            <p><strong>${patientName}</strong> tapped the "Take Me Home" button at <strong>${time}</strong>.</p>
            <p>${locationInfo}</p>
            <p>They may need assistance finding their way home. Google Maps has opened on their device with directions.</p>
            <p style="margin-top: 24px; color: #57534E;">
              <a href="https://maps.google.com/?q=${alert.latitude},${alert.longitude}" style="color: #0D9488;">View on Google Maps</a>
            </p>
            <hr style="border: none; border-top: 1px solid #E7E5E4; margin: 24px 0;">
            <p style="font-size: 12px; color: #A8A29E;">
              This is an automated alert from OurTurn Care. You can manage your notification preferences in the app settings.
            </p>
          </div>
        `,
      };

    case 'left_safe_zone':
      return {
        subject: `${patientName} has left a safe zone`,
        body: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #DC2626;">Safe Zone Alert</h2>
            <p><strong>${patientName}</strong> has left a designated safe zone at <strong>${time}</strong>.</p>
            <p>${locationInfo}</p>
            <p>Consider checking in to make sure everything is okay.</p>
            <p style="margin-top: 24px;">
              <a href="https://maps.google.com/?q=${alert.latitude},${alert.longitude}" style="color: #0D9488;">View current location</a>
            </p>
            <hr style="border: none; border-top: 1px solid #E7E5E4; margin: 24px 0;">
            <p style="font-size: 12px; color: #A8A29E;">
              This is an automated alert from OurTurn Care. You can manage safe zones and notifications in the app settings.
            </p>
          </div>
        `,
      };

    case 'night_movement':
      return {
        subject: `Night activity detected for ${patientName}`,
        body: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #F59E0B;">Night Movement Alert</h2>
            <p>Unusual activity was detected for <strong>${patientName}</strong> at <strong>${time}</strong>.</p>
            <p>${locationInfo}</p>
            <p>This may indicate nighttime wandering. You may want to check in.</p>
            <hr style="border: none; border-top: 1px solid #E7E5E4; margin: 24px 0;">
            <p style="font-size: 12px; color: #A8A29E;">
              This is an automated alert from OurTurn Care. You can adjust night monitoring settings in the app.
            </p>
          </div>
        `,
      };

    case 'inactive':
      return {
        subject: `No activity from ${patientName}`,
        body: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #F59E0B;">Inactivity Alert</h2>
            <p>We haven't detected activity from <strong>${patientName}</strong>'s device for an extended period.</p>
            <p>Last known activity: <strong>${time}</strong></p>
            <p>${locationInfo}</p>
            <p>This could mean the device is not with them, or they may need assistance. Consider checking in.</p>
            <hr style="border: none; border-top: 1px solid #E7E5E4; margin: 24px 0;">
            <p style="font-size: 12px; color: #A8A29E;">
              This is an automated alert from OurTurn Care.
            </p>
          </div>
        `,
      };

    default:
      return {
        subject: `OurTurn Care Alert for ${patientName}`,
        body: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0D9488;">OurTurn Care Alert</h2>
            <p>An alert was triggered for <strong>${patientName}</strong> at <strong>${time}</strong>.</p>
            <p>${locationInfo}</p>
            <hr style="border: none; border-top: 1px solid #E7E5E4; margin: 24px 0;">
            <p style="font-size: 12px; color: #A8A29E;">
              This is an automated alert from OurTurn Care.
            </p>
          </div>
        `,
      };
  }
}

async function sendEmail(to: string, recipientName: string, subject: string, htmlBody: string): Promise<void> {
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
