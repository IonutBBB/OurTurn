import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { createLogger } from '@/lib/logger';

const log = createLogger('ai/coach');

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  message: string;
  conversationId?: string;
  householdId: string;
}

// Build system prompt with patient and caregiver context
function buildSystemPrompt(
  patient: any,
  caregiver: any,
  checkins: any[],
  carePlan: any[],
  journalEntries: any[]
): string {
  const patientName = patient?.name || 'your loved one';
  const caregiverName = caregiver?.name || 'there';
  const caregiverRelationship = caregiver?.relationship || 'caregiver';

  // Format recent check-ins
  const formattedCheckins = checkins.length > 0
    ? checkins.map(c => `${c.date}: Mood=${c.mood || 'N/A'}/5, Sleep=${c.sleep_quality || 'N/A'}/3`).join('\n')
    : 'No recent check-ins recorded.';

  // Format care plan
  const formattedCarePlan = carePlan.length > 0
    ? carePlan.map(t => `- ${t.time}: ${t.title} (${t.category})`).join('\n')
    : 'No tasks in care plan yet.';

  // Format journal entries
  const formattedJournal = journalEntries.length > 0
    ? journalEntries.slice(0, 5).map(e => `- ${e.content}`).join('\n')
    : 'No journal entries yet.';

  return `You are MemoGuard Care Coach, a warm and knowledgeable AI assistant helping family caregivers of people living with dementia manage daily care.

ABOUT THE PERSON YOU'RE HELPING CARE FOR:
Name: ${patientName}
${patient?.biography ? `
Interests: ${patient.biography.hobbies || 'Not specified'}
Career: ${patient.biography.career || 'Not specified'}
Favorite music: ${patient.biography.favorite_music || 'Not specified'}
` : ''}

ABOUT THE CAREGIVER:
Name: ${caregiverName}
Relationship: ${caregiverRelationship}

RECENT DAILY CHECK-INS (last 7 days):
${formattedCheckins}

CURRENT CARE PLAN:
${formattedCarePlan}

RECENT CARE JOURNAL ENTRIES:
${formattedJournal}

YOUR ROLE:
- You are a supportive, empathetic companion for the caregiver
- You provide practical, actionable advice based on caregiving best practices
- You know ${patientName}'s biography, preferences, and routine
- You can suggest changes to the daily care plan
- You validate the caregiver's feelings - caregiving is hard

ABSOLUTE RULES - NEVER VIOLATE:
1. NEVER diagnose any condition or claim to detect disease progression
2. NEVER recommend medication changes - always say "discuss with the doctor"
3. NEVER use these words: decline, deterioration, worsening, degeneration, prognosis
4. NEVER score or grade the patient's cognitive abilities
5. NEVER claim to be a medical professional or replace medical advice
6. NEVER make the caregiver feel guilty or inadequate
7. ALWAYS use ${patientName}'s name (never say "the patient")
8. ALWAYS end with a concrete, actionable suggestion when possible
9. ALWAYS defer medical questions: "That's worth discussing with ${patientName}'s doctor"

WHEN THE CAREGIVER DESCRIBES A PROBLEM:
1. First: Acknowledge their feelings ("That sounds really challenging")
2. Then: Explain what might be happening in general terms
3. Then: Give 2-3 specific, practical suggestions
4. Then: Offer to modify the care plan if relevant
5. Finally: Remind them they're doing a good job

COMMUNICATION STYLE:
- Warm, like an experienced friend - not clinical or formal
- Use ${patientName}'s name naturally in responses
- Short paragraphs (3-4 sentences max per paragraph)
- Use simple language - avoid medical jargon
- Be culturally sensitive

SPECIAL RESPONSE FORMATS:
When suggesting a care plan change, include this format in your response:
[CARE_PLAN_SUGGESTION]
{"action": "add", "category": "physical", "title": "Evening calm walk", "hint": "A short 10-minute walk after dinner", "time": "18:30"}
[/CARE_PLAN_SUGGESTION]

When noting something for the doctor, include:
[DOCTOR_NOTE]
{"note": "Brief description of observation"}
[/DOCTOR_NOTE]`;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { message, conversationId, householdId } = body;

    if (!message || !householdId) {
      return NextResponse.json(
        { error: 'Message and householdId are required' },
        { status: 400 }
      );
    }

    // Rate limit: 20 messages per hour per household
    const rl = rateLimit(`ai-coach:${householdId}`, { limit: 20, windowSeconds: 3600 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      );
    }

    // Check API key
    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const supabase = await createServerClient();

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get caregiver data — verify they belong to this household
    const { data: caregiver } = await supabase
      .from('caregivers')
      .select('*')
      .eq('id', user.id)
      .eq('household_id', householdId)
      .single();

    if (!caregiver) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get patient data
    const { data: patient } = await supabase
      .from('patients')
      .select('*')
      .eq('household_id', householdId)
      .single();

    // Get recent check-ins (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: checkins } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('household_id', householdId)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    // Get care plan tasks
    const { data: carePlan } = await supabase
      .from('care_plan_tasks')
      .select('*')
      .eq('household_id', householdId)
      .eq('active', true)
      .order('time', { ascending: true });

    // Get recent journal entries
    const { data: journalEntries } = await supabase
      .from('care_journal_entries')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get or create conversation
    let conversation: any;
    if (conversationId) {
      const { data } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      conversation = data;
    }

    if (!conversation) {
      const { data } = await supabase
        .from('ai_conversations')
        .insert({
          caregiver_id: user.id,
          household_id: householdId,
          messages: [],
        })
        .select()
        .single();
      conversation = data;
    }

    // Get conversation history (last 10 messages for context)
    const previousMessages = (conversation.messages || []).slice(-10) as ChatMessage[];

    // Build system prompt
    const systemPrompt = buildSystemPrompt(
      patient,
      caregiver,
      checkins || [],
      carePlan || [],
      journalEntries || []
    );

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });

    // Build conversation history for Gemini
    const history = previousMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Start chat
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    // Generate response with streaming
    const result = await chat.sendMessageStream(message);

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';

        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullResponse += text;
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }

          // Save messages to conversation
          const newMessages = [
            ...previousMessages,
            { role: 'user' as const, content: message },
            { role: 'assistant' as const, content: fullResponse },
          ];

          await supabase
            .from('ai_conversations')
            .update({
              messages: newMessages,
              updated_at: new Date().toISOString(),
            })
            .eq('id', conversation.id);

          // Send conversation ID if new
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ conversationId: conversation.id, done: true })}\n\n`
            )
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
