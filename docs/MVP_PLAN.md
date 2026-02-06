# OurTurn — MVP Startup Plan
## AI-Powered Daily Care Platform for Families Living with Dementia

**Version:** 2.0 — February 2026
**Target:** Vibe-codeable MVP
**Market:** Global from Day One (GDPR-compliant)

---

## 1. WHAT MEMOGUARD IS (AND ISN'T)

### The One-Liner
OurTurn is two apps that help families manage daily life with dementia — a radically simple app for the patient, and an AI-powered care dashboard for the family caregiver (mobile + web).

### What It Is
- A **wellness and daily living support** tool for families
- A **care coordination platform** connecting family members around a loved one
- An **AI assistant** that helps caregivers make better daily care decisions
- A **routine management** system that gives structure and comfort to the patient's day

### What It Is NOT (Critical for Regulatory Avoidance)
- NOT a medical device
- NOT a diagnostic tool — never claims to detect, diagnose, or monitor disease progression
- NOT a treatment or therapy — never claims to treat, cure, or slow dementia
- NOT a clinical assessment instrument
- NOT a replacement for medical advice

### Language Rules (Every Screen, Every Feature)
| ❌ NEVER SAY | ✅ ALWAYS SAY |
|---|---|
| "Monitor cognitive decline" | "Track daily wellness" |
| "Detect symptoms" | "Notice routine changes" |
| "Cognitive therapy" | "Brain wellness activities" |
| "Treatment plan" | "Daily care plan" |
| "Diagnose" | "Observe" |
| "Clinical assessment" | "Daily check-in" |
| "Patient" (in UI) | "Your loved one" or their name |
| "Medical monitoring" | "Family care coordination" |
| "Prevents decline" | "Supports an active lifestyle" |
| "Therapy session" | "Activity" |

This positioning keeps OurTurn classified as a **general wellness app** under UK MHRA, EU MDR, and FDA guidance, avoiding the need for CE marking, clinical trials, or regulatory approval. The app provides information and supports daily routines — it does not make clinical decisions.

---

## 2. THE PROBLEM WE SOLVE

### For the Patient (Early-Stage Dementia)
- **"What am I supposed to do today?"** → Confusion about daily schedule
- **"Did I take my pills?"** → Medication uncertainty creates anxiety
- **"I feel lost and alone"** → Growing isolation as social life shrinks
- **"I'm not stupid, I just forget"** → Loss of dignity when treated as incapable
- **"I can't find my way home"** → Disorientation and fear when outside
- **"I don't want to be a burden"** → Guilt about needing help

### For the Family Caregiver
- **"Is she okay right now?"** → Constant worry when not together (especially remote caregivers)
- **"Am I doing this right?"** → No training, no playbook, learning through crisis
- **"I can't do this alone anymore"** → 40% of dementia caregivers develop depression
- **"What should today look like for her?"** → No structured daily plan
- **"I forgot to take care of myself"** → Caregiver burnout is progressive and dangerous
- **"My siblings don't help enough"** → Family coordination failures
- **"I need to check on her but I'm at work"** → Need web access, not just phone

### The Insight
**Nobody owns the "daily life coordination" layer** between doctor visits. Doctors see patients every 3-6 months. The other 360 days, families are on their own — navigating medications, meals, activities, safety, and emotional support without structure, guidance, or reassurance.

OurTurn fills that gap.

---

## 3. WHO WE'RE BUILDING FOR

### Primary User: The Caregiver (The Buyer)
- **Age:** 45-65 (adult daughter/son most common)
- **Digital literacy:** High — uses smartphone and computer daily
- **Emotional state:** Overwhelmed, guilty, isolated, seeking reassurance and structure
- **Location:** Often different city/country from the patient
- **Devices:** Uses phone on the go, laptop/desktop at work or home
- **Decision:** They find, download, pay for, and set up the app
- **Key desire:** "I want to know she's okay, and I want to know I'm doing enough"

### Secondary User: The Patient
- **Age:** 65-85 (early-stage dementia, still living at home)
- **Digital literacy:** Low to moderate — can use a phone but struggles with complex apps
- **Cognitive state:** Forgetful, sometimes confused, but aware and capable of following simple instructions
- **Emotional state:** Anxious, frustrated by limitations, wants to feel independent
- **Key desire:** "Tell me what to do today in a way that doesn't make me feel broken"

