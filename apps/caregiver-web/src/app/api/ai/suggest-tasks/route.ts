// AI Suggest Tasks API Route
// Generates personalized care plan task suggestions using Google Gemini
// All suggestions are grounded in the evidence-based intervention library

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { createLogger } from '@/lib/logger';
import { postProcess, logSafetyEvent, SafetyLevel } from '@/lib/ai-safety';
import {
  EVIDENCE_BASED_INTERVENTIONS,
  buildLibrarySummaryForPrompt,
  getInterventionById,
  getInterventionsByCategory,
} from '@ourturn/shared/data/evidence-based-interventions';
import {
  validateAndFilterSuggestions,
  enrichWithEvidence,
} from '@ourturn/shared/utils/task-suggestion-validator';
import type { TaskCategory } from '@ourturn/shared/types/care-plan';
import { getLanguageInstruction } from '@/lib/ai-language';
import { SUPPORTED_LANGUAGES, LANGUAGE_CODES } from '@ourturn/shared/constants/languages';

const log = createLogger('ai/suggest-tasks');

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface SuggestedTask {
  category: string;
  title: string;
  hint_text: string;
  time: string;
  recurrence: 'daily' | 'specific_days' | 'one_time';
  intervention_id: string | null;
  evidence_source: string | null;
}

