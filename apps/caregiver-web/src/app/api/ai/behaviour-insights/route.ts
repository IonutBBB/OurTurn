import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { createLogger } from '@/lib/logger';

const log = createLogger('ai/behaviour-insights');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 5 per day
    const rl = rateLimit(`behaviour-insights:${user.id}`, { limit: 5, windowSeconds: 86400 });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { householdId } = await request.json();

    const { data: caregiver } = await supabase
      .from('caregivers')
      .select('id, name, household_id')
      .eq('id', user.id)
      .single();

    if (!caregiver || caregiver.household_id !== householdId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Get all behaviour incidents for this household
    const { data: incidents } = await supabase
      .from('behaviour_incidents')
      .select('*')
      .eq('household_id', householdId)
      .order('logged_at', { ascending: true })
      .limit(100);

    if (!incidents || incidents.length < 5) {
      return NextResponse.json({ patterns: [], notEnoughData: true });
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json({ patterns: generateFallbackPatterns(incidents) });
    }

    const incidentRows = incidents.map((i) => {
      const date = new Date(i.logged_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      return `${date}: type=${i.behaviour_type}, severity=${i.severity}, time=${i.time_of_day || '?'}, triggers=[${(i.possible_triggers || []).join(',')}], what_helped=${i.what_helped || 'not recorded'}`;
    }).join('\n');

    const prompt = `You are a supportive behaviour analyst for a dementia caregiver.

Here are ${incidents.length} logged behaviour incidents:
${incidentRows}

Analyse patterns and generate 2-3 insight cards. Look for:
1. Time-of-day patterns (do certain behaviours happen at specific times?)
2. Common triggers (what situations precede incidents?)
3. What works (which strategies helped resolve incidents?)
4. Frequency trends (are incidents increasing, decreasing, or stable?)

RULES:
- Be warm, practical, and non-clinical
- Each insight should be actionable with a concrete suggestion
- Never diagnose or use clinical terminology
- Focus on what the caregiver can do differently
- Keep each insight to 2-3 sentences plus a short suggestion

Return ONLY a valid JSON array:
[{"title": "...", "insight": "...", "suggestion": "..."}]
No markdown, no explanation.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array');
      const patterns = JSON.parse(jsonMatch[0]);
      const valid = patterns
        .filter((p: { title?: string; insight?: string; suggestion?: string }) => p.title && p.insight && p.suggestion)
        .slice(0, 3);
      return NextResponse.json({ patterns: valid.length > 0 ? valid : generateFallbackPatterns(incidents) });
    } catch {
      log.warn('Failed to parse AI behaviour insights');
      return NextResponse.json({ patterns: generateFallbackPatterns(incidents) });
    }
  } catch (error) {
    log.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown' });
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

function generateFallbackPatterns(incidents: Array<{
  behaviour_type: string;
  time_of_day: string | null;
  severity: number;
  possible_triggers: string[] | null;
}>) {
  const patterns: Array<{ title: string; insight: string; suggestion: string }> = [];

  // Most common behaviour type
  const typeCounts: Record<string, number> = {};
  incidents.forEach((i) => { typeCounts[i.behaviour_type] = (typeCounts[i.behaviour_type] || 0) + 1; });
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
  if (topType) {
    patterns.push({
      title: `Most frequent: ${topType[0].replace('_', ' ')}`,
      insight: `${topType[0].replace('_', ' ')} accounts for ${topType[1]} of ${incidents.length} logged incidents.`,
      suggestion: 'Review the playbook for this behaviour type and try the prevention strategies.',
    });
  }

  // Time of day pattern
  const timeCounts: Record<string, number> = {};
  incidents.forEach((i) => { if (i.time_of_day) timeCounts[i.time_of_day] = (timeCounts[i.time_of_day] || 0) + 1; });
  const topTime = Object.entries(timeCounts).sort((a, b) => b[1] - a[1])[0];
  if (topTime) {
    patterns.push({
      title: `${topTime[0].charAt(0).toUpperCase() + topTime[0].slice(1)} is the most challenging time`,
      insight: `${topTime[1]} of ${incidents.length} incidents occurred during the ${topTime[0]}.`,
      suggestion: `Try adjusting the daily routine to reduce stimulation during ${topTime[0]} hours.`,
    });
  }

  return patterns;
}
