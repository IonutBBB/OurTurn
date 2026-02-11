// Send Daily Summary Email
// This Edge Function is triggered by a cron job each evening

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || (Deno.env.get('ENVIRONMENT') === 'production' ? 'https://app.ourturn.com' : '*');

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = 'OurTurn <summary@ourturn.app>';

interface Caregiver {
  id: string;
  name: string;
  email: string;
  household_id: string;
  notification_preferences: {
    daily_summary: boolean;
    email_notifications: boolean;
  };
}

interface TaskCompletion {
  completed: boolean;
  task: {
    title: string;
    category: string;
  };
}

interface DailyCheckin {
  mood: number | null;
  sleep_quality: number | null;
  ai_summary: string | null;
}

interface Household {
  id: string;
  timezone: string;
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

    const today = new Date().toISOString().split('T')[0];

    // Get all households
    const { data: households } = await supabase
      .from('households')
      .select('id, timezone');

    if (!households || households.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No households found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let totalSent = 0;

    // Process each household
    for (const household of households) {
      try {
        await processHousehold(supabase, household, today);
        totalSent++;
      } catch (err) {
        console.error(`Error processing household ${household.id}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ success: true, households_processed: totalSent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error sending daily summaries:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processHousehold(supabase: any, household: Household, date: string): Promise<void> {
  // Get patient
  const { data: patient } = await supabase
    .from('patients')
    .select('name')
    .eq('household_id', household.id)
    .single();

  if (!patient) return;

  // Get caregivers who want daily summary
  const { data: caregivers } = await supabase
    .from('caregivers')
    .select('id, name, email, notification_preferences')
    .eq('household_id', household.id);

  const recipients = (caregivers || []).filter(
    (c: Caregiver) =>
      c.notification_preferences?.daily_summary !== false &&
      c.notification_preferences?.email_notifications !== false
  );

  if (recipients.length === 0) return;

  // Get today's task completions
  const { data: completions } = await supabase
    .from('task_completions')
    .select(`
      completed,
      task:care_plan_tasks (title, category)
    `)
    .eq('household_id', household.id)
    .eq('date', date);

  // Get today's check-in
  const { data: checkin } = await supabase
    .from('daily_checkins')
    .select('mood, sleep_quality, ai_summary')
    .eq('household_id', household.id)
    .eq('date', date)
    .single();

  // Get today's journal entries
  const { data: journalEntries } = await supabase
    .from('care_journal_entries')
    .select('content, entry_type, author:caregivers(name)')
    .eq('household_id', household.id)
    .gte('created_at', `${date}T00:00:00`)
    .lt('created_at', `${date}T23:59:59`)
    .limit(5);

  // Build and send email
  const { subject, body } = buildSummaryEmail(
    patient.name,
    date,
    completions || [],
    checkin,
    journalEntries || []
  );

  // Send to all opted-in caregivers
  for (const caregiver of recipients) {
    await sendEmail(caregiver.email, subject, body);
  }
}

function buildSummaryEmail(
  patientName: string,
  date: string,
  completions: TaskCompletion[],
  checkin: DailyCheckin | null,
  journalEntries: any[]
): { subject: string; body: string } {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Calculate task stats
  const completedTasks = completions.filter(c => c.completed).length;
  const totalTasks = completions.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Mood emoji
  const moodEmojis = ['', '😢', '😕', '😐', '🙂', '😊'];
  const moodEmoji = checkin?.mood ? moodEmojis[checkin.mood] : '—';
  const sleepEmojis = ['', '😴', '💤', '⭐'];
  const sleepEmoji = checkin?.sleep_quality ? sleepEmojis[checkin.sleep_quality] : '—';

  // Build task list HTML
  const taskListHtml = completions.length > 0
    ? completions.map(c => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #E7E5E4;">
            ${c.completed ? '✅' : '⬜'} ${c.task?.title || 'Task'}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #E7E5E4; color: #57534E; text-transform: capitalize;">
            ${c.task?.category || ''}
          </td>
        </tr>
      `).join('')
    : '<tr><td style="padding: 8px; color: #A8A29E;">No tasks scheduled for today</td></tr>';

  // Build journal entries HTML
  const journalHtml = journalEntries.length > 0
    ? journalEntries.map(e => `
        <div style="margin-bottom: 12px; padding: 12px; background: #F5F5F4; border-radius: 8px;">
          <p style="margin: 0; color: #1C1917;">${e.content}</p>
          <p style="margin: 4px 0 0; font-size: 12px; color: #A8A29E;">— ${e.author?.name || 'Unknown'}</p>
        </div>
      `).join('')
    : '<p style="color: #A8A29E;">No journal entries today</p>';

  return {
    subject: `Daily Summary for ${patientName} — ${formattedDate}`,
    body: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #FAFAF8; padding: 24px;">
        <h1 style="color: #0D9488; margin-bottom: 8px;">Daily Summary</h1>
        <p style="color: #57534E; margin-top: 0;">How ${patientName}'s day went on ${formattedDate}</p>

        <!-- Check-in Card -->
        <div style="background: white; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #E7E5E4;">
          <h2 style="margin: 0 0 16px; font-size: 18px; color: #1C1917;">Daily Check-in</h2>
          <div style="display: flex; gap: 24px;">
            <div>
              <p style="margin: 0; color: #57534E; font-size: 14px;">Mood</p>
              <p style="margin: 4px 0 0; font-size: 24px;">${moodEmoji}</p>
            </div>
            <div>
              <p style="margin: 0; color: #57534E; font-size: 14px;">Sleep</p>
              <p style="margin: 4px 0 0; font-size: 24px;">${sleepEmoji}</p>
            </div>
          </div>
          ${checkin?.ai_summary ? `<p style="margin: 16px 0 0; color: #57534E; font-style: italic;">"${checkin.ai_summary}"</p>` : ''}
        </div>

        <!-- Tasks Card -->
        <div style="background: white; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #E7E5E4;">
          <h2 style="margin: 0 0 4px; font-size: 18px; color: #1C1917;">Care Plan Tasks</h2>
          <p style="margin: 0 0 16px; color: #57534E;">
            <strong style="color: #0D9488;">${completedTasks}</strong> of <strong>${totalTasks}</strong> completed (${completionRate}%)
          </p>
          <table style="width: 100%; border-collapse: collapse;">
            ${taskListHtml}
          </table>
        </div>

        <!-- Journal Card -->
        <div style="background: white; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #E7E5E4;">
          <h2 style="margin: 0 0 16px; font-size: 18px; color: #1C1917;">Care Journal</h2>
          ${journalHtml}
        </div>

        <hr style="border: none; border-top: 1px solid #E7E5E4; margin: 24px 0;">
        <p style="font-size: 12px; color: #A8A29E; text-align: center;">
          This is your daily summary from OurTurn.<br>
          You can manage notification preferences in the app settings.
        </p>
      </div>
    `,
  };
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
