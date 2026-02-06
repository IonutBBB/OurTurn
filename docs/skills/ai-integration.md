# Skill: AI Integration Patterns

## Overview

OurTurn uses AI (Anthropic Claude API) for four features:
1. **AI Care Coach** — conversational chatbot for caregivers
2. **Brain Activity Generator** — personalized daily activities for patients
3. **Pattern Insights** — weekly trend analysis from check-in data
4. **Doctor Visit Reports** — summarizing care data into readable reports

All AI calls happen through **Supabase Edge Functions** — never call Claude API from client apps directly.

## AI Care Coach

### Architecture

```
Caregiver App (mobile or web)
  │
  │  POST /functions/v1/ai-coach-chat
  │  Body: { message, conversation_id, household_id }
  │
  ▼
Edge Function: ai-coach-chat
  │
  │  1. Load patient profile + biography
  │  2. Load recent check-ins (7 days)
  │  3. Load current care plan
  │  4. Load recent journal entries
  │  5. Load conversation history
  │  6. Build system prompt with context
  │  7. Call Claude API (streaming)
  │  8. Stream response back to client
  │  9. Save conversation to database
  │
  ▼
Claude API (claude-sonnet-4-20250514)
```

### System Prompt

```
You are OurTurn Care Coach, a warm and knowledgeable AI assistant
helping family caregivers of people living with dementia manage daily care.

RESPOND IN: {user_language}

ABOUT THE PERSON YOU'RE HELPING CARE FOR:
Name: {patient_name}
Age: {patient_age}
Lives at: {patient_home_city}
Interests: {patient_hobbies}
Career: {patient_career}
Favorite music: {patient_music}
Favorite foods: {patient_foods}
Important people: {patient_people}
Medications: {patient_medications}

ABOUT THE CAREGIVER:
Name: {caregiver_name}
Relationship: {caregiver_relationship}
Location: {caregiver_country}

RECENT DAILY CHECK-INS (last 7 days):
{formatted_checkins}

CURRENT CARE PLAN:
{formatted_care_plan}

RECENT CARE JOURNAL ENTRIES:
{formatted_journal}

YOUR ROLE:
- You are a supportive, empathetic companion for the caregiver
- You provide practical, actionable advice based on caregiving best practices
- You know {patient_name}'s biography, preferences, and routine
- You can suggest changes to the daily care plan
- You validate the caregiver's feelings — caregiving is hard

ABSOLUTE RULES — NEVER VIOLATE:
1. NEVER diagnose any condition or claim to detect disease progression
2. NEVER recommend medication changes — always say "discuss with the doctor"
3. NEVER use these words: decline, deterioration, worsening, degeneration, prognosis
4. NEVER score or grade the patient's cognitive abilities
5. NEVER claim to be a medical professional or replace medical advice
6. NEVER make the caregiver feel guilty or inadequate
7. NEVER share patient information outside the conversation
8. ALWAYS use {patient_name}'s name (never say "the patient")
9. ALWAYS end with a concrete, actionable suggestion when possible
10. ALWAYS defer medical questions: "That's worth discussing with {patient_name}'s doctor"

WHEN THE CAREGIVER DESCRIBES A PROBLEM:
1. First: Acknowledge their feelings ("That sounds really challenging")
2. Then: Explain what might be happening in general terms
3. Then: Give 2-3 specific, practical suggestions
4. Then: Offer to modify the care plan if relevant
5. Finally: Remind them they're doing a good job

COMMUNICATION STYLE:
- Warm, like an experienced friend — not clinical or formal
- Use {patient_name}'s name naturally in responses
- Short paragraphs (3-4 sentences max per paragraph)
- Use simple language — avoid medical jargon
- Be culturally sensitive to {caregiver_country}
- If the caregiver writes in a different language, respond in that language

SPECIAL RESPONSE FORMATS:
When suggesting a care plan change, output:
[CARE_PLAN_SUGGESTION]
{"action": "add", "category": "physical", "title": "Evening calm walk", "hint": "A short 10-minute walk after dinner", "time": "18:30"}
[/CARE_PLAN_SUGGESTION]
The app will render this as a clickable "Add to care plan" button.

When noting something for the doctor, output:
[DOCTOR_NOTE]
{"note": "Recurring evening agitation — possible sundowning pattern"}
[/DOCTOR_NOTE]
The app will render this as an "Add to doctor notes" button.
```

### Streaming Response Pattern

