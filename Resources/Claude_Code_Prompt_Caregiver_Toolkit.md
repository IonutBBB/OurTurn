# Claude Code Implementation Prompt: Caregiver Toolkit Redesign

## Context

You are building the **Caregiver Toolkit** — a core feature of a dementia caregiving platform. This is the caregiver-facing web dashboard (Next.js). The toolkit replaces a generic AI chatbot with a structured, evidence-based support system for family caregivers of people with early-stage dementia.

**Tech Stack:**
- Frontend: **Next.js 14+** (App Router) with TypeScript
- Backend: **Supabase** (PostgreSQL, Auth, Realtime, Edge Functions)
- AI Engine: **DeepSeek V3** via OpenAI-compatible API (for personalization/triage routing)
- Styling: **Tailwind CSS** with a custom dark warm theme (see Design System below)
- State Management: React Context + Supabase Realtime subscriptions
- i18n: `next-intl` (must support English, German, Romanian from day one)

**Accessibility Requirements (NON-NEGOTIABLE):**
- Minimum touch targets: **56px × 56px**
- Minimum font size: **18px** (body), **16px** absolute minimum for secondary text
- Contrast ratio: **7:1** minimum (WCAG AAA for cognitive impairment)
- Focus indicators: visible, high-contrast, minimum 3px
- Screen reader support: proper ARIA labels, landmarks, live regions
- Reduced motion: respect `prefers-reduced-motion`
- No auto-playing media, no flashing content
- Sans-serif fonts only

---

## Design System

The app uses a **warm dark theme** designed to feel calming and non-clinical.

```
/* Color Tokens */
--bg-primary: #1a1410          /* Page background - very dark warm brown */
--bg-surface: #2a2118          /* Card/panel backgrounds */
--bg-surface-hover: #352a20    /* Card hover state */
--bg-elevated: #3d3028         /* Elevated panels, modals */
--text-primary: #f5e6d3        /* Primary text - warm off-white */
--text-secondary: #b8a898      /* Secondary/muted text */
--text-muted: #8a7a6a          /* Placeholder, disabled text */
--accent-primary: #e8a065      /* Primary accent - warm amber/orange */
--accent-primary-hover: #f0b478
--accent-success: #6b9e6b      /* Success/completed states */
--accent-warning: #d4a843      /* Warning states */
--accent-danger: #c45c5c       /* Danger/crisis states */
--accent-calm: #6b8e9e         /* Calm/info states */
--border-subtle: #3d3028       /* Subtle borders */
--border-default: #4d4038      /* Default borders */

/* Typography */
Font family: 'Inter', system-ui, sans-serif
Body: 18px / 1.6 line-height
H1: 32px / bold
H2: 26px / semibold
H3: 22px / semibold
Small/caption: 16px (never below this)

/* Spacing */
Base unit: 8px
Card padding: 24px
Section gap: 32px
Touch target min: 56px height

/* Border radius */
Cards: 16px
Buttons: 12px
Inputs: 10px
Pills/tags: 20px
```

---

## Database Schema (Supabase)

Create the following tables. All tables include `created_at`, `updated_at` timestamps and RLS policies scoped to the caregiver's household.

### Core Tables

