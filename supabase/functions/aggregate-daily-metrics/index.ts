// Aggregate Daily Metrics Edge Function
// Cron daily evening: aggregates each household's daily engagement data
// into the engagement_metrics table for reporting and burnout detection

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || (Deno.env.get('ENVIRONMENT') === 'production' ? 'https://app.ourturn.com' : '*');

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Household {
  id: string;
  timezone: string;
}

interface TaskCompletion {
  completed: boolean;
  skipped: boolean;
}

interface DailyCheckin {
  mood: number | null;
  sleep_quality: number | null;
  submitted_at: string | null;
}

interface BrainActivity {
  completed: boolean;
  duration_seconds: number | null;
}

interface LocationAlert {
  id: string;
  type: string;
}

interface EngagementMetrics {
  household_id: string;
  date: string;
  tasks_total: number;
  tasks_completed: number;
  tasks_skipped: number;
  checkin_completed: boolean;
  checkin_mood: number | null;
  checkin_sleep: number | null;
  brain_activity_completed: boolean;
  brain_activity_duration_seconds: number;
  location_alerts_count: number;
  sos_triggered: boolean;
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

    const today = new Date().toISOString().split('T')[0];

    // Get all households
    const { data: households, error: householdsError } = await supabase
      .from('households')
      .select('id, timezone');

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

    let processed = 0;

    // Process each household
    for (const household of households as Household[]) {
      try {
        await aggregateHouseholdMetrics(supabase, household, today);
        processed++;
      } catch (err) {
        console.error(`Error aggregating metrics for household ${household.id}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ success: true, households_processed: processed, date: today }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in aggregate-daily-metrics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function aggregateHouseholdMetrics(
  supabase: any,
  household: Household,
  date: string
): Promise<void> {
  // 1. Task completions for today
  const { data: completions } = await supabase
    .from('task_completions')
    .select('completed, skipped')
    .eq('household_id', household.id)
    .eq('date', date);

  const taskCompletions = (completions || []) as TaskCompletion[];
  const tasksTotal = taskCompletions.length;
  const tasksCompleted = taskCompletions.filter((c) => c.completed).length;
  const tasksSkipped = taskCompletions.filter((c) => c.skipped).length;

  // 2. Daily check-in for today
  const { data: checkin } = await supabase
    .from('daily_checkins')
    .select('mood, sleep_quality, submitted_at')
    .eq('household_id', household.id)
    .eq('date', date)
    .single();

  const dailyCheckin = checkin as DailyCheckin | null;
  const checkinCompleted = dailyCheckin?.submitted_at != null;
  const checkinMood = dailyCheckin?.mood || null;
  const checkinSleep = dailyCheckin?.sleep_quality || null;

  // 3. Brain activity for today
  const { data: brainActivity } = await supabase
    .from('brain_activities')
    .select('completed, duration_seconds')
    .eq('household_id', household.id)
    .eq('date', date)
    .single();

  const activity = brainActivity as BrainActivity | null;
  const brainActivityCompleted = activity?.completed || false;
  const brainActivityDurationSeconds = activity?.duration_seconds || 0;

  // 4. Location alerts for today
  const { data: alerts } = await supabase
    .from('location_alerts')
    .select('id, type')
    .eq('household_id', household.id)
    .gte('triggered_at', `${date}T00:00:00`)
    .lt('triggered_at', `${date}T23:59:59`);

  const locationAlerts = (alerts || []) as LocationAlert[];
  const locationAlertsCount = locationAlerts.length;
  const sosTriggered = locationAlerts.some((a) => a.type === 'sos_triggered');

  // 5. Upsert into engagement_metrics
  const metrics: EngagementMetrics = {
    household_id: household.id,
    date,
    tasks_total: tasksTotal,
    tasks_completed: tasksCompleted,
    tasks_skipped: tasksSkipped,
    checkin_completed: checkinCompleted,
    checkin_mood: checkinMood,
    checkin_sleep: checkinSleep,
    brain_activity_completed: brainActivityCompleted,
    brain_activity_duration_seconds: brainActivityDurationSeconds,
    location_alerts_count: locationAlertsCount,
    sos_triggered: sosTriggered,
  };

  const { error: upsertError } = await supabase
    .from('engagement_metrics')
    .upsert(metrics, { onConflict: 'household_id,date' });

  if (upsertError) {
    console.error(`Failed to upsert metrics for household ${household.id}:`, upsertError);
    throw upsertError;
  }

  console.log(
    `Aggregated metrics for household ${household.id} on ${date}: ` +
    `${tasksCompleted}/${tasksTotal} tasks, ` +
    `checkin=${checkinCompleted}, ` +
    `brain=${brainActivityCompleted}, ` +
    `alerts=${locationAlertsCount}, ` +
    `sos=${sosTriggered}`
  );
}
