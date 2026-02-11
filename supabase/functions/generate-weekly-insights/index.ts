// Generate Weekly Insights Edge Function
// Runs every Sunday at midnight via cron to analyze the week's wellness data
// and generate AI-powered insights for caregivers

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || (Deno.env.get('ENVIRONMENT') === 'production' ? 'https://app.ourturn.com' : '*');

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface DailyCheckin {
  date: string;
  mood: number | null;
  sleep_quality: number | null;
  voice_note_transcript: string | null;
}

interface TaskCompletion {
  task_id: string;
  date: string;
  completed: boolean;
  skipped: boolean;
  task: {
    category: string;
    title: string;
  };
}

interface JournalEntry {
  content: string;
  entry_type: string;
  created_at: string;
}

interface Insight {
  insight: string;
  suggestion: string;
  category: 'positive' | 'attention' | 'suggestion';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY is not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Calculate week boundaries (last 7 days)
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setHours(23, 59, 59, 999);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    console.log(`Generating insights for week: ${weekStartStr} to ${weekEndStr}`);

    // Get all Plus households
    const { data: households } = await supabase
      .from('households')
      .select('id')
      .eq('subscription_status', 'plus');

    if (!households || households.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No Plus households found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let generated = 0;
    let errors = 0;

    for (const household of households) {
      try {
        // Check if insights already exist for this week
        const { data: existing } = await supabase
          .from('weekly_insights')
          .select('id')
          .eq('household_id', household.id)
          .eq('week_start', weekStartStr)
          .single();

        if (existing) {
          console.log(`Insights already exist for household ${household.id}`);
          continue;
        }

        // Get patient info
        const { data: patient } = await supabase
          .from('patients')
          .select('id, name, stage')
          .eq('household_id', household.id)
          .single();

        if (!patient) {
          console.log(`No patient found for household ${household.id}`);
          continue;
        }

        // Get daily check-ins for the week
        const { data: checkins } = await supabase
          .from('daily_checkins')
          .select('date, mood, sleep_quality, voice_note_transcript')
          .eq('household_id', household.id)
          .gte('date', weekStartStr)
          .lte('date', weekEndStr)
          .order('date', { ascending: true });

        // Get task completions for the week
        const { data: completions } = await supabase
          .from('task_completions')
          .select(`
            task_id,
            date,
            completed,
            skipped,
            task:care_plan_tasks(category, title)
          `)
          .eq('household_id', household.id)
          .gte('date', weekStartStr)
          .lte('date', weekEndStr);

        // Get care journal entries for the week
        const { data: journalEntries } = await supabase
          .from('care_journal_entries')
          .select('content, entry_type, created_at')
          .eq('household_id', household.id)
          .gte('created_at', weekStart.toISOString())
          .lte('created_at', weekEnd.toISOString())
          .order('created_at', { ascending: true });

        // Generate insights
        const insights = await generateInsights(
          patient.name,
          patient.stage || 'early',
          checkins as DailyCheckin[] || [],
          completions as TaskCompletion[] || [],
          journalEntries as JournalEntry[] || []
        );

        // Save insights to database
        const { error: insertError } = await supabase.from('weekly_insights').insert({
          household_id: household.id,
          week_start: weekStartStr,
          week_end: weekEndStr,
          insights: insights,
        });

        if (insertError) {
          console.error(`Failed to insert insights for household ${household.id}:`, insertError);
          errors++;
        } else {
          generated++;
          console.log(`Generated insights for household ${household.id}`);
        }
      } catch (err) {
        console.error(`Error processing household ${household.id}:`, err);
        errors++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        generated,
        errors,
        total: households.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Weekly insights error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate insights' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function generateInsights(
  patientName: string,
  stage: string,
  checkins: DailyCheckin[],
  completions: TaskCompletion[],
  journalEntries: JournalEntry[]
): Promise<Insight[]> {
  // Calculate metrics
  const moodData = checkins.filter((c) => c.mood !== null);
  const avgMood = moodData.length > 0
    ? moodData.reduce((sum, c) => sum + (c.mood || 0), 0) / moodData.length
    : 0;
  const poorMoodDays = moodData.filter((c) => c.mood && c.mood <= 2).length;
  const goodMoodDays = moodData.filter((c) => c.mood && c.mood >= 4).length;

  const sleepData = checkins.filter((c) => c.sleep_quality !== null);
  const poorSleepDays = sleepData.filter((c) => c.sleep_quality && c.sleep_quality === 1).length;
  const goodSleepDays = sleepData.filter((c) => c.sleep_quality && c.sleep_quality === 3).length;

  // Calculate completion rates by category
  const completionsByCategory: Record<string, { completed: number; total: number }> = {};
  for (const comp of completions) {
    const category = (comp.task as { category: string })?.category || 'unknown';
    if (!completionsByCategory[category]) {
      completionsByCategory[category] = { completed: 0, total: 0 };
    }
    completionsByCategory[category].total++;
    if (comp.completed) {
      completionsByCategory[category].completed++;
    }
  }

  const completionRates: Record<string, number> = {};
  for (const [category, data] of Object.entries(completionsByCategory)) {
    completionRates[category] = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
  }

  const overallCompletionRate = completions.length > 0
    ? Math.round((completions.filter((c) => c.completed).length / completions.length) * 100)
    : 0;

  // Format data for AI
  const checkinSummary = checkins.length > 0
    ? checkins.map((c) => `${c.date}: Mood=${c.mood || 'N/A'}/5, Sleep=${c.sleep_quality || 'N/A'}/3`).join('\n')
    : 'No check-ins this week.';

  const completionSummary = Object.entries(completionRates)
    .map(([cat, rate]) => `${cat}: ${rate}%`)
    .join('\n') || 'No task data.';

  const journalSummary = journalEntries.length > 0
    ? journalEntries.map((e) => `"${e.content.substring(0, 100)}..."`).join('\n')
    : 'No journal entries this week.';

  const prompt = `Analyze this week's wellness data for ${patientName} (${stage}-stage) and generate 2-3 brief insights for their family caregiver.

DAILY CHECK-INS THIS WEEK:
${checkinSummary}

Average mood: ${avgMood.toFixed(1)}/5
Good mood days: ${goodMoodDays}, Not-so-good days: ${poorMoodDays}
Good sleep nights: ${goodSleepDays}, Poor sleep nights: ${poorSleepDays}

TASK COMPLETION RATES BY CATEGORY:
${completionSummary}
Overall completion: ${overallCompletionRate}%

CARE JOURNAL OBSERVATIONS:
${journalSummary}

Generate 2-3 insights. Each insight should be:
- Written for a family caregiver (warm, supportive tone)
- Based on observable patterns in the data
- Accompanied by a practical, actionable suggestion
- Categorized as "positive" (good pattern), "attention" (worth noting), or "suggestion" (improvement idea)

CRITICAL RULES - YOU MUST FOLLOW:
1. NEVER use words like: decline, deterioration, worsening, degeneration, cognitive, dementia
2. Say "routine changes" instead of "decline"
3. Say "patterns" instead of "symptoms"
4. Frame findings positively when possible
5. Always give concrete, actionable suggestions
6. Use ${patientName}'s name naturally
7. Keep each insight to 1-2 sentences
8. Keep each suggestion to 1-2 sentences

Return ONLY a valid JSON array. No markdown, no explanation.
Format:
[
  {
    "insight": "The insight text",
    "suggestion": "A practical suggestion",
    "category": "positive"
  }
]`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      return getDefaultInsights(patientName, avgMood, overallCompletionRate, poorSleepDays);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Validate structure
      const validInsights = parsed.filter(
        (i: Insight) =>
          i.insight &&
          i.suggestion &&
          ['positive', 'attention', 'suggestion'].includes(i.category)
      );
      if (validInsights.length > 0) {
        return validInsights.slice(0, 3);
      }
    }
  } catch (err) {
    console.error('Failed to generate AI insights:', err);
  }

  // Return fallback insights
  return getDefaultInsights(patientName, avgMood, overallCompletionRate, poorSleepDays);
}

function getDefaultInsights(
  patientName: string,
  avgMood: number,
  completionRate: number,
  poorSleepDays: number
): Insight[] {
  const insights: Insight[] = [];

  // Mood-based insight
  if (avgMood >= 3.5) {
    insights.push({
      insight: `${patientName} has been in good spirits this week with an average mood of ${avgMood.toFixed(1)}/5.`,
      suggestion: `Keep up the positive activities that seem to be working well for ${patientName}.`,
      category: 'positive',
    });
  } else if (avgMood > 0) {
    insights.push({
      insight: `${patientName}'s mood has been variable this week. Some days were better than others.`,
      suggestion: `Consider what activities or interactions helped on the better days and try to include more of those.`,
      category: 'attention',
    });
  }

  // Completion-based insight
  if (completionRate >= 70) {
    insights.push({
      insight: `${patientName} completed ${completionRate}% of planned activities this week, showing great engagement.`,
      suggestion: `This is a strong routine! Consider if any new activities might add variety.`,
      category: 'positive',
    });
  } else if (completionRate > 0 && completionRate < 50) {
    insights.push({
      insight: `Activity completion was ${completionRate}% this week. Some tasks may need adjustment.`,
      suggestion: `Review which tasks are being skipped and consider simplifying or rescheduling them.`,
      category: 'suggestion',
    });
  }

  // Sleep-based insight
  if (poorSleepDays >= 3) {
    insights.push({
      insight: `${patientName} reported poor sleep on ${poorSleepDays} nights this week.`,
      suggestion: `Consider reviewing the evening routine or discussing sleep patterns with the doctor.`,
      category: 'attention',
    });
  }

  // Ensure at least one insight
  if (insights.length === 0) {
    insights.push({
      insight: `This week's data for ${patientName} is still building up.`,
      suggestion: `Regular check-ins help track patterns. Encourage ${patientName} to complete the daily check-in.`,
      category: 'suggestion',
    });
  }

  return insights.slice(0, 3);
}