```sql
-- Daily wellness check-ins from caregivers
CREATE TABLE caregiver_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID REFERENCES auth.users(id) NOT NULL,
  household_id UUID REFERENCES households(id) NOT NULL,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10) NOT NULL,
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10) NOT NULL,
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10) NOT NULL,
  mood_notes TEXT,
  checked_in_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Behaviour incidents logged by caregiver
CREATE TABLE behaviour_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID REFERENCES auth.users(id) NOT NULL,
  household_id UUID REFERENCES households(id) NOT NULL,
  patient_id UUID REFERENCES patients(id) NOT NULL,
  behaviour_type TEXT NOT NULL CHECK (behaviour_type IN (
    'aggression', 'wandering', 'sleep_disturbance', 'repetitive_behaviour',
    'refusing_care', 'depression_anxiety_apathy', 'delusions_hallucinations',
    'changes_in_judgement'
  )),
  severity INTEGER CHECK (severity BETWEEN 1 AND 5) NOT NULL, -- 1=mild, 5=severe
  time_of_day TEXT CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'night')),
  duration_minutes INTEGER,
  possible_triggers TEXT[], -- array of trigger tags
  what_happened TEXT NOT NULL,
  what_helped TEXT,
  location TEXT, -- where it happened
  logged_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Caregiver daily goals
CREATE TABLE caregiver_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID REFERENCES auth.users(id) NOT NULL,
  goal_text TEXT NOT NULL,
  goal_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Quick relief activity completions
CREATE TABLE relief_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID REFERENCES auth.users(id) NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'breathing_box', 'breathing_478', 'grounding_54321',
    'progressive_muscle_relaxation', 'gratitude_moment',
    'mindful_break', 'guided_visualization', 'body_scan'
  )),
  duration_seconds INTEGER,
  mood_before INTEGER CHECK (mood_before BETWEEN 1 AND 5),
  mood_after INTEGER CHECK (mood_after BETWEEN 1 AND 5),
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- Help requests sent to care network
CREATE TABLE help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) NOT NULL,
  household_id UUID REFERENCES households(id) NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN (
    'need_break', 'medication_help', 'need_visit',
    'groceries', 'appointment', 'custom'
  )),
  message TEXT,
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
  accepted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI-generated weekly insights
CREATE TABLE weekly_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID REFERENCES auth.users(id) NOT NULL,
  household_id UUID REFERENCES households(id) NOT NULL,
  week_start DATE NOT NULL,
  wellness_summary JSONB, -- { avg_energy, avg_stress, avg_sleep, trend }
  behaviour_summary JSONB, -- { total_incidents, by_type, patterns_detected }
  highlights TEXT[], -- positive things that happened
  recommendations TEXT[], -- AI-generated actionable suggestions
  generated_at TIMESTAMPTZ DEFAULT now()
);
```

### Row Level Security

```sql
-- All tables: caregivers can only access their own household data
ALTER TABLE caregiver_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own checkins"
  ON caregiver_checkins FOR ALL
  USING (caregiver_id = auth.uid());

-- Repeat pattern for all tables, using household_id for shared family access
```

---

## Page Structure

The Caregiver Toolkit lives at `/dashboard/toolkit` and uses a **tabbed layout** with 4 tabs:

```
/dashboard/toolkit
├── /wellbeing        (Tab 1 - default)
├── /behaviours       (Tab 2)
├── /network          (Tab 3)
└── /insights         (Tab 4)
```

Plus a **floating SOS button** that is always visible across all tabs.

---

## Tab 1: My Wellbeing (`/dashboard/toolkit/wellbeing`)

This is the existing Caregiver Toolkit page, enhanced. Reference the current screenshot for layout direction.

### Components to Build:

#### 1.1 DailyCheckin
The "How are you today?" card with 3 sliders.

```typescript
interface DailyCheckinProps {
  existingCheckin?: CaregiverCheckin | null; // today's check-in if already done
  onSave: (data: CheckinData) => Promise<void>;
}

interface CheckinData {
  energy_level: number;   // 1-10
  stress_level: number;   // 1-10
  sleep_quality: number;  // 1-10
  mood_notes?: string;
}
```

**Requirements:**
- 3 horizontal sliders with large 56px thumb targets
- Labels at each end: "Exhausted ↔ Energized", "Calm ↔ Overwhelmed", "Terrible ↔ Great"
- Current value displayed as text label next to slider (e.g., "Exhausted", "Low", "Fair", "Good", "Energized")
- "Saved!" badge appears after save with gentle animation
- If already checked in today, show saved values with option to update
- Optional mood notes textarea (collapsible)
- **NEW: Mini sparkline** under each slider showing last 7 days trend (tiny inline chart)

#### 1.2 QuickReliefStation
Grid of guided micro-exercises.

```typescript
interface ReliefActivity {
  id: string;
  type: string;
  title: string;          // "Box Breathing"
  emoji: string;          // "🫁"
  duration_minutes: number;
  description: string;
  isRecommended: boolean; // based on current stress level
  steps: ReliefStep[];    // guided step-by-step instructions
}

interface ReliefStep {
  instruction: string;
  duration_seconds: number;
  animation?: 'breathe_in' | 'breathe_out' | 'hold' | 'count' | 'none';
}
```

**Activities to implement:**
1. **Box Breathing** (2 min) — 4-count inhale, hold, exhale, hold cycle with visual circle animation
2. **4-7-8 Breathing** (3 min) — inhale 4s, hold 7s, exhale 8s
3. **5-4-3-2-1 Grounding** (3 min) — guided sensory awareness exercise
4. **Progressive Muscle Relaxation** (5 min) — guided tension-release sequence
5. **Gratitude Moment** (2 min) — prompt to write 3 things grateful for, saved to journal
6. **Mindful Break** (2 min) — simple body awareness check-in
7. **Permission Slip** (1 min) — structured prompt: "Today I'm giving myself permission to let go of ___"
8. **Quick Walk Prompt** (5 min) — encouragement + timer to step outside

