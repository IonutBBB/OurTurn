# Crisis Hub — Complete Rebuild

## Overview

Rebuild the Crisis Hub page (`/crisis`) from scratch. The current implementation is action-oriented (generic buttons like "Start De-Escalation", "Call Emergency", "Alert Family", "Log Event"). The new design is **situation-first** — it asks caregivers "what's happening right now?" and delivers clinically-grounded step-by-step guidance for each specific scenario.

This is not a cosmetic update. The page structure, component hierarchy, data model, and user flow are all changing. Keep the existing app shell (sidebar, layout, breadcrumbs, page header style) and the existing design system tokens. Replace everything inside the page content area.

---

## Design System — Match Existing App

Do NOT introduce new design patterns. Use the existing design system already in the app. Reference existing components, tokens, and patterns from the codebase. Key visual characteristics to maintain:

- **Dark warm theme** — deep brown/black backgrounds, warm-toned cards
- **Card style** — subtle border (warm gray/brown), rounded corners (~12px), slightly lighter card background than page background
- **Active/selected states** — filled accent color backgrounds (e.g. the coral/orange toggle for "I'm with them" / "I'm remote")
- **Status banner** — full-width green banner for "All Clear" state with icon
- **Typography** — page title uses italic accent for second word ("Crisis *Hub*"), section headers are bold, descriptions are muted color
- **Accent colors already in use** — green for positive/safe states, coral/orange for active selections and warnings, muted text colors for descriptions
- **Sidebar** — left nav with icons, active state has left border accent + slightly lighter background + dot indicator
- **Breadcrumbs** — "Home / Dashboard" pattern at top
- **Right sidebar panels** — for Helplines and Family Contacts (keep these)

---

## Architecture — Three-Layer Navigation

### Layer 1: Entry Point (replaces the old static grid)

When the caregiver opens Crisis Hub, they see:

```
┌──────────────────────────────────────────────────┐
│  [Status Banner - All Clear / Active Alert]       │
├──────────────────────────────────────────────────┤
│                                                   │
│  Something's wrong?                               │
│  First — where are you right now?                 │
│                                                   │
│  ┌─────────────────────┐  ┌────────────────────┐ │
│  │ 🏠                  │  │ 📱                 │ │
│  │ I'm with [Name]     │  │ I'm not there      │ │
│  │ Step-by-step help    │  │ Reach them, check  │ │
│  │ for what's happening │  │ location, alert    │ │
│  └─────────────────────┘  └────────────────────┘ │
│                                                   │
│  ──────── Emergency — 112 ────────               │
│                                                   │
│  📊 Pattern Insight                               │
│  [Name]'s episodes tend to happen between         │
│  4-6 PM. 3 agitation events logged this week.     │
│                                                   │
├──────────────────────────────────────────────────┤
│  [Right sidebar: Helplines + Family Contacts]     │
└──────────────────────────────────────────────────┘
```

The two cards are large, tappable, full-width on mobile. They replace the old "I'm with them / I'm remote" toggle buttons. The emergency call button is ALWAYS visible at the bottom — not hidden inside a scenario.

The "Pattern Insight" box shows data derived from logged crisis events. If no events are logged yet, show a gentle prompt: "Crisis events you log will help spot patterns over time."

### Layer 2a: "I'm with them" → Scenario Selection Grid

When they tap "I'm with [Name]", show a 2-column grid of **situations**, not actions:

| Scenario | Emoji | Label | Urgency Tag |
|----------|-------|-------|-------------|
| `agitated` | 😤 | Agitated / Upset | — |
| `wandering` | 🚶 | Wandering / Missing | URGENT |
| `refusing` | 🚫 | Refusing Care | — |
| `hallucinations` | 👁️ | Seeing / Hearing Things | — |
| `sundowning` | 🌅 | Sundowning / Evening Anxiety | — |
| `fall` | 🆘 | Fall / Physical Emergency | URGENT |

Each card shows the emoji, the label, and (for critical urgency) a small red "URGENT" badge in the top-right corner.

A back button (← Back) returns to Layer 1.

Emergency 112 button remains visible below the grid.

### Layer 2b: "I'm not there" → Remote Actions

When they tap "I'm not there", show:

1. **Person status card** — avatar, name, last known location + time (from Location feature), green dot if location is recent
2. **Remote action list** (vertical, full-width cards):

