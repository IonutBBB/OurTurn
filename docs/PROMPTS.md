# OurTurn — Build Prompts
## Copy-paste these into Claude Code in order. One prompt at a time.

**Rules:**
- Run each prompt ONE AT A TIME
- After each prompt: run the app, verify it works, fix any errors
- After each working feature: `git add . && git commit -m "description"`
- Update the "Current Build Status" checklist in CLAUDE.md after each session

---

## PHASE 0: Project Setup (Do This Yourself — Not Claude Code)

Before your first Claude Code prompt, manually set up the project:

```bash
# 1. Create project folder
mkdir ourturn && cd ourturn && git init

# 2. Create the apps
npx create-expo-app@latest apps/patient-app --template blank-typescript
npx create-expo-app@latest apps/caregiver-app --template blank-typescript
npx create-next-app@latest apps/caregiver-web --typescript --tailwind --app --src-dir

# 3. Create shared packages
mkdir -p packages/shared/types packages/shared/constants packages/shared/utils
mkdir -p packages/supabase/queries packages/supabase/hooks
echo '{"name": "@ourturn/shared", "version": "1.0.0", "main": "index.ts"}' > packages/shared/package.json
echo '{"name": "@ourturn/supabase", "version": "1.0.0", "main": "index.ts"}' > packages/supabase/package.json

# 4. Create Supabase structure
mkdir -p supabase/migrations supabase/functions

# 5. Create docs folder and copy all files
mkdir -p docs/skills
# Copy CLAUDE.md to project root
# Copy docs/MVP_PLAN.md
# Copy all docs/skills/*.md files

# 6. Set up Supabase (go to supabase.com, create project, note URL + keys)
npm install -g supabase
supabase init

# 7. Create .env files with your keys
echo "EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co" > apps/patient-app/.env
echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key" >> apps/patient-app/.env
cp apps/patient-app/.env apps/caregiver-app/.env

# 8. Install Supabase client in all apps
cd apps/patient-app && npx expo install @supabase/supabase-js expo-secure-store && cd ../..
cd apps/caregiver-app && npx expo install @supabase/supabase-js expo-secure-store && cd ../..
cd apps/caregiver-web && npm install @supabase/supabase-js @supabase/ssr && cd ../..
cd packages/supabase && npm install @supabase/supabase-js && cd ../..

# 9. Git commit the skeleton
git add . && git commit -m "init: project skeleton with 3 apps and shared packages"
```

Now open Claude Code in the `ourturn/` folder and start with Prompt 1.

---

## PHASE 1: Foundation

### PROMPT 1 — Database Schema

```
Read docs/MVP_PLAN.md section "10. DATA MODEL" and docs/skills/supabase-patterns.md.

Create a complete Supabase migration file at supabase/migrations/001_initial_schema.sql.

Create ALL these tables with proper types, relationships, and constraints:

1. households — id (uuid pk default gen_random_uuid()), care_code (text unique not null), timezone (text default 'UTC'), language (text default 'en'), country (text), subscription_status (text default 'free'), created_at, updated_at

2. patients — id (uuid pk), household_id (fk → households, unique), name (text not null), date_of_birth (date), dementia_type (text), stage (text default 'early'), home_address_formatted (text), home_latitude (float8), home_longitude (float8), medications (jsonb default '[]'), biography (jsonb default '{}'), wake_time (time default '08:00'), sleep_time (time default '21:00'), emergency_number (text), created_at, updated_at

3. caregivers — id (uuid pk default auth.uid()), household_id (fk → households not null), name (text not null), email (text not null unique), relationship (text), role (text default 'primary' check in ('primary','family_member')), permissions (jsonb default '{"can_edit_plan": true, "receives_alerts": true}'), language_preference (text default 'en'), notification_preferences (jsonb default '{"safety_alerts": true, "daily_summary": true, "email_notifications": true}'), created_at, updated_at

4. care_plan_tasks — id (uuid pk), household_id (fk → households not null), category (text not null check in ('medication','nutrition','physical','cognitive','social','health')), title (text not null), hint_text (text), time (time not null), recurrence (text default 'daily' check in ('daily','specific_days','one_time')), recurrence_days (text[] default '{}'), active (boolean default true), one_time_date (date), created_by (uuid fk → caregivers), created_at, updated_at

5. task_completions — id (uuid pk), task_id (fk → care_plan_tasks not null), household_id (fk → households not null), date (date not null), completed (boolean default false), completed_at (timestamptz), skipped (boolean default false), unique constraint on (task_id, date)

6. daily_checkins — id (uuid pk), household_id (fk → households not null), date (date not null), mood (int check 1-5), sleep_quality (int check 1-3), voice_note_url (text), voice_note_transcript (text), submitted_at (timestamptz), ai_summary (text), unique constraint on (household_id, date)

7. care_journal_entries — id (uuid pk), household_id (fk → households not null), author_id (uuid fk → caregivers not null), content (text not null), entry_type (text default 'note' check in ('observation','note','milestone')), created_at

8. location_logs — id (uuid pk), patient_id (uuid fk → patients not null), household_id (fk → households not null), latitude (float8 not null), longitude (float8 not null), timestamp (timestamptz default now()), location_label (text default 'unknown'), accuracy_meters (float8)

9. safe_zones — id (uuid pk), household_id (fk → households not null), name (text not null), latitude (float8 not null), longitude (float8 not null), radius_meters (int not null default 200), active (boolean default true), created_at

10. location_alerts — id (uuid pk), household_id (fk → households not null), type (text not null check in ('left_safe_zone','inactive','night_movement','take_me_home_tapped')), triggered_at (timestamptz default now()), latitude (float8), longitude (float8), location_label (text), acknowledged (boolean default false), acknowledged_by (uuid fk → caregivers)

11. ai_conversations — id (uuid pk), caregiver_id (uuid fk → caregivers not null), household_id (fk → households not null), messages (jsonb default '[]'), created_at, updated_at

12. caregiver_wellbeing_logs — id (uuid pk), caregiver_id (uuid fk → caregivers not null), date (date not null), mood (int check 1-5), self_care_checklist (jsonb default '{}'), notes (text), unique constraint on (caregiver_id, date)

13. brain_activities — id (uuid pk), household_id (fk → households not null), date (date not null), activity_type (text not null check in ('reminiscence','word_game','music','creative','orientation')), prompt_text (text not null), follow_up_text (text), patient_response_text (text), patient_response_audio_url (text), completed (boolean default false), duration_seconds (int), unique constraint on (household_id, date)

14. doctor_visit_reports — id (uuid pk), household_id (fk → households not null), generated_by (uuid fk → caregivers), period_start (date not null), period_end (date not null), content_json (jsonb), pdf_url (text), generated_at (timestamptz default now())

Also include:
- A trigger function to auto-generate a unique 6-digit care_code when a household is created (see docs/skills/supabase-patterns.md for the pattern)
- Auto-updating updated_at triggers on all tables that have updated_at
- Indexes on household_id for all tables, plus date columns where relevant
- Enable RLS on ALL tables
- RLS policies for caregiver access (caregivers can only access their own household's data via auth.uid() matching caregivers table)
- RLS policies for patient device access (using household_id from JWT claims — patient can SELECT from tasks, safe_zones, patients, brain_activities and INSERT into task_completions, daily_checkins, location_logs, location_alerts, brain_activities)
- Create Supabase Storage buckets: voice-notes (authenticated), reports (authenticated)
```