**Requirements:**
- 2-column grid on mobile, 3-column on desktop
- Cards: 56px min height, clear emoji + title + duration
- "Recommended for you" tag on activities matching current stress profile
- Clicking opens a **full-screen guided experience** with step-by-step instructions, timers, and gentle animations
- Log mood_before and mood_after for each completed activity
- Respect `prefers-reduced-motion` — replace animations with text-based cues

#### 1.3 TodaysGoal
Simple daily goal setter with weekly progress dots.

**Requirements:**
- Text input with 56px height, placeholder "What's one small thing for today?"
- Green checkmark button to mark complete
- 7 dots showing this week (S-M-T-W-T-F-S): filled green = completed, gray outline = set but not completed, empty = no goal set
- Tap on past day's dot shows that day's goal text in a tooltip

#### 1.4 WellbeingCompanion (Redesigned)
**This is NOT a free-form chat anymore.** It becomes a structured triage entry point.

```
┌─────────────────────────────────┐
│ 🧡 Wellbeing Companion          │
│                                  │
│ "What do you need right now?"    │
│                                  │
│ [😤 I'm overwhelmed]            │
│ [😴 I can't sleep]              │
│ [😢 I feel alone]               │
│ [❓ I have a question]          │
│                                  │
│ ─── or type freely ───          │
│ [________________________] Send  │
│                                  │
│ For emotional support only.      │
│ Not medical advice.              │
└─────────────────────────────────┘
```

**Requirements:**
- 4 pre-set quick-action buttons (56px height each) that route to specific responses:
  - "I'm overwhelmed" → Suggests Emergency Decompression activity + shows Permission Slip + asks if they need a break (→ help request flow)
  - "I can't sleep" → Offers sleep hygiene tips card + breathing exercise
  - "I feel alone" → Shows support resources + asks if they want to send a help request to their care network
  - "I have a question" → Opens a focused Q&A mode using DeepSeek, scoped to caregiving knowledge base
- Free-text input below as fallback
- AI responses should be **short** (3-4 sentences max), always end with a concrete action button (not just words)
- Every AI response includes at least one actionable element: a button to start an activity, log something, or reach out to someone

#### 1.5 NeedSupport
Static card with curated support resources.

**Requirements:**
- Title: "Need Support?"
- Subtitle: "Caregiving is challenging. It is okay to ask for help."
- Links to localized resources (varies by country via i18n):
  - Germany: Deutsche Alzheimer Gesellschaft, Pflegestützpunkte
  - UK/International: Alzheimer's Association, Alzheimer's Society
  - Romania: Asociația Alzheimer Romania
- Crisis line number displayed prominently
- "Call now" button with `tel:` link

---

## Tab 2: Manage Behaviours (`/dashboard/toolkit/behaviours`)

**This is entirely new.** This is the highest-value addition — structured behaviour management with incident logging and pattern detection.

### Components to Build:

#### 2.1 BehaviourPlaybookGrid
A grid of 8 behaviour playbook cards, similar layout to Quick Relief Station.

```typescript
interface BehaviourPlaybook {
  id: string;
  type: BehaviourType; // matches behaviour_incidents.behaviour_type
  title: string;
  emoji: string;
  description: string;
  sections: {
    right_now: PlaybookStep[];      // "What to do RIGHT NOW"
    understand_why: string[];       // Root cause checklist
    prevent_next_time: string[];    // Prevention strategies
    when_to_call_doctor: string[];  // Red flags requiring medical attention
  };
}
```

**The 8 Playbooks:**

1. **😠 Aggression & Agitation**
   - RIGHT NOW: Stay calm, speak slowly and softly. Don't argue or restrain. Remove yourself if unsafe. Remove potential triggers (noise, crowds, overstimulation). Offer a comforting object or activity.
   - UNDERSTAND WHY: Pain or physical discomfort? Overstimulation (noise, crowds, unfamiliar place)? Feeling loss of control? Unmet need (hunger, toilet, fatigue)? Medication side effects? Infection (UTI is common trigger)?
   - PREVENT: Maintain consistent daily routines. Reduce environmental stressors. Prepare for known trigger times. Use distraction and redirection techniques.
   - CALL DOCTOR: Sudden onset of aggression (could indicate infection/pain). Aggression worsening rapidly. Risk of injury to self or others. New medication was recently started.