```typescript
// Edge Function: ai-coach-chat
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

// Inside the serve handler:
const stream = await anthropic.messages.stream({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  system: systemPrompt,
  messages: conversationHistory,
});

// Return as Server-Sent Events
return new Response(
  new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
          );
        }
      }
      controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
      controller.close();
    },
  }),
  {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  }
);
```

### Client-Side Streaming Consumption

```typescript
// In the Care Coach chat component
const sendMessage = async (userMessage: string) => {
  setIsStreaming(true);
  setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
  setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

  const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-coach-chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      message: userMessage,
      conversation_id: conversationId,
      household_id: householdId,
    }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') break;
      const { text } = JSON.parse(data);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].content += text;
        return updated;
      });
    }
  }
  setIsStreaming(false);
};
```

### Parsing Special Blocks

After AI response is complete, parse for action blocks:

```typescript
function parseAIResponse(content: string) {
  const carePlanSuggestions: CarePlanSuggestion[] = [];
  const doctorNotes: DoctorNote[] = [];

  // Extract care plan suggestions
  const planRegex = /\[CARE_PLAN_SUGGESTION\]([\s\S]*?)\[\/CARE_PLAN_SUGGESTION\]/g;
  let match;
  while ((match = planRegex.exec(content)) !== null) {
    carePlanSuggestions.push(JSON.parse(match[1].trim()));
  }

  // Extract doctor notes
  const noteRegex = /\[DOCTOR_NOTE\]([\s\S]*?)\[\/DOCTOR_NOTE\]/g;
  while ((match = noteRegex.exec(content)) !== null) {
    doctorNotes.push(JSON.parse(match[1].trim()));
  }

  // Clean content (remove blocks for display)
  const cleanContent = content
    .replace(/\[CARE_PLAN_SUGGESTION\][\s\S]*?\[\/CARE_PLAN_SUGGESTION\]/g, '')
    .replace(/\[DOCTOR_NOTE\][\s\S]*?\[\/DOCTOR_NOTE\]/g, '')
    .trim();

  return { cleanContent, carePlanSuggestions, doctorNotes };
}
```

## Brain Activity Generator

### How It Works

A daily cron Edge Function generates personalized activities for each household:

```typescript
// Edge Function: generate-daily-activities
// Runs daily at 3am UTC

// 1. Get all active households
// 2. For each household, load patient biography + preferences
// 3. Call Claude API to generate 1 activity
// 4. Save to brain_activities table

const prompt = `Generate a brain wellness activity for ${patient.name}.

About them:
- Age: ${patient.age}
- Grew up in: ${patient.biography.childhood_location}
- Career: ${patient.biography.career}
- Hobbies: ${patient.biography.hobbies}
- Favorite music: ${patient.biography.favorite_music}
- Important people: ${JSON.stringify(patient.biography.important_people)}
- Key life events: ${JSON.stringify(patient.biography.key_events)}

Recent activities they've done (avoid repeating):
${recentActivities.map(a => `- ${a.activity_type}: ${a.prompt_text}`).join('\n')}