### PROMPT 2 — Shared TypeScript Types

```
Read the database schema at supabase/migrations/001_initial_schema.sql and docs/MVP_PLAN.md section "10. DATA MODEL".

Create TypeScript interfaces for all database entities:

1. packages/shared/types/household.ts — Household type
2. packages/shared/types/patient.ts — Patient, PatientBiography, Medication types
3. packages/shared/types/caregiver.ts — Caregiver, CaregiverPermissions, NotificationPreferences types
4. packages/shared/types/care-plan.ts — CarePlanTask, TaskCompletion, TaskCategory (union type of the 6 categories), TaskRecurrence types
5. packages/shared/types/checkin.ts — DailyCheckin type
6. packages/shared/types/location.ts — LocationLog, SafeZone, LocationAlert, LocationAlertType types
7. packages/shared/types/journal.ts — CareJournalEntry, EntryType types
8. packages/shared/types/ai.ts — AIConversation, AIMessage, BrainActivity, DoctorVisitReport types
9. packages/shared/types/wellbeing.ts — CaregiverWellbeingLog, SelfCareChecklist types
10. packages/shared/types/index.ts — re-export everything

All types should match the database schema exactly. Use `string` for uuid, `number` for int/float, `boolean` for boolean. Nullable columns should be `| null`. JSONB columns should have typed interfaces. Dates as `string` (ISO format).

Also create:
11. packages/shared/constants/categories.ts — TASK_CATEGORIES array with { id, label (i18n key), icon (emoji), color (hex), lightBg (hex) } for each of the 6 categories. Use colors from docs/skills/design-system.md.
12. packages/shared/constants/emergency-numbers.ts — copy the full emergency numbers map from docs/skills/i18n-patterns.md
13. packages/shared/index.ts — re-export everything from types/ and constants/
```

### PROMPT 3 — Supabase Client and Queries

```
Read docs/skills/supabase-patterns.md for patterns and packages/shared/types/ for type definitions.

Create the Supabase client package:

1. packages/supabase/client.ts — Initialize Supabase client. Read URL and anon key from environment variables (support both EXPO_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL patterns). Export the client.

2. packages/supabase/queries/households.ts
   - createHousehold(caregiverId, data) → creates household + patient + caregiver records in a transaction
   - getHousehold(householdId) → household with patient
   - validateCareCode(code) → returns household if valid, null if not
   - regenerateCareCode(householdId) → generates new code, returns it
   - updateSubscription(householdId, status) → updates subscription_status

3. packages/supabase/queries/tasks.ts
   - getTodaysTasks(householdId, dayOfWeek) → active tasks for today, ordered by time
   - getWeekTasks(householdId) → all active tasks grouped by recurrence
   - createTask(householdId, task) → insert care_plan_task
   - updateTask(taskId, updates) → update care_plan_task
   - deleteTask(taskId) → soft delete (set active=false)
   - getTodaysCompletions(householdId, date) → completions for today
   - completeTask(taskId, householdId, date) → insert task_completion
   - uncompleteTask(taskId, date) → delete task_completion

4. packages/supabase/queries/checkins.ts
   - submitCheckin(householdId, data) → insert daily_checkin
   - getCheckin(householdId, date) → today's checkin or null
   - getCheckinHistory(householdId, days) → last N days of checkins

5. packages/supabase/queries/location.ts
   - logLocation(patientId, householdId, lat, lng, accuracy) → insert location_log
   - getLatestLocation(householdId) → most recent location_log
   - getLocationHistory(householdId, date) → day's location logs
   - getSafeZones(householdId) → all active safe zones
   - createSafeZone(householdId, zone) → insert safe_zone
   - updateSafeZone(zoneId, updates) → update
   - deleteSafeZone(zoneId) → delete
   - createLocationAlert(householdId, alert) → insert location_alert
   - getRecentAlerts(householdId, hours) → alerts in last N hours
   - acknowledgeAlert(alertId, caregiverId) → mark acknowledged

6. packages/supabase/queries/caregivers.ts
   - getCaregiver(userId) → caregiver profile with household
   - getCaregiversByHousehold(householdId) → all caregivers
   - updateCaregiver(caregiverId, updates) → update profile
   - inviteCaregiver(householdId, email, name, relationship) → create caregiver with family_member role

7. packages/supabase/queries/journal.ts
   - createEntry(householdId, authorId, content, type) → insert journal entry
   - getEntries(householdId, limit, offset) → paginated entries

8. packages/supabase/queries/activities.ts
   - getTodaysActivity(householdId, date) → brain_activity for today or null
   - saveActivityResponse(activityId, responseText, audioUrl) → update with response
   - getRecentActivities(householdId, days) → for AI to avoid repeats

9. packages/supabase/queries/wellbeing.ts
   - logWellbeing(caregiverId, data) → insert/upsert wellbeing log
   - getWellbeingHistory(caregiverId, days) → last N days

10. packages/supabase/queries/conversations.ts
    - createConversation(caregiverId, householdId) → new ai_conversation
    - addMessage(conversationId, role, content) → append to messages jsonb
    - getConversation(conversationId) → full conversation
    - getConversationList(caregiverId) → list with first message preview

11. packages/supabase/index.ts — re-export client and all queries

Every function should be typed with imports from @ourturn/shared. Handle errors by throwing — let the caller decide how to handle.
```

### PROMPT 4 — i18n Setup + English Strings

```
Read docs/skills/i18n-patterns.md for the complete JSON structure and setup patterns.

Set up internationalization for all 3 apps:

1. Install i18next in mobile apps:
   cd apps/patient-app && npx expo install i18next react-i18next expo-localization
   cd apps/caregiver-app && npx expo install i18next react-i18next expo-localization

2. Install next-intl in web app (or i18next for consistency):
   cd apps/caregiver-web && npm install i18next react-i18next

3. Create the English locale files by copying the FULL JSON structure from docs/skills/i18n-patterns.md:
   - apps/patient-app/locales/en.json (only patientApp + common + categories + notifications sections)
   - apps/caregiver-app/locales/en.json (only caregiverApp + common + categories + notifications + subscription sections)
   - apps/caregiver-web/locales/en.json (full — all sections)

4. Create i18n initialization files:
   - apps/patient-app/src/i18n.ts — init i18next with expo-localization auto-detect, fallback to 'en'
   - apps/caregiver-app/src/i18n.ts — same pattern
   - apps/caregiver-web/src/i18n.ts — init with browser language detection

5. Import and initialize i18n in each app's entry point (App.tsx or layout.tsx).

All user-facing text from this point forward MUST use the t() function. Never hardcode strings.
```

