// AI Daily Tip API Route
// Generates a personalized daily wellness tip for caregivers using Google Gemini

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { createLogger } from '@/lib/logger';

const log = createLogger('ai/daily-tip');

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

const TIP_CATEGORIES = ['respite', 'delegation', 'exercise', 'insight', 'self_care'] as const;

const FALLBACK_TIPS = [
  { tip_text: 'Take 5 minutes to step outside and breathe fresh air. Even a short pause can reset your energy.', tip_category: 'respite' as const },
  { tip_text: 'Could a family member handle one task today? Sharing the load helps everyone feel involved.', tip_category: 'delegation' as const },
  { tip_text: 'Try a quick stretch — roll your shoulders 10 times and reach for the ceiling. Your body will thank you.', tip_category: 'exercise' as const },
  { tip_text: 'You are doing something meaningful every single day. Give yourself credit for showing up.', tip_category: 'insight' as const },
  { tip_text: 'Drink a full glass of water right now. Hydration is the simplest form of self-care.', tip_category: 'self_care' as const },
  { tip_text: 'Call or text someone who makes you smile today. Connection lifts your spirits.', tip_category: 'self_care' as const },
  { tip_text: 'Write down one thing that went well today, no matter how small. Tiny wins matter.', tip_category: 'insight' as const },
  { tip_text: 'Is there a task you can simplify or skip today? Giving yourself permission to do less is okay.', tip_category: 'respite' as const },
];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 5 refreshes per day per caregiver
    const rl = rateLimit(`daily-tip:${user.id}`, { limit: 5, windowSeconds: 86400 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'You can refresh your daily tip up to 5 times per day.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      );
    }

    const today = new Date().toISOString().split('T')[0];

    // Get caregiver info
    const { data: caregiver } = await supabase
      .from('caregivers')
      .select('id, name, household_id')
      .eq('id', user.id)
      .single();

    if (!caregiver) {
      return NextResponse.json({ error: 'Caregiver not found' }, { status: 404 });
    }

    if (!GOOGLE_AI_API_KEY) {
      // Use fallback if AI not configured
      const fallback = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
      const { data: tip } = await supabase
        .from('ai_daily_tips')
        .upsert(
          {
            caregiver_id: caregiver.id,
            date: today,
            tip_text: fallback.tip_text,
            tip_category: fallback.tip_category,
            dismissed: false,
          },
          { onConflict: 'caregiver_id,date' }
        )
        .select()
        .single();

      return NextResponse.json({ tip });
    }

    // Get 7 days of wellbeing logs for context
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: recentLogs } = await supabase
      .from('caregiver_wellbeing_logs')
      .select('date, energy_level, stress_level, sleep_quality_rating, relief_exercises_used, daily_goal, goal_completed')
      .eq('caregiver_id', caregiver.id)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    // Get today's care plan load
    const { count: taskCount } = await supabase
      .from('care_plan_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('household_id', caregiver.household_id)
      .eq('active', true);

    // Get last help request date
    const { data: lastHelpRequest } = await supabase
      .from('caregiver_help_requests')
      .select('created_at')
      .eq('requester_id', caregiver.id)
      .order('created_at', { ascending: false })
      .limit(1);

    const daysSinceHelpRequest = lastHelpRequest?.[0]
      ? Math.floor((Date.now() - new Date(lastHelpRequest[0].created_at).getTime()) / 86400000)
      : null;

    // Build context
    const logsContext = recentLogs && recentLogs.length > 0
      ? recentLogs.map((l) => `${l.date}: energy=${l.energy_level ?? '?'}, stress=${l.stress_level ?? '?'}, sleep=${l.sleep_quality_rating ?? '?'}, exercised=${(l.relief_exercises_used || []).length > 0}`).join('\n')
      : 'No recent check-ins.';

    const randomSeed = Math.random().toString(36).substring(2, 8);

    const prompt = `You are a warm, supportive wellness companion for ${caregiver.name}, who is a dementia caregiver.

CONTEXT (last 7 days):
${logsContext}
Active care tasks: ${taskCount || 0}
Days since last help request: ${daysSinceHelpRequest ?? 'never'}

Generate ONE short, actionable daily wellness tip (2 sentences maximum).
Be warm and supportive. Never use medical or diagnostic language.
The tip should be practical — something they can do today.
Seed for variety: ${randomSeed}

CATEGORIES (pick the most relevant one):
- respite: taking breaks, pausing, stepping away
- delegation: asking family for help, sharing tasks
- exercise: movement, stretching, physical activity
- insight: reflection, positive reinforcement, perspective
- self_care: hydration, nutrition, sleep, personal care

Return ONLY valid JSON: {"tip_text": "...", "tip_category": "..."}
No markdown, no explanation.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 256,
        },
      }),
    });

    let tipText: string;
    let tipCategory: string;

    if (!response.ok) {
      log.error('Gemini API error');
      const fallback = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
      tipText = fallback.tip_text;
      tipCategory = fallback.tip_category;
    } else {
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found');
        const parsed = JSON.parse(jsonMatch[0]);
        tipText = parsed.tip_text;
        tipCategory = TIP_CATEGORIES.includes(parsed.tip_category) ? parsed.tip_category : 'insight';
      } catch {
        log.warn('Failed to parse AI tip response');
        const fallback = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
        tipText = fallback.tip_text;
        tipCategory = fallback.tip_category;
      }
    }

    // Upsert into ai_daily_tips
    const { data: tip, error: upsertError } = await supabase
      .from('ai_daily_tips')
      .upsert(
        {
          caregiver_id: caregiver.id,
          date: today,
          tip_text: tipText,
          tip_category: tipCategory,
          dismissed: false,
        },
        { onConflict: 'caregiver_id,date' }
      )
      .select()
      .single();

    if (upsertError) throw upsertError;

    return NextResponse.json({ tip });
  } catch (error: unknown) {
    log.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown' });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
