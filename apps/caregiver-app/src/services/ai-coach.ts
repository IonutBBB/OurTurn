import { supabase } from '@ourturn/supabase';
import type { Caregiver, Household, Patient } from '@ourturn/shared';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface CarePlanSuggestion {
  action: 'add' | 'update';
  category: string;
  title: string;
  hint?: string;
  time?: string;
}

export interface DoctorNote {
  note: string;
}

export interface ParsedResponse {
  cleanContent: string;
  carePlanSuggestions: CarePlanSuggestion[];
  doctorNotes: DoctorNote[];
}

// Parse AI response for special blocks
export function parseAIResponse(content: string): ParsedResponse {
  const carePlanSuggestions: CarePlanSuggestion[] = [];
  const doctorNotes: DoctorNote[] = [];

  // Extract care plan suggestions
  const planRegex = /\[CARE_PLAN_SUGGESTION\]([\s\S]*?)\[\/CARE_PLAN_SUGGESTION\]/g;
  let match;
  while ((match = planRegex.exec(content)) !== null) {
    try {
      carePlanSuggestions.push(JSON.parse(match[1].trim()));
    } catch (e) {
      if (__DEV__) console.error('Failed to parse care plan suggestion:', e);
    }
  }

  // Extract doctor notes
  const noteRegex = /\[DOCTOR_NOTE\]([\s\S]*?)\[\/DOCTOR_NOTE\]/g;
  while ((match = noteRegex.exec(content)) !== null) {
    try {
      doctorNotes.push(JSON.parse(match[1].trim()));
    } catch (e) {
      if (__DEV__) console.error('Failed to parse doctor note:', e);
    }
  }

  // Clean content (remove blocks for display)
  const cleanContent = content
    .replace(/\[CARE_PLAN_SUGGESTION\][\s\S]*?\[\/CARE_PLAN_SUGGESTION\]/g, '')
    .replace(/\[DOCTOR_NOTE\][\s\S]*?\[\/DOCTOR_NOTE\]/g, '')
    .trim();

  return { cleanContent, carePlanSuggestions, doctorNotes };
}

// Build system prompt with patient and caregiver context
function buildSystemPrompt(
  patient: Patient | null,
  caregiver: Caregiver | null,
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

  return `You are OurTurn Care Coach, a warm and knowledgeable AI assistant helping family caregivers of people living with dementia manage daily care.

ABOUT THE PERSON YOU'RE HELPING CARE FOR:
Name: ${patientName}
${patient?.biography ? `
Interests: ${(patient.biography as any).hobbies || 'Not specified'}
Career: ${(patient.biography as any).career || 'Not specified'}
Favorite music: ${(patient.biography as any).favorite_music || 'Not specified'}
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

// Fetch context data from Supabase
export async function fetchCoachContext(householdId: string): Promise<{
  checkins: any[];
  carePlan: any[];
  journalEntries: any[];
}> {
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

  return {
    checkins: checkins || [],
    carePlan: carePlan || [],
    journalEntries: journalEntries || [],
  };
}

// Get or create conversation
export async function getOrCreateConversation(
  householdId: string,
  caregiverId: string,
  conversationId?: string
): Promise<{ id: string; messages: Message[] }> {
  if (conversationId) {
    const { data } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (data) {
      return { id: data.id, messages: data.messages || [] };
    }
  }

  // Create new conversation
  const { data } = await supabase
    .from('ai_conversations')
    .insert({
      caregiver_id: caregiverId,
      household_id: householdId,
      messages: [],
    })
    .select()
    .single();

  return { id: data?.id || '', messages: [] };
}

// Save messages to conversation
export async function saveConversationMessages(
  conversationId: string,
  messages: Message[]
): Promise<void> {
  await supabase
    .from('ai_conversations')
    .update({
      messages,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId);
}

// Send message to AI Coach API
export async function sendMessageToCoach(
  message: string,
  conversationId: string | undefined,
  householdId: string,
  onChunk: (text: string) => void,
  onConversationId: (id: string) => void,
  conversationType?: string,
  conversationContext?: string
): Promise<void> {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is not configured');
  }

  const response = await fetch(`${apiBaseUrl}/api/ai/coach`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      conversationId,
      householdId,
      conversationType: conversationType || 'open',
      conversationContext: conversationContext || undefined,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('No response body');
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6);
      try {
        const parsed = JSON.parse(data);

        if (parsed.error) {
          throw new Error(parsed.error);
        }

        if (parsed.conversationId) {
          onConversationId(parsed.conversationId);
        }

        if (parsed.text) {
          onChunk(parsed.text);
        }
      } catch (e) {
        // Ignore parse errors for incomplete chunks
      }
    }
  }
}

// Add care plan suggestion
export async function addCarePlanSuggestion(
  householdId: string,
  suggestion: CarePlanSuggestion
): Promise<void> {
  const { error } = await supabase.from('care_plan_tasks').insert({
    household_id: householdId,
    category: suggestion.category,
    title: suggestion.title,
    hint_text: suggestion.hint,
    time: suggestion.time || '12:00',
    recurrence: 'daily',
    recurrence_days: [],
    active: true,
  });

  if (error) throw error;
}

// Add doctor note
export async function addDoctorNote(
  householdId: string,
  note: DoctorNote
): Promise<void> {
  const { error } = await supabase.from('care_journal_entries').insert({
    household_id: householdId,
    content: `[For Doctor] ${note.note}`,
    entry_type: 'observation',
  });

  if (error) throw error;
}

// Get suggested prompts
export function getSuggestedPrompts(patientName: string): string[] {
  return [
    `How can I help ${patientName} stay engaged during the day?`,
    'What activities work well for sundowning?',
    `${patientName} seems agitated in the evenings. What can I do?`,
    'How do I handle repetitive questions without getting frustrated?',
  ];
}
