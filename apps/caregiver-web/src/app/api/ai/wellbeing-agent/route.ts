import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { createLogger } from '@/lib/logger';
import {
  preProcess,
  postProcess,
  logSafetyEvent,
  SafetyLevel,
  AI_SAFETY_SYSTEM_PROMPT,
  BLOCKED_RESPONSE_FALLBACK,
} from '@/lib/ai-safety';
import { getLanguageInstruction } from '@/lib/ai-language';
import { LANGUAGE_CODES } from '@ourturn/shared/constants/languages';

const log = createLogger('ai/wellbeing-agent');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

interface RequestBody {
  message: string;
  checkin: { energy: number | null; stress: number | null; sleep: number | null };
  history: { role: 'user' | 'assistant'; content: string }[];
  locale?: string;
}

function buildSystemPrompt(
  caregiverName: string,
  checkin: RequestBody['checkin'],
  trendSummary: string
): string {
  const energy = checkin.energy ?? 'unknown';
  const stress = checkin.stress ?? 'unknown';
  const sleep = checkin.sleep ?? 'unknown';

  return `You are the OurTurn Care Wellbeing Companion for ${caregiverName}, who is a family caregiver for someone living with dementia.

TODAY'S CHECK-IN:
- Energy: ${energy}/5 (1=exhausted, 5=energized)
- Stress: ${stress}/5 (1=calm, 5=overwhelmed)
- Sleep quality: ${sleep}/5 (1=terrible, 5=great)

RECENT TRENDS (last 7 days):
${trendSummary}

WHO YOU ARE:
You are like a wise, compassionate friend who deeply understands caregiving — not from a textbook, but from real life. You know the loneliness, the guilt of wanting a break, the grief of watching someone you love change, and the quiet heroism of showing up every single day. You speak with the warmth and honesty of someone who has walked this road.

HOW TO HELP — YOUR APPROACH:
- LISTEN FIRST. When ${caregiverName} shares something, respond to what they actually said. Don't pivot to a technique unless they ask for one or it flows naturally.
- VALIDATE genuinely. Not "I hear you" (robotic). More like "That sounds exhausting, and honestly, anyone in your shoes would feel the same way."
- OFFER REAL WISDOM when appropriate — insights about the caregiving journey that come from understanding, not a wellness blog:
  * "The hardest part of caregiving isn't the tasks — it's carrying it mentally even when you're not doing anything."
  * "Feeling resentful doesn't make you a bad person. It makes you a human being with limits."
  * "You don't have to earn rest by suffering enough first."
- When they ask for help or seem stuck, offer PRACTICAL SUPPORT:
  * A specific technique (breathing, grounding) WITH clear steps
  * A perspective reframe that fits their situation
  * Permission to lower their standards today
  * A small, doable action for right now
- When things are okay, celebrate that. "A decent day is worth noticing."

WHAT GOOD ADVICE LOOKS LIKE:
- "When everything feels like too much, pick the one thing that matters most today and let the rest be good enough."
- "You mentioned you can't sleep — sometimes it helps to do a brain dump: write everything you're carrying on paper before bed. Get it out of your head and onto something you can close."
- "Guilt is caregiving's constant companion. But think about it this way — the fact that you feel guilty means you care deeply. That's not a flaw, that's love."
- "You don't need to be the perfect caregiver. You need to be a sustainable one."

WHAT BAD ADVICE LOOKS LIKE (NEVER DO THIS):
- "Just take deep breaths!" without context or empathy
- "Try to stay positive!" — dismissive of real pain
- "Have you tried meditation?" as a first response to someone in crisis
- Rattling off a list of techniques without reading the room
- Asking "how are you feeling?" without offering anything

RESPONSE LENGTH:
- 3-6 sentences. Enough to be genuinely helpful, short enough to feel like a friend texting.
- Complete your thoughts fully. Never end mid-sentence.

ABSOLUTE RULES:
1. NEVER discuss the patient's condition, symptoms, or care tasks — redirect to: "The Care Coach in the Coach tab is great for that."
2. NEVER diagnose or use clinical terms (depression, anxiety disorder, burnout syndrome)
3. NEVER recommend medication or therapy changes — for professional concerns say: "That sounds worth bringing up with someone you trust — a friend, a support group, or your own doctor."
4. NEVER parrot back their check-in numbers
5. Use ${caregiverName}'s name occasionally, not every message
6. Vary your responses — never repeat the same advice twice in a conversation

TONE: Warm, real, grounded. Like a late-night conversation with someone who gets it.`;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { message, checkin, history, locale } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (typeof message !== 'string' || message.length > 5000) {
      return NextResponse.json(
        { error: 'Message must be a string of 5000 characters or fewer.' },
        { status: 400 }
      );
    }

    if (locale && !(LANGUAGE_CODES as readonly string[]).includes(locale)) {
      return NextResponse.json({ error: 'Unsupported locale.' }, { status: 400 });
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    const startTime = Date.now();

    const supabase = await createServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 15 messages per hour
    const rl = rateLimit(`wellbeing-agent:${user.id}`, { limit: 15, windowSeconds: 3600 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      );
    }

    // --- SAFETY PRE-PROCESSING ---
    // Only classify non-auto messages (auto-generated greetings are safe)
    const isAutoMessage = message === '[AUTO_GREETING]' || message === '[CHECKIN_UPDATED]';
    const safetyResult = isAutoMessage
      ? { proceed: true, safetyLevel: SafetyLevel.GREEN as SafetyLevel, classification: { level: SafetyLevel.GREEN as SafetyLevel, triggers: [] as string[] }, contextInjection: undefined, disclaimer: undefined }
      : preProcess(message, 'caregiver');

    // RED trigger → return static crisis response via SSE, no AI call
    if (!safetyResult.proceed && 'staticResponse' in safetyResult && safetyResult.staticResponse) {
      const crisisResponse = safetyResult.staticResponse;
      const crisisStream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ text: `**${crisisResponse.title}**\n\n${crisisResponse.message}\n\n${crisisResponse.resources.map((r: { name: string; action: string }) => `- **${r.name}**: ${r.action}`).join('\n')}` })}\n\n`),
          );
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ done: true })}\n\n`),
          );
          controller.close();
        },
      });

      logSafetyEvent(supabase, {
        session_id: `wellbeing-${user.id}`,
        user_id: user.id,
        user_role: 'caregiver',
        safety_level: safetyResult.safetyLevel,
        trigger_category: safetyResult.classification.triggerCategory || null,
        ai_model_called: false,
        response_approved: true,
        post_process_violations: [],
        disclaimer_included: false,
        professional_referral_included: true,
        escalated_to_crisis: true,
        response_time_ms: Date.now() - startTime,
      });

      return new Response(crisisStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // Get caregiver
    const { data: caregiver } = await supabase
      .from('caregivers')
      .select('id, name, household_id')
      .eq('id', user.id)
      .single();

    if (!caregiver) {
      return NextResponse.json({ error: 'Caregiver not found' }, { status: 404 });
    }

    // Get 28-day wellbeing logs for trend context
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);
    const { data: recentLogs } = await supabase
      .from('caregiver_wellbeing_logs')
      .select('date, energy_level, stress_level, sleep_quality_rating')
      .eq('caregiver_id', caregiver.id)
      .gte('date', twentyEightDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false })
      .limit(28);

    const trendSummary = recentLogs && recentLogs.length > 0
      ? recentLogs
          .slice(0, 7)
          .map(l => `${l.date}: energy=${l.energy_level ?? '?'}, stress=${l.stress_level ?? '?'}, sleep=${l.sleep_quality_rating ?? '?'}`)
          .join('\n')
      : 'No recent check-in data available.';

    // Build system prompt with safety layer + language instruction
    let systemPrompt = AI_SAFETY_SYSTEM_PROMPT + '\n\n' + buildSystemPrompt(caregiver.name, checkin, trendSummary);
    if (safetyResult.contextInjection) {
      systemPrompt += '\n\n' + safetyResult.contextInjection;
    }
    systemPrompt += getLanguageInstruction(locale);

    // Initialize Gemini
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    // Build conversation history for Gemini
    // Filter out empty messages and ensure history starts with 'user' role (Gemini requirement)
    const rawHistory = (history || [])
      .filter(msg => msg.content.trim() !== '')
      .slice(-6)
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
        parts: [{ text: msg.content }],
      }));
    // Gemini requires history to start with 'user' role — drop leading 'model' entries
    const firstUserIdx = rawHistory.findIndex(m => m.role === 'user');
    const chatHistory = firstUserIdx >= 0 ? rawHistory.slice(firstUserIdx) : [];

    // For system messages, craft natural user messages based on check-in context
    let userMessage = message;
    if (message === '[AUTO_GREETING]') {
      const stressHigh = checkin.stress != null && checkin.stress >= 4;
      const energyLow = checkin.energy != null && checkin.energy <= 2;
      const sleepPoor = checkin.sleep != null && checkin.sleep <= 2;
      const doingWell = !stressHigh && !energyLow && !sleepPoor;

      if (stressHigh && sleepPoor) {
        userMessage = `Hey. Rough day — I'm really stressed and barely slept. I don't even know where to start.`;
      } else if (stressHigh && energyLow) {
        userMessage = `I'm overwhelmed and I have nothing left in the tank today. It's a lot.`;
      } else if (stressHigh) {
        userMessage = `I'm carrying a lot of stress today. Some days it just hits harder.`;
      } else if (energyLow && sleepPoor) {
        userMessage = `I'm so tired. Didn't sleep and I still have to get through the whole day.`;
      } else if (energyLow) {
        userMessage = `Running on empty today. It's one of those days where everything takes extra effort.`;
      } else if (sleepPoor) {
        userMessage = `Didn't sleep well. I'm functional but my head feels foggy.`;
      } else if (doingWell) {
        userMessage = `Hi. Actually having a decent day today, which feels rare.`;
      } else {
        userMessage = `Hey, just checking in. It's been a mixed kind of day.`;
      }
    } else if (message === '[CHECKIN_UPDATED]') {
      const stressHigh = checkin.stress != null && checkin.stress >= 4;
      const energyLow = checkin.energy != null && checkin.energy <= 2;

      if (stressHigh) {
        userMessage = `Things are feeling heavier now. The stress is really building up.`;
      } else if (energyLow) {
        userMessage = `I'm fading. The energy just isn't there anymore today.`;
      } else {
        userMessage = `Things shifted a bit since we last talked. Feeling a little different.`;
      }
    }

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.8,
        topP: 0.9,
        topK: 40,
      },
    });

    const result = await chat.sendMessageStream(userMessage);

    // Stream response
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';
        try {
          for await (const chunk of result.stream) {
            // Extract delta text directly from candidate parts to avoid
            // SDK cumulative-text bugs.
            const parts = chunk.candidates?.[0]?.content?.parts;
            const delta = parts
              ? parts.map((p: any) => p.text || '').join('')
              : chunk.text();

            if (delta) {
              fullResponse += delta;
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ text: delta })}\n\n`)
              );
            }
          }

          // --- SAFETY POST-PROCESSING ---
          const postResult = postProcess(
            fullResponse,
            safetyResult.safetyLevel,
            'caregiver',
            safetyResult.disclaimer,
          );

          if (!postResult.approved) {
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ replace: true, text: BLOCKED_RESPONSE_FALLBACK })}\n\n`,
              ),
            );
          } else if (postResult.disclaimerAppended && safetyResult.disclaimer) {
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ text: '\n\n---\n\n' + safetyResult.disclaimer })}\n\n`,
              ),
            );
          }

          // Log audit entry
          logSafetyEvent(supabase, {
            session_id: `wellbeing-${user.id}`,
            user_id: user.id,
            user_role: 'caregiver',
            safety_level: safetyResult.safetyLevel,
            trigger_category: safetyResult.classification.triggerCategory || null,
            ai_model_called: true,
            response_approved: postResult.approved,
            post_process_violations: postResult.violations,
            disclaimer_included: postResult.disclaimerAppended,
            professional_referral_included: safetyResult.safetyLevel !== SafetyLevel.GREEN,
            escalated_to_crisis: false,
            response_time_ms: Date.now() - startTime,
          });

          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ done: true })}\n\n`)
          );
          controller.close();
        } catch (error) {
          log.error('Streaming error');
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    log.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown' });
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
