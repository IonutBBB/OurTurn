# Skill: AI Integration Patterns

## Overview

OurTurn uses **Google Gemini 2.5 Flash** for all AI features. There are 8 AI-powered features split across two architectures:

**Next.js API Routes** (in `apps/caregiver-web/src/app/api/ai/`):
1. **AI Care Coach** — conversational chatbot for caregivers (streaming)
2. **Suggest Tasks** — evidence-based care plan task generation
3. **Behaviour Insights** — pattern analysis from behaviour incidents
4. **Toolkit Insights** — correlation analysis from 28-day wellbeing data
5. **Wellbeing Agent** — dedicated caregiver wellbeing chatbot (streaming)

**Supabase Edge Functions** (in `supabase/functions/`):
6. **Activity Generator** — daily personalized patient activities (cron)
7. **Weekly Insights** — weekly trend analysis from check-in data (cron)

**Safety Layer** (in `apps/caregiver-web/src/lib/ai-safety/`):
8. **AI Safety Pipeline** — 10-file guardrails system integrated into all 5 API routes

All API routes use the `@google/generative-ai` SDK. Edge Functions call the Gemini REST API directly. The AI API key (`GOOGLE_AI_API_KEY`) is never exposed to clients.

## AI Care Coach

### Architecture

```
Caregiver App (mobile or web)
  │
  │  POST /api/ai/coach
  │  Body: { message, conversationId?, householdId, conversationType?, conversationContext?, locale? }
  │
  ▼
Next.js API Route: src/app/api/ai/coach/route.ts
  │
  │  1. Rate limit (20 messages/hour per household)
  │  2. Safety pre-processing (classify RED/ORANGE/YELLOW/GREEN)
  │  3. RED → return static crisis response, NO AI call
  │  4. Load patient profile + biography
  │  5. Load recent check-ins (7 days)
  │  6. Load current care plan + completion rates
  │  7. Load recent journal entries + weekly insights
  │  8. Load conversation history (last 10 messages)
  │  9. Build system prompt with all context + safety injection
  │  10. Call Gemini 2.5 Flash (streaming via SDK)
  │  11. Stream response back as SSE
  │  12. Safety post-processing (scan for forbidden content)
  │  13. Append disclaimer if YELLOW/ORANGE
  │  14. Save conversation to database
  │  15. Log to ai_safety_audit_log
  │
  ▼
Google Gemini 2.5 Flash (gemini-2.5-flash)
```

### Conversation Types

The coach supports different conversation modes via `conversationType`:

| Type | Context | Behavior |
|---|---|---|
| `open` | None | Free-form care coaching conversation |
| `situation` | Situation description | Structured response: what's happening → try this → what to avoid → if continues |
| `workflow:plan_tomorrow` | — | Generates morning/afternoon/evening plan with `[CARE_PLAN_SUGGESTION]` blocks |
| `workflow:doctor_visit` | — | Generates structured doctor visit summary with `[DOCTOR_NOTE]` blocks |
| `workflow:review_week` | — | Analyzes weekly patterns: what went well → needs attention → suggestions |
| `workflow:adjust_plan` | — | Reviews completion rates and suggests care plan optimizations |
| `topic` | Topic description | Evidence-based topic exploration personalized to the patient |

### System Prompt

The system prompt is built from real data and includes:
- Patient biography, preferences, and routine
- Caregiver name and relationship
- Recent daily check-ins (7 days)
- Current care plan with completion rates by category
- Recent care journal entries
- Latest weekly insights
- Safety guardrails (injected from `AI_SAFETY_SYSTEM_PROMPT`)
- Language instruction based on locale

Key system prompt rules (preserved in full in `route.ts`):
- Never diagnose or claim to detect disease progression
- Never recommend medication changes
- Never use forbidden words: decline, deterioration, worsening, degeneration, prognosis
- Never score cognitive abilities
- Always defer medical questions to doctor
- Use patient's name naturally but don't overuse it
- End with concrete, actionable suggestions

### Streaming Pattern (Gemini SDK)

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: systemPrompt,
});

const chat = model.startChat({
  history: previousMessages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  })),
  generationConfig: {
    maxOutputTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
  },
});

const result = await chat.sendMessageStream(message);