2. **🚶 Wandering & Getting Lost**
   - RIGHT NOW: Stay calm. Check familiar routes first. Call neighbours/local police if not found quickly. Have recent photo ready to share.
   - UNDERSTAND WHY: Looking for something familiar? Need to use toilet? Bored or restless? Following old routine (going to work)? Disoriented by environment changes?
   - PREVENT: Ensure ID bracelet/GPS tracker is worn. Install door alarms/smart locks. Keep shoes and coat out of sight near exits. Provide supervised walking opportunities. Engage in physical activities during the day.
   - CALL DOCTOR: Wandering frequency increasing significantly. Getting lost in familiar places (new). Signs of distress or fear during episodes.

3. **🌙 Sleep Disturbances & Sundowning**
   - RIGHT NOW: Use calm, reassuring voice. Turn on gentle lighting (avoid bright overhead). Offer a warm drink (decaf). Play soft, familiar music. Don't argue about the time.
   - UNDERSTAND WHY: Disrupted circadian rhythm? Too much daytime sleeping? Pain or discomfort? Need to use toilet? Caffeine or sugar too late? Room too dark/bright/noisy? Medication timing?
   - PREVENT: Maintain consistent sleep/wake schedule. Maximize daylight exposure during the day. Limit naps to 20 min before 2pm. Create calming evening routine. Reduce stimulation after 4pm. Night lights in bedroom and bathroom.
   - CALL DOCTOR: Severe sleep disruption lasting over a week. Hallucinations during night-time. Significant daytime drowsiness affecting function. Possible sleep apnea symptoms.

4. **🔄 Repetitive Behaviour**
   - RIGHT NOW: Answer each time with patience — it's new to them each time. Use brief, simple responses. Try redirecting to an activity. Don't say "you already asked that."
   - UNDERSTAND WHY: Anxiety or insecurity? Boredom? Looking for comfort or reassurance? Memory of the answer doesn't stick? Environmental cue triggering the question?
   - PREVENT: Address the underlying emotion (often anxiety). Post visual reminders/notes for common questions. Use familiar activities as anchors. Maintain a reassuring routine.
   - CALL DOCTOR: Sudden increase in repetitive behaviour. Accompanied by new confusion or disorientation. Signs of increasing anxiety or distress.

5. **🚿 Refusing Care** (bathing, eating, medication)
   - RIGHT NOW: Don't force it. Step back, wait 15-20 minutes, try again. Approach from the front, make eye contact. Explain each step simply before doing it. Offer choices: "Bath or shower?" not "Time for your bath."
   - UNDERSTAND WHY: Feels cold, exposed, or frightened? Doesn't understand what's being asked? Pain during the activity? Loss of dignity/embarrassment? Water sensation is frightening?
   - PREVENT: Same time, same routine each day. Warm the room first. Use a calm, matter-of-fact tone. Break tasks into small steps. Let them do what they can independently. Use distraction (music, conversation).
   - CALL DOCTOR: Refusing all food/drink for 24+ hours. Refusing critical medication. Signs of pain during care activities. Sudden change from accepting to refusing care.

6. **😔 Depression, Anxiety & Apathy**
   - RIGHT NOW: Sit with them. Don't try to "fix" the feeling. Offer gentle physical comfort if welcome. Suggest a simple, familiar activity. Go outside if possible.
   - UNDERSTAND WHY: Awareness of cognitive decline? Social isolation? Loss of independence? Pain or discomfort? Under-stimulation? Medication side effect?
   - PREVENT: Maintain meaningful daily activities. Ensure social contact. Physical exercise (even gentle walking). Music and reminiscence activities. Routine that provides purpose.
   - CALL DOCTOR: Persistent sadness lasting 2+ weeks. Loss of interest in ALL activities. Changes in appetite/weight. Expressing hopelessness or worthlessness. Talk of wanting to die.

7. **👻 Delusions & Hallucinations**
   - RIGHT NOW: Don't argue or try to convince them it's not real. Acknowledge their feelings: "That sounds frightening." Check for environmental causes (shadows, reflections, TV sounds). Gently redirect attention. Stay calm.
   - UNDERSTAND WHY: Medication side effects? Infection (UTI)? Dehydration? Sensory impairment (poor vision/hearing)? Environmental (mirrors, shadows, TV)? Disease progression?
   - PREVENT: Ensure good lighting (reduce shadows). Cover or remove mirrors if triggering. Keep environment familiar and uncluttered. Regular hearing and vision checks. Monitor medication effects.
   - CALL DOCTOR: New onset of hallucinations. Hallucinations causing significant distress. After starting new medication. Accompanied by fever or sudden confusion.