---

## PHASE 2: Patient App

### PROMPT 5 — Patient App: Navigation + Care Code Screen

```
Read docs/skills/patient-app-ux.md for all design rules and docs/skills/design-system.md for colors.

Set up the patient app (apps/patient-app) with Expo Router and build the Care Code entry screen.

1. Install dependencies:
   npx expo install expo-router expo-linking expo-constants expo-status-bar react-native-safe-area-context react-native-screens

2. Set up Expo Router with file-based routing:
   - app/_layout.tsx — root layout, initialize i18n, check for stored session
   - app/index.tsx — Care Code entry screen (shown when no session)
   - app/(tabs)/_layout.tsx — tab navigator with 2 tabs: Today and Help
   - app/(tabs)/today.tsx — Today's Plan (placeholder for now)
   - app/(tabs)/help.tsx — Help tab (placeholder for now)

3. Care Code Entry Screen (app/index.tsx):
   - OurTurn logo/name at top (just text "OurTurn" with a 💙 heart, 36px bold)
   - "Welcome to OurTurn" heading (28px)
   - "Enter your Care Code" instruction (20px)
   - 6 large digit input boxes in a row (each 56px × 64px, 28px font, centered, auto-focus-next)
   - Helper text: "Your family member will give you this code." (18px, muted)
   - "Connect" button (full width, 64px height, Primary Teal, 20px bold white text)
   - Loading state: button shows "Connecting..." with spinner
   - Error state: "Please check your code and try again." (Warm Amber text, below button)

4. On successful code validation:
   - Call packages/supabase validateCareCode(code)
   - Store the household_id and session info in expo-secure-store
   - Navigate to (tabs)/today

5. On app launch (app/_layout.tsx):
   - Check expo-secure-store for existing session
   - If found: navigate directly to (tabs)/today (skip code screen)
   - If not found: show code entry screen

6. Tab bar design:
   - 2 tabs only: "📋 Today" and "🆘 Help"
   - Tab bar height: 80px
   - Tab icon size: 28px
   - Tab label size: 14px bold
   - Active color: Teal (#0D9488)
   - Inactive color: Text Muted (#A8A29E)
   - Background: white with top border

Follow ALL design rules from docs/skills/patient-app-ux.md — minimum 20px text, 56px+ touch targets, warm colors, no complex navigation.
```

### PROMPT 6 — Patient App: Today's Plan Screen

```
Read docs/skills/patient-app-ux.md for task card templates and design rules.
Read docs/skills/design-system.md for colors and category colors.
Read docs/MVP_PLAN.md section "6. THE PATIENT APP — Screen 1: Today's Plan".

Build the Today's Plan screen at apps/patient-app/app/(tabs)/today.tsx.

This is the main screen — the heart of the patient experience.

1. Top section:
   - Time-of-day greeting: "Good morning, {name}! ☀️" (28px bold)
     Use patient name from stored household data.
     Morning (6-12): ☀️, Afternoon (12-18): 🌤️, Evening (18-22): 🌙
   - Progress bar: "4 of 7 activities done today 🌟" (18px)
     Visual bar underneath (8px height, Teal fill, rounded)
   - Encouraging micro-message below progress bar when >50% done

2. Time-of-day adaptive background:
   - Apply gradient backgrounds from docs/skills/patient-app-ux.md Time-of-Day Backgrounds section
   - Smooth transition based on current hour

3. Scrollable task timeline:
   - Fetch today's tasks using getTodaysTasks(householdId, dayOfWeek)
   - Fetch today's completions using getTodaysCompletions(householdId, date)
   - Sort by time ascending
   - Subscribe to real-time changes on care_plan_tasks (caregiver edits) and task_completions

4. Task Card component (each task):
   - States: upcoming, now, overdue, completed (see docs/skills/patient-app-ux.md Component Patterns)
   - "NOW" badge on the next upcoming uncompleted task (Teal pill badge, top-right)
   - Category emoji icon (from TASK_CATEGORIES constant)
   - Time (18px, muted)
   - Title (24px, bold, dark)
   - Hint text (20px, regular, warm gray) — this is the personalized instruction from the caregiver
   - "Done" button: full-width, 64px height, Primary Teal, white "✓ Done" text (20px bold)
   - On tap "Done": 
     a) Optimistic UI update (immediately show as completed)
     b) Play satisfying checkmark animation (Lottie or custom animated view)
     c) Call completeTask() to save to database
     d) Haptic feedback (expo-haptics light impact)
   - Completed card: collapsed (hide hint), muted colors, green checkmark, "Done at 9:12 AM"
   - Overdue card: light amber background (#FFFBEB), amber left border — NOT red, NOT alarming

5. Empty state:
   - If no tasks: "No activities planned for today. Your family is setting things up! 💙"
   - Centered, friendly, not an error

6. Offline support:
   - Cache today's tasks in AsyncStorage on each successful fetch
   - If offline: load from cache, show subtle offline banner at top
   - Queue task completions for sync when back online

All text must use t() from i18next. All colors from design system. All sizes per patient-app-ux.md rules.
```

### PROMPT 7 — Patient App: Help Tab (Contacts + Take Me Home)

```
Read docs/MVP_PLAN.md section "Screen 2: I Need Help" and the "Take Me Home" details.
Read docs/skills/patient-app-ux.md for design rules.

Build the Help tab at apps/patient-app/app/(tabs)/help.tsx.

This is the patient's safety screen. Two sections: Call Someone and Get Home Safely.

1. Install dependencies:
   npx expo install expo-linking expo-location expo-haptics

2. Screen layout:
   - Title: "I Need Help 💙" (28px bold)
   - Section 1: "Call Someone" header (20px, semibold)
   - Section 2: "Get Home Safely" header (20px, semibold)

3. CALL SOMEONE section:
   - Load emergency contacts from the patient profile (stored locally)
   - Each contact is a large button (full-width, 64px height):
     "📞 Ana (daughter)" — left-aligned icon + name + relationship
     Background: white card with border. Rounded corners.
   - On tap: immediately call via Linking.openURL(`tel:${phoneNumber}`)
     No confirmation dialog for family contacts.
   - Emergency number button at bottom:
     "🚨 Emergency (112)" — uses country-detected number
     Red background (#DC2626), white text
     On tap: show confirmation dialog "Are you sure you want to call emergency services?"
     Confirmed → call. Cancelled → dismiss.
   - Emergency number auto-detected from patient's country using getEmergencyNumber() from shared constants

4. GET HOME SAFELY section:
   - One large, prominent button: "🏠 TAKE ME HOME"
   - Design: Full-width, 80px height, Teal background, white text (24px bold)
   - Subtitle below button text: "Tap to get walking directions to your home" (16px)
   - This should be the most visually prominent element on the screen
   
   On tap:
   a) Get current GPS location using expo-location (request permission if needed)
   b) Send a silent alert to backend:
      createLocationAlert(householdId, {
        type: 'take_me_home_tapped',
        latitude: currentLat,
        longitude: currentLng
      })
      (Do this in background — don't block the navigation)
   c) Open Google Maps with walking directions to home:
      - Load home coordinates from patient profile (cached locally)
      - Android: Linking.openURL(`google.navigation:q=${homeLat},${homeLng}&mode=w`)
      - iOS: Try `comgooglemaps://?daddr=${homeLat},${homeLng}&directionsmode=walking`
      - Fallback iOS: `maps://app?daddr=${homeLat},${homeLng}&dirflg=w` (Apple Maps)
      - Fallback Android: `https://www.google.com/maps/dir/?api=1&destination=${homeLat},${homeLng}&travelmode=walking`
   d) Haptic feedback on tap (medium impact)