// Return as Server-Sent Events
const stream = new ReadableStream({
  async start(controller) {
    let fullResponse = '';
    for await (const chunk of result.stream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      const chunkText = parts?.map(p => p.text || '').join('') || '';

      // Gemini sends cumulative text — compute delta
      let delta: string;
      if (chunkText.startsWith(fullResponse)) {
        delta = chunkText.slice(fullResponse.length);
      } else {
        delta = chunkText;
      }

      if (delta) {
        fullResponse += delta;
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({ text: delta })}\n\n`)
        );
      }
    }
    // Post-processing, save, audit log, then close
    controller.enqueue(
      new TextEncoder().encode(`data: ${JSON.stringify({ done: true })}\n\n`)
    );
    controller.close();
  },
});
```

### Special Response Blocks

The AI can include structured blocks in its responses:

```
[CARE_PLAN_SUGGESTION]
{"action": "add", "category": "physical", "title": "Evening calm walk", "hint": "A short 10-minute walk after dinner", "time": "18:30"}
[/CARE_PLAN_SUGGESTION]

[DOCTOR_NOTE]
{"note": "Recurring evening agitation — possible sundowning pattern"}
[/DOCTOR_NOTE]
```

The client parses these and renders them as "Add to care plan" / "Add to doctor notes" buttons.

## Suggest Tasks

**Route:** `POST /api/ai/suggest-tasks`
**File:** `src/app/api/ai/suggest-tasks/route.ts`

Generates evidence-based care plan suggestions grounded in the intervention library (`@ourturn/shared/data/evidence-based-interventions`).

- Loads patient biography, existing care plan, and completion patterns
- Sends to Gemini with the full evidence-based intervention catalogue
- Validates suggestions against the intervention library
- Enriches with evidence source references
- Rate limit: configurable per household
- Supports both cookie auth (web) and Bearer token auth (mobile)

## Behaviour Insights

**Route:** `POST /api/ai/behaviour-insights`
**File:** `src/app/api/ai/behaviour-insights/route.ts`

Analyzes logged behaviour incidents to find patterns and suggest strategies.

- Loads all behaviour incidents for the household
- Groups by type, time of day, and triggers
- Gemini generates pattern analysis and non-pharmacological strategies
- Rate limit: 5 per day per caregiver
- Safety post-processing applied (no diagnostic language)

## Toolkit Insights

**Route:** `POST /api/ai/toolkit-insights`
**File:** `src/app/api/ai/toolkit-insights/route.ts`

Analyzes 28 days of caregiver wellbeing check-in data for correlations.

- Loads energy, stress, and sleep data from toolkit check-ins
- Gemini identifies correlations and patterns
- Returns insight cards: `pattern`, `correlation`, or `suggestion` categories
- Rate limit: 3 per day per caregiver
- Uses Gemini REST API directly (not SDK)

## Wellbeing Agent

**Route:** `POST /api/ai/wellbeing-agent`
**File:** `src/app/api/ai/wellbeing-agent/route.ts`

Dedicated conversational AI for caregiver self-care and emotional support.

- Takes current check-in data (energy, stress, sleep) and conversation history
- Builds a caregiver-focused system prompt with recent trends
- Full safety pipeline integration (preProcess + postProcess)
- Streaming response via Gemini SDK (same pattern as Care Coach)
- Tone: "wise, compassionate friend who deeply understands caregiving"

## Activity Generator (Edge Function)

**Function:** `supabase/functions/generate-daily-activities/index.ts`
**Trigger:** Daily cron at 3am UTC

Generates one personalized brain wellness activity per household for the next day.

```
For each Plus household:
  1. Check if activity already exists for target date
  2. Load patient biography + preferences
  3. Select activity type (weighted random): reminiscence (30%), word_game (20%),
     creative (20%), orientation (15%), music (15%)
  4. Call Gemini REST API with patient context
  5. Parse JSON response: { prompt, followUp, songName? }
  6. Determine media_url (YouTube search link for music activities)
  7. Save to brain_activities table
  8. Fallback to default activity if API fails
```

**Model:** `gemini-2.5-flash` (via REST API)
**Config:** temperature 0.8, maxOutputTokens 256

## Weekly Insights (Edge Function)

**Function:** `supabase/functions/generate-weekly-insights/index.ts`
**Trigger:** Weekly cron (Sunday at midnight)

Generates 2-3 insights per household from the week's wellness data.

```
For each Plus household:
  1. Load daily check-ins for the week (mood, sleep)
  2. Load task completion rates by category
  3. Load care journal observations
  4. Calculate metrics (avg mood, poor sleep days, completion rates)
  5. Call Gemini REST API with formatted data
  6. Parse JSON response: [{ insight, suggestion, category }]
  7. Save to weekly_insights table
  8. Fallback to rule-based default insights if API fails
```

**Insight categories:**
- `positive` — good pattern detected (green card)
- `attention` — something worth noting (amber card)
- `suggestion` — improvement idea (blue card)

Never use `warning` or `alert` categories (medical device territory).

## AI Safety Pipeline

**Location:** `apps/caregiver-web/src/lib/ai-safety/` (10 files)
**Import:** `@/lib/ai-safety`

### Files

| File | Purpose |
|---|---|
| `index.ts` | Re-exports for clean imports |
| `types.ts` | TypeScript types |
| `classifier.ts` | Pattern-based message classification into RED/ORANGE/YELLOW/GREEN |
| `pipeline.ts` | `preProcess()` and `postProcess()` orchestration |
| `crisis-responses.ts` | Static responses for RED-tier inputs |
| `medication-blocklist.ts` | Medication name detection in AI output |
| `disclaimers.ts` | Context-appropriate disclaimer text |
| `audit-log.ts` | `logSafetyEvent()` — writes to `ai_safety_audit_log` table |
| `pre-processor.ts` | Input sanitization utilities |
| `post-processor.ts` | Output validation patterns |

### Classification Tiers

| Level | Trigger Examples | Action |
|---|---|---|
| **RED** | Self-harm ("want to die"), abuse detected, immediate danger, caregiver crisis | Static crisis response. **NO AI call.** Emergency resources shown. |
| **ORANGE** | Medication confusion, sudden changes, falls/injury, driving safety, swallowing difficulty | AI responds with strong constraints. Context injection forces medical referral. Blocked topics enforced. |
| **YELLOW** | Behavioral symptoms, caregiver stress, sleep problems, continence issues | AI responds with gentle disclaimer. Non-pharmacological strategies only. |
| **GREEN** | General care questions | Normal AI response. |

### Pipeline Flow

```
User message
  │
  ▼
preProcess(message, userRole)
  │
  ├─ RED → return static crisis response, log to audit, DONE
  │
  ├─ ORANGE → proceed=true, inject safety context, set blocked topics
  │
  ├─ YELLOW → proceed=true, inject gentle safety context
  │
  └─ GREEN → proceed=true, no modifications
  │
  ▼
Call Gemini API (streaming)
  │
  ▼
postProcess(aiResponse, safetyLevel, userRole, disclaimer)
  │
  ├─ Scan for medication names (blocklist)
  ├─ Scan for diagnostic language patterns
  ├─ Scan for dosage/treatment instructions
  ├─ Scan for prognosis language
  ├─ Scan for dehumanizing language
  ├─ Patient-facing: check for prohibited words (dementia, alzheimer, etc.)
  │
  ├─ Hard violation → replace with BLOCKED_RESPONSE_FALLBACK
  ├─ Soft violation → append disclaimer
  └─ Clean → pass through
  │
  ▼
logSafetyEvent(supabase, auditData)
  │  Writes to ai_safety_audit_log table
  │  Metadata only — NO message content (GDPR)
  │
  ▼
Return to client
```

### Audit Logging

All AI interactions are logged to `ai_safety_audit_log` (migration 021):

```typescript
logSafetyEvent(supabase, {
  session_id: conversationId,
  user_id: userId,
  user_role: 'caregiver',
  safety_level: 'yellow',
  trigger_category: 'caregiverStress',
  ai_model_called: true,
  response_approved: true,
  post_process_violations: [],
  disclaimer_included: true,
  professional_referral_included: true,
  escalated_to_crisis: false,
  response_time_ms: 1234,
});
```

**GDPR compliance:** No message content is stored. Only metadata (safety level, trigger category, timing, approval status).

### Integrated Routes

All 5 API routes use the safety pipeline:
- `coach` — full pipeline (preProcess + postProcess + audit)
- `wellbeing-agent` — full pipeline (preProcess + postProcess + audit)
- `suggest-tasks` — postProcess + audit (no preProcess since input is structured)
- `behaviour-insights` — postProcess + audit
- `toolkit-insights` — postProcess + audit

## Cost Optimization

### Model Selection
All features use **Gemini 2.5 Flash** — Google's fast, cost-effective model. It provides good quality for conversational and analytical tasks at significantly lower cost than frontier models.

### Token Management
- Conversation history limited to last 10 messages (not entire history)
- Edge Functions use low `maxOutputTokens` (256 for activities, 512 for insights)
- API routes use 4096 maxOutputTokens for richer conversational responses
- Patient biography context is extracted to key fields, not sent as raw blob

### Caching & Batching
- Activities pre-generated daily (1 cron run, not on-demand)
- Weekly insights cached per week (not regenerated on every dashboard load)
- Evidence-based intervention library loaded once from shared package

### Rate Limits
| Route | Limit |
|---|---|
| Coach | 20 messages/hour per household |
| Behaviour Insights | 5 per day per caregiver |
| Toolkit Insights | 3 per day per caregiver |
| Suggest Tasks | Configurable per household |

### Estimated Costs (Gemini 2.5 Flash, per household per month)
- Care Coach: ~15 conversations × ~2000 tokens avg = ~30K tokens → ~$0.02
- Activities: 30 days × 256 tokens = ~8K tokens → <$0.01
- Insights: 4 weeks × 512 tokens = ~2K tokens → <$0.01
- Other routes: ~10 calls × 1000 tokens = ~10K tokens → ~$0.01
- **Total: ~$0.05 per household per month** (well within subscription margin)