8. **⚖️ Changes in Judgement**
   - RIGHT NOW: Don't shame or lecture. Gently redirect from unsafe activities. Secure keys, finances, appliances as needed. Stay calm even when the situation is frustrating.
   - UNDERSTAND WHY: Disease affecting frontal lobe function? Doesn't recognize danger? Confusing past abilities with current ones? Trying to maintain independence?
   - PREVENT: Simplify the environment (remove excess choices). Secure finances and important documents. Disable stove if needed (auto-shutoff). Remove car keys if driving is no longer safe. Set up automatic bill pay.
   - CALL DOCTOR: Sudden worsening of judgement. New risky behaviours. Financial exploitation suspected. Safety concerns escalating.

**Requirements:**
- Grid layout: 2 columns on mobile, 4 columns on desktop
- Each card: emoji + title + short description, 56px min height
- Clicking opens **full-screen playbook view** with 4 collapsible sections (Right Now expanded by default)
- Each playbook has a "Log Incident" button at the bottom → opens IncidentLogger prefilled with this behaviour type
- Playbooks are stored as structured content in the database (not hardcoded) for easy i18n and updates

#### 2.2 IncidentLogger
Quick-log form for recording behaviour incidents.

```
┌─────────────────────────────────────┐
│ 📝 Log an Incident                  │
│                                      │
│ What happened?                       │
│ [Aggression ▼] (dropdown, prefilled  │
│  if coming from a playbook)          │
│                                      │
│ How severe? (1-5 stars/circles)      │
│ ○ ○ ○ ○ ○                           │
│ Mild          Severe                 │
│                                      │
│ When?                                │
│ [Morning ▼] [Today, 2:30 PM ▼]     │
│                                      │
│ How long?                            │
│ [~15 minutes ▼]                     │
│                                      │
│ What might have triggered it?        │
│ [Pain] [Noise] [Hunger] [Fatigue]   │
│ [Toilet] [Boredom] [Unfamiliar]     │
│ [Other: ___________]                │
│                                      │
│ What happened? (brief description)   │
│ [________________________________]  │
│ [________________________________]  │
│                                      │
│ What helped?                         │
│ [________________________________]  │
│                                      │
│ [Save Log]           [Cancel]        │
└─────────────────────────────────────┘
```

**Requirements:**
- All inputs must meet 56px touch target minimum
- Trigger tags are multi-select toggle buttons (not a dropdown)
- "What happened" is a textarea but keep it simple — prompt for brevity
- "What helped" is optional but valuable for pattern analysis
- After saving, show brief confirmation and offer: "Want to review the [Behaviour] Playbook?"
- Logs are saved to `behaviour_incidents` table
- Can be opened standalone or pre-filled from a playbook

#### 2.3 BehaviourTimeline
A chronological list of recent incidents.

**Requirements:**
- Reverse chronological list, grouped by day
- Each entry shows: emoji + behaviour type, severity dots, time, brief description preview
- Tap to expand and see full details
- Filter by behaviour type (horizontal scrolling pill filters)
- "Export for Doctor" button → generates a simple PDF summary of incidents in a date range

#### 2.4 PatternInsights
AI-powered analysis of logged incidents.

**Requirements:**
- Only shows if 5+ incidents have been logged (otherwise shows encouragement to keep logging)
- Cards showing detected patterns:
  - "Aggression peaks between 4-6 PM" (time-of-day analysis)
  - "Sleep disturbances correlate with days without outdoor activity" (cross-referencing with care plan)
  - "Most common trigger: fatigue (appears in 60% of incidents)"
- Generated via DeepSeek API call on demand ("Analyse Patterns" button) or weekly
- Results cached in `weekly_insights` table

---

## Tab 3: My Network (`/dashboard/toolkit/network`)

### Components to Build:

#### 3.1 CareTeamMap
Visual representation of who helps with what.

```typescript
interface CareTeamMember {
  id: string;
  name: string;
  relationship: string; // "Sister", "Son", "Neighbour", "Professional Carer"
  phone?: string;
  email?: string;
  avatar_url?: string;
  can_help_with: string[]; // ["respite", "groceries", "medication", "appointments"]
  availability_notes?: string;
}
```

**Requirements:**
- Card grid of care team members
- Each card: avatar/initials + name + relationship + "Can help with" tags
- "Add member" button opens simple form
- Quick-action buttons on each member: Call, Message, Request Help

#### 3.2 HelpRequestFlow
Structured flow for requesting help from the care network.