5. Offline behavior:
   - Emergency contacts: cached locally, phone calls work offline
   - Home coordinates: cached locally in AsyncStorage
   - "Take Me Home": Google Maps opens offline if area maps are cached. The silent alert to backend will queue and send when online.

6. Edge case: If home address not set yet (patient profile incomplete):
   - Hide the "Take Me Home" section entirely
   - Don't show an error — just omit it

All text via i18n t(). All sizes per patient-app-ux.md.
```

### PROMPT 8 — Patient App: Daily Check-In

```
Read docs/MVP_PLAN.md section "Screen 3: Daily Check-In".
Read docs/skills/patient-app-ux.md for design rules and emoji button template.

Build the daily check-in feature for the patient app.

1. Install: npx expo install expo-av (for voice recording)

2. Create a DailyCheckin component/screen at apps/patient-app/src/components/daily-checkin.tsx
   This appears as a full-screen modal overlay triggered by:
   a) A push notification at the caregiver-configured time
   b) A special task card in the Today's Plan timeline (category: health, title from i18n)

3. Check-in flow (single scrollable screen, one question leads to next):
   
   Step 1: Greeting
   - "Good morning, Maria! ☀️" (28px bold, time-appropriate greeting)
   - Warm, personal, uses patient name
   
   Step 2: Mood
   - "How are you feeling today?" (24px)
   - 3 large emoji buttons in a row (72px × 72px each):
     😊 Good   |   😐 Okay   |   😟 Not great
   - Emoji: 36px, label: 16px below
   - On tap: highlight selected (teal border, slight scale up), scroll to next question
   
   Step 3: Sleep
   - "Did you sleep well?" (24px)
   - 3 large emoji buttons:
     😴 Yes   |   🙂 So-so   |   😩 Not really
   - Same interaction pattern
   
   Step 4: Voice note (optional)
   - "Anything you want to tell your family?" (24px)
   - Large microphone button (80px circle, Teal background, white 🎤 icon)
   - Tap to start recording → button turns red with pulsing animation, text changes to "Recording..."
   - Tap again to stop → show playback controls (play/re-record)
   - "Skip" link below for those who don't want to record
   - Record using expo-av Audio.Recording
   - Upload to Supabase Storage (voice-notes bucket) in background
   
   Step 5: Submit
   - "Send to family" button (full-width, 64px height, Primary Teal)
   - On submit:
     a) Save to daily_checkins table via submitCheckin()
     b) Show thank-you screen: "Thank you! Your family will see this. 💙" (24px)
     c) Auto-dismiss after 3 seconds → return to Today's Plan
   
4. Prevent duplicate submissions:
   - Check if today's checkin already exists (getCheckin)
   - If already submitted: show a message "You already checked in today! 💙" instead of the form

5. All text via i18n. All sizes per patient-app-ux rules.
```

### PROMPT 9 — Patient App: Brain Wellness Activity

```
Read docs/MVP_PLAN.md section "Screen 4: Brain Wellness Activity".
Read docs/skills/patient-app-ux.md and docs/skills/regulatory-language.md.

Build the brain wellness activity component for the patient app.

1. Create BrainActivity component at apps/patient-app/src/components/brain-activity.tsx

2. This appears as a special task card in the Today's Plan timeline. When tapped, it expands to a full-screen activity view.

3. Activity screen layout:
   - "🧩 Today's Activity" heading (24px bold)
   - Activity prompt text (20px, warm color, centered)
     E.g., "What do you remember about your wedding day?"
   - Response area:
     a) Large microphone button (80px circle) — "🎤 Tap to share your memory"
     b) Recording state: pulsing red border, "Recording..." text
     c) After recording: playback controls
   - "Skip for today" ghost button at bottom (not prominent — it's okay to skip)

4. On response submission:
   - Upload audio to Supabase Storage
   - Call saveActivityResponse(activityId, transcriptText, audioUrl)
   - Transcription happens server-side (Edge Function triggers on audio upload)
   - Show positive feedback: randomly pick from i18n positive feedback array
     "What a wonderful memory! Thank you for sharing. 💙"
   - Auto-return to Today's Plan after 3 seconds

5. Data flow:
   - Fetch today's activity using getTodaysActivity(householdId, today)
   - If no activity exists: don't show the task card (AI generation is a backend cron job)
   - Activity prompt and type come from brain_activities table

6. Design:
   - Warm, inviting, never feels like a test
   - NEVER show scores, grades, or evaluation
   - Always celebrate the response regardless of content
   - Large text, calming colors, per patient-app-ux.md

7. Per docs/skills/regulatory-language.md:
   - Never call this "cognitive therapy" or "cognitive training"
   - UI label: "Brain Wellness Activity" or "Today's Activity"
   - Never evaluate or score responses
```

### PROMPT 10 — Patient App: Push Notifications + Offline

```
Build push notifications and solidify offline support for the patient app.

1. Install: npx expo install expo-notifications expo-device @react-native-async-storage/async-storage expo-haptics expo-network

2. Push notification setup:
   - Register for push notifications on app launch (after Care Code validated)
   - Save Expo push token to the patient's device_tokens in the patients table
   - Handle incoming notifications:
     a) Task reminder → scroll to that task in Today's Plan
     b) Check-in prompt → open DailyCheckin modal
   - Notification display: simple, clear text with task icon

3. Offline mode:
   - Create an OfflineManager utility at apps/patient-app/src/utils/offline-manager.ts
   - On each successful data fetch, cache to AsyncStorage:
     Key: 'cached_tasks_YYYY-MM-DD' → today's tasks
     Key: 'cached_patient_profile' → patient profile (name, home coords, emergency contacts)
     Key: 'cached_activity' → today's brain activity
   - On app launch: check network status (expo-network)
   - If offline: load from cache, show subtle banner "You're offline — your data will sync when connected"
   - Queue operations when offline:
     Key: 'pending_completions' → array of {taskId, date, completedAt}
     Key: 'pending_checkin' → checkin data
     Key: 'pending_location_alerts' → array of alerts
   - When network returns: flush all queued operations to Supabase
   - Show brief "Synced ✓" toast when queue is flushed

