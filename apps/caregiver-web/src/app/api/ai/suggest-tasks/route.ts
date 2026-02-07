// AI Suggest Tasks API Route
// Generates personalized care plan task suggestions using Google Gemini

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { createLogger } from '@/lib/logger';

const log = createLogger('ai/suggest-tasks');

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

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

    // Add randomness seed so each refresh produces different results
    const randomSeed = Math.random().toString(36).substring(2, 8);

    const prompt = `You are a compassionate care plan assistant helping families create daily routines for people with ${patient.stage || 'early'}-stage dementia.

Generate exactly ${count} UNIQUE and DIFFERENT care plan task suggestions for ${patient.name}.
IMPORTANT: Be creative and varied! Each suggestion must be a distinct activity. Seed: ${randomSeed}

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
1. Each task MUST have a detailed, step-by-step hint that guides ${patient.name} through the activity
2. For exercises or activities (e.g. "chair exercises", "stretches", "breathing"), the hint MUST include specific instructions: which movements to do, how many repetitions, how long to hold, etc.
3. For meals or nutrition, include what to eat or drink
4. Hints should be warm, specific, and encouraging — written as if speaking directly to ${patient.name}
5. Schedule tasks between ${wakeTime} and ${sleepTime}, spaced throughout the day
6. Keep task titles short and clear (max 6 words)
7. Avoid medical jargon — use simple, friendly language
8. Personalize to ${patient.name}'s interests and biography
9. For ${patient.stage || 'early'} stage: ${
      (patient.stage || 'early') === 'early'
        ? 'Can handle moderate complexity'
        : 'Keep tasks simple and concrete'
    }
10. NEVER repeat the same activity twice — each of the ${count} suggestions must be different

HINT EXAMPLES (this level of detail is required):
- Physical: "${patient.name}, let's do some seated exercises! Sit in your favorite chair. First, lift your right knee up 5 times, then your left knee 5 times. Next, stretch your arms out wide and bring them back 10 times. Finish by rolling your ankles in circles."
- Cognitive: "${patient.name}, let's play a word game! I'll show you a letter, and you think of 3 things that start with that letter. Take your time — there's no rush!"
- Nutrition: "${patient.name}, time for a healthy snack! There are sliced apples and peanut butter in the fridge. Pour yourself a glass of water too."

Return ONLY a valid JSON array with exactly ${count} tasks. No markdown, no explanation.
Each task must have: category, title, hint_text, time (HH:MM format), recurrence (daily/specific_days/one_time)`;


    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 4096,
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
  count: number = 5
): SuggestedTask[] {
  const allSuggestions: SuggestedTask[] = [
    // Medication
    {
      category: 'medication',
      title: 'Morning medication',
      hint_text: `${patientName}, time for your morning pills. They're in your pill box on the kitchen counter.`,
      time: '09:00',
      recurrence: 'daily',
    },
    {
      category: 'medication',
      title: 'Afternoon vitamins',
      hint_text: `${patientName}, time for your vitamins with lunch. They're next to the water jug.`,
      time: '13:00',
      recurrence: 'daily',
    },
    {
      category: 'medication',
      title: 'Evening medication',
      hint_text: `${patientName}, time for your evening pills before bed. They're on your bedside table.`,
      time: '20:00',
      recurrence: 'daily',
    },
    // Nutrition
    {
      category: 'nutrition',
      title: 'Breakfast time',
      hint_text: `Good morning, ${patientName}! Let's have a healthy breakfast. There's fruit and yogurt in the fridge.`,
      time: '08:30',
      recurrence: 'daily',
    },
    {
      category: 'nutrition',
      title: 'Drink some water',
      hint_text: `${patientName}, let's have a glass of water. Staying hydrated helps you feel your best.`,
      time: '11:00',
      recurrence: 'daily',
    },
    {
      category: 'nutrition',
      title: 'Afternoon snack',
      hint_text: `${patientName}, time for a healthy snack! There are crackers and cheese in the kitchen.`,
      time: '15:00',
      recurrence: 'daily',
    },
    {
      category: 'nutrition',
      title: 'Lunch time',
      hint_text: `${patientName}, lunch is ready! Come to the kitchen and have a seat.`,
      time: '12:30',
      recurrence: 'daily',
    },
    {
      category: 'nutrition',
      title: 'Dinner time',
      hint_text: `${patientName}, dinner is served. Let's sit down and enjoy a nice meal together.`,
      time: '18:30',
      recurrence: 'daily',
    },
    // Physical
    {
      category: 'physical',
      title: 'Morning walk',
      hint_text: `${patientName}, a short walk will help you feel great. Your walking shoes are by the door.`,
      time: '10:00',
      recurrence: 'daily',
    },
    {
      category: 'physical',
      title: 'Gentle stretches',
      hint_text: `${patientName}, let's do some gentle stretches. Stand by your favorite chair for balance.`,
      time: '08:00',
      recurrence: 'daily',
    },
    {
      category: 'physical',
      title: 'Afternoon garden time',
      hint_text: `${patientName}, let's spend some time in the garden. Fresh air and gentle movement are wonderful.`,
      time: '14:30',
      recurrence: 'daily',
    },
    {
      category: 'physical',
      title: 'Chair exercises',
      hint_text: `${patientName}, let's do some seated exercises. Sit comfortably and follow along gently.`,
      time: '11:30',
      recurrence: 'daily',
    },
    {
      category: 'physical',
      title: 'Evening stroll',
      hint_text: `${patientName}, a short evening walk before dinner helps with relaxation. Let's go together.`,
      time: '17:00',
      recurrence: 'daily',
    },
    // Cognitive
    {
      category: 'cognitive',
      title: 'Brain activity',
      hint_text: `${patientName}, let's do something fun for your mind. Would you like to look at some photos or do a puzzle?`,
      time: '14:00',
      recurrence: 'daily',
    },
    {
      category: 'cognitive',
      title: 'Photo memories',
      hint_text: `${patientName}, let's look at some family photos together. It's always nice to remember happy times.`,
      time: '15:30',
      recurrence: 'daily',
    },
    {
      category: 'cognitive',
      title: 'Listen to music',
      hint_text: `${patientName}, let's put on some of your favorite songs. Music always brightens the day!`,
      time: '11:00',
      recurrence: 'daily',
    },
    {
      category: 'cognitive',
      title: 'Word game',
      hint_text: `${patientName}, let's play a fun word game together. No rush, just enjoy it!`,
      time: '10:30',
      recurrence: 'daily',
    },
    {
      category: 'cognitive',
      title: 'Read together',
      hint_text: `${patientName}, let's read a few pages from a book or magazine you enjoy.`,
      time: '16:00',
      recurrence: 'daily',
    },
    // Social
    {
      category: 'social',
      title: 'Call family',
      hint_text: `${patientName}, your family would love to hear from you. Let's give them a call!`,
      time: '16:00',
      recurrence: 'daily',
    },
    {
      category: 'social',
      title: 'Video chat',
      hint_text: `${patientName}, let's do a video call with your loved ones. They'll be so happy to see you!`,
      time: '11:00',
      recurrence: 'daily',
    },
    {
      category: 'social',
      title: 'Chat over tea',
      hint_text: `${patientName}, let's sit down and have a nice cup of tea and a good chat.`,
      time: '15:00',
      recurrence: 'daily',
    },
    {
      category: 'social',
      title: 'Share a story',
      hint_text: `${patientName}, would you like to tell me about something from your past? I'd love to hear.`,
      time: '14:00',
      recurrence: 'daily',
    },
    {
      category: 'social',
      title: 'Look at old letters',
      hint_text: `${patientName}, let's go through some old cards or letters together. Such lovely memories!`,
      time: '10:00',
      recurrence: 'daily',
    },
    // Health
    {
      category: 'health',
      title: 'Check blood pressure',
      hint_text: `${patientName}, let's check your blood pressure. The monitor is in the living room cabinet.`,
      time: '11:00',
      recurrence: 'daily',
    },
    {
      category: 'health',
      title: 'Weigh in',
      hint_text: `${patientName}, let's check your weight this morning. The scale is in the bathroom.`,
      time: '08:30',
      recurrence: 'daily',
    },
    {
      category: 'health',
      title: 'Skin care routine',
      hint_text: `${patientName}, let's apply some moisturizer to keep your skin healthy and comfortable.`,
      time: '09:30',
      recurrence: 'daily',
    },
    {
      category: 'health',
      title: 'Eye drops',
      hint_text: `${patientName}, time for your eye drops. Sit back and look up at the ceiling.`,
      time: '10:00',
      recurrence: 'daily',
    },
    {
      category: 'health',
      title: 'Dental hygiene',
      hint_text: `${patientName}, let's brush your teeth. Your toothbrush and toothpaste are by the sink.`,
      time: '21:00',
      recurrence: 'daily',
    },
  ];

  // Filter by category if specified
  const filtered = category
    ? allSuggestions.filter((s) => s.category === category)
    : allSuggestions;

  // Shuffle to give variety
  const shuffled = filtered.sort(() => Math.random() - 0.5);

  return shuffled.slice(0, count);
}
