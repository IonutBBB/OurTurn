// AI Toolkit Insights API Route
// Generates correlation insights from 28 days of toolkit check-in data

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { createLogger } from '@/lib/logger';

const log = createLogger('ai/toolkit-insights');

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

interface InsightCard {
  category: 'pattern' | 'correlation' | 'suggestion';
  text: string;
  suggestion: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 3 per day per caregiver
    const rl = rateLimit(`toolkit-insights:${user.id}`, { limit: 3, windowSeconds: 86400 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Insight generation is limited to 3 times per day.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      );
    }

    // Get caregiver
    const { data: caregiver } = await supabase
      .from('caregivers')
      .select('id, name')
      .eq('id', user.id)
      .single();

    if (!caregiver) {
      return NextResponse.json({ error: 'Caregiver not found' }, { status: 404 });
    }

    // Get 28 days of data
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);

    const { data: logs } = await supabase
      .from('caregiver_wellbeing_logs')
      .select('date, energy_level, stress_level, sleep_quality_rating, relief_exercises_used, goal_completed')
      .eq('caregiver_id', caregiver.id)
      .gte('date', twentyEightDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (!logs || logs.length < 3) {
      return NextResponse.json({
        insights: [{
          category: 'suggestion',
          text: 'Keep checking in daily to unlock personalized insights.',
          suggestion: 'After a few more check-ins, we can spot patterns in your energy, stress, and sleep.',
        }],
      });
    }

    if (!GOOGLE_AI_API_KEY) {
      return NextResponse.json({ insights: generateFallbackInsights(logs) });
    }

    // Build data summary for AI
    const dataRows = logs.map((l) => {
      const day = new Date(l.date).toLocaleDateString('en-US', { weekday: 'short' });
      return `${l.date} (${day}): energy=${l.energy_level ?? '?'}, stress=${l.stress_level ?? '?'}, sleep=${l.sleep_quality_rating ?? '?'}, exercised=${(l.relief_exercises_used || []).length > 0}, goal_done=${l.goal_completed ?? false}`;
    }).join('\n');

    const prompt = `You are a supportive wellness analyst for ${caregiver.name}, a dementia caregiver.

Here are their last ${logs.length} days of daily check-in data:
${dataRows}

Analyze patterns and generate exactly 2-3 insight cards. Look for:
1. Correlations between exercise days and energy/stress levels
2. Stress patterns by day of week
3. Sleep quality trends
4. Goal completion patterns

RULES:
- Be warm and encouraging, never clinical or diagnostic
- Each insight should be actionable — include a concrete suggestion
- Keep each insight to 1-2 sentences plus a short suggestion
- Never use words like "therapy", "treatment", "diagnosis"

Return ONLY a valid JSON array:
[{"category": "pattern"|"correlation"|"suggestion", "text": "...", "suggestion": "..."}]
No markdown, no explanation.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      log.error('Gemini API error');
      return NextResponse.json({ insights: generateFallbackInsights(logs) });
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found');
      const insights: InsightCard[] = JSON.parse(jsonMatch[0]);
      const valid = insights
        .filter((i) => i.text && i.suggestion && ['pattern', 'correlation', 'suggestion'].includes(i.category))
        .slice(0, 3);

      return NextResponse.json({ insights: valid.length > 0 ? valid : generateFallbackInsights(logs) });
    } catch {
      log.warn('Failed to parse AI insights response');
      return NextResponse.json({ insights: generateFallbackInsights(logs) });
    }
  } catch (error: unknown) {
    log.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown' });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateFallbackInsights(logs: Array<{
  energy_level: number | null;
  stress_level: number | null;
  sleep_quality_rating: number | null;
  relief_exercises_used: string[] | null;
  goal_completed: boolean | null;
}>): InsightCard[] {
  const insights: InsightCard[] = [];

  const withExercise = logs.filter((l) => (l.relief_exercises_used || []).length > 0);
  const withoutExercise = logs.filter((l) => (l.relief_exercises_used || []).length === 0);

  if (withExercise.length >= 2 && withoutExercise.length >= 2) {
    const avgEnergyWithEx = withExercise.reduce((s, l) => s + (l.energy_level || 0), 0) / withExercise.length;
    const avgEnergyWithout = withoutExercise.reduce((s, l) => s + (l.energy_level || 0), 0) / withoutExercise.length;

    if (avgEnergyWithEx > avgEnergyWithout) {
      insights.push({
        category: 'correlation',
        text: 'Your energy tends to be higher on days you do relief exercises.',
        suggestion: 'Try fitting in a quick exercise early in the day to boost your energy.',
      });
    }
  }

  const goalsSet = logs.filter((l) => l.goal_completed !== null);
  const goalsCompleted = goalsSet.filter((l) => l.goal_completed);
  if (goalsSet.length >= 3) {
    const rate = Math.round((goalsCompleted.length / goalsSet.length) * 100);
    insights.push({
      category: 'pattern',
      text: `You completed ${rate}% of the daily goals you set over the last ${goalsSet.length} days.`,
      suggestion: rate < 50 ? 'Try setting smaller, more achievable goals.' : 'Great consistency! Keep it up.',
    });
  }

  if (insights.length === 0) {
    insights.push({
      category: 'suggestion',
      text: 'Keep checking in daily to build up enough data for deeper insights.',
      suggestion: 'Even a quick 30-second check-in helps us spot helpful patterns for you.',
    });
  }

  return insights;
}