| Action | Emoji | Label | Description |
|--------|-------|-------|-------------|
| `call` | 📞 | Call them | Voice call — hearing a familiar voice can help |
| `location` | 📍 | See their location | Check where they are right now |
| `alertNearest` | 👤 | Alert nearest family | Notify the family member closest to them |
| `playMusic` | 🎵 | Play calming music | Send familiar music to their device remotely |
| `emergency` | 🚨 | Call emergency for them | Send emergency services to their location |

3. **Cross-link**: "Need to guide someone who IS with [Name]?" → button to switch to scenario grid

Back button returns to Layer 1.

### Layer 3: Guided Scenario (Step-by-Step)

When they select a scenario from the grid, navigate to a guided walkthrough. This is the core of the feature.

Layout:
```
┌──────────────────────────────────────────────────┐
│  ← Back to situations                            │
│                                                   │
│  [emoji]  Agitated / Upset                       │
│           4 steps • Take it slow                  │
│                                                   │
│  ┌──────────────────────────────────────────────┐│
│  │ 💡 WHAT WORKS FOR [NAME]                     ││
│  │ Classical music (Chopin), photos of           ││
│  │ grandchildren, warm chamomile tea             ││
│  └──────────────────────────────────────────────┘│
│                                                   │
│  Step 1 — GROUND YOURSELF                        │
│  You first                                        │
│  [Expanded: breathing exercise + text]            │
│                                                   │
│  Step 2 — ASSESS                                 │
│  Quick check — physical cause?                    │
│  [Collapsed]                                      │
│                                                   │
│  Step 3 — DO THIS                                │
│  Lower the temperature                            │
│  [Collapsed]                                      │
│                                                   │
│  Step 4 — ESCALATE                               │
│  When to get help                                 │
│  [Collapsed]                                      │
│                                                   │
│  ┌──────────────────────────────────────────────┐│
│  │ 📝 Log this episode                          ││
│  │ Quick notes help spot patterns.              ││
│  │ [textarea]                                    ││
│  │ [Save to Crisis Journal]                     ││
│  └──────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

---

## Step Card Component

Each step is an accordion-style card. Only one is expanded at a time (clicking a new one collapses the previous). Structure:

### Collapsed State
- Circle with step number (colored by step type)
- Step type label in small caps (GROUND YOURSELF / ASSESS / DO THIS / ESCALATE)
- Step title
- Chevron indicator (▾)

### Expanded State
Shows all collapsed content plus:
- **Instruction text** — the main guidance paragraph
- **Checklist** (for `assess` type steps) — interactive checkboxes the caregiver can tick off
- **Tips list** (for `do` type steps) — concrete suggestions in individual small cards
- **Breathing timer** (for `breathe` type steps) — animated circle with inhale/hold/exhale phases
- **Action button** (for steps that link to other features) — e.g. "Open Location →", "Alert All Family Members →", "Call Emergency Services →"

### Step Type Colors
Use semantic colors that work within the existing design system:
- `breathe` → green (the app's positive/success color)
- `assess` → amber/yellow
- `do` → blue/periwinkle
- `escalate` → red (the app's danger/emergency color)

---

## Breathing Timer Component

A simple guided breathing exercise. Build as a standalone component.

### States
1. **Ready** — shows circle at base size with "Tap to start" label
2. **Inhale** (4 seconds) — circle slowly expands, label says "Breathe in..."
3. **Hold** (3 seconds) — circle stays expanded, label says "Hold..."
4. **Exhale** (5 seconds) — circle slowly contracts, label says "Breathe out..."
5. **Done** (after 2 cycles) — circle at base size with checkmark, label says "Better. Let's go." + "Continue →" button

### Visual
- Circle with subtle gradient border, matching the green accent
- Smooth CSS transitions on `transform: scale()` — no jarring jumps
- The animation should feel calming, not clinical

---

## Personalization Box — "What Works for [Name]"

At the top of every scenario guide, show a highlighted box with person-specific calming strategies. This data comes from the patient profile / care preferences.

### Data Source
Pull from the patient's profile. Fields needed:
- `calmingStrategies: string[]` — e.g. ["Classical music (Chopin)", "Photos of grandchildren", "Warm chamomile tea", "Going to the garden"]
- If empty, show: "No calming strategies recorded yet. Add them in Care Plan → Preferences to see personalized tips here."

### Visual
- Subtle accent background (use the app's green at very low opacity)
- Small caps label: "💡 WHAT WORKS FOR [NAME]"
- Strategies listed as flowing text, comma-separated

---

## Pattern Insight Component

Shows on the entry point (Layer 1). Derives insights from logged crisis events.

### Data Source
Query crisis journal entries. Compute:
- Most common time of day for episodes
- Episode count this week
- Most frequent scenario type
- Trend (increasing/decreasing/stable)

### Display Rules
- If **0 events logged**: "Crisis events you log will help spot patterns over time."
- If **1-2 events**: Show basic count only
- If **3+ events**: Show time pattern + count + optional trend
- Visual: subtle amber/gold background at very low opacity, small icon

---

## Complete Scenario Content

Below is the full clinical content for each scenario. This is grounded in evidence from the Alzheimer's Association Home Care Practice Recommendations, WHO iSupport, Lancet Commission 2024, and NICE guidelines. It is NOT medical advice — it is practical caregiver guidance.

### Scenario: `agitated`

**Label:** Agitated / Upset
**Urgency:** high
**Step count description:** "Take it slow"

**Step 1 — breathe**
- Title: "You first"
- Instruction: "Take one slow breath before you do anything. You can't calm someone if you're not calm."
- Component: BreathingTimer

**Step 2 — assess**
- Title: "Quick check — could something physical be wrong?"
- Instruction: "Pain, hunger, needing the bathroom, or an infection can all cause agitation. These need to be ruled out first."
- Checklist: ["Pain or discomfort?", "Hungry or thirsty?", "Needs the bathroom?", "Recent medication change?", "Fever or illness signs?"]

**Step 3 — do**
- Title: "Lower the temperature"
- Instruction: "Speak slowly and softly. Don't argue, correct, or explain. Match their emotional tone — validate what they're feeling, not the facts."
- Tips: ["\"I can see you're upset. I'm here.\"", "Reduce noise — turn off TV, close windows", "Give them physical space, don't crowd", "Offer a familiar comfort object"]

**Step 4 — do**
- Title: "Redirect, don't reason"
- Instruction: "If validation doesn't work, gently change the subject or environment. Don't try to logic them out of it."
- Tips: ["Suggest a walk or move to another room", "Put on music they love", "Offer a snack or warm drink", "Look at photos together"]

**Step 5 — escalate**
- Title: "When to get help"
- Instruction: "If agitation lasts more than 30 minutes, if they're at risk of hurting themselves or you, or if this is a sudden new behavior — call their doctor or emergency services."

---

### Scenario: `wandering`

**Label:** Wandering / Missing
**Urgency:** critical
**Step count description:** "Act fast"

**Step 1 — do**
- Title: "Check the usual places first"
- Instruction: "Most people with dementia go to familiar places — a former workplace, a childhood home, a neighbor's house, a favorite shop."
- Tips: ["Check the garden, garage, nearby streets", "Ask neighbors if they've seen them", "Check places they used to go regularly"]

**Step 2 — do**
- Title: "Use their location"
- Instruction: "If location tracking is set up, check their current position now."
- Action: links to /location page
- ActionLabel: "Open Location →"

**Step 3 — do**
- Title: "Alert the family"
- Instruction: "Let everyone know immediately. More eyes searching is better."
- Action: triggers alert family function
- ActionLabel: "Alert All Family Members →"

**Step 4 — escalate**
- Title: "Call police if not found within 15 minutes"
- Instruction: "Don't wait. People with dementia are at high risk of injury. Call emergency services and tell them the person has dementia. Have a recent photo ready."
- Action: call emergency
- ActionLabel: "Call Emergency Services →"

---

### Scenario: `refusing`

**Label:** Refusing Care
**Urgency:** medium
**Step count description:** "Take it slow"

**Step 1 — breathe**
- Title: "Pause — this isn't defiance"
- Instruction: "Refusal is almost always fear, confusion, or discomfort. They may not understand what you're asking, or the task may feel threatening."
- Component: BreathingTimer

**Step 2 — do**
- Title: "Step back and try differently"
- Instruction: "Don't push. Come back in 15-20 minutes and approach as if it's the first time."
- Tips: ["Change who's asking — a different person may get a different response", "Change the environment — bathroom too cold? Lighting too harsh?", "Break the task into smaller steps", "Offer choices: \"Bath or shower?\" not \"Time for your bath\""]

**Step 3 — do**
- Title: "Make it feel safe"
- Instruction: "Explain each step before you do it. Move slowly. Keep them warm and covered."
- Tips: ["Warn before touching: \"I'm going to help with your sleeve\"", "Use a calm, warm tone — not a parenting tone", "Play their favorite music during the task", "Keep the routine consistent — same time, same order"]

**Step 4 — assess**
- Title: "Is this a pattern?"
- Instruction: "If they consistently refuse the same task, log it. There may be an underlying issue — pain during movement, fear of water, sensitivity to touch. Discuss with their doctor."

---

### Scenario: `hallucinations`

**Label:** Seeing / Hearing Things
**Urgency:** medium
**Step count description:** "Take it slow"

**Step 1 — do**
- Title: "Don't argue — it's real to them"
- Instruction: "Telling someone their hallucination isn't real causes more distress. Acknowledge what they're experiencing without confirming it's true."
- Tips: ["\"That sounds frightening. I'm here with you.\"", "\"Tell me what you're seeing.\"", "Don't say \"there's nothing there\""]

**Step 2 — assess**
- Title: "Check the environment"
- Instruction: "Shadows, reflections, TV sounds, and clutter can trigger visual or auditory misinterpretation in dementia."
- Checklist: ["Shadows from windows or lamps?", "TV or radio on in background?", "Mirror reflections?", "Clutter that could look like figures?", "Poor lighting?"]

**Step 3 — do**
- Title: "Redirect gently"
- Instruction: "Once you've acknowledged their experience, try to shift their attention to something concrete and comforting."
- Tips: ["Move to a well-lit room", "Offer a hands-on activity", "Go for a short walk together", "Make a cup of tea together"]

**Step 4 — escalate**
- Title: "When to call the doctor"
- Instruction: "If hallucinations are new, frequent, or causing extreme distress. Sudden onset can indicate infection (especially UTI), medication side effects, or delirium — all of which need medical attention."

---

### Scenario: `sundowning`

**Label:** Sundowning / Evening Anxiety
**Urgency:** medium
**Step count description:** "Take it slow"

**Step 1 — do**
- Title: "Recognize the pattern"
- Instruction: "Sundowning typically starts late afternoon. Anxiety builds as daylight fades. This is extremely common and not something they can control."

**Step 2 — do**
- Title: "Adjust the environment now"
- Instruction: "Your goal is to reduce all stimulation and create safety signals."
- Tips: ["Turn on warm lights before it gets dark", "Close curtains to reduce shadows", "Turn off or lower the TV volume", "Reduce the number of people in the room"]

**Step 3 — do**
- Title: "Offer calming activities"
- Instruction: "Gentle, repetitive, familiar activities work best during sundowning."
- Tips: ["Gentle hand massage with lotion", "Soft, familiar music", "Folding towels or sorting objects", "Looking through a photo album together"]

**Step 4 — assess**
- Title: "Prevent it tomorrow"
- Instruction: "Log the episode with timing details. Over time, patterns emerge that help you prevent or reduce sundowning through schedule adjustments — more morning activity, less afternoon caffeine, consistent evening routine."

---

### Scenario: `fall`

**Label:** Fall / Physical Emergency
**Urgency:** critical
**Step count description:** "Act fast"

**Step 1 — do**
- Title: "Don't move them"
- Instruction: "Unless they're in immediate danger (fire, water), don't try to lift or move them. You could worsen an injury."
- Tips: ["Get down to their level — kneel beside them", "Reassure them: \"I'm here, you're safe\"", "Check for visible injury — bleeding, swelling, odd limb position"]

**Step 2 — assess**
- Title: "Can they get up?"
- Instruction: "If there's no obvious injury and they want to try getting up, help them do it slowly in stages — roll to side, get to hands and knees, use a sturdy chair."
- Checklist: ["Are they alert and responsive?", "Any obvious injury or pain?", "Can they move all limbs?", "Did they hit their head?"]

**Step 3 — escalate**
- Title: "Call for help if..."
- Instruction: "Head injury, can't get up, severe pain, confusion worse than usual, or bleeding that won't stop. Don't hesitate — falls in older adults are medical emergencies."
- Action: call emergency
- ActionLabel: "Call Emergency Services →"

**Step 4 — do**
- Title: "After the fall"
- Instruction: "Even if they seem fine, log this event and mention it to their doctor. Repeated falls can indicate medication issues, vision problems, or progression of the disease."

---

## Data Model

### Crisis Event (for logging)

```typescript
interface CrisisEvent {
  id: string;
  patientId: string;
  caregiverId: string;
  scenario: 'agitated' | 'wandering' | 'refusing' | 'hallucinations' | 'sundowning' | 'fall' | 'other';
  timestamp: string; // ISO datetime
  note: string; // free-text from caregiver
  duration?: number; // minutes, optional
  resolved: boolean;
  resolvedBy?: string; // what worked
}
```

### Patient Calming Strategies (add to patient profile if not present)

```typescript
interface PatientCalmingStrategies {
  patientId: string;
  strategies: string[]; // e.g. ["Classical music (Chopin)", "Photos of grandchildren"]
  updatedAt: string;
  updatedBy: string;
}
```

### Supabase

Create a `crisis_events` table if it doesn't exist. Columns should match the CrisisEvent interface above. Add an index on `(patientId, timestamp)` for pattern queries.

If a `calming_strategies` field doesn't exist on the patient profile table, add it as a `text[]` (PostgreSQL array) column.

---

## Integration Points

These features already exist in the app. The Crisis Hub should link to them, not rebuild them:

1. **Location** (`/location`) — the "Open Location →" action in the wandering scenario should navigate to the existing Location page
2. **Family** (`/family`) — the "Alert All Family Members →" action should trigger the existing alert/notification mechanism used by the Family feature
3. **Emergency call** — use `window.open('tel:112')` or the existing emergency call utility if one exists
4. **Helplines sidebar** — keep the existing Helplines panel in the right sidebar. It already works.
5. **Family Contacts sidebar** — keep the existing Family Contacts panel in the right sidebar. It already works.

---

## Component File Structure

Suggested structure (adapt to match existing project conventions):

```
crisis/
├── page.tsx                    # Main Crisis Hub page
├── components/
│   ├── CrisisEntryPoint.tsx   # Layer 1 — mode selection
│   ├── ScenarioGrid.tsx       # Layer 2a — situation cards
│   ├── RemoteActions.tsx      # Layer 2b — remote mode
│   ├── ScenarioGuide.tsx      # Layer 3 — step-by-step walkthrough
│   ├── StepCard.tsx           # Accordion step component
│   ├── BreathingTimer.tsx     # Guided breathing animation
│   ├── PatternInsight.tsx     # Data-driven insight box
│   ├── PersonalizationBox.tsx # "What works for [Name]"
│   └── CrisisLogger.tsx      # Quick note + save form
├── data/
│   └── scenarios.ts           # All scenario content (steps, tips, checklists)
├── hooks/
│   ├── useCrisisEvents.ts     # Fetch/create crisis events from Supabase
│   └── usePatientProfile.ts   # Get patient name + calming strategies (or reuse existing hook)
└── types.ts                   # CrisisEvent, Scenario types
```

---

## Implementation Notes

1. **State management** — use URL-based state or React state for the current view (entry → grid/remote → scenario). No need for global state. The flow is: `mode: null | 'with' | 'remote'` and `selectedScenario: string | null`.

2. **Accessibility** — this is a crisis tool used under stress. Minimum touch targets of 56px (per existing app accessibility standards). High contrast text. No small or fiddly UI elements.

3. **Mobile responsiveness** — the scenario grid should collapse to single column on narrow screens. Step cards should be full-width. The breathing timer circle should be centered and large enough to be calming, not cramped.

4. **Loading states** — for the personalization box and pattern insight, show a subtle skeleton/placeholder while data loads. Never block the scenario guide from rendering while waiting for personalization data.

5. **Empty states** — handle gracefully:
   - No calming strategies → prompt to add them in Care Plan
   - No crisis events logged → gentle encouragement, not a blank void
   - No location data → show "Location not available" in remote mode status card

6. **The log form at the bottom of every scenario guide** — pre-fill the scenario type automatically. The caregiver only needs to type a free-text note and hit save. Keep it minimal — they may be emotionally drained at this point.

7. **Do NOT add a disclaimer or "not medical advice" banner.** The app handles this at a platform level. The Crisis Hub content is practical caregiving guidance, not diagnosis or treatment.

8. **Animations** — keep them minimal and purposeful. The breathing timer needs smooth animation. Everything else should use simple transitions (0.15-0.2s) for hover/expand states. No flashy entrances or bouncing.

9. **Emergency button** — must be visible on every layer of the navigation. It should never scroll out of view. Consider making it sticky/fixed at the bottom on mobile.

---

## What NOT To Build

- Do NOT build a chat/AI component in Crisis Hub. The AI Coach is a separate page.
- Do NOT build a full crisis journal viewer. The "View all in Journal" link can go to Reports or a future journal page.
- Do NOT add scenario content beyond the six defined above in this phase.
- Do NOT rebuild the sidebar, helplines panel, or family contacts panel — they already work.