### The Buying Decision Flow
1. Family notices memory problems → doctor diagnoses early-stage dementia
2. Caregiver Googles "how to help parent with dementia"
3. Caregiver discovers OurTurn (through search, Alzheimer's society referral, word of mouth)
4. Caregiver signs up (web or mobile) and creates a care profile for their loved one
5. Caregiver receives a **6-digit Care Code**
6. Caregiver installs the Patient App on loved one's phone and enters the code — that's it
7. Both apps sync — the daily care loop begins

---

## 4. THE THREE PLATFORMS

### Platform Overview

| Platform | User | Purpose | Tech |
|---|---|---|---|
| **Patient App** (mobile) | Person with dementia | See today's plan, complete tasks, check in, get help | React Native (iOS + Android) |
| **Caregiver App** (mobile) | Family caregiver | On-the-go monitoring, alerts, quick actions | React Native (iOS + Android) |
| **Caregiver Web App** | Family caregiver | Full dashboard, care plan management, AI Coach, reports | React (Next.js) or responsive web |

### Why a Web App for Caregivers?
- Caregivers are often at work when managing care — desktop is essential
- Complex care plan editing is easier on a larger screen
- AI Coach conversations are richer on a keyboard
- Doctor visit reports are easier to print/share from browser
- Multi-caregiver families may have members who prefer web over mobile
- Faster onboarding — no app install needed to get started
- Web-first signup reduces friction for acquisition

### Feature Parity Table

| Feature | Patient Mobile | Caregiver Mobile | Caregiver Web |
|---|---|---|---|
| Today's plan timeline | ✅ Full | ✅ View only | ✅ View only |
| Task completion | ✅ Primary | ❌ | ❌ |
| Daily check-in | ✅ Primary | ❌ | ❌ |
| "I Need Help" + calls | ✅ Full | ❌ | ❌ |
| "Take Me Home" navigation | ✅ Full | ❌ | ❌ |
| Brain wellness activities | ✅ Full | ❌ | ❌ |
| Dashboard | ❌ | ✅ Full | ✅ Full |
| Care plan builder | ❌ | ✅ Full | ✅ Full (best experience) |
| Location map & safe zones | ❌ | ✅ Full | ✅ Full |
| AI Care Coach | ❌ | ✅ Full | ✅ Full (best experience) |
| Caregiver wellbeing | ❌ | ✅ Full | ✅ Full |
| Family Circle & Journal | ❌ | ✅ Full | ✅ Full |
| Doctor visit reports | ❌ | ✅ View | ✅ Full (generate + print) |
| Onboarding & setup | ❌ | ✅ Full | ✅ Full (recommended) |
| Subscription management | ❌ | ✅ Full | ✅ Full |
| Push notifications | ✅ Reminders | ✅ Alerts | ❌ (email instead) |

---

## 5. PATIENT ACCESS — THE CARE CODE SYSTEM

### How It Works

The patient **never creates an account**. No email, no password, no sign-up form.

**Setup flow:**
1. Caregiver signs up (web or mobile) → creates care profile for their loved one
2. System generates a unique **6-digit Care Code** (e.g., `847 291`)
3. Caregiver installs Patient App on loved one's phone
4. Patient App shows only one screen: **"Enter your Care Code"**
5. Caregiver enters the code (or the patient does, with help)
6. App pairs to the household → loads the personalized care plan
7. Patient App auto-saves the session — **never asks for the code again**
8. Done. The patient never sees a login screen again.

### Care Code Details

```
┌─────────────────────────────────────┐
│                                     │
│       Welcome to OurTurn 💙       │
│                                     │
│    Enter your Care Code             │
│                                     │
│    ┌───┐ ┌───┐ ┌───┐               │
│    │ 8 │ │ 4 │ │ 7 │               │
│    └───┘ └───┘ └───┘               │
│    ┌───┐ ┌───┐ ┌───┐               │
│    │ 2 │ │ 9 │ │ 1 │               │
│    └───┘ └───┘ └───┘               │
│                                     │
│    Your family member will          │
│    give you this code.              │
│                                     │
│         [ Connect ]                 │
│                                     │
└─────────────────────────────────────┘
```

**Technical details:**
- 6-digit numeric code (easy to read aloud over the phone)
- Code is displayed prominently in caregiver's app/web dashboard
- Code can be regenerated if compromised (old code instantly invalidated)
- Code remains active until manually regenerated
- Multiple patient devices can use the same code (e.g., phone + tablet)
- Session persists on device — code entry is a one-time setup
- If app is uninstalled and reinstalled, code must be re-entered
- **No patient data is stored on the device itself** — all data lives in the cloud and syncs via the code

**Why this approach:**
- Zero cognitive load for the patient (no remembering passwords)
- Caregiver maintains full control over access
- Family member can set up the phone remotely (enter code, hand phone to patient)
- Reduces accidental lockouts (no "forgot password" scenarios)
- Simple enough for someone with cognitive impairment to enter with minimal help

---

## 6. THE PATIENT APP — Screen by Screen

### Design Philosophy
- **One purpose:** Show today's plan clearly and calmly
- **Zero cognitive load:** No menus, no settings, no decisions
- **Warm, not clinical:** Feels like a friendly helper, not a medical device
- **Time-aware:** Adapts appearance based on morning/afternoon/evening
- **Large everything:** Minimum 20px text, huge touch targets, high contrast

### Screen 1: Today's Plan (Home Screen — the ONLY main screen)

**Layout:** Single scrollable timeline of today's tasks, sorted by time

Each task card shows:
```
┌─────────────────────────────────────┐
│  🕐 9:00 AM                   NOW  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  💊 Morning Medication              │
│                                     │
│  "Take your blue pill and white     │
│   pill with a glass of water.       │
│   They're in the kitchen counter    │
│   pill box, Tuesday section."       │
│                                     │
│         [ ✓ Done ]                  │
└─────────────────────────────────────┘
```

**Task card elements:**
- Time (large, bold)
- Category icon (💊 🥗 🚶 🧩 💬 ❤️)
- Task title (large, clear)
- "Hint" — the gentle instruction written by the caregiver (personalized, warm, specific to their home and routine)
- Big "Done" button with satisfying checkmark animation
- "NOW" badge on the next upcoming task
- Gentle color-coded nudge for overdue tasks (not alarming)

**Categories** (inspired by FINGER domains, never labeled as such):
- 💊 Medication
- 🥗 Meals & Nutrition
- 🚶 Physical Activity
- 🧩 Brain Wellness Activities
- 💬 Social & Connection
- ❤️ Health Check (blood pressure, etc.)

**Time-of-day themes:**
- Morning (6am-12pm): Warm sunrise gradient, energetic feel
- Afternoon (12pm-6pm): Bright daylight, active feel
- Evening (6pm-10pm): Warm sunset gradient, calming feel

**Daily progress:**
- Simple progress bar at the top: "4 of 7 activities done today 🌟"
- Encouraging micro-messages: "Great morning!" / "You're doing wonderfully"

### Screen 2: I Need Help (Persistent Tab — Bottom Navigation)

The Help tab is always accessible from the bottom navigation bar. It contains two sections: **contact people** and **get home safely**.

```
┌─────────────────────────────────────┐
│                                     │
│        I Need Help 💙               │
│                                     │
│  ── CALL SOMEONE ──────────────     │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  📞  Ana (daughter)          │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  📞  Marco (son)             │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  📞  Dr. Ionescu             │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  🚨  Emergency (112 / 911)   │  │
│  └──────────────────────────────┘  │
│                                     │
│  ── GET HOME SAFELY ───────────     │
│                                     │
│  ┌──────────────────────────────┐  │
│  │                              │  │
│  │  🏠  TAKE ME HOME            │  │
│  │                              │  │
│  │  Tap to get walking           │  │
│  │  directions to your home      │  │
│  │                              │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘

Bottom Navigation:
[ 📋 Today ]  [ 🆘 Help ]
```

**Call behavior:**
- One tap = starts phone call. No confirmation dialogs for family contacts
- Confirmation dialog only for emergency number
- Emergency number auto-detects based on patient's country (112 in EU, 911 in US, 999 in UK, etc.)

**Take Me Home behavior:**
1. Patient taps the big "Take Me Home" button
2. App gets current GPS location
3. Opens Google Maps with walking directions from current location → home address
4. Deep link: `google.navigation:q={home_lat},{home_lng}&mode=w` (Android) / `comgooglemaps://?daddr={home_lat},{home_lng}&directionsmode=walking` (iOS)
5. If Google Maps is not installed, falls back to Apple Maps (iOS) or browser-based Google Maps
6. Home address is set by the caregiver during onboarding (stored in care profile)

**Take Me Home — Technical details:**
```
// Deep link logic
const openNavigationHome = (homeAddress) => {
  const { latitude, longitude } = homeAddress;
  
  // Try Google Maps first
  const googleMapsUrl = Platform.select({
    ios: `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=walking`,
    android: `google.navigation:q=${latitude},${longitude}&mode=w`,
  });
  
  // Fallback to Apple Maps (iOS) or browser Google Maps
  const fallbackUrl = Platform.select({
    ios: `maps://app?daddr=${latitude},${longitude}&dirflg=w`,
    android: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`,
  });
  
  Linking.canOpenURL(googleMapsUrl)
    .then(supported => Linking.openURL(supported ? googleMapsUrl : fallbackUrl));
};
```

**Why "Take Me Home" matters:**
- Wandering and disorientation is the #1 safety fear for families
- A confused person with dementia may not remember their address
- Having a single, unmistakable button that says "TAKE ME HOME" can prevent dangerous situations
- Google Maps handles the complexity (route, turn-by-turn, voice guidance)
- No need to build our own navigation — leverage the best existing tool
- **Also triggers a silent notification to the caregiver:** "Maria tapped 'Take Me Home' at [location]" — so the caregiver knows something may be wrong and can call

### Screen 3: Daily Check-In (AI-Powered — appears once per day)

A gentle, conversational check-in that appears at a caregiver-configured time (e.g., 10am):

```
┌─────────────────────────────────────┐
│                                     │
│     Good morning, Maria! ☀️         │
│                                     │
│     How are you feeling today?      │
│                                     │
│     😊        😐        😟         │
│    Good     Okay     Not great     │
│                                     │
│                                     │
│     Did you sleep well?             │
│                                     │
│     😴        🙂        😩         │
│    Yes     So-so    Not really     │
│                                     │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Anything you want to tell   │  │
│  │  your family? (optional)     │  │
│  │  🎤 Tap to speak             │  │
│  └──────────────────────────────┘  │
│                                     │
│         [ Send to family ]          │
│                                     │
└─────────────────────────────────────┘
```

**What this does:**
- Captures mood and sleep quality (simple emoji taps — no cognitive load)
- Optional voice note → transcribed by AI → sent to caregiver app/web
- AI analyzes patterns over time → surfaces trends to caregiver (e.g., "Maria has reported poor sleep 4 of the last 7 days")
- NEVER shown to the patient as "assessment" — just a friendly morning chat
- Caregiver sees the responses in their dashboard (mobile + web)

### Screen 4: Brain Wellness Activity (Optional — 1x per day)

Appears as a task card in the daily plan. Short, enjoyable, never frustrating:

```
┌─────────────────────────────────────┐
│                                     │
│  🧩 Today's Activity               │
│                                     │
│  "What do you remember about        │
│   your wedding day?"                │
│                                     │
│  🎤 Tap to share your memory       │
│                                     │
│  ────────────────────────────────── │
│                                     │
│  🖼️ [Photo from family album]      │
│                                     │
│         [ Skip for today ]          │
│                                     │
└─────────────────────────────────────┘
```

**Activity types (AI-generated, personalized):**
- **Reminiscence prompts:** Based on biographical info the caregiver provides
- **Photo stories:** "Who is in this photo? Tell us about them" (using family photos uploaded by caregiver)
- **Word games:** Simple word association, categories ("Name 5 fruits")
- **Music moments:** "Listen to this song. Does it remind you of anything?"
- **Orientation helpers:** "What day is it today? What season are we in?" (gentle, not testing)
- **Creative prompts:** "Describe your favorite meal as a child"

**AI's role:**
- Generates personalized prompts based on patient's biography and caregiver input
- Adapts difficulty: If patient skips activities, make them easier/shorter
- Voice responses are transcribed and shared with caregiver
- NEVER scores or grades the patient — no pass/fail, no points
- Always positive feedback: "What a wonderful memory! Thank you for sharing"

### Patient App Bottom Navigation

Only 2 tabs — absolute minimum:
```
┌─────────────────────────────────────┐
│                                     │
│    [ 📋 Today ]    [ 🆘 Help ]     │
│                                     │
└─────────────────────────────────────┘
```

That's it. Two icons. Two words. No hamburger menu, no settings gear, no profile icon.

### What's NOT in the Patient App
- ❌ No settings menu
- ❌ No login/password screen (code entry is one-time)
- ❌ No complex navigation
- ❌ No notifications that require decisions
- ❌ No caregiver features visible
- ❌ No medical terminology
- ❌ No scores, grades, or performance metrics visible to patient
- ❌ No social media features
- ❌ No advertising

---

## 7. THE CAREGIVER APP (MOBILE) — Screen by Screen

### Design Philosophy
- **Command center on the go:** Quick visibility into care status
- **AI-assisted:** Get answers and suggestions, not just data
- **Alert-driven:** Push notifications for safety events, daily summaries for routine
- **Professional but warm:** Clean UI with gentle colors, not cold clinical

### Tab 1: Dashboard (Home)

```
┌─────────────────────────────────────┐
│  Good morning, Ana                  │
│  Maria's day is going well 💚      │
│                                     │
│  ┌─── TODAY'S STATUS ───────────┐  │
│  │ ✅ 3 of 7 tasks done         │  │
│  │ 💊 Morning meds: taken ✓     │  │
│  │ 🥗 Breakfast: done ✓         │  │
│  │ 🚶 Morning walk: done ✓      │  │
│  │ 💊 Noon meds: upcoming 12:00 │  │
│  │ 🧩 Brain activity: pending   │  │
│  │ 💬 Call with Marco: 3:00 PM  │  │
│  │ 🥗 Dinner: 6:30 PM          │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌─── DAILY CHECK-IN ──────────┐  │
│  │ Mood: 😊 Good                │  │
│  │ Sleep: 😴 Slept well         │  │
│  │ Voice note: "I'm having a    │  │
│  │ good day, the garden looks..." │  │
│  │ [▶ Play voice note]          │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌─── LOCATION ────────────────┐  │
│  │ 📍 Maria is at home         │  │
│  │ Last updated: 2 min ago      │  │
│  │ [View on map]                │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌─── AI INSIGHTS ─────────────┐  │
│  │ 💡 Maria has been sleeping   │  │
│  │ poorly 4 of the last 7 days. │  │
│  │ This could be worth mentioning│  │
│  │ at the next doctor visit.     │  │
│  │ [Ask AI Coach about this →]  │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### Tab 2: Care Plan

Quick-access care plan editor (full editing on mobile, best experience on web):
- View all tasks for today / this week
- Add/edit/delete tasks
- Write hints per task
- Set recurrence
- Copy days to other days
- AI suggest button for new activities

### Tab 3: Location & Safety

- Map view with patient's current location
- Safe zones displayed as circles
- Location history timeline
- Alert configuration
- **"Take Me Home" alert indicator** — shows when patient tapped the button, with location and timestamp

### Tab 4: AI Care Coach

Full conversational AI (same as web — see Section 9).

### Tab 5: Family & Wellbeing

Combined tab with:
- Family Circle (invite members, roles, shared journal)
- Caregiver wellbeing tracker (mood, self-care checklist)
- Support resources
- Care Code display (to share with new family members or re-pair patient device)

---

## 8. THE CAREGIVER WEB APP

### Why Web Matters

The web app is not a "nice to have" — it's where the **serious care management happens**:
- Caregivers at work check on their loved one from a browser
- Care plan editing is faster and more precise on a large screen
- AI Coach conversations are richer with a full keyboard
- Doctor visit reports are generated and printed from web
- Multi-caregiver families coordinate better on web
- **Zero-install onboarding** — caregiver can sign up and start building a care plan before installing any mobile app

### Web App URL Structure

```
ourturn.com                   → Marketing / Landing page
app.ourturn.com               → Caregiver web dashboard
app.ourturn.com/dashboard     → Today's overview
app.ourturn.com/care-plan     → Care plan builder
app.ourturn.com/location      → Location & safety
app.ourturn.com/coach         → AI Care Coach
app.ourturn.com/family        → Family circle & journal
app.ourturn.com/wellbeing     → Caregiver self-care
app.ourturn.com/reports       → Doctor visit reports
app.ourturn.com/settings      → Account, subscription, care code
```

### Web Dashboard Layout

```
┌──────────────────────────────────────────────────────────────┐
│  🧠 OurTurn        Dashboard  Plan  Location  Coach  More │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐  ┌──────────────────────────────┐  │
│  │  TODAY'S STATUS      │  │  MARIA'S CHECK-IN            │  │
│  │                      │  │                              │  │
│  │  ✅ 3 / 7 tasks     │  │  Mood: 😊 Good               │  │
│  │  done today          │  │  Sleep: 😴 Slept well        │  │
│  │                      │  │                              │  │
│  │  💊 Morning meds ✓  │  │  Voice note:                 │  │
│  │  🥗 Breakfast ✓     │  │  "I'm having a good day..."  │  │
│  │  🚶 Walk ✓          │  │  [▶ Play]                    │  │
│  │  💊 Noon meds 12:00 │  │                              │  │
│  │  🧩 Activity pending │  │  This Week's Mood:           │  │
│  │  💬 Call 3:00 PM    │  │  Mon Tue Wed Thu Fri         │  │
│  │  🥗 Dinner 6:30 PM  │  │  😊  😐  😫  😊  —         │  │
│  └─────────────────────┘  └──────────────────────────────┘  │
│                                                              │
│  ┌─────────────────────┐  ┌──────────────────────────────┐  │
│  │  LOCATION            │  │  AI INSIGHTS                 │  │
│  │                      │  │                              │  │
│  │  📍 Maria is at      │  │  💡 Sleep quality has        │  │
│  │  home                │  │  decreased this week.        │  │
│  │                      │  │                              │  │
│  │  [Map preview]       │  │  💡 Maria completes more     │  │
│  │                      │  │  tasks on days she walks.    │  │
│  │  Last update: 2 min  │  │                              │  │
│  │  [Full map →]        │  │  [Chat with AI Coach →]      │  │
│  └─────────────────────┘  └──────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  CARE JOURNAL (recent)                                 │  │
│  │                                                        │  │
│  │  Ana, today 9:15 AM: "Mom seemed confused about the   │  │
│  │  day, but brightened up after her walk."               │  │
│  │                                                        │  │
│  │  Marco, yesterday 6:00 PM: "Called Mom, she was in     │  │
│  │  good spirits."                                        │  │
│  │                                                        │  │
│  │  [+ Add note]                              [View all →]│  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Web Care Plan Builder (Best Experience)

The web version provides the most powerful care plan editing:

```
┌──────────────────────────────────────────────────────────────┐
│  Maria's Care Plan                                           │
│                                                              │
│  [Mon] [Tue] [Wed] [Thu] [Fri] [Sat] [Sun]  [Copy week →]  │
│                                                              │
│  ┌────────┬───────────────────────┬───────────────────────┐ │
│  │ TIME   │ TASK                  │ HINT                  │ │
│  ├────────┼───────────────────────┼───────────────────────┤ │
│  │ 9:00   │ 💊 Morning Medication │ "Blue pill and white  │ │
│  │        │                       │  pill from Tuesday     │ │
│  │        │                       │  pill box on kitchen   │ │
│  │        │                       │  counter"              │ │
│  │        │                       │         [Edit] [🗑️]   │ │
│  ├────────┼───────────────────────┼───────────────────────┤ │
│  │ 9:30   │ 🥗 Breakfast          │ "Yogurt and fruit in  │ │
│  │        │                       │  the fridge, top       │ │
│  │        │                       │  shelf"                │ │
│  │        │                       │         [Edit] [🗑️]   │ │
│  ├────────┼───────────────────────┼───────────────────────┤ │
│  │ 10:30  │ 🚶 Morning Walk       │ "Take a 20 min walk   │ │
│  │        │                       │  in the park. Coat     │ │
│  │        │                       │  by the door!"         │ │
│  │        │                       │         [Edit] [🗑️]   │ │
│  └────────┴───────────────────────┴───────────────────────┘ │
│                                                              │
│  [+ Add Task]          [🤖 AI Suggest Tasks for This Day]   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Web Doctor Visit Report Generator

A unique web feature for preparing medical appointments:

```
┌──────────────────────────────────────────────────────────────┐
│  📋 Doctor Visit Report                                      │
│                                                              │
│  Generate a summary for Maria's next appointment             │
│  Period: [Last 30 days ▼]                                    │
│                                                              │
│  Report includes:                                            │
│  ☑️ Mood trends and daily check-in summary                  │
│  ☑️ Sleep patterns                                          │
│  ☑️ Activity completion rates by category                   │
│  ☑️ Medication adherence                                    │
│  ☑️ Notable observations from Care Journal                  │
│  ☑️ Location patterns (time spent at home vs. outside)      │
│  ☑️ Caregiver concerns and questions                        │
│                                                              │
│  [Generate Report]                                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  MEMOGUARD CARE SUMMARY — Maria Ionescu               │   │
│  │  Period: January 3 – February 2, 2026                 │   │
│  │                                                        │   │
│  │  Overall Wellness: Stable with minor sleep concerns   │   │
│  │                                                        │   │
│  │  Mood: Predominantly positive (Good: 18 days,         │   │
│  │  Okay: 8 days, Not great: 4 days)                     │   │
│  │  ...                                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  [🖨️ Print]  [📧 Email to doctor]  [📄 Download PDF]       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. AI FEATURES — DEEP DIVE

### AI Feature 1: Care Coach (LLM-powered chatbot)

Available on both caregiver mobile and web. Web provides the richest experience.

**Technical approach:**
- Backend: API calls to Claude or GPT-4 with carefully crafted system prompt
- Context window includes: Patient profile, recent check-ins, care plan, caregiver history
- RAG (Retrieval Augmented Generation) over curated caregiving knowledge base:
  - Alzheimer's association guidelines (international)
  - WHO iSupport content
  - FINGER trial lifestyle recommendations
  - Cognitive Stimulation Therapy activity ideas
  - General caregiving best practices
- Response guardrails: Never diagnose, never recommend medication, always defer to doctor
- Conversation memory: Remembers past conversations within and across sessions

**Prompt engineering priorities:**
- Warm, empathetic tone — like talking to an experienced friend who knows about dementia care
- Personalized to the specific patient ("Based on Maria's love of gardening, have you tried...")
- Actionable — always ends with something concrete the caregiver can do
- Can directly suggest care plan changes that caregiver approves with one tap
- Culturally sensitive — adapts based on user's language and location
- Multilingual — responds in the language the caregiver writes in

### AI Feature 2: Personalized Activity Generator

**Activity categories:**
1. **Reminiscence:** "Tell us about the time you visited Paris in 1985"
2. **Photo Stories:** Shows uploaded family photo → "Who are these people?"
3. **Word Play:** "Name as many animals as you can"
4. **Music Connection:** Plays a song from their era → "What does this remind you of?"
5. **Sensory Prompts:** "Describe your favorite childhood meal"
6. **Orientation:** "What's the weather like today?"
7. **Creative:** "If you could visit anywhere tomorrow, where would you go?"

**Technical approach:**
- LLM generates activities based on patient profile + caregiver-uploaded content
- Pre-generate a week of activities in advance (works offline)
- Voice input for patient responses → speech-to-text → stored for caregiver
- No scoring — purely engagement-focused
- Always positive feedback

### AI Feature 3: Pattern Detection & Insights

**What it analyzes (from daily check-ins and task completion):**
- Mood trends over time
- Sleep quality patterns
- Activity completion rates by category
- Time-of-day patterns
- Correlation between activities and mood
- Changes in voice note length/frequency

**What it surfaces to the caregiver:**
- "Maria's mood tends to be better on days she takes her morning walk"
- "Sleep quality has decreased over the past week"
- "Maria skipped brain activities 3 days this week"
- Weekly summary with trends and suggestions

**What it NEVER does:**
- Never claims to measure cognitive function
- Never uses terms like "decline," "deterioration," or "worsening"
- Uses language like "routine changes," "patterns," "trends"

### AI Feature 4: Smart Notifications

**For the patient:**
- Gentle, timely reminders that feel personal
- "Maria, it's time for your morning walk! 🌤️"
- Never more than 1 notification in a 30-minute window
- Voice-announced option

**For the caregiver (mobile):**
- Safety alerts always break through (left safe zone, "Take Me Home" tapped, inactivity)
- Routine updates batched into daily summary
- AI-generated evening wrap-up

**For the caregiver (web):**
- Email notifications for safety alerts
- Daily summary email (configurable)
- In-app notification bell for non-urgent updates

---

## 10. DATA MODEL

### Core Entities

```
HOUSEHOLD
├── id
├── created_at
├── timezone
├── language (auto-detected, changeable)
├── country (for emergency numbers, resources)
├── care_code (6-digit, unique, regeneratable)
├── subscription_status
└── subscription_platform (web / ios / android)

PATIENT (one per household)
├── id
├── household_id
├── name
├── age / date_of_birth
├── dementia_type (optional)
├── stage (early / moderate)
├── home_address: { formatted, latitude, longitude }
├── medications: [{name, dosage, times, notes}]
├── biography: {
│     childhood_location, career, hobbies,
│     favorite_music, favorite_foods,
│     important_people, key_events
│   }
├── photos: [url]
├── wake_time
├── sleep_time
├── emergency_number (auto-set by country, overridable)
└── device_tokens: [{ token, platform, last_seen }]

CAREGIVER (multiple per household)
├── id
├── household_id
├── name
├── email
├── password_hash
├── relationship_to_patient
├── role (primary / family_member)
├── permissions: {can_edit_plan, receives_alerts, etc.}
├── language_preference
├── device_tokens: [{ token, platform }]
└── notification_preferences: {
      safety_alerts: always,
      daily_summary: boolean,
      summary_time: time,
      email_notifications: boolean
    }

CARE_PLAN_TASK (recurring template)
├── id
├── household_id
├── category (medication | nutrition | physical | cognitive | social | health)
├── title
├── hint_text
├── time
├── recurrence (daily | specific_days | one_time)
├── recurrence_days: [mon, tue, wed...]
├── active (boolean)
├── created_by (caregiver_id)
└── created_at

TASK_COMPLETION (daily instance)
├── id
├── task_id
├── date
├── completed (boolean)
├── completed_at (timestamp)
└── skipped (boolean)

DAILY_CHECKIN
├── id
├── household_id
├── date
├── mood (1-5 scale)
├── sleep_quality (1-3 scale)
├── voice_note_url (optional)
├── voice_note_transcript (optional)
├── submitted_at
└── ai_summary (generated)

CARE_JOURNAL_ENTRY
├── id
├── household_id
├── author_id (caregiver)
├── content (text)
├── created_at
└── entry_type (observation | note | milestone)

LOCATION_LOG
├── id
├── patient_id
├── latitude
├── longitude
├── timestamp
├── location_label (home | known_place | unknown)
└── accuracy_meters

SAFE_ZONE
├── id
├── household_id
├── name
├── latitude
├── longitude
├── radius_meters
└── active (boolean)

LOCATION_ALERT
├── id
├── household_id
├── type (left_safe_zone | inactive | night_movement | take_me_home_tapped)
├── triggered_at
├── location_log_id
├── acknowledged (boolean)
└── acknowledged_by

AI_CONVERSATION (Care Coach)
├── id
├── caregiver_id
├── household_id
├── messages: [{role, content, timestamp}]
├── created_at
└── updated_at

CAREGIVER_WELLBEING_LOG
├── id
├── caregiver_id
├── date
├── mood (1-5)
├── self_care_checklist: {breaks, meals, social, enjoyable, exercise, sleep}
└── notes (optional)

BRAIN_ACTIVITY
├── id
├── household_id
├── date
├── activity_type (reminiscence | photo | word_game | music | creative | orientation)
├── prompt_text
├── patient_response_text (transcribed)
├── patient_response_audio_url
├── completed (boolean)
└── duration_seconds

DOCTOR_VISIT_REPORT
├── id
├── household_id
├── generated_by (caregiver_id)
├── period_start
├── period_end
├── content_json
├── pdf_url
└── generated_at
```

---

## 11. TECH STACK (Optimized for Vibe Coding)

### Recommended Stack

| Layer | Technology | Why |
|---|---|---|
| **Patient App** | React Native (Expo) | Single codebase → iOS + Android. Expo makes it fast |
| **Caregiver App** | React Native (Expo) | Same codebase pattern, shared component library |
| **Caregiver Web App** | Next.js (React) | Fast, SEO-friendly marketing pages + app dashboard |
| **Shared Logic** | Shared TypeScript package | Business logic, types, API calls shared across all 3 platforms |
| **Backend** | Supabase | Postgres + Auth + Realtime + Storage + Edge Functions |
| **AI / LLM** | Anthropic Claude API | Care Coach + activity generation + insights |
| **Speech-to-Text** | Whisper API (OpenAI) or Deepgram | Voice notes and activity responses |
| **Push Notifications** | Expo Notifications + Supabase Edge Functions | Task reminders + safety alerts |
| **Email Notifications** | Resend or SendGrid | Web caregiver alerts + daily summaries |
| **Maps** | Google Maps API | Location display (web + mobile), safe zones |
| **Navigation** | Google Maps deep links | "Take Me Home" feature — opens native Google Maps |
| **Location** | Expo Location (background) | Phone GPS with background tracking |
| **File Storage** | Supabase Storage | Family photos, voice notes, report PDFs |
| **Analytics** | PostHog (self-hosted) or Mixpanel | User behavior, no PII |
| **Payments** | RevenueCat (mobile) + Stripe (web) | Subscription management cross-platform |
| **Hosting** | Vercel (web) + Supabase (backend) | Simple, scalable, global CDN |

### Architecture Overview

```
┌─────────────┐  ┌─────────────┐  ┌──────────────────┐
│ Patient App  │  │ Caregiver   │  │  Caregiver Web   │
│ (React      │  │ Mobile App  │  │  (Next.js)       │
│  Native)    │  │ (React      │  │                  │
│             │  │  Native)    │  │  app.ourturn   │
│ Code entry  │  │             │  │  .com             │
│ → session   │  │ Auth →      │  │                  │
│             │  │ session     │  │  Auth → session  │
└──────┬──────┘  └──────┬──────┘  └────────┬─────────┘
       │                │                   │
       │  Supabase Realtime (WebSockets)    │
       ├────────────────┼───────────────────┤
       │                │                   │
  ┌────▼────────────────▼───────────────────▼────┐
  │              SUPABASE                         │
  │  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
  │  │ Postgres  │  │  Auth    │  │  Storage   │ │
  │  │ Database  │  │          │  │ (photos,   │ │
  │  │          │  │ Caregiver│  │  voice,    │ │
  │  │          │  │ accounts │  │  PDFs)     │ │
  │  └──────────┘  └──────────┘  └────────────┘ │
  │  ┌──────────┐  ┌──────────────────────────┐ │
  │  │ Realtime  │  │    Edge Functions         │ │
  │  │ (sync)    │  │  • Push notifications     │ │
  │  │           │  │  • Email notifications    │ │
  │  │           │  │  • Location processing    │ │
  │  │           │  │  • AI insight cron jobs   │ │
  │  │           │  │  • Report generation      │ │
  │  │           │  │  • Care Code validation   │ │
  │  └──────────┘  └──────────────────────────┘ │
  └──────────────────────┬───────────────────────┘
                         │
            ┌────────────▼────────────┐
            │    External APIs        │
            │  • Claude API (AI)      │
            │  • Whisper (speech)     │
            │  • Resend (email)       │
            │  • RevenueCat (subs)    │
            │  • Stripe (web subs)    │
            │  • Google Maps API      │
            └─────────────────────────┘
```

### Patient Authentication Flow (Care Code)

```
Patient App Launch:
  │
  ├─ Has stored session token? ──YES──→ Load household data → Show Today's Plan
  │
  └─ NO → Show Care Code Entry Screen
           │
           └─ User enters 6-digit code
              │
              └─ POST /functions/v1/validate-care-code
                 │
                 ├─ Invalid → "Please check your code and try again"
                 │
                 └─ Valid → Return household_id + session token
                            │
                            └─ Store token securely on device
                               │
                               └─ Load household data → Show Today's Plan
```

### Key Technical Decisions

**Real-time sync across all three platforms:**
- Supabase Realtime subscriptions on `task_completion`, `daily_checkin`, `location_log`
- Patient taps "Done" → instant update on caregiver mobile AND web
- Caregiver edits care plan on web → instant update on patient's phone
- Location updates → real-time position on both caregiver platforms

**Offline support (critical for patient app):**
- Patient app caches today's plan locally
- Completions stored locally if offline → synced when connection returns
- Voice notes recorded locally → uploaded in background
- "Take Me Home" works offline (home coordinates cached locally)
- Patient app MUST work without internet for core timeline and help features

**Location tracking (battery-efficient):**
- Use significant location changes (not continuous GPS) — updates every ~100m movement
- Geofence triggers for safe zones (OS-level, battery-efficient)
- Background location permissions — handle consent during onboarding
- Location data retained for 30 days, then auto-deleted

**"Take Me Home" silent alert flow:**
1. Patient taps "Take Me Home"
2. Before opening Google Maps, app sends location event to backend
3. Backend creates `LOCATION_ALERT` with type `take_me_home_tapped`
4. Edge Function triggers push notification to all caregivers with safety alerts enabled
5. Push notification: "🏠 Maria tapped 'Take Me Home' from [location/address]. She may need help finding her way."
6. Google Maps opens on patient's phone with walking directions

**Global i18n from day one:**
- All strings in translation files (not hardcoded)
- Auto-detect device language on first launch
- Support for RTL languages in layout
- Dates, times, currency formatted per locale
- Emergency numbers mapped to country
- AI Care Coach responds in the user's language
- Initial languages: English (launch) → rapid addition of major world languages

**Privacy & Security (GDPR-compliant globally):**
- All data encrypted at rest (Supabase default)
- End-to-end encryption for voice notes
- Supabase deployed in EU region (GDPR-compliant)
- Data deletion on account removal (right to erasure)
- Data export on request (right to portability)
- No data sold or shared with third parties — ever
- Privacy policy in plain language
- Cookie consent on web app
- Dynamic consent for location tracking
- Care Code access can be revoked instantly by caregiver

---

## 12. MONETIZATION

### Pricing Model: Freemium + Subscription

**Free Tier (forever):**
- Daily plan builder with up to 5 tasks per day
- Daily check-in (mood + sleep)
- 1 emergency contact in Help tab
- Basic task completion tracking
- "Take Me Home" button
- Location sharing (view only, no safe zones or alerts)
- Limited AI Coach (5 messages per month)
- 1 caregiver only

**OurTurn Plus — $9.99 / month** (or $89.99 / year = 25% discount):
*Price adjusts by region using purchasing power parity:*

| Region | Monthly | Annual |
|---|---|---|
| USA, UK, Western Europe, Australia | $9.99 / £7.99 / €8.99 | $89.99 / £69.99 / €79.99 |
| Eastern Europe, Latin America | $4.99 | $44.99 |
| India, Southeast Asia, Africa | $2.99 | $26.99 |

**OurTurn Plus includes:**
- Unlimited tasks per day
- Full AI Care Coach (unlimited conversations)
- AI-generated brain wellness activities
- Safe zones + all location alerts
- Multi-caregiver support (up to 5 family members)
- Shared Care Journal
- AI pattern insights and weekly summaries
- Doctor visit report generator
- Caregiver wellbeing tracker
- Full web app access
- Priority email support
- All future features

**Why this price point:**
- Elli Cares: $3.99-$5.99/month → we charge more but deliver massively more value (AI Coach alone justifies it)
- Headspace/Calm: ~$10/month → establishes health app pricing psychology
- Family subscription — one payment covers all caregivers + patient
- Monthly cost roughly equals one cup of coffee per week

**Cross-platform subscription:**
- RevenueCat manages iOS + Android subscriptions
- Stripe manages web subscriptions
- Subscription syncs across all platforms via Supabase user record
- Subscribe on any platform → access everywhere

### Revenue Projections (Global, Conservative)

| Year | Paying Households | MRR | ARR |
|---|---|---|---|
| Year 1 | 5,000 | $50,000 | $600,000 |
| Year 2 | 30,000 | $300,000 | $3,600,000 |
| Year 3 | 120,000 | $1,200,000 | $14,400,000 |

*Based on ~8% free-to-paid conversion, weighted average $10/mo*

### Future Revenue Streams (Post-MVP)
- **B2B:** Partner with healthcare systems, Alzheimer's associations, care homes
- **Insurance partnerships:** Dementia-specific insurance add-ons
- **DiGA pathway (Germany):** Insurance-reimbursed prescriptions
- **Professional tier:** Care agencies managing multiple patients
- **Anonymized research insights:** Opt-in only, fully anonymized

---

## 13. GLOBAL LAUNCH STRATEGY

### Philosophy: Global from Day One, Localize Progressively

OurTurn launches globally — available in every country's App Store and on web from day one. No geographic restrictions. The app auto-detects language and location to provide the right experience.

### Launch Sequence

**Month 1-4: Build MVP**
- English-only UI
- Global availability on iOS, Android, and web
- Emergency numbers auto-detected for all countries
- GDPR-compliant architecture from day one
- Currency and pricing auto-adjusted by region

**Month 5: Global Launch**
- App Store + Google Play worldwide
- Web app live at app.ourturn.com
- English + auto-detected locale settings
- Marketing: English-language content, global social media, Alzheimer's association outreach worldwide

**Month 6-12: Progressive Localization**
- Add languages based on user demand (track where signups come from)
- Likely priority order based on global dementia prevalence and digital adoption:
  - German (1.59M cases in Germany)
  - French (1.23M in France)
  - Spanish (opens Spain + all of Latin America)
  - Portuguese (Brazil + Portugal)
  - Italian (1.28M in Italy)
  - Dutch, Polish, Romanian (based on demand)
  - Japanese (3.9M cases, highly tech-savvy elderly)
  - Mandarin (longer-term)

**Per-language localization includes:**
- Full UI translation
- AI Coach responds in that language
- Localized support resources (national helplines, associations)
- Localized brain wellness activities (culturally appropriate food, music, holiday references)
- App Store listing in that language

### Global Marketing Channels

| Channel | Approach |
|---|---|
| **Google Search** | "dementia care app" / "alzheimer's daily routine" / "help for dementia carers" — run in English globally, add language-specific campaigns as localized |
| **Facebook / Instagram** | Target dementia caregiver groups (massive, active communities in every country) |
| **Alzheimer's Associations** | Partner with Alzheimer's Disease International (ADI) + national associations. There are 100+ member organizations |
| **Content marketing** | Blog at ourturn.com/blog — SEO-optimized caregiving guides in English, then localized |
| **Reddit / forums** | r/dementia, r/caregivers, r/Alzheimers — provide genuine help, mention app naturally |
| **YouTube** | "How to care for someone with dementia" educational content with product integration |
| **App Store Optimization** | Optimize for "dementia," "alzheimer," "caregiver," "memory care" in every supported language |
| **Word of mouth** | The most powerful channel. Build a product so good that caregivers tell other caregivers |
| **Press** | Founder story: "I built this because my family needed it" — universal human interest angle |

### Localization Infrastructure

**i18n setup (from day one in codebase):**
```
/locales
  /en.json        ← Launch language
  /de.json        ← German
  /fr.json        ← French
  /es.json        ← Spanish
  /pt.json        ← Portuguese
  /it.json        ← Italian
  /ro.json        ← Romanian
  /ja.json        ← Japanese
  ...
```

**Dynamic content localization:**
- AI Coach: System prompt includes `language: {user_language}` — Claude responds in any language
- Brain activities: Prompt includes cultural context — "Generate a reminiscence prompt appropriate for someone who grew up in {country}"
- Support resources: JSON database of helplines/associations per country
- Emergency numbers: Mapped per country code

**Country-specific emergency number mapping:**
```json
{
  "GB": { "emergency": "999", "secondary": "111" },
  "US": { "emergency": "911" },
  "DE": { "emergency": "112" },
  "FR": { "emergency": "112", "secondary": "15" },
  "RO": { "emergency": "112" },
  "JP": { "emergency": "119" },
  "AU": { "emergency": "000" },
  "IN": { "emergency": "112" },
  "default": { "emergency": "112" }
}
```

---

## 14. COMPETITIVE POSITIONING

### OurTurn vs. Competition

| Feature | OurTurn | Elli Cares | MapHabit | MindMate |
|---|---|---|---|---|
| **Separate patient & caregiver apps** | ✅ Fully separate | ❌ Single app | ❌ Single app | ❌ Patient only |
| **Caregiver web app** | ✅ Full dashboard | ❌ Mobile only | ❌ Mobile only | ❌ No caregiver |
| **Patient code access (no login)** | ✅ 6-digit code | ❌ Account needed | ❌ Account needed | ❌ Account needed |
| **AI Care Coach** | ✅ Full LLM chatbot | ❌ Basic FAQ | ❌ None | ❌ None |
| **"Take Me Home" navigation** | ✅ One-tap Google Maps | ❌ None | ❌ None | ❌ None |
| **Personalized daily plan** | ✅ Caregiver builds, patient follows | ⚠️ Basic reminders | ✅ Visual maps | ❌ No planning |
| **Hint system** | ✅ Personal instructions per task | ❌ Generic | ✅ Photo steps | ❌ N/A |
| **Location safety** | ✅ Phone GPS + safe zones + alerts | ✅ GPS tracking | ❌ None | ❌ None |
| **Multi-caregiver** | ✅ Up to 5 family members | ✅ Up to 5 | ❌ Single | ❌ N/A |
| **Caregiver wellbeing** | ✅ Full mood + self-care tracking | ❌ None | ❌ None | ❌ None |
| **Brain activities** | ✅ AI-personalized, biographical | ❌ None | ❌ None | ✅ Generic games |
| **Doctor visit reports** | ✅ AI-generated PDF | ❌ None | ❌ None | ❌ None |
| **Voice interaction** | ✅ Voice notes, voice check-ins | ✅ Video messages | ❌ None | ❌ None |
| **Global from day one** | ✅ All countries, multi-language | ⚠️ NZ-based, expanding | ❌ US only | ⚠️ UK-based |
| **Evidence-based framework** | ✅ FINGER + CST inspired | ❌ No framework | ✅ NIH validated | ⚠️ Limited |

### The Moat

1. **AI Care Coach** — No competitor has a contextualized LLM chatbot. Every conversation makes the AI better through the data flywheel.

2. **True app separation with code-based patient access** — Zero-friction for the patient. No passwords, no accounts, no confusion. Nobody else does this.

3. **Web + Mobile caregiver experience** — Caregivers need desktop access. Elli Cares and MapHabit are mobile-only.

4. **"Take Me Home"** — One button that could save a life. Simple, powerful, emotionally resonant. Sends silent alert to family.

5. **Personalization depth** — Biography + photos + hints + AI = an experience that feels handcrafted. Generic apps can't compete.

6. **Global-first architecture** — Built for i18n from day one, not retrofitted. First-mover in non-English markets.

---

## 15. MVP FEATURE CHECKLIST

### Must Have (Launch)

**Patient App (Mobile):**
- [ ] Care Code entry screen (one-time setup)
- [ ] Session persistence (never ask for code again after initial entry)
- [ ] Daily timeline view with time-sorted tasks
- [ ] Task completion (tap to mark done)
- [ ] Category icons and color coding
- [ ] Caregiver-written hints per task
- [ ] "NOW" badge and progress bar
- [ ] Time-of-day adaptive backgrounds
- [ ] Help tab with emergency contacts
- [ ] Help tab with "Take Me Home" button → opens Google Maps walking directions
- [ ] Silent alert to caregiver when "Take Me Home" is tapped
- [ ] Auto-detected emergency number by country
- [ ] Daily check-in (mood + sleep + optional voice note)
- [ ] 1 brain wellness activity per day
- [ ] Push notification reminders
- [ ] Offline-capable daily plan and Help tab
- [ ] i18n-ready string architecture

**Caregiver Mobile App:**
- [ ] Email/password signup + social auth (Google, Apple)
- [ ] Onboarding flow (patient profile, biography, care plan setup)
- [ ] Care Code generation and display
- [ ] Dashboard with today's status overview
- [ ] Care plan builder (add/edit/delete tasks with hints and recurrence)
- [ ] Daily check-in results view + voice note playback
- [ ] Phone GPS location map
- [ ] Safe zones (create/edit/delete)
- [ ] Location alerts (leave safe zone, inactivity, night movement, "Take Me Home" tapped)
- [ ] AI Care Coach (chat interface)
- [ ] Caregiver wellbeing tracker (mood + checklist)
- [ ] Support resources with localized helpline numbers
- [ ] Multi-caregiver invite system (share Care Code + role assignment)
- [ ] Shared Care Journal
- [ ] Push notifications (safety alerts + daily summary)
- [ ] Subscription management (RevenueCat)
- [ ] i18n-ready

**Caregiver Web App:**
- [ ] Sign up / login (same auth as mobile)
- [ ] Full dashboard (mirrors mobile)
- [ ] Care plan builder (enhanced table/grid view)
- [ ] Location map + safe zones
- [ ] AI Care Coach (chat — optimized for keyboard)
- [ ] Family Circle (invite, roles, journal)
- [ ] Caregiver wellbeing
- [ ] Care Code display + regenerate
- [ ] Doctor visit report generator (generate + print + download PDF)
- [ ] Account settings + subscription management (Stripe)
- [ ] Email notification preferences
- [ ] Responsive design (desktop + tablet)
- [ ] i18n-ready

**Backend (Supabase + Edge Functions):**
- [ ] User authentication (email + social)
- [ ] Care Code validation endpoint
- [ ] Real-time data sync (Realtime subscriptions)
- [ ] Background location processing
- [ ] Push notification scheduling (task reminders + alerts)
- [ ] Email notification sending (alerts + daily summaries)
- [ ] AI API integration (Claude)
- [ ] Speech-to-text for voice notes (Whisper)
- [ ] File storage (photos, voice notes)
- [ ] Subscription billing (RevenueCat + Stripe sync)
- [ ] GDPR-compliant data handling
- [ ] Data export endpoint (right to portability)
- [ ] Account + data deletion endpoint (right to erasure)
- [ ] Emergency number lookup by country
- [ ] i18n string serving

### Nice to Have (Post-Launch)
- [ ] AI-generated weekly summary email
- [ ] AI pattern insights dashboard (advanced)
- [ ] Photo-based reminiscence activities with caregiver-uploaded photos
- [ ] Music integration (Spotify/Apple Music)
- [ ] Video calling between caregiver and patient (in-app)
- [ ] Home screen widget (patient app — today's next task)
- [ ] Apple Watch / WearOS companion ("I'm okay" button)
- [ ] Dark mode
- [ ] Accessibility audit (screen reader, voice control)
- [ ] PWA support for patient app (progressive web app as alternative to native)
- [ ] SMS-based reminders for patients without smartphones
- [ ] Integration with pharmacy APIs for medication info

---

## 16. RISKS AND MITIGATIONS

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Regulatory reclassification** | Medium | Critical | Strict language rules, no diagnostic claims, legal review of all features, pre-ship checklist (Appendix A) |
| **Patient can't use the app** | High | Medium | Ultra-simple UI + voice mode. Caregiver can also complete tasks on behalf. Code-based access eliminates login friction |
| **Low patient engagement** | High | Medium | Caregiver-initiated reminders, "Take Me Home" provides immediate safety value even without daily engagement |
| **Caregiver churn** | Medium | High | AI Coach delivers ongoing value, weekly summaries create habit, web app keeps them engaged at work |
| **Privacy backlash** | Medium | Medium | Transparent consent, easy on/off toggle, privacy-first messaging, GDPR compliance, no data selling |
| **AI hallucination** | Medium | High | RAG over curated sources, strict guardrails, always defer to doctor, human review of common queries |
| **Competition copies** | Medium | Medium | Speed of execution, AI data flywheel, community building, global-first |
| **Battery drain from GPS** | Medium | Medium | Significant location changes (not continuous), OS-level geofencing, battery optimization |
| **Family conflict** | High | Low | Clear roles/permissions, Care Journal for transparency, AI Coach can mediate |
| **Scale costs (AI API)** | Low | Medium | Cache common responses, smaller models for simple tasks, optimize prompts |
| **App Store rejection** | Low | Medium | Follow platform guidelines strictly, no health claims, proper location permission justification |
| **Localization quality** | Medium | Medium | Start English-only, professional translation for each language, native speaker review |

---

## 17. TEAM NEEDS

### Founding Team (2-3 people)

1. **CEO / Product Lead**
   - Personal connection to dementia caregiving (essential for credibility)
   - Product management experience
   - Customer interviews, partnerships, fundraising

2. **CTO / Lead Developer**
   - React Native + React (Next.js) experience
   - Backend/cloud experience (Supabase or similar)
   - Can vibe-code fast, ship weekly
   - Comfortable with 3-platform architecture

3. **Clinical Advisor** (part-time / advisory)
   - Geriatrician, neurologist, or dementia specialist nurse
   - Reviews health-related content and AI responses
   - Ensures regulatory positioning stays clean
   - Provides credibility for association partnerships

### First Hires (After Traction)
- Community Manager (engage global carer communities)
- AI/ML Engineer (optimize Care Coach, build pattern detection)
- Designer (accessibility specialist)
- Localization Manager (when adding languages)

---

## 18. MVP TIMELINE

### Weeks 1-4: Foundation
- Set up monorepo: patient app (React Native) + caregiver app (React Native) + web app (Next.js) + shared TypeScript package
- Set up Supabase: database schema, auth, storage, Edge Functions
- Build Care Code system (generation + validation + pairing)
- Patient app: Code entry screen → session persistence → basic timeline view
- Caregiver web: Sign up → onboarding flow → care plan builder
- Caregiver mobile: Sign up → basic dashboard

### Weeks 5-8: Core Features
- Patient app: Task completion, check-in screen, Help tab with contacts + "Take Me Home"
- Caregiver apps: Location map + safe zones, alert system
- Real-time sync across all 3 platforms
- Push notifications (patient reminders + caregiver safety alerts)
- Email notifications for web caregivers
- Voice note recording + Whisper transcription
- Background location tracking

### Weeks 9-12: AI & Polish
- AI Care Coach full implementation with RAG (mobile + web)
- Brain wellness activity generator
- Caregiver wellbeing tab (mobile + web)
- Multi-caregiver invite system + Care Journal
- Doctor visit report generator (web)
- Design polish, accessibility pass
- Subscription setup (RevenueCat mobile + Stripe web)
- i18n framework setup (even if only English at launch)

### Weeks 13-16: Beta
- Private beta with 50 families globally (find through online communities)
- Daily feedback collection
- Bug fixes and iteration across all 3 platforms
- App Store / Play Store submission preparation
- Privacy policy, terms of service
- GDPR documentation

### Weeks 17-20: Launch
- Global launch: iOS App Store + Google Play + web
- Content marketing + social media push
- Alzheimer's association outreach (global)
- Community building: Discord/Slack/Facebook group for caregivers
- First paid subscribers
- Monitor analytics for localization priorities

---

## 19. SUCCESS METRICS

### North Star Metric
**Weekly active caregiving households** — a household where the caregiver opened the app/web AND the patient completed at least 1 task in the past 7 days.

### Key Performance Indicators

| Category | Metric | Target (Month 6) |
|---|---|---|
| **Growth** | Registered households (global) | 5,000 |
| **Growth** | Paying households | 400 (8% conversion) |
| **Platform** | % using web app | 50% of caregivers |
| **Platform** | % using mobile + web | 30% of caregivers |
| **Engagement** | Weekly active households | 55% of registered |
| **Patient** | Tasks completed per day (avg) | 4+ |
| **Patient** | Daily check-in completion rate | 65% |
| **Patient** | "Take Me Home" used (ever) | Track (safety metric) |
| **Caregiver** | AI Coach conversations per week | 3+ |
| **Caregiver** | Care plan edits per week | 2+ |
| **Safety** | Location feature adoption | 50% |
| **Safety** | Safe zone alerts responded to <10min | 80% |
| **Quality** | App Store rating | 4.5+ |
| **Retention** | 30-day retention (caregiver) | 55% |
| **Retention** | 90-day retention (caregiver) | 35% |
| **Revenue** | MRR | $4,000 |
| **Satisfaction** | NPS score | 50+ |
| **Global** | Countries with active users | 15+ |

---

## APPENDIX A: MEDICAL DEVICE AVOIDANCE CHECKLIST

Before every feature ships, verify:

- [ ] Does any text claim to diagnose, detect, or screen for a disease? → Remove
- [ ] Does any text claim to treat, cure, or slow disease progression? → Remove
- [ ] Does any feature output a clinical score or rating? → Remove
- [ ] Does any feature recommend specific medical treatments? → Remove
- [ ] Does the AI make clinical decisions without human review? → Add disclaimer
- [ ] Is there a feature that could be interpreted as monitoring disease? → Reframe as "wellness tracking"
- [ ] Does any marketing claim therapeutic benefit? → Reframe as lifestyle support
- [ ] Would a regulator reading this screen think it's a medical device? → Simplify language
- [ ] Is there a "not medical advice" disclaimer on health-adjacent screens? → Add it

### Key Reference Documents
- **UK MHRA:** Guidance on standalone software including apps (wellness exemption)
- **EU MDR 2017/745:** Article 2 definition, Rule 11 for software classification
- **FDA:** General Wellness Policy (enforcement discretion for low-risk wellness apps)
- **Health Canada:** SaMD guidance (wellness exemption)
- **TGA Australia:** Excluded goods (wellness apps)

---

## APPENDIX B: AI CARE COACH SYSTEM PROMPT (Draft)

```
You are OurTurn Care Coach, a warm and knowledgeable AI assistant
helping family caregivers of people with dementia manage daily care.

LANGUAGE: Respond in {user_language}. Match the caregiver's language.

ABOUT THE PERSON YOU'RE HELPING CARE FOR:
{patient_profile}
{patient_biography}

ABOUT THE CAREGIVER:
{caregiver_profile}

RECENT CONTEXT:
{recent_checkins}
{recent_task_completions}
{recent_journal_entries}

YOUR ROLE:
- You are a supportive, empathetic companion for the caregiver
- You provide practical, actionable advice based on established
  caregiving best practices
- You know the patient's biography, preferences, and routine
- You can suggest changes to the daily care plan
- You validate the caregiver's feelings and efforts

YOU MUST NEVER:
- Diagnose any condition or claim to detect disease progression
- Recommend specific medications or dosage changes
- Replace medical advice — always suggest consulting their doctor
- Use clinical or alarming language
- Make the caregiver feel guilty or inadequate
- Share patient information with anyone outside the household
- Use words like "decline," "deterioration," "worsening"
- Claim the app is a medical device or therapy

COMMUNICATION STYLE:
- Warm, friendly, like talking to an experienced friend
- Use the patient's name (not "the patient")
- Give specific, actionable suggestions
- Acknowledge emotions before giving information
- Keep responses concise but thorough
- Use simple language — avoid medical jargon
- End with a concrete next step when possible
- Be culturally sensitive to the user's background

WHEN ASKED MEDICAL QUESTIONS:
"That's a really important question, and I'd recommend discussing
it with {patient_name}'s doctor at the next visit. What I can
share is [general wellness information]. Would you like me to
add this to your doctor visit notes?"
```

---

## APPENDIX C: "TAKE ME HOME" FLOW DIAGRAM

```
Patient taps "Take Me Home"
         │
         ▼
    Get current GPS location
         │
         ▼
    Send silent alert to backend ──→ Push to all caregivers:
         │                           "🏠 {name} tapped Take Me Home
         │                            at {location}"
         ▼
    Open Google Maps with
    walking directions:
    Current Location → Home Address
         │
         ├── Google Maps installed? ──YES──→ Open Google Maps app
         │                                   (walking mode)
         │
         └── NO ──→ iOS: Open Apple Maps (walking)
                     Android: Open Google Maps in browser
```

---

*This plan is a living document. Update it as you learn from users.*
*The best feature ideas will come from the families who use OurTurn.*

*"Technology alone cannot solve dementia. But thoughtfully designed
tools can extend caregiver capabilities, reduce isolation, and
preserve safety — buying precious time and peace of mind for
families navigating one of life's most difficult journeys."*