const VALID_CATEGORIES: TaskCategory[] = ['medication', 'nutrition', 'physical', 'cognitive', 'social', 'health'];

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    const supabase = await createServerClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const { householdId, category, count = 5, locale } = await request.json();

    if (!householdId) {
      return NextResponse.json({ error: 'Household ID is required' }, { status: 400 });
    }

    // Input validation
    if (typeof count !== 'number' || count < 1 || count > 20) {
      return NextResponse.json(
        { error: 'count must be a number between 1 and 20.' },
        { status: 400 }
      );
    }

    if (locale && !(LANGUAGE_CODES as readonly string[]).includes(locale)) {
      return NextResponse.json(
        { error: 'Unsupported locale.' },
        { status: 400 }
      );
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
      .select('category, title, time, intervention_id')
      .eq('household_id', householdId)
      .eq('active', true);

    // Get recent task intervention_ids (last 3 days) for variety enforcement
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const recentInterventionIds = (existingTasks || [])
      .filter((t) => t.intervention_id)
      .map((t) => t.intervention_id as string);

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

    // Build intervention library summary for the prompt (condensed to save tokens)
    const libraryEntries = category
      ? getInterventionsByCategory(category as TaskCategory)
      : EVIDENCE_BASED_INTERVENTIONS;

    const librarySummary = libraryEntries
      .map(
        (i) =>
          `${i.id}|${i.category}|${i.intervention}|${i.adaptations.join('; ')}|${i.timeOfDay}|${i.durationMinutes}min|${i.difficultyLevel}`
      )
      .join('\n');

    // Build variety constraint
    const recentIdsContext =
      recentInterventionIds.length > 0
        ? `RECENTLY USED (do NOT repeat these): ${recentInterventionIds.join(', ')}`
        : 'No recent tasks — feel free to choose any intervention.';

    // Category focus instruction
    const categoryFocus = category
      ? `Focus ONLY on the "${category}" category.`
      : 'Include a variety of categories (physical, nutrition, cognitive, social, health).';

    // Random seed for variety
    const randomSeed = Math.random().toString(36).substring(2, 8);

    // Determine target language for AI output
    const targetLanguageName = (() => {
      if (!locale || locale === 'en') return null;
      const lang = SUPPORTED_LANGUAGES.find((l) => l.code === locale);
      return lang?.name || null;
    })();

    // Build the evidence-based prompt
    const prompt = `You are an evidence-based care task generator for the OurTurn Care daily care platform.
${targetLanguageName ? `\n**OUTPUT LANGUAGE: ${targetLanguageName.toUpperCase()}**\nYou MUST write ALL "title" and "hint_text" values in ${targetLanguageName}. This is mandatory — do NOT write them in English.\n` : ''}
CRITICAL RULES:
1. You must ONLY suggest tasks derived from the provided intervention library below. Never invent new interventions.
2. Every task you generate MUST include the intervention_id from the library.
3. Personalization means adapting LANGUAGE (warm, simple, encouraging) and selecting the appropriate ADAPTATION variant based on the patient's profile.
4. Task hint_text must be 2-4 sentences, direct and conversational ("Let's...", "Time to...", "How about...").
5. NEVER use these terms: "dementia", "cognitive decline", "brain training", "Alzheimer's".
6. Follow CST principle: opinions over facts, never test or quiz. Frame as enjoyable activities.
7. Seed for variety: ${randomSeed}${targetLanguageName ? `\n8. ALL "title" and "hint_text" fields MUST be in ${targetLanguageName}. The "category", "intervention_id", "time", and "recurrence" fields stay in English. Only translate the user-facing text (title, hint_text).` : ''}

SAFETY CONSTRAINTS:
- Never suggest balance exercises without noting seated alternative
- Never suggest cooking with sharp knives or open flames without caregiver present
- Never suggest leaving the house alone if wandering risk exists
- For ${patient.stage || 'early'} stage: ${
      (patient.stage || 'early') === 'early'
        ? 'Can handle moderate complexity'
        : 'Keep tasks simple and concrete'
    }

PATIENT PROFILE:
Name: ${patient.name}
Stage: ${patient.stage || 'early'}
${bioContext || 'No detailed biography provided.'}
Wake time: ${wakeTime}
Sleep time: ${sleepTime}

EXISTING CARE PLAN (avoid duplicating):
${existingTasksContext}

${recentIdsContext}

${categoryFocus}

INTERVENTION LIBRARY (format: id|category|intervention|adaptations|timeOfDay|duration|difficulty):
${librarySummary}

DAILY PLAN STRUCTURE:
- Morning: physical activity + nutrition
- Midday: cognitive/brain wellness activity
- Afternoon: social connection + optional creative activity
- Evening: health check + sleep hygiene
- Space tasks with minimum 1.5-hour gaps between ${wakeTime} and ${sleepTime}

Generate exactly ${count} UNIQUE task suggestions. Each must map to a different intervention_id.
${targetLanguageName ? `\nREMINDER: Write "title" and "hint_text" in ${targetLanguageName}. Do NOT use English for these fields.` : ''}
Return ONLY a valid JSON array. No markdown, no explanation.
Each task: { "intervention_id": "...", "category": "...", "title": "short title max 6 words${targetLanguageName ? ` in ${targetLanguageName}` : ''}", "hint_text": "2-4 warm sentences${targetLanguageName ? ` in ${targetLanguageName}` : ''}", "time": "HH:MM", "recurrence": "daily" }`;

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      log.error('Gemini API error', { status: response.status, error });
      return NextResponse.json(
        { error: 'Failed to generate suggestions' },
        { status: 500 }
      );
    }

    const result = await response.json();
    const candidate = result.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || '';
    const finishReason = candidate?.finishReason;

    // If Gemini didn't finish normally, log and fall back
    if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
      log.warn('Gemini non-standard finish', { finishReason });
    }

    // Parse JSON from response
    try {
      // Strip markdown code fences if present (```json ... ```)
      const cleanText = text.replace(/```[\w]*\n?/g, '').trim();
      const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const rawSuggestions = JSON.parse(jsonMatch[0]);
      // Validate against the intervention library
      const validatedTasks = validateAndFilterSuggestions(
        rawSuggestions.map((s: Record<string, unknown>) => ({
          intervention_id: s.intervention_id || '',
          category: s.category || '',
          title: s.title || '',
          hint_text: s.hint_text || '',
          time: s.time || '09:00',
          duration_minutes: s.duration_minutes,
          recurrence: s.recurrence || 'daily',
        })),
        patient.stage || 'early'
      );

      // Enrich with evidence data from the library
      const enrichedSuggestions: SuggestedTask[] = validatedTasks
        .map((task) => {
          const enriched = enrichWithEvidence(task);
          return {
            category: enriched.category,
            title: enriched.title,
            hint_text: enriched.hint_text,
            time: enriched.time,
            recurrence: (enriched.recurrence || 'daily') as 'daily' | 'specific_days' | 'one_time',
            intervention_id: enriched.intervention_id,
            evidence_source: enriched.evidence_source,
          };
        })
        .filter(
          (s) =>
            s.category &&
            s.title &&
            s.hint_text &&
            s.time &&
            VALID_CATEGORIES.includes(s.category as TaskCategory)
        )
        .slice(0, count);

      // If validation stripped too many suggestions, backfill with fallback
      if (enrichedSuggestions.length < count) {
        const fallbacks = getFallbackSuggestions(
          patient.name,
          category,
          count - enrichedSuggestions.length,
          recentInterventionIds
        );
        enrichedSuggestions.push(...fallbacks);
      }

      // --- SAFETY POST-PROCESSING: scan each suggestion's hint_text ---
      const allViolations: string[] = [];
      for (const suggestion of enrichedSuggestions) {
        const result = postProcess(suggestion.hint_text, SafetyLevel.GREEN, 'caregiver');
        if (!result.approved) {
          suggestion.hint_text = `${suggestion.title} — a great activity to try today!`;
          allViolations.push(...result.violations);
        }
      }

      // Log audit entry
      logSafetyEvent(supabase, {
        session_id: `suggest-tasks-${householdId}`,
        user_id: user.id,
        user_role: 'caregiver',
        safety_level: SafetyLevel.GREEN,
        trigger_category: null,
        ai_model_called: true,
        response_approved: allViolations.length === 0,
        post_process_violations: allViolations,
        disclaimer_included: false,
        professional_referral_included: false,
        escalated_to_crisis: false,
        response_time_ms: Date.now() - startTime,
      });

      return NextResponse.json({ suggestions: enrichedSuggestions });
    } catch (parseError) {
      log.warn('Failed to parse AI response');
      return NextResponse.json({
        suggestions: getFallbackSuggestions(patient.name, category, count, recentInterventionIds),
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

// Evidence-based fallback suggestions drawn from the intervention library
function getFallbackSuggestions(
  patientName: string,
  category?: string,
  count: number = 5,
  recentInterventionIds: string[] = []
): SuggestedTask[] {
  // Filter interventions by category if specified, and exclude recent ones
  let available = category
    ? EVIDENCE_BASED_INTERVENTIONS.filter((i) => i.category === category)
    : EVIDENCE_BASED_INTERVENTIONS;

  // Exclude recently used interventions for variety
  if (recentInterventionIds.length > 0) {
    const filtered = available.filter((i) => !recentInterventionIds.includes(i.id));
    if (filtered.length >= count) {
      available = filtered;
    }
  }

  // Shuffle for variety
  const shuffled = [...available].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, count).map((intervention) => {
    // Pick a random adaptation for the hint text
    const adaptation =
      intervention.adaptations[Math.floor(Math.random() * intervention.adaptations.length)];

    // Build time based on timeOfDay
    const timeMap: Record<string, string> = {
      morning: '09:00',
      midday: '12:00',
      afternoon: '15:00',
      evening: '19:00',
      flexible: '11:00',
    };

    return {
      category: intervention.category,
      title: intervention.intervention,
      hint_text: `${patientName}, ${adaptation.charAt(0).toLowerCase() + adaptation.slice(1)}`,
      time: timeMap[intervention.timeOfDay] || '10:00',
      recurrence: 'daily' as const,
      intervention_id: intervention.id,
      evidence_source: `${intervention.evidence.source} (${intervention.evidence.study})`,
    };
  });
}