**Requirements:**
- Triggered from "Ask for Help" buttons or standalone
- Step 1: What do you need? (buttons matching `help_requests.request_type`)
- Step 2: Any details? (optional text)
- Step 3: Who to ask? (shows care team members filtered by capability, or "Ask everyone")
- Step 4: Sends notification (push notification / SMS via Supabase Edge Function)
- Pending requests shown as a list with status badges

#### 3.3 SharedCalendar (Simplified)
Basic shared caregiving schedule.

**Requirements:**
- Week view showing who's covering when
- Simple "I can help on [day]" toggle for network members
- Shows gaps in coverage highlighted in amber
- Links to main care calendar for full scheduling

---

## Tab 4: Trends & Insights (`/dashboard/toolkit/insights`)

### Components to Build:

#### 4.1 WellnessTrends
Charts showing caregiver wellness over time.

**Requirements:**
- Line charts for Energy, Stress, Sleep Quality over 4 weeks
- Use a lightweight chart library (Recharts)
- Color-coded: green = good range, amber = watch, red = concern
- Summary text: "Your stress has been trending up over the last 2 weeks"
- Minimum chart text size: 16px, high contrast

#### 4.2 BehaviourTrends
Charts showing patient behaviour patterns.

**Requirements:**
- Bar chart: incidents by type (last 4 weeks)
- Heatmap: incidents by time of day × day of week
- Trend line: total incidents per week
- Only show if 5+ incidents logged

#### 4.3 WeeklyDigest
AI-generated weekly summary.

**Requirements:**
- Auto-generated each Sunday (or on-demand via "Generate" button)
- Sections:
  - 🏥 **Care Summary**: X incidents logged, most common: [type]
  - 💚 **Your Wellness**: Average energy/stress/sleep scores + trend
  - 🌟 **This Week's Win**: AI picks one positive data point to highlight
  - 📋 **Recommendations**: 2-3 specific, actionable suggestions based on data
- Shareable with family members (toggle)
- Stored in `weekly_insights` table

#### 4.4 DoctorReport
Exportable summary for medical appointments.

**Requirements:**
- Date range selector
- Generates structured report including:
  - Behaviour incidents summary (grouped by type, with severity and frequency)
  - Caregiver wellness trends
  - Medication adherence data (if tracked)
  - Key concerns / questions for the doctor
- Export as PDF
- Clean, professional formatting suitable for a medical professional

---

## Floating SOS Button

Always visible on all tabs. Fixed position bottom-right (above any nav bar on mobile).

```
┌──────────┐
│  🆘 SOS  │  ← 64px × 64px, red accent, always visible
└──────────┘
```

**When tapped, opens a modal with:**

```
┌─────────────────────────────────────┐
│        What do you need?            │
│                                      │
│  [🫁 Help me calm down]            │  → Opens Box Breathing full-screen
│  [📋 Behaviour happening now]       │  → Opens IncidentLogger + shows relevant Playbook
│  [📞 Call for help]                 │  → Shows crisis number + care team quick-call
│  [🏠 I need a break NOW]           │  → Fast-track help request to care network
│                                      │
│  [Close]                            │
└─────────────────────────────────────┘
```

**Requirements:**
- Modal has semi-transparent dark overlay
- Large buttons (72px height minimum) for crisis accessibility
- "Call for help" shows the crisis line number AND care team members with direct call links
- Each option routes to the appropriate existing component
- Accessible: focus trapped in modal, Escape to close, screen reader announcements

---

## Proactive Nudge System

Background logic that generates contextual nudges displayed as gentle notification cards at the top of the relevant tab.

**Nudge Rules (implement as Supabase Edge Functions or cron):**

```typescript
const NUDGE_RULES = [
  {
    id: 'no_break_5_days',
    condition: 'No help request of type "need_break" in last 5 days AND average stress > 7',
    message: "You haven't taken a break in 5 days. You deserve one.",
    action: { type: 'help_request', preset: 'need_break' },
    tab: 'wellbeing'
  },
  {
    id: 'stress_climbing',
    condition: 'Stress level increased for 3 consecutive days',
    message: "Your stress has been climbing. Let's try something that helps.",
    action: { type: 'navigate', to: 'quick_relief' },
    tab: 'wellbeing'
  },
  {
    id: 'no_checkin_2_days',
    condition: 'No check-in for 2 days',
    message: "We haven't heard from you in a while. A quick check-in helps us help you.",
    action: { type: 'navigate', to: 'checkin' },
    tab: 'wellbeing'
  },
  {
    id: 'behaviour_pattern_detected',
    condition: '3+ incidents of same type in same time-of-day slot this week',
    message: "We noticed a pattern with [behaviour] in the [time]. Check the playbook for prevention tips.",
    action: { type: 'navigate', to: 'playbook', params: { type: behaviour_type } },
    tab: 'behaviours'
  },
  {
    id: 'weekly_digest_ready',
    condition: 'Sunday + enough data for digest',
    message: "Your weekly summary is ready.",
    action: { type: 'navigate', to: 'weekly_digest' },
    tab: 'insights'
  }
];
```

