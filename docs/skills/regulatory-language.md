# Skill: Regulatory Language — Medical Device Avoidance

## Why This Matters

OurTurn is positioned as a **general wellness and daily living support app**. If any feature or text crosses into medical device territory, the app would require:
- CE marking (EU) — €100K-250K and 12-18 months
- MHRA registration (UK)
- FDA 510(k) or De Novo (USA)
- Clinical trials to prove efficacy

**One wrong sentence in the UI can trigger regulatory classification.** This skill must be followed for ALL user-facing text: UI labels, notifications, AI responses, marketing, App Store descriptions, emails, help text, onboarding.

## The Bright Line

A software app becomes a **medical device** when its **intended purpose** is to:
- Diagnose a disease or condition
- Treat, cure, mitigate, or prevent a disease
- Monitor a physiological or pathological process
- Provide clinical decision support

OurTurn's intended purpose is:
- **Help families organize daily routines** for a loved one
- **Provide information** about healthy lifestyles
- **Coordinate care** among family members
- **Support general wellbeing** through activities and structure

## Forbidden Words and Phrases

### NEVER USE (anywhere in UI, notifications, AI prompts, marketing)

| ❌ Forbidden | ✅ Use Instead |
|---|---|
| diagnose / diagnosis | — (don't reference diagnosis at all) |
| detect / detection | notice / observe |
| monitor cognitive decline | track daily wellness |
| monitor symptoms | observe routine changes |
| assess / assessment (clinical) | check-in / daily check-in |
| cognitive therapy | brain wellness activities |
| treatment / treat | daily care / daily plan / support |
| treatment plan | care plan / daily plan |
| therapy / therapeutic | activity / exercise |
| clinical / clinically proven | evidence-informed / based on research |
| medical monitoring | family care coordination |
| prevent decline | support an active lifestyle |
| slow progression | maintain daily routines |
| improve cognition | support mental wellness |
| cognitive score | — (never score anything) |
| test / testing (cognitive) | activity / game / exercise |
| patient (in UI) | your loved one / their name |
| symptom tracking | wellness tracking / routine tracking |
| disease management | daily care management |
| efficacy / effective treatment | helpful / supportive |
| rehabilitate / rehabilitation | daily activities / engagement |
| prescribe / prescription | suggest / recommend |
| medical device | care tool / family app |
| clinically validated | — (avoid this claim entirely) |
| FDA cleared / CE marked | — (not applicable, don't reference) |

### Context-Dependent (Okay in Some Cases)

| Word | ❌ Not Okay | ✅ Okay |
|---|---|---|
| "health" | "health monitoring device" | "healthy lifestyle tips" |
| "brain" | "brain disease tracker" | "brain wellness activities" |
| "memory" | "memory decline assessment" | "memory games" / "share your memories" |
| "track" | "track cognitive function" | "track daily tasks" / "track your mood" |
| "alert" | "clinical alert system" | "family safety alerts" |
| "report" | "clinical assessment report" | "care summary for your doctor" |
| "sleep" | "sleep disorder monitoring" | "how did you sleep?" (self-report) |
| "medication" | "medication management system" | "medication reminders" |

## Feature-Specific Language Rules

### Daily Check-In
- NEVER call it "assessment," "screening," or "evaluation"
- Call it "daily check-in" or "how are you today?"
- Mood and sleep are **self-reported**, not measured
- The app records what the person tells us — it does not interpret, diagnose, or score
- AI insights based on check-ins use language like: "Maria reported poor sleep 4 of 7 days" — not "Sleep deterioration detected"

### Brain Wellness Activities
- NEVER call them "cognitive therapy," "cognitive training," or "CST sessions"
- Call them "brain wellness activities," "today's activity," or "brain games"
- NEVER score, grade, or measure performance
- NEVER show a progress graph of "cognitive performance"
- Completion metrics are okay: "You've done 5 activities this week! 🌟"
- Content metrics are NOT okay: "Your word recall improved by 15%"

### AI Care Coach
- System prompt must include explicit prohibitions (see `docs/skills/ai-integration.md`)
- Every AI response must avoid diagnostic language
- When caregiver asks a medical question, AI must defer: "I'd recommend discussing this with {name}'s doctor"
- AI can share general wellness information: "Many families find that regular walks help with mood and sleep"
- AI must NEVER say: "Based on the data, {name} may be experiencing cognitive decline"

### Location & Safety
- Call it "family safety" or "location sharing" — not "wandering prevention system" or "patient tracking"
- Safe zone alerts: "{name} has left the home area" — not "Wandering detected"
- "Take Me Home": just navigates — doesn't reference disorientation or cognitive impairment
- Inactivity alerts: "No movement detected" — not "Possible fall" or "Possible emergency"

### Doctor Visit Reports
- Header: "OurTurn Care Summary" — not "Clinical Assessment Report"
- Content is labeled as "self-reported data" and "family observations"
- Include disclaimer: "This summary is based on self-reported wellness data and family observations. It is not a clinical assessment."
- NEVER include language like "decline detected" or "deterioration in..."
- Use: "trends," "patterns," "changes in routine," "observations"

### Marketing & App Store
- App Store category: "Health & Fitness" or "Lifestyle" — NOT "Medical"
- Description: "Help your family manage daily routines" — not "Monitor and manage dementia"
- NEVER claim the app can: detect dementia, slow progression, replace doctor visits, provide medical advice
- Safe claims: "Stay connected with your family" / "Organize daily care" / "Peace of mind for caregivers" / "AI-powered daily planning"

### Push Notifications
- "Time for your morning walk! 🌤️" ✅
- "Medication reminder: It's time for your pills" ✅
- "Cognitive assessment due" ❌
- "Symptom check required" ❌
- "Decline detected in sleep patterns" ❌

## Disclaimers to Include

### On AI Coach Screen (always visible)
```
"I'm here to help you with daily care — I'm not a doctor.
For medical concerns, always consult your healthcare provider."
```

### On Doctor Visit Reports
```
"This summary is based on self-reported wellness data and family
observations collected through the OurTurn app. It is not a
clinical assessment or medical record. Please discuss any concerns
with your healthcare provider."
```

### In App Settings / About
```
"OurTurn is a family care coordination tool. It is not a medical
device and is not intended to diagnose, treat, cure, or prevent
any disease. Always consult qualified healthcare professionals
for medical advice."
```

### On Check-In History (Caregiver View)
```
"This data reflects {name}'s self-reported daily check-ins.
It is not a clinical measurement."
```

## Implementation Reference — AI Safety Guardrails

The regulatory language rules are enforced programmatically through the AI safety pipeline at `apps/caregiver-web/src/lib/ai-safety/` (10 files):

| File | Purpose |
|---|---|
| `pipeline.ts` | Main orchestrator: preProcess → classify → AI call → postProcess → audit |
| `classifier.ts` | Classifies input into RED / ORANGE / YELLOW / GREEN severity tiers |
| `crisis-responses.ts` | Static responses for RED-tier inputs (no AI call made) |
| `crisis-resources.ts` | Emergency resource links and hotline numbers |
| `medication-blocklist.ts` | Blocks medication dosage/change requests |
| `disclaimers.ts` | Appends appropriate disclaimers to AI responses |
| `audit-log.ts` | Logs classification metadata to `ai_safety_audit_log` table |
| `golden-rules.ts` | AI behaviour constraints and safety boundaries |
| `system-prompt-safety.ts` | Safety-focused system prompt injected into all AI calls |
| `index.ts` | Re-exports for clean imports |

**Classification tiers:**
- **RED** — Crisis/self-harm: static crisis response, NO AI call, emergency resources shown
- **ORANGE** — Medical/medication: redirect to medical professional, add disclaimer
- **YELLOW** — Emotional distress: AI responds with empathy + caregiver resources
- **GREEN** — General care: standard AI response with evidence-based information

**Audit logging:** All classifications are logged to `ai_safety_audit_log` (migration 021). Metadata only — no message content is stored (GDPR compliance). All 5 AI routes are integrated: coach, wellbeing-agent, suggest-tasks, behaviour-insights, toolkit-insights.

## Pre-Ship Checklist

Run through this for EVERY feature, screen, notification, and AI prompt before shipping:

- [ ] Does any text claim to diagnose, detect, or screen for disease? → REMOVE
- [ ] Does any text claim to treat, cure, slow, or prevent disease? → REMOVE
- [ ] Does any feature output a clinical score or rating? → REMOVE
- [ ] Does any feature recommend specific medical treatments? → REMOVE
- [ ] Does the AI make clinical decisions? → ADD DISCLAIMER + DEFER TO DOCTOR
- [ ] Could a regulator reading this screen think it's a medical device? → SIMPLIFY
- [ ] Is there a disclaimer on every health-adjacent screen? → ADD IT
- [ ] Are all metrics presented as self-reported observations? → VERIFY
- [ ] Would the App Store reviewer flag this as requiring medical review? → SOFTEN LANGUAGE
