# Resources Tab — Full Implementation Plan for Claude Code

## Overview

Add a third tab ("Resources") to the Care Coach page (`/coach`) alongside the existing "Chat" and "Behaviours" tabs. The Resources tab contains two main sections:

1. **"First Steps" Journey** — An interactive, stage-based post-diagnosis roadmap that caregivers progress through
2. **Knowledge Library** — Topical articles written in-app (our own content, fully localized)
3. **Local Support Directory** — Country-specific organizations, helplines, and services auto-populated by locale

All content is **our own prose** (not links to English-only external sites), stored as i18n translation keys so it works across every target market from day one. External links are only used in the Local Support Directory, where they point to native-language organizations in the user's country.

---

## 1. Data Architecture

### 1.1 Content Types & Database Schema

```sql
-- Post-diagnosis journey steps (the interactive checklist)
CREATE TABLE resource_journey_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number INTEGER NOT NULL,           -- 1-8 ordering
  slug TEXT NOT NULL UNIQUE,              -- e.g. 'understand-diagnosis', 'legal-planning'
  icon TEXT NOT NULL,                     -- emoji or icon name from lucide-react
  title_key TEXT NOT NULL,               -- i18n key: 'journey.step1.title'
  subtitle_key TEXT NOT NULL,            -- i18n key: 'journey.step1.subtitle'
  content_key TEXT NOT NULL,             -- i18n key: 'journey.step1.content' (markdown body)
  estimated_time_minutes INTEGER,        -- e.g. 15, 30
  category TEXT NOT NULL,                -- 'understanding' | 'legal-financial' | 'care-setup' | 'daily-living'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Caregiver's progress through the journey (per care_recipient)
CREATE TABLE resource_journey_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID REFERENCES profiles(id),
  care_recipient_id UUID REFERENCES care_recipients(id),
  step_id UUID REFERENCES resource_journey_steps(id),
  status TEXT NOT NULL DEFAULT 'not_started',  -- 'not_started' | 'in_progress' | 'completed' | 'skipped'
  completed_at TIMESTAMPTZ,
  notes TEXT,                            -- caregiver's personal notes on this step
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(caregiver_id, care_recipient_id, step_id)
);

-- Knowledge library articles (topical guides)
CREATE TABLE resource_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,                -- 'communication' | 'safety' | 'nutrition' | 'behaviors' | 'self-care' | 'activities'
  icon TEXT NOT NULL,
  title_key TEXT NOT NULL,               -- i18n key
  summary_key TEXT NOT NULL,             -- i18n key (1-2 sentence preview)
  content_key TEXT NOT NULL,             -- i18n key (full markdown body)
  reading_time_minutes INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Country-specific support organizations
CREATE TABLE resource_local_support (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,            -- ISO 3166-1 alpha-2: 'DE', 'AT', 'GB', etc.
  region_code TEXT,                      -- optional: state/province code
  category TEXT NOT NULL,                -- 'alzheimer_society' | 'helpline' | 'legal_aid' | 'support_group' | 'government' | 'care_services'
  name TEXT NOT NULL,                    -- organization name (in local language)
  description_key TEXT,                  -- i18n key for description (optional, some are just links)
  phone TEXT,
  website_url TEXT,
  email TEXT,
  is_24_7 BOOLEAN DEFAULT false,
  language TEXT NOT NULL,                -- primary language of the resource: 'de', 'en', 'fr', etc.
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies (same pattern as existing tables)
ALTER TABLE resource_journey_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own journey progress"
  ON resource_journey_progress
  FOR ALL
  USING (caregiver_id = auth.uid());
```

### 1.2 Supabase RLS Notes

- `resource_journey_steps`, `resource_articles`, `resource_local_support` are **read-only for authenticated users** (content managed by us)
- `resource_journey_progress` has full CRUD for the authenticated user's own rows
- Follow the same RLS pattern used in existing tables in the project

---

## 2. The 8 Journey Steps (Content Specification)

Each step below includes the i18n content that needs to be written. Write all content in **clear, warm, non-clinical language** aimed at an adult child (30-60 years old) who just learned their parent has dementia. Tone: empathetic, action-oriented, never patronizing.