4. Test that the core flow works end-to-end:
   - Care Code → Today's Plan with tasks → complete a task → see it update
   - Help tab → contacts load → Take Me Home opens Google Maps
   - Check-in → submit → data saves
   - Verify all text uses i18n t() function
```

---

## PHASE 3: Caregiver Web App

### PROMPT 11 — Web App: Auth + Layout Shell

```
Read docs/skills/design-system.md for the full design system (colors, typography, spacing, Tailwind config).
Read docs/MVP_PLAN.md section "8. THE CAREGIVER WEB APP".

Set up the caregiver web app (apps/caregiver-web) with auth and app shell.

1. Install dependencies:
   npm install @supabase/ssr zustand lucide-react

2. Apply the Tailwind config from docs/skills/design-system.md (extend colors, fonts, border radius).

3. Install Inter font via next/font/google.

4. Supabase auth setup for Next.js:
   - Create src/lib/supabase/server.ts (server-side client using @supabase/ssr)
   - Create src/lib/supabase/client.ts (browser client)
   - Create src/lib/supabase/middleware.ts (session refresh middleware)
   - Update middleware.ts to protect /dashboard/* routes

5. Auth pages:
   - src/app/login/page.tsx — email + password form, Google OAuth button, Apple OAuth button, link to signup
   - src/app/signup/page.tsx — name + email + password form, same OAuth buttons, link to login
   - Clean, centered card layout on warm background (#FAFAF8)
   - OurTurn logo at top (text "OurTurn 💙" in Teal, 28px)
   - After auth: check if caregiver has a household → if not, redirect to /onboarding. If yes, redirect to /dashboard.

6. Dashboard layout shell:
   - src/app/(dashboard)/layout.tsx
   - Left sidebar (240px) with navigation links:
     📊 Dashboard, 📋 Care Plan, 📍 Location, 🤖 AI Coach, 👨‍👩‍👧 Family, 💙 Wellbeing, 📄 Reports, ⚙️ Settings
   - Use Lucide React icons (LayoutDashboard, ClipboardList, MapPin, Bot, Users, Heart, FileText, Settings)
   - Active link: Teal text + light teal background
   - Sidebar header: "OurTurn" logo + household/patient name below
   - Top bar: breadcrumb, notification bell icon (placeholder), user avatar + dropdown
   - Main content area with max-width 1200px, horizontal padding 24px
   - Responsive: sidebar collapses to hamburger menu on screens < 1024px

7. Create placeholder pages for each route:
   - src/app/(dashboard)/dashboard/page.tsx
   - src/app/(dashboard)/care-plan/page.tsx
   - src/app/(dashboard)/location/page.tsx
   - src/app/(dashboard)/coach/page.tsx
   - src/app/(dashboard)/family/page.tsx
   - src/app/(dashboard)/wellbeing/page.tsx
   - src/app/(dashboard)/reports/page.tsx
   - src/app/(dashboard)/settings/page.tsx
   Each with just a page title heading for now.
```

### PROMPT 12 — Web App: Onboarding Wizard

```
Read docs/MVP_PLAN.md section "Onboarding Flow (Caregiver App)" for all 6 steps.
Read docs/skills/design-system.md for form input styles.

Build the onboarding wizard at apps/caregiver-web/src/app/onboarding/page.tsx.

Multi-step form with progress bar. 6 steps. Data saves to Supabase on completion.

1. Progress bar at top showing steps 1-6, current step highlighted in Teal.

2. Step 1: About You
   - Name (pre-filled from signup)
   - Relationship to the person you care for (dropdown: Mother, Father, Spouse, Grandmother, Grandfather, Sibling, Friend, Other)
   - Country (dropdown with search, auto-detect from browser locale)

3. Step 2: About Your Loved One
   - Their first name (text input — this is used everywhere in the app)
   - Date of birth (date picker)
   - Type of dementia (optional dropdown: Alzheimer's, Vascular, Lewy Body, Frontotemporal, Mixed, Other, Not sure / prefer not to say)
   - Home address (text input with Google Places autocomplete if API key available, otherwise manual text + separate lat/lng fields for now)
   - Medications (dynamic list — each entry has: name, dosage, time of day, notes. "Add medication" button adds a new row. "Remove" button on each row)

4. Step 3: Their Life Story (this powers AI personalization)
   - Where they grew up (text)
   - Career / occupation (text)
   - Hobbies and interests (text, or tag-style input)
   - Favorite music / artists (text)
   - Favorite foods (text)
   - Important people (dynamic list: name + relationship)
   - Key life events (dynamic list: event description + approximate year)

5. Step 4: Daily Routine
   - Wake time (time picker, default 8:00)
   - Sleep time (time picker, default 21:00)
   - Meal times: breakfast, lunch, dinner (time pickers)
   - "Describe a typical day" (textarea, optional)
   - "Generate suggested plan" button → calls an Edge Function (or client-side for MVP) that creates a starter set of care plan tasks based on all the data entered so far. Show the suggested tasks in a preview list. Caregiver can check/uncheck which ones to keep.
   
   If Claude API is not set up yet, create a hardcoded starter plan:
   - Morning medication (9:00)
   - Breakfast (9:30)
   - Morning walk (10:30)
   - Brain wellness activity (11:00)
   - Lunch (12:30)
   - Afternoon social call (15:00)
   - Dinner (18:30)
   - Evening medication (20:00)

6. Step 5: Safety Setup
   - Review home address (show on mini map if possible, or just text)
   - Emergency contacts (dynamic list: name, phone number, relationship)
   - Alert toggles: safe zone exit, inactivity, night movement, Take Me Home (all default on)

7. Step 6: Your Care Code
   - Display the auto-generated 6-digit Care Code in LARGE text (48px, bold, Teal, monospace, letter-spaced)
   - "Copy code" button
   - Instructions: "Install OurTurn on your loved one's phone and enter this code to connect."
   - "Send code via SMS" (optional — text input for phone number + send button, or skip for MVP)
   - "Get Started" button → redirect to /dashboard

8. On completion: create all records in Supabase (household, patient, caregiver, care_plan_tasks).

Use Zustand to manage form state across steps. "Back" and "Next" buttons on every step. Validate required fields before allowing "Next". Save progress to localStorage in case of accidental browser close.
```

### PROMPT 13 — Web App: Dashboard

```
Read docs/MVP_PLAN.md section "8. THE CAREGIVER WEB APP — Web Dashboard Layout".
Read docs/skills/design-system.md for card styles.

Build the main dashboard at apps/caregiver-web/src/app/(dashboard)/dashboard/page.tsx.

2-column grid layout on desktop, single column on mobile.

1. Greeting header:
   - "Good morning, Ana" (24px bold) — time-of-day aware, uses caregiver name
   - "{patient_name}'s day is going well 💚" status line (16px) — green if >50% tasks done, amber if <50%

2. Dashboard cards (each is a reusable DashboardCard component with title, optional "View more →" link):

   Card: TODAY'S STATUS
   - Fetch tasks + completions via real-time subscription (useRealtimeCompletions hook)
   - Show: "3 of 7 tasks done" with progress bar
   - List each task: icon + title + status (✓ done / time if upcoming / overdue badge)
   - Link: "Edit plan →" → /care-plan

   Card: DAILY CHECK-IN
   - Fetch today's checkin via getCheckin()
   - If submitted: show mood emoji + label, sleep emoji + label, voice note with play button (HTML5 audio player), transcript if available
   - If not submitted yet: "No check-in yet today" with muted text

   Card: LOCATION
   - Fetch latest location via getLatestLocation()
   - Show: "📍 {name} is at {label}" + "Last updated: {time ago}"
   - Mini map preview (Google Maps embed, 200px height) showing patient marker
   - Link: "Full map →" → /location
   - If "Take Me Home" was tapped recently: show an alert banner in this card

   Card: AI INSIGHTS
   - Fetch from a new insights table or generate client-side from recent checkin data
   - For MVP: simple pattern detection client-side:
     "Maria reported poor sleep 4 of 7 days" (if sleep_quality was 3+ days ≤1)
     "Mood tends to be better on walk days" (if correlation exists)
   - Link: "Chat with AI Coach →" → /coach

   Card: CARE JOURNAL (Recent)
   - Fetch last 5 entries via getEntries()
   - Show: author name, timestamp, content preview (truncated to 2 lines)
   - "Add note" button (opens inline form or modal)
   - Link: "View all →" → /family

3. All data should use Supabase Realtime subscriptions where applicable (task completions, location). Show loading skeletons (gray pulsing blocks) while data loads.

4. Empty states: friendly messages for new users before patient has used the app. E.g., "Waiting for {name} to connect the patient app. Share the Care Code: {code}"
```

### PROMPT 14 — Web App: Care Plan Builder

```
Read docs/MVP_PLAN.md section "Web Care Plan Builder" for the table layout.
Read docs/skills/design-system.md for component styles.
Read docs/skills/regulatory-language.md — the hint field instructions must use appropriate language.

Build the care plan builder at apps/caregiver-web/src/app/(dashboard)/care-plan/page.tsx.

1. Page header: "{patient_name}'s Daily Plan" (24px bold)

2. Day selector: 7 buttons in a row (Mon-Sun), active day highlighted in Teal. Default to today.

3. Task table (visible on desktop, switches to card list on mobile):
   - Columns: Time | Category | Task Title | Instructions | Actions
   - Each row shows one task for the selected day
   - Sort by time ascending
   - Category shown as emoji + color badge
   - "Instructions" column shows the hint_text (the text the patient sees)
   - Actions: Edit (pencil icon), Delete (trash icon with confirmation dialog)

4. Inline editing: Click any cell to edit it directly. Or click Edit to open a modal with all fields.

5. Add Task modal/drawer:
   - Category (dropdown with emoji icons and colored labels)
   - Title (text input)
   - Time (time picker)
   - Instructions / Hint (textarea with helper text: "This is what {patient_name} will see. Be specific and personal. E.g., 'Your pills are in the kitchen counter pill box, Tuesday section.'")
   - Recurrence: Daily / Specific days (show day checkboxes) / One-time (show date picker)
   - "Save" button → creates task via createTask(), real-time sync sends to patient app
   - Show "Saved ✓" toast on success

6. "Copy day to..." button: Select source day, pick target days, copies all tasks.

7. "🤖 AI Suggest Tasks" button:
   - For MVP: show 5 hardcoded suggestions based on FINGER domains that aren't covered yet
   - E.g., if no physical activity task exists, suggest "Morning Walk"
   - Each suggestion has: Accept ✓ / Edit ✏️ / Dismiss ✕ buttons
   - Accepted tasks are created immediately
   - Later: this will call Claude API via Edge Function with patient profile context

8. Real-time: When a task is created/edited/deleted, it should sync to the patient app within seconds via Supabase Realtime. Show a subtle indicator: "Changes sync instantly to {patient_name}'s app."

9. Handle the care plan hint_text per regulatory language rules — the placeholder/helper text should guide caregivers to write personal, specific instructions without using medical terminology.
```

### PROMPT 15 — Web App: Location & Safety

```
Read docs/MVP_PLAN.md section "Tab 3: Location & Safety" and the "Take Me Home" alert details.
Read docs/skills/design-system.md for styles.

Build the location page at apps/caregiver-web/src/app/(dashboard)/location/page.tsx.

1. Install: npm install @vis.gl/react-google-maps (or use Google Maps JavaScript API with react wrapper)

2. Main layout: Map (60% width on desktop) + sidebar panel (40%) on right. Full-width stacked on mobile.

3. MAP:
   - Full Google Maps embed
   - Patient's current position as a marker (use latest location_log)
   - Safe zones as semi-transparent colored circles on the map
   - If "Take Me Home" was tapped in the last 24h: show a special marker at that location with a 🏠 icon
   - Auto-center on patient's position
   - Refresh position every 30 seconds (poll getLatestLocation or use Realtime subscription)

4. SIDEBAR — 3 collapsible sections:

   Section: Safe Zones
   - List of all safe zones with name, radius, active toggle
   - "Add Safe Zone" button → mode: click on map to place center, then enter name and radius in a form
   - Edit zone: change name, radius. Click map to move center.
   - Delete zone (with confirmation)

   Section: Alert Settings
   - Toggle switches for each alert type:
     "Notify when {name} leaves a safe zone" — on/off
     "Notify when no movement for [dropdown: 1h, 2h, 3h, 4h] hours" — on/off + duration
     "Notify when {name} is outside after [time picker]" — on/off + time
     "Notify when {name} taps 'Take Me Home'" — on/off (default on, always recommend on)
   - Save preferences to caregiver's notification_preferences

   Section: Location History
   - Date picker (default: today)
   - Timeline list: "8:00 AM — At home" / "10:35 AM — Left home" / "10:40 AM — At park" / "11:05 AM — Returned home"
   - Derive from location_logs for the selected date
   - Label locations: "Home" if within home safe zone, zone name if in a zone, "Unknown" otherwise

5. TAKE ME HOME ALERT LOG:
   - If any take_me_home_tapped alerts exist in the last 7 days, show a banner at the top:
     "🏠 {name} tapped 'Take Me Home' on {date} at {time} from {location}"
   - Link to that location on the map

6. Map fallback: If Google Maps API key is not configured, show a simple display of coordinates + text-based location info instead of a full map. The page should still be functional.
```

### PROMPT 16 — Web App: AI Care Coach

```
Read docs/skills/ai-integration.md for the full AI architecture, system prompt, and streaming patterns.
Read docs/skills/regulatory-language.md for language rules.
Read docs/MVP_PLAN.md section "Tab 4: AI Care Coach".

Build the AI Care Coach at apps/caregiver-web/src/app/(dashboard)/coach/page.tsx.

1. Create the Edge Function first: supabase/functions/ai-coach-chat/index.ts
   - Receives: { message, conversation_id, household_id }
   - Loads context: patient profile + biography, recent checkins (7 days), current care plan tasks, recent journal entries, conversation history
   - Builds system prompt from docs/skills/ai-integration.md (the full system prompt template with all placeholders filled)
   - Calls Anthropic Claude API (claude-sonnet-4-20250514) with streaming
   - Returns Server-Sent Events stream
   - Saves assistant message to ai_conversations on completion
   - If ANTHROPIC_API_KEY is not set: return a friendly mock response for development

2. Chat UI:
   - Full-height chat area (flexbox, grows to fill)
   - Messages: user bubbles (right-aligned, light teal bg) + AI bubbles (left-aligned, white bg with border)
   - AI avatar: 🤖 icon or small teal circle with sparkle
   - Typing indicator: three animated dots while AI is responding
   - Markdown rendering in AI responses (use react-markdown)
   - Auto-scroll to bottom on new messages

3. Input area (fixed at bottom):
   - Text input (multiline, auto-grow up to 4 lines)
   - Send button (Teal, arrow icon)
   - Enter to send, Shift+Enter for new line

4. Suggested topics (shown when conversation is empty):
   - Chips/buttons above the input:
     "How do I handle sundowning?"
     "What activities work for rainy days?"
     "Help me talk to my siblings about sharing care"
     "{patient_name} refuses to eat. Help."
     "How do I handle repetitive questions?"
   - Clicking a chip sends it as a message

5. Parse AI responses for special blocks (from docs/skills/ai-integration.md):
   - [CARE_PLAN_SUGGESTION] → render as a card with "Add to care plan" button
     On click: create the task via createTask() and show success toast
   - [DOCTOR_NOTE] → render as a card with "Add to doctor notes" button
     On click: save note for the report generator

6. Conversation management:
   - Left sidebar (collapsible): list of past conversations by date
   - "New conversation" button at top
   - Each conversation shows first message as preview

7. Disclaimer always visible at top of chat:
   "I'm here to support you, not replace medical advice. For health concerns, always consult your doctor."
   (Styled as a subtle info banner, not alarming)

8. Rate limiting: Track messages sent. Free tier: show upgrade prompt after 5 messages/month. Paid: unlimited.
```

### PROMPT 17 — Web App: Family, Wellbeing, Reports, Settings

```
Read docs/MVP_PLAN.md sections for Family Circle, Caregiver Wellbeing, and Doctor Visit Reports.
Read docs/skills/regulatory-language.md for report disclaimer language.

Build the remaining 4 web app pages:

1. FAMILY CIRCLE — src/app/(dashboard)/family/page.tsx
   - Care Team list: all caregivers with name, relationship, role badge (Primary/Family)
   - "Invite Family Member" button → modal with email input + relationship + role selector → calls inviteCaregiver()
   - Care Code display card: large code, "Copy" button, "Regenerate" button (with warning dialog)
   - Care Journal section below:
     - Chronological list of entries (author avatar/initial, name, timestamp, content, type badge)
     - "Add note" button → inline form or modal (textarea + entry type radio: Observation/Note/Milestone)
     - Pagination or infinite scroll
     - Filter by author or entry type (optional for MVP)

2. CAREGIVER WELLBEING — src/app/(dashboard)/wellbeing/page.tsx
   - "How are YOU doing, {name}? 💙" heading
   - Mood selector: 5 buttons (Good 😊, Okay 😐, Tired 😫, Stressed 😰, Overwhelmed 😢)
   - Weekly self-care checklist: 6 checkboxes (from i18n strings — took break, ate well, talked to friend, did something enjoyable, exercise, sleep)
   - "Save" saves to caregiver_wellbeing_logs
   - Mood history: simple visual of last 14 days (emoji row or small line chart)
   - Burnout detection: if mood ≤ 2 for 3+ consecutive days, show an amber banner: "You've been feeling stressed lately. That's completely understandable." with links to AI Coach and support resources
   - Support Resources card: list of helplines based on caregiver's country + links to WHO iSupport, local Alzheimer's association
   - Inspirational quote: "Remember: You can't pour from an empty cup. Your wellbeing matters too."

3. DOCTOR VISIT REPORTS — src/app/(dashboard)/reports/page.tsx
   - Date range selector (preset: Last 30 days, Last 60 days, Last 90 days, Custom)
   - Checkboxes for what to include (from i18n strings: mood trends, sleep patterns, activity completion, medication adherence, journal notes, location patterns, caregiver concerns)
   - "Additional notes for the doctor" textarea
   - "Generate Report" button
   - For MVP: aggregate data client-side and format into a clean HTML report
     (Later: Edge Function with Claude for narrative summary)
   - Report preview: rendered in a clean, printable card
     Header: "OurTurn Care Summary — {Patient Name}"
     Period, sections with simple data summaries
     Disclaimer at bottom (from regulatory-language.md)
   - Action buttons: Print (window.print with print CSS), Download PDF (html2pdf.js), Email (future)

4. SETTINGS — src/app/(dashboard)/settings/page.tsx
   - Account section: name, email (read-only), change password
   - Subscription: current plan, upgrade/manage button
   - Notifications: toggle email alerts, daily summary time picker
   - Language: dropdown (only English for MVP, structure ready for more)
   - Privacy: link to privacy policy, "Export My Data" button (calls data export Edge Function), "Delete Account" button (with strong confirmation dialog — types "DELETE" to confirm)
   - About: app version, links to terms, privacy policy, "OurTurn is not a medical device" disclaimer
```

---

## PHASE 4: Caregiver Mobile App

### PROMPT 18 — Caregiver Mobile App: Full Build

```
Read docs/MVP_PLAN.md section "7. THE CAREGIVER APP (MOBILE)".
The caregiver mobile app mirrors the web app but optimized for mobile.

Build the caregiver mobile app at apps/caregiver-app/ using Expo Router.

Since all Supabase queries and shared types already exist, this app reuses everything from packages/supabase and packages/shared.

1. Install dependencies:
   npx expo install expo-router expo-linking expo-notifications expo-secure-store react-native-safe-area-context react-native-screens @react-native-async-storage/async-storage

2. Set up Expo Router with:
   - app/_layout.tsx — root layout, auth check
   - app/login.tsx — login screen (email + password, Google/Apple OAuth)
   - app/signup.tsx — signup screen
   - app/onboarding/ — simplified onboarding flow (same steps as web but mobile-optimized with bottom sheet modals instead of sidebar panels)
   - app/(tabs)/_layout.tsx — 5-tab navigation

3. Tab navigation (5 tabs):
   📊 Dashboard | 📋 Plan | 📍 Location | 🤖 Coach | ☰ More

4. Dashboard tab (app/(tabs)/dashboard.tsx):
   - Mirrors web dashboard in single-column mobile layout
   - Pull-to-refresh
   - Same data cards: Today's Status, Check-In, Location, Insights
   - Quick action: tap phone icon to call patient

5. Care Plan tab (app/(tabs)/plan.tsx):
   - Day selector as horizontal scrollable pills (Mon-Sun)
   - Task list (card-based, not table)
   - Tap task to edit (bottom sheet modal with form)
   - "+" FAB button to add task (bottom sheet)
   - Swipe-to-delete with confirmation

6. Location tab (app/(tabs)/location.tsx):
   - Full-screen map (react-native-maps)
   - Patient marker + safe zone circles
   - Bottom sheet with: safe zone list, alert toggles, location history
   - "Take Me Home" alert indicator

7. AI Coach tab (app/(tabs)/coach.tsx):
   - Same chat UI as web, adapted for mobile
   - Keyboard-avoiding input at bottom
   - Same Edge Function for AI responses (streaming via EventSource or fetch with reader)
   - Suggested topic chips horizontally scrollable

8. More tab (app/(tabs)/more.tsx):
   - List menu linking to:
     Family Circle (separate screen)
     Wellbeing (separate screen)
     Reports (view web-generated reports, link to web for full generation)
     Settings (account, notifications, Care Code display, subscription)
     Care Code card (prominently displayed with Copy button)

9. Push notifications:
   - Register for push tokens on login
   - Handle notification types: safety alerts, task completions, check-in received, daily summary
   - Safety alerts (left safe zone, Take Me Home) → navigate to Location tab
   - Task completed → brief toast notification

Reuse all queries from packages/supabase. Reuse all types from packages/shared. Use i18n for all strings.
```

---

## PHASE 5: Integration + Polish

### PROMPT 19 — Real-Time Sync + Notification System

```
Read docs/skills/supabase-patterns.md for Realtime and Edge Function patterns.

Build the real-time sync and notification infrastructure:

1. Create reusable Realtime hooks in packages/supabase/hooks/:
   - useRealtimeCompletions(householdId) — subscribes to task_completions INSERT
   - useRealtimeCheckins(householdId) — subscribes to daily_checkins INSERT/UPDATE
   - useRealtimeTasks(householdId) — subscribes to care_plan_tasks INSERT/UPDATE/DELETE
   - useRealtimeLocation(householdId) — subscribes to location_logs INSERT
   - useRealtimeAlerts(householdId) — subscribes to location_alerts INSERT
   - useRealtimeJournal(householdId) — subscribes to care_journal_entries INSERT
   
   Each hook: fetches initial data, subscribes to changes, returns reactive state.
   Clean up subscriptions on unmount.

2. Replace direct queries with these hooks in all dashboard/list views across all 3 apps.

3. Edge Function: supabase/functions/send-push-notification/index.ts
   - Triggered by database webhook on INSERT to: location_alerts, task_completions
   - Loads caregiver device tokens from caregivers table + associated device_tokens
   - Sends push notification via Expo Push API (https://exp.host/--/api/v2/push/send)
   - Notification content varies by trigger type (use notification i18n strings)
   - Also sends email notification via Resend if caregiver has email_notifications enabled

4. Edge Function: supabase/functions/daily-summary/index.ts  
   - Scheduled via cron (runs at 20:00 for each timezone — or simplified: runs every hour and checks which households' 8pm it is)
   - Aggregates: tasks completed/total, checkin mood/sleep, notable events
   - Sends push + email: "{name}'s day: 5/7 tasks done. Mood: 😊 Good."

5. Set up database webhooks in Supabase Dashboard (document the configuration needed):
   - INSERT on location_alerts → call send-push-notification
   - INSERT on task_completions → call send-push-notification (optional, can be noisy — make configurable)

6. Test real-time flow end-to-end:
   - Patient completes task → caregiver dashboard updates instantly (both web and mobile)
   - Caregiver edits care plan on web → patient app updates instantly
   - Patient taps "Take Me Home" → caregiver gets push notification within seconds
```

### PROMPT 20 — Subscriptions + Final Polish

```
Build the subscription system and do a final polish pass.

1. SUBSCRIPTIONS:

   Mobile (RevenueCat):
   - npm install react-native-purchases in both mobile apps
   - Configure RevenueCat with App Store + Play Store products:
     ourturn_plus_monthly ($12.99)
     ourturn_plus_annual ($99.99)
   - Create a Paywall component shown when free user hits a premium feature
   - On purchase: webhook from RevenueCat → Supabase Edge Function → update households.subscription_status to 'plus'

   Web (Stripe):
   - npm install stripe @stripe/stripe-js in caregiver-web
   - Stripe Checkout session created by Edge Function
   - On success: Stripe webhook → Edge Function → update households.subscription_status
   - Customer portal link for managing subscription

   Feature gating:
   - Create packages/shared/utils/subscription.ts:
     isFreeTier(household) → boolean
     canUseFeature(household, feature) → boolean
     FREE_LIMITS = { maxTasks: 5, maxCaregivers: 1, aiMessages: 5 }
   - In UI: when free user tries a premium feature, show upgrade prompt (not a hard block — let them see what they're missing)

2. VOICE NOTE PIPELINE:
   - Edge Function: supabase/functions/transcribe-voice-note/index.ts
   - Triggered by Supabase Storage webhook when file uploaded to voice-notes bucket
   - Downloads audio, converts to base64, sends to Gemini 2.5 Flash for transcription
   - Saves transcript back to daily_checkins.voice_note_transcript or brain_activities.patient_response_text
   - If GOOGLE_AI_API_KEY not set: skip transcription gracefully

3. FINAL POLISH:
   - Run through ALL screens on all 3 platforms and verify:
     a) All text uses i18n t() (no hardcoded strings)
     b) Patient app: all text ≥ 20px, all touch targets ≥ 56px
     c) No medical/diagnostic language anywhere (per regulatory-language.md)
     d) Loading states on all data-dependent views
     e) Error states with friendly messages
     f) Empty states for new users
     g) Disclaimers on AI Coach and Reports screens
   - Add app icons and splash screens (use Expo's app.json config)
   - Set up proper error boundaries on all page roots
   - Add analytics events for key actions (task completed, checkin submitted, coach message sent, Take Me Home tapped)

4. Create deployment guide:
   - Supabase: apply migration, set up webhooks, deploy Edge Functions
   - Mobile: expo build for iOS and Android, submit to stores
   - Web: deploy to Vercel (connect git repo, set env vars)

Update CLAUDE.md "Current Build Status" — check off all completed items.
```

---

## DONE 🎉

After completing all 20 prompts, you should have:

- ✅ Patient app (iOS + Android) with code entry, daily plan, help + Take Me Home, check-in, brain activities
- ✅ Caregiver web app with full dashboard, care plan builder, location map, AI Coach, family circle, wellbeing, reports
- ✅ Caregiver mobile app mirroring web features
- ✅ Real-time sync across all 3 platforms
- ✅ Push + email notifications
- ✅ Subscription system (mobile + web)
- ✅ Voice note recording + transcription
- ✅ GDPR-compliant, i18n-ready, no medical device language

**Next steps after the 20 prompts:**
1. Private beta with 50 families
2. Iterate based on feedback
3. Add localization (German first, based on demand)
4. App Store / Play Store submission
5. Launch 🚀