Generate ONE activity. Choose from these types:
- reminiscence: A question about their past (use their biography)
- photo: A prompt to describe a memory (we'll show a family photo)
- word_game: A simple word game (name 5 things, rhyming, categories)
- creative: An imaginative prompt (describe a memory, imagine a place)
- orientation: A gentle question about today (weather, season, day)

RULES:
- Use warm, inviting language
- Never test or quiz — this is for enjoyment
- Keep the prompt under 30 words
- Make it specific to their life when possible
- Vary the type from recent activities

Respond in JSON only:
{
  "activity_type": "reminiscence",
  "prompt_text": "What was your favorite thing about working as a teacher?",
  "follow_up": "What a wonderful memory! Teaching shapes so many lives."
}`;
```

### Activity Difficulty Adaptation

Track engagement over time and adjust:

```typescript
// If patient has skipped activities 3+ times recently
// → Generate simpler, shorter, more open-ended prompts
// → Prefer music and creative types (most engaging, least demanding)

// If patient regularly completes activities with voice responses
// → Can use more detailed prompts
// → Include follow-up questions
```

## Pattern Insights Generator

### Weekly Analysis (Cron Edge Function)

```typescript
// Edge Function: generate-weekly-insights
// Runs every Sunday at midnight

const prompt = `Analyze this week's wellness data for ${patient.name}.

Daily check-ins this week:
${checkins.map(c => `${c.date}: Mood=${c.mood}/5, Sleep=${c.sleep_quality}/3`).join('\n')}

Task completion rates this week:
${Object.entries(completionRates).map(([cat, rate]) => `${cat}: ${rate}%`).join('\n')}

Care journal observations:
${journalEntries.map(e => `${e.created_at}: "${e.content}"`).join('\n')}

Generate 2-3 brief insights. Each insight should be:
- Written for a family caregiver (warm, supportive tone)
- Based on observable patterns in the data
- Accompanied by a practical suggestion
- NEVER use words like: decline, deterioration, worsening, cognitive

RULES:
- Say "routine changes" not "decline"
- Say "reported" not "showed symptoms of"
- Frame positively when possible
- Always suggest something actionable

Respond in JSON:
[
  {
    "insight": "Maria's mood tends to be brighter on days she completes her morning walk.",
    "suggestion": "Consider making the walk a priority — it seems to set a positive tone for the day.",
    "category": "positive"
  }
]`;
```

### Insight Categories

- `positive` — good pattern detected (green card in dashboard)
- `attention` — something worth noting (amber card)
- `suggestion` — general improvement idea (blue card)

Never use `warning` or `alert` categories for insights (medical device territory).

## Doctor Visit Report Generator

### On-Demand Generation

```typescript
// Edge Function: generate-doctor-report
// Called by caregiver from web app

const prompt = `Generate a care summary for a doctor visit.

Patient: ${patient.name}, Age: ${patient.age}
Period: ${startDate} to ${endDate}

Mood data (self-reported daily check-ins):
${moodSummary}

Sleep data (self-reported):
${sleepSummary}

Task completion rates by category:
${completionSummary}

Medication reminders completed: ${medAdherence}%

Notable family observations (from care journal):
${notableJournalEntries}

Caregiver concerns:
${caregiverNotes}

Generate a clear, concise care summary formatted for a healthcare provider.

RULES:
- Label all data as "self-reported via OurTurn app"
- Use factual, neutral language
- Present trends without interpretation (e.g., "Sleep rated as 'good' 3 of 7 days" not "Sleep is deteriorating")
- Include a section for family observations
- NEVER diagnose or suggest a diagnosis
- NEVER use: decline, deterioration, worsening
- End with: "This summary is based on self-reported wellness data. It is not a clinical assessment."

Format as structured sections:
1. Overview
2. Daily Wellness Check-Ins (mood + sleep trends)
3. Activity & Routine Completion
4. Medication Reminder Adherence
5. Family Observations
6. Caregiver Concerns
7. Disclaimer`;
```

## Cost Optimization

### Model Selection
- **Care Coach**: `claude-sonnet-4-20250514` — good balance of quality and cost
- **Activity generation**: `claude-haiku-4-5-20251001` — simple task, cheaper
- **Insights**: `claude-haiku-4-5-20251001` — structured analysis, cheaper
- **Reports**: `claude-sonnet-4-20250514` — needs quality writing

### Caching
- Cache common Care Coach responses (e.g., "what is sundowning?" always gets similar answer)
- Pre-generate 7 days of activities at once (1 API call, not 7)
- Cache insights for the week (don't regenerate on every dashboard load)

### Prompt Length
- Limit conversation history sent to Claude: last 10 messages (not entire history)
- Summarize older conversation context instead of sending raw messages
- Keep patient profile context concise (extract key fields, not entire biography blob)

### Estimated Costs (per household per month)
- Care Coach: ~15 conversations × 1000 tokens avg = 15K tokens → ~$0.50
- Activities: 30 days × 200 tokens = 6K tokens → ~$0.02
- Insights: 4 weeks × 500 tokens = 2K tokens → ~$0.01
- Reports: 1 per month × 2000 tokens = 2K tokens → ~$0.05
- **Total: ~$0.60 per household per month** (well within $9.99 subscription margin)

## Safety Guardrails

### Input Validation
- Max message length: 2000 characters
- Rate limit: 20 messages per hour per caregiver
- Block prompt injection attempts (monitor for "ignore previous instructions")

### Output Validation
- Scan AI responses for forbidden words before sending to client
- If forbidden word detected, re-generate with stronger guardrail emphasis
- Log all conversations for review (anonymized, opt-in for improvement)

### Fallback
- If Claude API is down: show "Care Coach is temporarily unavailable. Please try again shortly."
- If response takes > 30 seconds: timeout and show error
- Never show raw API errors to users