### Step 1: Understand the Diagnosis
- **slug:** `understand-diagnosis`
- **icon:** `Brain` (lucide)
- **category:** `understanding`
- **estimated_time:** 15 min
- **Content covers:**
  - What dementia actually means vs. normal aging
  - The different types (Alzheimer's, vascular, Lewy body, frontotemporal) — brief overview, not medical textbook
  - What to expect in the early stage: the person is still themselves, they can still do most things, this is a time to plan not panic
  - Common myths debunked (it's not just "forgetting things", it's not an immediate emergency, the person doesn't instantly lose independence)
  - What the diagnosis does NOT mean right now
- **Sources:** Dementia Road Map (DSHS), Mayo Clinic dementia overview, NICE guidelines section 1.1.6
- **Checklist items within step:**
  - [ ] I understand what type of dementia has been diagnosed
  - [ ] I know what changes to expect in the near term
  - [ ] I've talked with the diagnosing doctor about what this means specifically for our family

### Step 2: Have the Family Conversation
- **slug:** `family-conversation`
- **icon:** `Users` (lucide)
- **category:** `understanding`
- **estimated_time:** 20 min
- **Content covers:**
  - Who needs to know: immediate family, close friends, key people in the person's life
  - How to tell them: practical conversation scripts and framing
  - Including the person with dementia in decisions about who is told
  - Addressing common reactions: denial, grief, fear, overreaction
  - Establishing who will be involved in care and how (the "care team" concept)
  - Managing differing opinions among siblings/family members
- **Sources:** Alzheimer's Association "Sharing Your Diagnosis", Dementia Road Map, Tips for Caregivers (Alzheimers.gov)
- **Checklist items:**
  - [ ] I've discussed the diagnosis with immediate family members
  - [ ] We've included our loved one in deciding who to tell
  - [ ] We've had an initial discussion about care responsibilities

### Step 3: Legal Planning
- **slug:** `legal-planning`
- **icon:** `FileText` (lucide)
- **category:** `legal-financial`
- **estimated_time:** 30 min
- **Content covers:**
  - Why NOW is the time — the person still has legal capacity to make decisions
  - The universal categories of documents needed (with country-specific names):
    - **Power of Attorney (Financial):** DE: Vorsorgevollmacht | AT: Vorsorgevollmacht | GB: Lasting Power of Attorney (Property & Financial Affairs)
    - **Power of Attorney (Health):** DE: Patientenverfügung + Vorsorgevollmacht | AT: Patientenverfügung | GB: Lasting Power of Attorney (Health & Welfare)
    - **Advance Directive / Living Will:** DE: Patientenverfügung | AT: Patientenverfügung | GB: Advance Decision to Refuse Treatment
    - **Will / Estate Plan:** Universal concept, country-specific execution
  - Emphasize: signing POA does NOT mean the person loses control today — it's a safety net
  - When to consult a lawyer vs. what you can do yourself
  - What happens if you DON'T plan (guardianship/conservatorship — more expensive, less control)
- **IMPORTANT i18n note:** The article body uses a `{legal_documents_table}` placeholder. At render time, swap in the country-specific table based on the user's locale. Store per-country legal document mappings in a separate i18n namespace: `legal.{country_code}.poa_financial`, `legal.{country_code}.poa_health`, etc.
- **Sources:** Alzheimer's Association Legal Documents, NICE guidelines 1.1.12, Comprehensive Resource Guide Table V, Dementia Road Map Action Steps
- **Checklist items:**
  - [ ] I understand what legal documents are needed
  - [ ] We've discussed wishes for future care with our loved one
  - [ ] Power of Attorney documents are in progress or completed
  - [ ] Advance directive / living will is in progress or completed

### Step 4: Financial Planning
- **slug:** `financial-planning`
- **icon:** `Wallet` (lucide)
- **category:** `legal-financial`
- **estimated_time:** 25 min
- **Content covers:**
  - Organizing financial documents: all accounts, debts, insurance policies, income streams, pensions
  - Understanding care costs: what is expensive (and when), what is covered by health insurance/state programs
  - Country-specific benefits overview:
    - **DE:** Pflegeversicherung (care insurance) and Pflegegrade (care levels), Pflegegeld, Verhinderungspflege, Kurzzeitpflege
    - **AT:** Pflegegeld (7 levels), Bundespflegegeldgesetz
    - **GB:** NHS Continuing Healthcare, Attendance Allowance, Council-funded care, Carer's Allowance
  - Long-term care insurance: checking existing policies for "benefit triggers" related to cognitive impairment
  - Deciding who manages finances going forward
  - Practical: automated bill payments, simplified banking
- **IMPORTANT i18n note:** Like legal planning, use `{financial_benefits_table}` placeholder with country-specific content from `financial.{country_code}.*` namespace
- **Sources:** BrightFocus 3 Steps, Alzheimer's Association Financial Planning, Insurance guide
- **Checklist items:**
  - [ ] I've inventoried all financial accounts, debts, and policies
  - [ ] I understand what government benefits we may be eligible for
  - [ ] We've decided who will manage finances
  - [ ] Automated payments are set up for recurring bills

### Step 5: Build Your Care Team
- **slug:** `build-care-team`
- **icon:** `HeartHandshake` (lucide)
- **category:** `care-setup`
- **estimated_time:** 20 min
- **Content covers:**
  - The primary care physician's role: ongoing monitoring, medication management, referrals
  - Specialists you may encounter: neurologist, geriatrician, neuropsychologist
  - Allied health: occupational therapist (home safety), speech therapist (swallowing/communication later), physiotherapist
  - Family roles: who does what, being realistic about capacity, avoiding one person carrying everything
  - Professional home care services: what they do, when to start considering them
  - Care coordination: the concept of a single point of contact (per NICE guidelines 1.3.1)
  - **This is where Daylight Care fits** — brief, non-pushy mention that the app can help coordinate across the care team
- **Sources:** NICE guidelines 1.3.1-1.3.5, Dementia Road Map, Alzheimer's Association Creating Your Care Team
- **Checklist items:**
  - [ ] We have a primary physician overseeing dementia care
  - [ ] Family care roles are discussed and agreed
  - [ ] I know how to access specialist support if needed
  - [ ] I've looked into local home care services

### Step 6: Make the Home Safer
- **slug:** `home-safety`
- **icon:** `Home` (lucide)
- **category:** `daily-living`
- **estimated_time:** 20 min
- **Content covers:**
  - **Kitchen:** stove safety (knob covers/disable), unplug appliances, lock cleaning supplies, water temperature limits (110-120°F / 43-49°C)
  - **Bathroom:** grab bars, non-slip mats, shower bench, color contrast between toilet/sink/tub and walls, water temperature
  - **General:** remove trip hazards (loose rugs, clutter, cords), adequate lighting especially at night (motion-sensor lights), lock/remove access to dangerous items (power tools, sharp knives, firearms, medications)
  - **Stairs:** sturdy handrails, contrasting tape on step edges, firm carpet
  - **Doors & Wandering prevention:** door alarms/chimes, disguised handles, motion sensors at exits, ID bracelet
  - **Fire safety:** smoke detectors, working extinguisher, bedroom identification stickers for fire department
  - Recommendation: request a home safety assessment from an occupational therapist
  - Not everything needs to change immediately — prioritize by risk
- **Sources:** Dementia Care Practice Recommendations Phase 4 (Home Safety section), REACH OUT program safety checklist, DSHS Dementia Road Map
- **Checklist items:**
  - [ ] I've done a basic safety walkthrough of the home
  - [ ] Kitchen and bathroom hazards are addressed
  - [ ] Fall prevention measures are in place (lighting, rugs, grab bars)
  - [ ] I've considered wandering prevention if relevant

### Step 7: Driving & Independence
- **slug:** `driving-independence`
- **icon:** `Car` (lucide)
- **category:** `daily-living`
- **estimated_time:** 15 min
- **Content covers:**
  - Driving: this is one of the hardest conversations, but safety must come first
  - Country-specific obligations:
    - **DE:** Must inform Führerscheinstelle if fitness to drive is in question; liability implications if accident occurs with known diagnosis
    - **GB:** Must inform DVLA and car insurer (NICE guideline 1.1.6); failure to do so is a legal offense
    - **AT:** Must inform Bezirkshauptmannschaft
  - Signs it's time to stop: getting lost on familiar routes, new dents/scrapes, running red lights, slow reaction times
  - How to have the conversation: involve the doctor, frame it as safety not punishment, offer alternatives
  - Maintaining other forms of independence: daily routines, contributing to household tasks, social activities
  - Using technology to support independence (Take Me Home feature in Daylight Care)
  - The emotional weight: driving = freedom and identity, especially for men of that generation
- **Sources:** NICE guidelines 1.1.6, Dementia Road Map driving sections, Alzheimer's Association Dementia and Driving
- **Checklist items:**
  - [ ] I understand the legal requirements around driving in our country
  - [ ] We've assessed whether driving is still safe
  - [ ] If driving has stopped, alternative transportation is arranged
  - [ ] We've identified areas where our loved one can maintain independence

### Step 8: Start the Care Plan
- **slug:** `start-care-plan`
- **icon:** `ClipboardCheck` (lucide)
- **category:** `care-setup`
- **estimated_time:** 15 min
- **Content covers:**
  - What a care plan is: a living document that tracks routines, medications, appointments, preferences, and goals
  - Why structure helps: predictability reduces anxiety and confusion for the person with dementia
  - Key elements: daily routine, medication schedule, nutrition notes, activity preferences, sleep patterns, emergency contacts
  - Reviewing and adjusting: care plans should be reviewed regularly (weekly at first) as you learn what works
  - **Direct CTA to Daylight Care's core features** — this is the natural on-ramp to using the app's care plan, daily logging, and AI insights
  - Connection to the "Plan tomorrow" and "Adjust the care plan" workflows already in Care Coach
- **Sources:** NICE guidelines 1.3.2 (care and support plan), Comprehensive Resource Guide section on NPIs
- **Checklist items:**
  - [ ] I've set up a basic daily routine
  - [ ] Medications are tracked and organized
  - [ ] I know my loved one's preferences and what calms/upsets them
  - [ ] I have a plan I can share with other family members and care providers

---

## 3. Knowledge Library Articles (Content Specification)

These are standalone topical articles — not part of the journey progression. They serve as a reference library caregivers return to over time.

### Category: Communication
| Slug | Title | Content Summary |
|------|-------|-----------------|
| `communication-basics` | Talking With Your Loved One | How dementia changes communication, practical techniques: short sentences, one question at a time, positive framing ("let's go here" not "don't go there"), allow processing time, focus on feelings not facts, visual cues, body language, avoid arguing or correcting. Sources: Dementia Road Map Communication Tips, Alzheimer's Association Communication guide |
| `when-they-dont-recognize-you` | When They Don't Recognize You | The emotional devastation + practical coping. This is the disease, not rejection. How to respond. When to introduce yourself vs. go along with who they think you are. |
| `repetitive-questions` | The Same Question Again and Again | Why it happens (short-term memory loop), how to stay patient, techniques: answer warmly each time, redirect with activity, use written reminders, address the underlying emotion |

### Category: Behaviors
| Slug | Title | Content Summary |
|------|-------|-----------------|
| `sundowning` | Sundowning: Late-Day Confusion | What it is, why evenings are harder, environmental adjustments (lighting, reduce stimulation), routine changes, when to talk to the doctor |
| `agitation-aggression` | When They Become Agitated or Aggressive | Triggers (pain, overstimulation, frustration, environment), de-escalation, safety, when it's a medical issue (UTI, medication side effects), never take it personally |
| `wandering-safety` | Understanding Wandering | Why it happens, prevention strategies, what to do if they wander, ID systems, GPS tracking, notification plans with neighbors |
| `refusing-care` | When They Refuse Food, Medication, or Bathing | Common in mid-stage, preservation of dignity, timing and approach adjustments, when to involve the doctor, simplifying routines |

### Category: Daily Living
| Slug | Title | Content Summary |
|------|-------|-----------------|
| `nutrition-eating` | Nutrition and Mealtimes | Changes in appetite and taste, making meals easier (finger foods, contrasting plates), hydration, when swallowing becomes difficult, mealtime as social connection |
| `sleep-problems` | Sleep and Dementia | Why sleep patterns change, sleep hygiene basics, reducing daytime napping, nighttime safety, medication considerations |
| `activities-engagement` | Meaningful Activities | Matching activities to abilities, reminiscence (photos, music, familiar objects), simplifying favorite hobbies, the Montessori approach, physical activity, social engagement |

### Category: Caregiver Self-Care
| Slug | Title | Content Summary |
|------|-------|-----------------|
| `caregiver-burnout` | Recognizing and Preventing Burnout | Warning signs (exhaustion, resentment, health decline, isolation), permission to feel overwhelmed, practical steps: respite care, support groups, asking for help, maintaining your own health. Sources: REACH OUT program, Tips for Caregivers (Alzheimers.gov) |
| `emotions-of-caregiving` | The Emotional Weight of Caregiving | Grief while the person is still alive (ambiguous grief), guilt, anger, the role reversal reality, when to seek professional support, self-compassion |
| `asking-for-help` | Learning to Ask for Help | Why caregivers resist help, how to delegate specific tasks, what to say to friends/family who offer, respite care options, adult day services |

### Category: Safety
| Slug | Title | Content Summary |
|------|-------|-----------------|
| `medication-safety` | Medication Management | Pill organizers, schedules, pharmacy reviews, locking medications, ensuring pills are swallowed, watching for side effects, keeping an updated medication list |
| `fall-prevention` | Preventing Falls | Environmental changes, footwear, exercise for balance, when to get a physiotherapy assessment, assistive devices |

---

## 4. Local Support Directory (Initial Countries)

Seed data for launch markets. Each entry links to **native-language** resources.

### Germany (DE)
| Category | Organization | Phone | Website |
|----------|-------------|-------|---------|
| alzheimer_society | Deutsche Alzheimer Gesellschaft e.V. | 030 259 37 95 14 | deutsche-alzheimer.de |
| helpline | Alzheimer-Telefon (Deutsche Alzheimer Gesellschaft) | 030 259 37 95 14 | deutsche-alzheimer.de/alzheimer-telefon |
| alzheimer_society | Alzheimer Forschung Initiative e.V. | 0211 86 20 66 0 | alzheimer-forschung.de |
| government | Bundesministerium für Gesundheit — Pflege | - | bundesgesundheitsministerium.de/pflege |
| care_services | Pflegestützpunkte (local care support centers) | - | zqp.de/pflegestuetzpunkte |
| legal_aid | Betreuungsvereine (local guardianship associations) | - | bdb-ev.de |
| government | Pflegeberatung (care counseling — mandatory free service) | - | pflegeberatung.de |

### Austria (AT)
| Category | Organization | Phone | Website |
|----------|-------------|-------|---------|
| alzheimer_society | Alzheimer Austria | 01 332 51 66 | alzheimer-selbsthilfe.at |
| helpline | Demenz-Helpline | 0800 700 300 | - |
| government | Sozialministeriumservice — Pflegegeld | - | sozialministeriumservice.at |
| care_services | Hilfswerk Österreich | - | hilfswerk.at |

### United Kingdom (GB)
| Category | Organization | Phone | Website |
|----------|-------------|-------|---------|
| alzheimer_society | Alzheimer's Society | 0333 150 3456 | alzheimers.org.uk |
| helpline | Dementia Connect Support Line | 0333 150 3456 | alzheimers.org.uk/dementia-connect |
| alzheimer_society | Dementia UK (Admiral Nurses) | 0800 888 6678 | dementiauk.org |
| government | NHS Dementia Guide | - | nhs.uk/conditions/dementia |
| legal_aid | Age UK | 0800 678 1602 | ageuk.org.uk |
| support_group | Memory Cafés (local) | - | memorycafes.org.uk |

### Switzerland (CH)
| Category | Organization | Phone | Website |
|----------|-------------|-------|---------|
| alzheimer_society | Alzheimer Schweiz / Alzheimer Suisse | 024 426 06 06 | alzheimer-schweiz.ch |
| helpline | Alzheimer-Telefon | 024 426 06 06 | - |

> **Expansion pattern:** For each new country, create a seed migration with 5-10 entries covering the main categories. The UI groups by category and shows the country-appropriate entries based on the user's profile `country_code`.

---

## 5. Frontend Implementation

### 5.1 File Structure

```
src/
├── features/
│   └── coach/
│       ├── CoachPage.tsx                    # existing — add "Resources" tab
│       ├── tabs/
│       │   ├── ChatTab.tsx                  # existing
│       │   ├── BehavioursTab.tsx            # existing
│       │   └── ResourcesTab.tsx             # NEW — main resources container
│       └── resources/
│           ├── JourneySection.tsx           # "First Steps" interactive timeline
│           ├── JourneyStepCard.tsx          # individual step card (expandable)
│           ├── JourneyStepDetail.tsx        # full step content view (with checklist)
│           ├── JourneyProgressBar.tsx       # visual progress indicator
│           ├── ArticleSection.tsx           # "Know More" article grid
│           ├── ArticleCard.tsx              # article preview card
│           ├── ArticleDetail.tsx            # full article reader view
│           ├── LocalSupportSection.tsx      # "Local Support" directory
│           ├── LocalSupportCard.tsx         # individual organization card
│           └── hooks/
│               ├── useJourneyProgress.ts    # CRUD for journey progress
│               ├── useArticles.ts           # fetch articles
│               └── useLocalSupport.ts       # fetch local support by country
├── i18n/
│   └── locales/
│       ├── en/
│       │   ├── resources.json              # all journey + article content in English
│       │   └── legal.json                  # country-specific legal document names (EN versions)
│       ├── de/
│       │   ├── resources.json              # German translations
│       │   ├── legal.json                  # German legal document names
│       │   └── financial.json              # German financial benefits info
│       ├── fr/
│       └── ...
```

### 5.2 ResourcesTab Component

```tsx
// ResourcesTab.tsx — high-level structure
const ResourcesTab = () => {
  return (
    <ScrollView>
      {/* Section 1: Journey Progress Summary */}
      <JourneyProgressBar />

      {/* Section 2: First Steps Journey */}
      <SectionHeader
        title={t('resources.journey.title')}        // "First Steps After Diagnosis"
        subtitle={t('resources.journey.subtitle')}   // "A step-by-step guide to help you feel prepared"
      />
      <JourneySection />

      {/* Section 3: Knowledge Library */}
      <SectionHeader
        title={t('resources.articles.title')}        // "Know More"
        subtitle={t('resources.articles.subtitle')}   // "Practical guides for everyday challenges"
      />
      <ArticleSection />

      {/* Section 4: Local Support */}
      <SectionHeader
        title={t('resources.local.title')}           // "Support Near You"
        subtitle={t('resources.local.subtitle')}      // "Organizations and helplines in your area"
      />
      <LocalSupportSection />
    </ScrollView>
  );
};
```

### 5.3 Journey Step Card Design

```
┌─────────────────────────────────────────────────────┐
│  ● ─ ─ ─ ● ─ ─ ─ ● ─ ─ ─ ○ ─ ─ ─ ○ ─ ─ ─ ○      │  <- progress dots (filled = done)
│  1       2       3       4       5       6          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  🧠                                    ✓ Completed  │
│  Understand the Diagnosis                           │
│  What dementia means and what to expect             │
│  ⏱ 15 min read                                      │
│                                                     │
│  ☑ I understand the type of dementia diagnosed      │
│  ☑ I know what changes to expect                    │
│  ☐ I've talked with the diagnosing doctor           │
│                                                     │
│  [Continue Reading →]                               │
└─────────────────────────────────────────────────────┘
```

### 5.4 Accessibility Requirements

Per project standards for dementia-friendly UI (these apply to the entire Resources tab):

- **Touch targets:** minimum 56px × 56px
- **Font sizes:** minimum 18px body text, 22px+ for headings
- **Contrast:** 7:1 ratio minimum (WCAG AAA)
- **Reading level:** content at 6th-8th grade reading level (Flesch-Kincaid), simple sentences, short paragraphs
- **Visual hierarchy:** clear sections, generous whitespace, one idea per paragraph
- **No cognitive overload:** show 2-3 journey steps at a time with "show more" rather than all 8
- **Checklist interactions:** large checkboxes, satisfying completion feedback (gentle animation, not confetti)
- **Back navigation:** always clear and prominent, breadcrumbs on detail views
- **Offline support:** cache article content for offline reading (important for caregivers in hospitals/care facilities)

### 5.5 UI Component Styling

Follow the existing dark theme from Care Coach (as visible in the screenshot). Key design tokens:

```tsx
// Match existing Care Coach visual language
const styles = {
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',  // subtle glass effect on dark bg
    borderRadius: 12,
    padding: 20,
  },
  sectionHeader: {
    title: { fontSize: 13, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.4)' },
  },
  journeyStep: {
    completed: { borderLeftColor: '#4CAF50', borderLeftWidth: 3 },
    inProgress: { borderLeftColor: '#FF9800', borderLeftWidth: 3 },
    notStarted: { borderLeftColor: 'rgba(255,255,255,0.1)', borderLeftWidth: 3 },
  },
  progressDot: {
    completed: { backgroundColor: '#4CAF50' },
    current: { backgroundColor: '#FF9800', scale: 1.2 },
    upcoming: { backgroundColor: 'rgba(255,255,255,0.2)' },
  },
  articleCard: {
    // same card style as "Plan tomorrow" / "Prepare for doctor visit" cards
  },
  localSupport: {
    phoneButton: { backgroundColor: '#4CAF50', minHeight: 56 },  // large, tappable
    websiteButton: { borderColor: 'rgba(255,255,255,0.2)', minHeight: 56 },
  },
};
```

---

## 6. i18n Content Structure

### 6.1 Main Resources Namespace (`resources.json`)

```json
{
  "resources": {
    "tab_label": "Resources",
    "journey": {
      "title": "First Steps After Diagnosis",
      "subtitle": "A step-by-step guide to help you feel prepared",
      "progress": "{{completed}} of {{total}} steps completed",
      "step1": {
        "title": "Understand the Diagnosis",
        "subtitle": "What dementia means and what to expect",
        "content": "FULL MARKDOWN ARTICLE CONTENT HERE — see Section 2 for what to cover",
        "checklist": {
          "item1": "I understand what type of dementia has been diagnosed",
          "item2": "I know what changes to expect in the near term",
          "item3": "I've talked with the diagnosing doctor about what this means for our family"
        }
      },
      "step2": { ... },
      ...
    },
    "articles": {
      "title": "Know More",
      "subtitle": "Practical guides for everyday challenges",
      "categories": {
        "communication": "Communication",
        "behaviors": "Behaviors",
        "daily_living": "Daily Living",
        "self_care": "Taking Care of Yourself",
        "safety": "Safety"
      },
      "communication_basics": {
        "title": "Talking With Your Loved One",
        "summary": "Practical techniques for clear, compassionate communication as abilities change",
        "content": "FULL MARKDOWN CONTENT",
        "reading_time": "8 min read"
      },
      ...
    },
    "local": {
      "title": "Support Near You",
      "subtitle": "Organizations and helplines in your area",
      "categories": {
        "alzheimer_society": "Alzheimer's & Dementia Organizations",
        "helpline": "Helplines",
        "legal_aid": "Legal Support",
        "support_group": "Support Groups",
        "government": "Government Resources",
        "care_services": "Care Services"
      },
      "call": "Call",
      "visit_website": "Visit Website",
      "available_24_7": "Available 24/7",
      "no_resources_found": "We don't have local resources for your region yet. Please check with your national Alzheimer's association.",
      "suggest_resource": "Know a resource we should add?"
    }
  }
}
```

### 6.2 Country-Specific Legal Namespace (`legal.json`)

```json
{
  "legal": {
    "DE": {
      "poa_financial": {
        "name": "Vorsorgevollmacht",
        "description": "Allows a trusted person to make financial and personal decisions on your behalf when you can no longer do so.",
        "where_to_get": "Any notary (Notar) or through Betreuungsverein (guardianship association)",
        "cost_note": "Notarization recommended but not always required; costs vary"
      },
      "poa_health": {
        "name": "Vorsorgevollmacht (Gesundheitsangelegenheiten)",
        "description": "Specifically covers healthcare decisions. Often combined with the general Vorsorgevollmacht."
      },
      "advance_directive": {
        "name": "Patientenverfügung",
        "description": "Records your loved one's wishes about specific medical treatments and life-sustaining measures.",
        "where_to_get": "Can be created without a lawyer using official forms from the Bundesministerium der Justiz"
      },
      "care_directive": {
        "name": "Betreuungsverfügung",
        "description": "If no Vorsorgevollmacht exists, this document suggests to the court who should be appointed as legal guardian (Betreuer)."
      }
    },
    "GB": {
      "poa_financial": {
        "name": "Lasting Power of Attorney (Property and Financial Affairs)",
        "description": "...",
        "where_to_get": "Register with the Office of the Public Guardian (OPG). Can be done online.",
        "cost_note": "£82 per LPA to register (fee reductions available)"
      },
      ...
    }
  }
}
```

### 6.3 Country-Specific Financial Namespace (`financial.json`)

```json
{
  "financial": {
    "DE": {
      "care_insurance": {
        "name": "Pflegeversicherung (Care Insurance)",
        "description": "Germany's mandatory care insurance covers care needs through 5 care levels (Pflegegrade). Assessment is done by the MDK (Medizinischer Dienst).",
        "levels": {
          "1": "Pflegegrad 1 — Minor impairment. Advisory services, care aids.",
          "2": "Pflegegrad 2 — Significant impairment. Pflegegeld: €332/month or care services: €761/month.",
          "3": "Pflegegrad 3 — Severe impairment. Pflegegeld: €573/month or care services: €1,432/month.",
          "4": "Pflegegrad 4 — Most severe impairment. Pflegegeld: €765/month or care services: €1,778/month.",
          "5": "Pflegegrad 5 — Most severe with special care needs. Pflegegeld: €947/month or care services: €2,200/month."
        },
        "how_to_apply": "Apply through your health insurance provider (Krankenkasse). They will arrange an MDK assessment.",
        "tip": "Dementia often qualifies for Pflegegrad 2 or higher even in early stages. The MDK assessment specifically evaluates cognitive and communicative abilities."
      },
      "respite_care": {
        "name": "Verhinderungspflege (Respite Care)",
        "description": "Up to €1,612/year for substitute care when the primary caregiver needs a break. Available after 6 months of home care."
      },
      "short_term_care": {
        "name": "Kurzzeitpflege (Short-term Care)",
        "description": "Up to €1,774/year for temporary care facility stays (e.g., after hospital discharge or caregiver emergency)."
      }
    },
    "GB": {
      "nhs_chc": {
        "name": "NHS Continuing Healthcare (CHC)",
        "description": "Free care package for people with complex medical needs. Assessment required."
      },
      "attendance_allowance": {
        "name": "Attendance Allowance",
        "description": "£72.65 or £108.55 per week for people over State Pension age who need help with personal care.",
        "how_to_apply": "Apply through GOV.UK or call the Attendance Allowance helpline."
      },
      "carers_allowance": {
        "name": "Carer's Allowance",
        "description": "£81.90 per week if you care for someone at least 35 hours a week."
      }
    }
  }
}
```

---

## 7. Supabase Hooks & Data Fetching

### 7.1 useJourneyProgress Hook

```tsx
// hooks/useJourneyProgress.ts

export function useJourneyProgress(careRecipientId: string) {
  // Fetch all journey steps (static content from DB)
  // Fetch user's progress for each step
  // Provide mutations: markStepStarted, markStepCompleted, toggleChecklistItem, addNote
  // Return: { steps, progress, completedCount, totalCount, isLoading }

  const updateProgress = async (stepId: string, status: Status) => {
    // upsert into resource_journey_progress
    // optimistic update
  };

  const toggleChecklist = async (stepId: string, itemIndex: number, checked: boolean) => {
    // Store checklist state in the 'notes' JSON field of resource_journey_progress
    // Structure: { checklist: { 0: true, 1: true, 2: false }, notes: "..." }
  };
}
```

### 7.2 useLocalSupport Hook

```tsx
// hooks/useLocalSupport.ts

export function useLocalSupport() {
  // Get user's country_code from profile
  // Fetch resource_local_support WHERE country_code = user.country_code AND is_active = true
  // Group by category
  // Return: { supportByCategory, countryCode, isLoading }
}
```

---

## 8. Implementation Sequence

Execute in this order. Each prompt is a standalone unit of work.

### Prompt 1: Database Migration
- Create the Supabase migration with all 4 tables
- Add RLS policies
- Seed the 8 journey steps (English slugs, icons, ordering — content keys only, actual content is in i18n)
- Seed the knowledge library article metadata (14 articles)
- Seed local support directory for DE, AT, GB, CH

### Prompt 2: i18n Content Files
- Create `resources.json` for English with ALL journey step content and ALL article content (this is the big content writing task)
- Create `legal.json` for DE and GB
- Create `financial.json` for DE and GB
- Ensure the i18n setup supports the nested namespace structure
- Create placeholder `resources.json` for German (can be translated later, but structure must exist)

### Prompt 3: Core Components — Resources Tab Shell
- Add the "Resources" tab to CoachPage with the 📚 icon
- Create `ResourcesTab.tsx` with the three sections (Journey, Articles, Local Support)
- Create `JourneyProgressBar.tsx`
- Create `SectionHeader` component (reusable)
- Wire up navigation between tab and detail views
- Match existing dark theme styling from Chat and Behaviours tabs

### Prompt 4: Journey Section Components
- Create `JourneySection.tsx` — renders the step timeline
- Create `JourneyStepCard.tsx` — expandable card showing title, subtitle, progress, checklist preview
- Create `JourneyStepDetail.tsx` — full content view with markdown rendering, embedded checklist, notes field
- Create `useJourneyProgress.ts` hook
- Implement checklist toggle with optimistic updates
- Implement step status transitions (not_started → in_progress → completed)
- Accessibility: 56px touch targets, high contrast, large text

### Prompt 5: Knowledge Library Components
- Create `ArticleSection.tsx` — category-filtered article grid
- Create `ArticleCard.tsx` — preview cards in 2-column grid (matching Plan & Prepare card style)
- Create `ArticleDetail.tsx` — full article reader with markdown rendering
- Create `useArticles.ts` hook
- Category filter chips at top (like the "RIGHT NOW" tags in Chat tab)
- Reading time display
- Smooth transitions between list and detail views

### Prompt 6: Local Support Directory
- Create `LocalSupportSection.tsx` — grouped by category
- Create `LocalSupportCard.tsx` — shows org name, phone (tappable to call), website (tappable to open)
- Create `useLocalSupport.ts` hook
- Phone numbers use `Linking.openURL('tel:...')` on mobile
- Website links use `Linking.openURL(url)` on mobile, `window.open` on web
- 24/7 badge for helplines
- "No resources for your region" fallback with national alternatives
- "Suggest a resource" link/button at bottom

### Prompt 7: German Translation
- Translate `resources.json` to German (all journey content + all articles)
- This is a significant content task — the journey steps and articles should be naturally written in German, not machine-translated
- Verify `legal.json` DE content accuracy
- Verify `financial.json` DE content accuracy (Pflegegrade amounts, etc.)

### Prompt 8: Polish & Integration
- Journey step completion triggers a subtle celebration (gentle checkmark animation, no confetti)
- "For You" card on Chat tab: if journey progress < 100%, show a nudge like "Continue your first steps — Step 3: Legal Planning"
- Deep linking: Care Coach AI can reference and link to specific articles when answering caregiver questions (e.g., "I wrote more about this in the Communication guide → [link]")
- Offline caching for article content
- Final accessibility audit against WCAG 2.2 AA + dementia-friendly standards

---

## 9. Content Writing Guidelines

When writing the actual article content for the i18n files, follow these rules:

1. **Reading level:** 6th-8th grade. Use the Hemingway principle — short sentences, common words, active voice.
2. **Tone:** Like a knowledgeable friend who has been through this. Warm but not saccharine. Direct but not clinical.
3. **Structure:** Short paragraphs (2-3 sentences max). Use subheadings to break up content. No walls of text.
4. **Perspective:** Address the caregiver as "you". Refer to the person with dementia as "your loved one" or "the person you're caring for" (not "the patient" or "the sufferer").
5. **Actionable:** Every section should end with something the caregiver can DO, not just know.
6. **Honest:** Don't sugarcoat. Acknowledge that this is hard. But always pair honesty with practical help.
7. **No jargon:** If a medical/legal term is necessary, define it inline on first use.
8. **Country-neutral body, country-specific inserts:** The main article text should work for any European country. Country-specific details (legal document names, benefit amounts, government programs) go in the `{placeholder}` inserts that are swapped at render time.
9. **Sources:** Do NOT cite academic papers in the user-facing text. The content is informed by the research but should read as authoritative guidance, not a literature review. Source attribution lives in our internal documentation only.
10. **Length:** Journey steps: 800-1200 words each. Knowledge articles: 600-1000 words each.

---

## 10. Country Expansion Checklist

When adding a new country, complete these items:

- [ ] Add `legal.{country_code}` entries to `legal.json` (research the specific document names, registration processes, and costs)
- [ ] Add `financial.{country_code}` entries to `financial.json` (research care insurance, benefits, allowances)
- [ ] Add 5-10 `resource_local_support` entries (national Alzheimer's society, helpline, government care portal, legal aid, at least one support group network)
- [ ] Translate `resources.json` to the country's primary language (or verify existing translation covers cultural nuances)
- [ ] Test that the `{legal_documents_table}` and `{financial_benefits_table}` placeholders render correctly for the new locale
- [ ] Verify all phone numbers and URLs are current and working
- [ ] Have a native speaker review the local support descriptions

---

## 11. Regulatory Note

All content in the Resources tab is **educational and informational** — it does NOT constitute medical advice, diagnosis, or treatment recommendations. This is critical for:

- **DiGA compliance:** Educational content is explicitly outside the scope of medical device classification
- **Disclaimer:** Every article and journey step should have a subtle footer: "This information is for educational purposes. Always consult your healthcare team for medical decisions."
- **No symptom assessment:** The content describes what to expect but never asks the user to assess symptoms or make diagnostic judgments
- **No medication recommendations:** Content discusses medication management (organizing, tracking) but never recommends specific medications or dosage changes
