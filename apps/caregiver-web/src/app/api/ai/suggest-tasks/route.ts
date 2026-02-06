// AI Suggest Tasks API Route
// Generates personalized care plan task suggestions using Google Gemini

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { createLogger } from '@/lib/logger';

const log = createLogger('ai/suggest-tasks');

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface SuggestedTask {
  category: string;
  title: string;
  hint_text: string;
  time: string;
  recurrence: 'daily' | 'specific_days' | 'one_time';
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const { householdId, category, count = 3 } = await request.json();

    if (!householdId) {
      return NextResponse.json({ error: 'Household ID is required' }, { status: 400 });
    }

    // Rate limit: 10 suggestion requests per hour per household
    const rl = rateLimit(`ai-suggest:${householdId}`, { limit: 10, windowSeconds: 3600 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      );
    }

    if (!GOOGLE_AI_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    // Verify caregiver belongs to household
    const { data: caregiver } = await supabase
      .from('caregivers')
      .select('id, household_id')
      .eq('id', user.id)
      .eq('household_id', householdId)
      .single();

    if (!caregiver) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get patient info
    const { data: patient } = await supabase
      .from('patients')
      .select('id, name, stage, biography, wake_time, sleep_time')
      .eq('household_id', householdId)
      .single();

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Get existing tasks to avoid duplicates
    const { data: existingTasks } = await supabase
      .from('care_plan_tasks')
      .select('category, title, time')
      .eq('household_id', householdId)
      .eq('active', true);

    // Build existing tasks context
    const existingTasksContext =
      existingTasks && existingTasks.length > 0
        ? existingTasks.map((t) => `- ${t.time}: ${t.title} (${t.category})`).join('\n')
        : 'No existing tasks yet.';

    // Build patient biography context
    const bio = patient.biography || {};
    const bioContext = [
      bio.hobbies ? `Hobbies: ${bio.hobbies}` : '',
      bio.career ? `Career: ${bio.career}` : '',
      bio.favorite_music ? `Favorite music: ${bio.favorite_music}` : '',
      bio.favorite_foods ? `Favorite foods: ${bio.favorite_foods}` : '',
      bio.important_people ? `Important people: ${bio.important_people}` : '',
      bio.childhood_location ? `Grew up in: ${bio.childhood_location}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    // Wake/sleep times
    const wakeTime = patient.wake_time || '08:00';
    const sleepTime = patient.sleep_time || '21:00';

    // Build the prompt
    const categoryFocus = category
      ? `Focus ONLY on the "${category}" category.`
      : 'Include a variety of categories.';

    const prompt = `You are a compassionate care plan assistant helping families create daily routines for people with ${patient.stage || 'early'}-stage dementia.

Generate ${count} care plan task suggestions for ${patient.name}.

PATIENT BACKGROUND:
${bioContext || 'No detailed biography provided.'}
Wake time: ${wakeTime}
Sleep time: ${sleepTime}

EXISTING CARE PLAN (avoid duplicating these):
${existingTasksContext}

${categoryFocus}

CATEGORIES TO CHOOSE FROM:
- medication: Medication reminders (pills, vitamins, supplements)
- nutrition: Meals, snacks, hydration reminders
- physical: Exercise, walks, stretches, movement activities
- cognitive: Brain wellness activities, puzzles, reading, memory prompts
- social: Phone calls, video chats, visits, social interaction
- health: Health monitoring (blood pressure, weight, doctor appointments)

RULES:
1. Each task must have a warm, personalized hint that helps ${patient.name} complete it
2. Hints should be specific and encouraging (e.g., "Your blue pills are in the kitchen drawer")
3. Schedule tasks between ${wakeTime} and ${sleepTime}
4. Space tasks throughout the day - not all at once
5. Keep task titles short and clear (max 6 words)
6. Make hints actionable and supportive
7. Avoid medical jargon - use simple, friendly language
8. Consider ${patient.name}'s interests when suggesting activities
9. For ${patient.stage || 'early'} stage: ${
      (patient.stage || 'early') === 'early'
        ? 'Can handle moderate complexity'
        : 'Keep tasks simple and concrete'
    }

Return ONLY a valid JSON array with exactly ${count} tasks. No markdown, no explanation.
Each task must have: category, title, hint_text, time (HH:MM format), recurrence (daily/specific_days/one_time)

Example format:
[
  {
    "category": "physical",
    "title": "Morning stretches",
    "hint_text": "${patient.name}, let's do some gentle stretches to start the day. Stand by your favorite chair for balance.",
    "time": "09:00",
    "recurrence": "daily"
  }
]`;

    // Call Gemini API
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
      const error = await response.text();
      log.error('Gemini API error');
      return NextResponse.json(
        { error: 'Failed to generate suggestions' },
        { status: 500 }
      );
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON from response
    try {
      // Extract JSON array from response (handle potential markdown)
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const suggestions: SuggestedTask[] = JSON.parse(jsonMatch[0]);

      // Validate and sanitize suggestions
      const validSuggestions = suggestions
        .filter(
          (s) =>
            s.category &&
            s.title &&
            s.hint_text &&
            s.time &&
            ['medication', 'nutrition', 'physical', 'cognitive', 'social', 'health'].includes(
              s.category
            )
        )
        .slice(0, count);

      return NextResponse.json({ suggestions: validSuggestions });
    } catch (parseError) {
      log.warn('Failed to parse AI response');
      // Return fallback suggestions
      return NextResponse.json({
        suggestions: getFallbackSuggestions(patient.name, category, count),
      });
    }
  } catch (error: unknown) {
    log.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown' });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Fallback suggestions if AI fails
function getFallbackSuggestions(
  patientName: string,
  category?: string,
  count: number = 3
): SuggestedTask[] {
  const allSuggestions: SuggestedTask[] = [
    {
      category: 'medication',
      title: 'Morning medication',
      hint_text: `${patientName}, time for your morning pills. They're in your pill box on the kitchen counter.`,
      time: '09:00',
      recurrence: 'daily',
    },
    {
      category: 'nutrition',
      title: 'Breakfast time',
      hint_text: `Good morning, ${patientName}! Let's have a healthy breakfast. There's fruit and yogurt in the fridge.`,
      time: '08:30',
      recurrence: 'daily',
    },
    {
      category: 'physical',
      title: 'Morning walk',
      hint_text: `${patientName}, a short walk will help you feel great. Your walking shoes are by the door.`,
      time: '10:00',
      recurrence: 'daily',
    },
    {
      category: 'cognitive',
      title: 'Brain activity',
      hint_text: `${patientName}, let's do something fun for your mind. Would you like to look at some photos or do a puzzle?`,
      time: '14:00',
      recurrence: 'daily',
    },
    {
      category: 'social',
      title: 'Call family',
      hint_text: `${patientName}, your family would love to hear from you. Let's give them a call!`,
      time: '16:00',
      recurrence: 'daily',
    },
    {
      category: 'health',
      title: 'Check blood pressure',
      hint_text: `${patientName}, let's check your blood pressure. The monitor is in the living room cabinet.`,
      time: '11:00',
      recurrence: 'daily',
    },
  ];

  // Filter by category if specified
  const filtered = category
    ? allSuggestions.filter((s) => s.category === category)
    : allSuggestions;

  return filtered.slice(0, count);
}