**Requirements:**
- Nudge cards are dismissible (don't show again for same trigger until next occurrence)
- Maximum 1 nudge shown at a time (prioritize by severity)
- Gentle presentation — not intrusive, not alarming
- Each nudge has a single clear action button

---

## AI Integration (DeepSeek V3)

The AI is used in 3 specific, bounded ways — NOT as a free-form oracle:

### 1. Triage Router (Wellbeing Companion)
When user types free-text, classify intent and route:

```typescript
const TRIAGE_SYSTEM_PROMPT = `You are a caregiver support triage system. Your job is to:
1. Classify the caregiver's message into one category
2. Respond with 2-3 empathetic sentences MAX
3. Always suggest ONE concrete action

Categories:
- STRESS_RELIEF → suggest a Quick Relief activity
- BEHAVIOUR_HELP → identify which behaviour type and suggest the Playbook
- NEED_BREAK → suggest sending a help request
- LONELINESS → suggest connecting with support resources or care network
- INFORMATION → answer briefly from caregiving knowledge base
- CRISIS → show crisis resources immediately

RULES:
- Never give medical advice
- Never diagnose
- Keep responses under 60 words
- Always end with a concrete action button suggestion
- Be warm but brief
- Use the caregiver's name if known

Respond as JSON:
{
  "category": "STRESS_RELIEF",
  "response": "Your short empathetic message",
  "action": { "type": "activity", "id": "breathing_box" }
}`;
```

### 2. Pattern Analyser (Behaviour Insights)
Analyses logged incidents to surface patterns:

```typescript
const PATTERN_SYSTEM_PROMPT = `You analyse behaviour incident logs for patterns.
Given a list of incidents, identify:
1. Time-of-day patterns
2. Common triggers
3. What interventions worked
4. Correlations with caregiver wellness data

Return structured JSON with specific, actionable insights.
Never speculate about diagnosis. Focus on practical patterns.`;
```

### 3. Weekly Digest Generator
Generates the weekly summary from structured data:

```typescript
const DIGEST_SYSTEM_PROMPT = `Generate a brief, supportive weekly summary for a dementia caregiver.
Input: structured data about their week (check-ins, incidents, activities, goals).
Output: JSON with sections for care_summary, wellness_check, weekly_win, recommendations.
Keep the tone warm and encouraging. Focus on one specific positive thing.
Limit recommendations to 2-3 specific, actionable items.
Never use medical jargon. Never diagnose. Be brief.`;
```

---

## i18n Structure

Use `next-intl` with the following namespace structure:

```
/messages
├── en/
│   ├── toolkit.json        # Toolkit UI strings
│   ├── playbooks.json      # All 8 behaviour playbooks content
│   ├── activities.json     # Quick relief activity instructions
│   └── nudges.json         # Proactive nudge messages
├── de/
│   ├── toolkit.json
│   ├── playbooks.json
│   ├── activities.json
│   └── nudges.json
└── ro/
    ├── toolkit.json
    ├── playbooks.json
    ├── activities.json
    └── nudges.json
```

**Critical:** Start with English content fully written. German and Romanian can use placeholder `[TO_TRANSLATE]` markers initially but the i18n keys and structure must be in place from day one.

---

## Implementation Order

Build in this exact sequence to maintain a working product at each step:

### Sprint 1: Foundation (Days 1-3)
1. Database schema + RLS policies + seed data
2. Tab layout with routing (`/toolkit/wellbeing`, `/toolkit/behaviours`, etc.)
3. Design system components: Button, Card, Slider, Modal, Badge, Tabs
4. DailyCheckin component with save to Supabase
5. TodaysGoal component

### Sprint 2: Wellbeing Tab Complete (Days 4-6)
6. QuickReliefStation grid + 3 guided activities (Box Breathing, Grounding, Gratitude)
7. Remaining 5 guided activities
8. Redesigned WellbeingCompanion (button-first triage)
9. NeedSupport card with i18n resources
10. Floating SOS button + modal

### Sprint 3: Behaviours Tab (Days 7-10)
11. BehaviourPlaybookGrid with all 8 playbooks (content as structured JSON)
12. Full-screen playbook view with collapsible sections
13. IncidentLogger form
14. BehaviourTimeline (chronological list + filters)
15. Connect IncidentLogger to playbooks ("Log from playbook" flow)

### Sprint 4: Network Tab (Days 11-13)
16. CareTeamMap (CRUD for team members)
17. HelpRequestFlow (request creation + notifications)
18. Ask for Help quick buttons integration
19. Basic shared calendar view

### Sprint 5: Insights Tab + AI (Days 14-17)
20. WellnessTrends charts (Recharts)
21. BehaviourTrends charts
22. DeepSeek integration for triage router
23. Pattern analysis for behaviour insights
24. Weekly digest generation
25. Doctor report PDF export

### Sprint 6: Polish + Nudges (Days 18-20)
26. Proactive nudge system (rules engine + display)
27. Accessibility audit and fixes
28. i18n key structure + German/Romanian placeholders
29. Performance optimization (lazy loading tabs, code splitting)
30. Final QA pass against all accessibility requirements

---

## File Structure

```
src/
├── app/
│   └── [locale]/
│       └── dashboard/
│           └── toolkit/
│               ├── layout.tsx           # Tab layout + SOS button
│               ├── page.tsx             # Redirects to /wellbeing
│               ├── wellbeing/
│               │   └── page.tsx
│               ├── behaviours/
│               │   └── page.tsx
│               ├── network/
│               │   └── page.tsx
│               └── insights/
│                   └── page.tsx
├── components/
│   └── toolkit/
│       ├── shared/
│       │   ├── SOSButton.tsx
│       │   ├── SOSModal.tsx
│       │   ├── NudgeCard.tsx
│       │   └── ToolkitTabs.tsx
│       ├── wellbeing/
│       │   ├── DailyCheckin.tsx
│       │   ├── QuickReliefStation.tsx
│       │   ├── ReliefActivityModal.tsx
│       │   ├── TodaysGoal.tsx
│       │   ├── WellbeingCompanion.tsx
│       │   └── NeedSupport.tsx
│       ├── behaviours/
│       │   ├── BehaviourPlaybookGrid.tsx
│       │   ├── PlaybookDetailView.tsx
│       │   ├── IncidentLogger.tsx
│       │   ├── BehaviourTimeline.tsx
│       │   └── PatternInsights.tsx
│       ├── network/
│       │   ├── CareTeamMap.tsx
│       │   ├── HelpRequestFlow.tsx
│       │   └── SharedCalendar.tsx
│       └── insights/
│           ├── WellnessTrends.tsx
│           ├── BehaviourTrends.tsx
│           ├── WeeklyDigest.tsx
│           └── DoctorReport.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── queries/
│   │       ├── checkins.ts
│   │       ├── incidents.ts
│   │       ├── goals.ts
│   │       ├── helpRequests.ts
│   │       └── insights.ts
│   ├── ai/
│   │   ├── deepseek.ts              # DeepSeek API client
│   │   ├── triage.ts                # Triage classification
│   │   ├── patternAnalysis.ts       # Behaviour pattern detection
│   │   └── digestGenerator.ts       # Weekly digest generation
│   └── nudges/
│       ├── rules.ts                 # Nudge rule definitions
│       └── engine.ts                # Nudge evaluation logic
├── content/
│   └── playbooks/
│       ├── aggression.json
│       ├── wandering.json
│       ├── sleep-disturbance.json
│       ├── repetitive-behaviour.json
│       ├── refusing-care.json
│       ├── depression-anxiety-apathy.json
│       ├── delusions-hallucinations.json
│       └── changes-in-judgement.json
├── hooks/
│   ├── useCheckin.ts
│   ├── useIncidents.ts
│   ├── useGoals.ts
│   ├── useHelpRequests.ts
│   ├── useNudges.ts
│   └── useTrends.ts
└── types/
    └── toolkit.ts                    # All TypeScript interfaces
```

---

## Testing Checklist

Before considering each sprint complete:

- [ ] All touch targets ≥ 56px
- [ ] All text ≥ 16px, body text ≥ 18px
- [ ] Contrast ratio ≥ 7:1 on all text
- [ ] Keyboard navigation works on all interactive elements
- [ ] Screen reader can navigate all content meaningfully
- [ ] `prefers-reduced-motion` respected
- [ ] Components work at 320px viewport width (minimum)
- [ ] Supabase RLS prevents cross-household data access
- [ ] AI responses never give medical advice or diagnoses
- [ ] i18n keys used for all user-facing strings (no hardcoded English)
- [ ] Loading states shown for all async operations
- [ ] Error states handled gracefully with user-friendly messages
