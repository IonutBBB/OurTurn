# Full-Stack Testing Guide for OurTurn

> **Comprehensive testing prompt for all three OurTurn apps.**
> Covers: Caregiver Web Dashboard, Caregiver Mobile App, and Patient Companion App.

---

## Project Context

OurTurn is a digital wellness platform for daily dementia home care, consisting of three coordinated applications:

| App                         | Stack                        | Primary Users                      | Location                   |
| --------------------------- | ---------------------------- | ---------------------------------- | -------------------------- |
| **Caregiver Web Dashboard** | Next.js 14+, Supabase        | Adult children / family caregivers | `apps/caregiver-web/`      |
| **Caregiver Mobile App**    | React Native (Expo)          | Caregivers on the go               | `apps/caregiver-app/`      |
| **Patient Companion App**   | React Native (Expo)          | People with early-stage dementia   | `apps/patient-app/`        |

### Critical Testing Requirements

- **Accessibility (Patient App)**: 20px minimum font size, large touch targets, high contrast (WCAG 2.2 AAA for cognitive impairment)
- **Accessibility (Caregiver Apps)**: 16px minimum font size, 44px+ touch targets, WCAG 2.1 AA
- **Regulatory**: This is a **wellness app, NOT a medical device** -- no diagnostic/medical language in UI
- **Safety**: Crisis hub, SOS, and "Take Me Home" must always be reachable and functional
- **Localization**: 24 EU languages -- verify no untranslated strings or hardcoded text
- **Offline**: Patient app must work offline (cached plan, queued writes)

---

## PART 1 -- Claude-in-Chrome: Web Dashboard Testing

### How to Launch

```bash
claude --chrome
```

### Master Prompt -- Exploratory Dashboard Testing

```
You are a QA engineer testing the OurTurn caregiver web dashboard.
The app is running at http://localhost:3000.

TESTING PRIORITIES (in order):
1. Critical safety flows (Crisis Hub access, emergency contacts, SOS)
2. Core caregiver workflows (Care Plan, daily schedule, task management)
3. AI-powered features (Care Coach, task suggestions, behaviour insights)
4. Family coordination features (Family Circle, Care Journal, Care Code sharing)
5. Caregiver wellbeing features (Toolkit, mood tracking, burnout detection)
6. Accessibility compliance
7. Edge cases and error handling

FOR EVERY SCREEN YOU VISIT:
- Check accessibility: contrast ratios, font sizes, touch target sizes, keyboard navigation
- Check for untranslated strings (switch language to DE and back to EN)
- Check loading states, error states, and empty states
- Verify Supabase data persists after page refresh
- Note any console errors or warnings
- Verify dark mode renders correctly (toggle theme)

REPORT FORMAT:
After each flow, produce a structured report:
## [Flow Name]
- **Status**: PASS / FAIL / PARTIAL
- **Steps taken**: numbered list of actions
- **Issues found**: severity (CRITICAL/HIGH/MEDIUM/LOW), description, screenshot reference
- **Accessibility notes**: any violations found
- **Suggestions**: UX or functional improvements
```

### Flow-Specific Prompts

#### 1. Authentication & Onboarding

```
TEST: Authentication and Onboarding Flow

1. Navigate to http://localhost:3000
2. Verify the landing page renders with OurTurn branding
3. Test signup flow:
   - Click "Start Free Trial" or signup link
   - Test OAuth buttons (Google, Apple) are present
   - Test email/password signup:
     - Empty form submission -> expect validation errors
     - Password < 8 chars -> expect length validation
     - Password mismatch -> expect match validation
     - Valid submission -> redirect to /onboarding
4. Test the 6-step onboarding wizard:
   - Step 1: About You (caregiver name, relationship, country)
   - Step 2: About Loved One (patient name, DOB, dementia type, address)
   - Step 3: Life Story (biography, childhood, career, hobbies, music, foods)
   - Step 4: Daily Routine (wake/sleep times, meal times)
   - Step 5: Safety (emergency contacts array)
   - Step 6: Care Code (generated 6-digit code display)
   - Verify progress indicators work
   - Test back navigation within onboarding
   - Verify data saves between steps (localStorage persistence)
5. Test login flow:
   - Valid credentials -> redirect to /dashboard
   - Invalid credentials -> clear error message
   - Forgot password link -> /forgot-password page
6. Test logout and session persistence

Record a GIF of the complete onboarding flow.
```

#### 2. Care Plan & Task Management

```
TEST: Care Plan Builder and Task Management

1. Navigate to /care-plan from the sidebar
2. Verify the task grid/table renders with:
   - Correct categorization (health, nutrition, medication, physical, cognitive, social, other)
   - Category color coding with icons
   - Time-based scheduling
3. Test task CRUD operations:
   - Add a new task with category, time, and description
   - Edit an existing task inline
   - Delete a task (verify confirmation dialog)
   - Verify changes persist after page refresh
4. Test AI-powered task suggestions:
   - Click "AI Suggest" or similar
   - Verify suggestions are evidence-based
   - Accept a suggestion -> adds to plan
   - Dismiss a suggestion -> removes from list
   - Verify subscription gating (if applicable via UpgradeGate)
5. Verify real-time sync:
   - Open /care-plan in two browser tabs
   - Add a task in Tab 1 -> verify it appears in Tab 2 without refresh
6. Check accessibility:
   - Keyboard navigation through the task grid
   - Screen reader labels on interactive elements
   - Color coding also indicated by icons/text (not color-only)

Take screenshots of: empty plan state, populated plan, AI suggestions, and any errors.
```

#### 3. Crisis Hub

```
TEST: Crisis Hub -- CRITICAL SAFETY FEATURE

This is the highest-priority test. All crisis scenarios must work flawlessly.

1. Navigate to /crisis from the sidebar
2. Verify it is accessible within 2 clicks from any screen
3. Verify the Crisis Status Panel renders (latest location, patient status)
4. Test the Scenario Grid -- verify all scenarios load:
   - Each scenario card should have clear title, icon, and description
   - Common scenarios: refusing to eat, aggression, wandering, sundowning, etc.
5. For EACH scenario, tap into the Scenario Guide and verify:
   - Step-by-step progression with step cards (next/back)
   - Clear, large text
   - Personalization box (custom calming strategies for the patient)
   - No medical advice that could trigger regulatory issues
   - Content is available in the selected language
6. Test the Crisis Logger:
   - Log an incident with details and severity
   - Verify it saves to Supabase
7. Test the Breathing Timer:
   - Start the de-escalation breathing exercise
   - Verify timer animation works correctly
8. Test Pattern Insights:
   - Verify AI-generated 30-day pattern analysis displays
9. Test Remote Actions:
   - "Alert Family" button -> verify notification dispatch
   - Emergency contacts displayed with clickable phone numbers
   - Country-aware emergency numbers (auto-detected)
10. Test Support Resources:
    - Crisis hotlines display for the correct country
11. Verify the Crisis Hub is reachable even if other parts of the app error out

Record a GIF of navigating from dashboard -> Crisis Hub -> completing one full scenario.
```

#### 4. AI Care Coach

```
TEST: AI Care Coach -- Streaming Chat with Safety Pipeline

1. Navigate to /coach from the sidebar
2. Verify the Coach Hub renders with:
   - Proactive Insight Card (daily AI-generated insight)
   - Situation Cards (refusing food, agitated, sundowning, etc.)
   - Workflow Cards (plan tomorrow, doctor visit, review week, adjust plan)
   - Open Chat Input field
3. Test the AI Safety Architecture (4-tier pipeline):
   - RED tier: Type a crisis message (e.g., "I want to hurt myself")
     -> must show static crisis response, NO AI call, emergency resources
   - ORANGE tier: Type a medical request (e.g., "should I increase her donepezil?")
     -> must redirect to medical professional, add disclaimer
   - YELLOW tier: Type an emotional message (e.g., "I feel so overwhelmed")
     -> must respond with empathy + caregiver resources
   - GREEN tier: Type a general care question (e.g., "tips for sundowning?")
     -> must provide evidence-based answer with streaming
4. Test streaming responses:
   - Verify tokens stream in real-time (not all at once)
   - Verify loading indicator during response
5. Test Situation Cards:
   - Click a situation card -> should pre-fill chat context
   - Verify response is relevant to the specific situation
6. Test Workflow Cards:
   - "Plan Tomorrow" -> generates structured daily plan
   - "Doctor Visit" -> generates structured visit report
7. Navigate to /coach/behaviours (Behaviour Playbook):
   - Verify playbook grid loads with behaviour categories
   - Click a playbook -> detail view with strategies
   - Test incident logger -> log a behaviour incident
   - Verify timeline shows logged incidents
   - Check pattern insights (30-day analysis)
8. Navigate to /coach/resources (Resources Tab):
   - Verify journey guide progress tracking
   - Verify knowledge library articles load
   - Verify local support directory (filtered by country)
   - Test article detail view with markdown rendering
9. Verify accessibility:
   - Large input field with clear placeholder
   - Messages are readable (contrast, font size)
   - Keyboard-accessible send button

Take screenshots of: safety tier responses, streaming in action, and behaviour playbook.
```

#### 5. Caregiver Wellbeing (Toolkit)

```
TEST: Caregiver Toolkit & Wellbeing Features

1. Navigate to /wellbeing from the sidebar
2. Test the Slider Check-in:
   - Rate mood, energy, and stress levels
   - Verify sliders are responsive and save data
3. Test Daily Goal:
   - Set a wellness goal
   - Mark it complete
4. Test Quick Relief / Self-Care Exercises:
   - Browse available exercises
   - Play an exercise (audio/video)
   - Verify exercise player works
5. Test Wellness Trends:
   - Verify charts render (mood, energy, stress over time)
   - Check chart accessibility (not color-only)
6. Test the Burnout Warning Banner:
   - Verify it appears when 3+ days of high stress or low energy
   - Verify it links to support resources
7. Test SOS Button:
   - Click SOS -> verify modal opens
   - Select a reason
   - Verify contact options display (family, crisis hotline)
8. Test Help Request Flow:
   - Submit a structured help request
   - Verify multi-step workflow
9. Navigate to /wellbeing/insights:
   - Verify weekly insights tab loads
   - Check 28-day pattern analysis
10. Test Wellbeing Agent (AI):
    - Chat about caregiver self-care
    - Verify safety pipeline applies here too

Take screenshots of: slider check-in, wellness trends chart, burnout banner, SOS modal.
```

#### 6. Family Coordination

```
TEST: Family Circle & Care Journal

1. Navigate to /family from the sidebar
2. Test Family tab:
   - View list of caregivers (primary + invited)
   - Copy Care Code (6-digit code)
   - Invite a family member (verify subscription gating if applicable)
   - Change a member's role
   - Remove a family member (verify confirmation dialog)
3. Test Journal tab:
   - Add a new journal entry (observation, note, milestone, crisis)
   - Verify entry shows author name and timestamp
   - Edit an existing entry
   - Delete an entry (verify confirmation)
4. Test real-time sync:
   - Open /family in two browser tabs
   - Add a journal entry in Tab 1 -> verify it appears in Tab 2

Take screenshots of: family member list, Care Code display, journal entries.
```

#### 7. Location & Safety

```
TEST: Location Tracking & Safe Zones

1. Navigate to /location from the sidebar
2. Verify Google Maps renders with patient's location history
3. Test today's location timeline:
   - Verify location points display on map
   - Check timestamp accuracy
4. Test Safe Zone management:
   - Create a new safe zone (name, center, radius)
   - Edit an existing safe zone
   - Delete a safe zone (verify confirmation)
   - Verify zones render as circles on the map
5. Test Location Alerts:
   - Verify recent alerts display (last 24h)
   - Alert types: left_safe_zone, inactive, night_movement, take_me_home_tapped, sos_triggered
   - Verify alert severity indicators
6. Check the device status indicator:
   - Patient online/offline status
   - Last seen timestamp

Take screenshots of: map with safe zones, alert list, empty state.
```

#### 8. Doctor Reports

```
TEST: Doctor Visit Report Generator

1. Navigate to /reports from the sidebar
2. Test report generation:
   - Select a date range
   - Generate a structured report
   - Verify report contains: task completions, check-in data, behaviour incidents
3. Test report history:
   - Verify previous reports display (most recent first)
   - Click to view a past report
4. Test export functionality (PDF/print)
5. Verify no medical/diagnostic language in generated reports

Take screenshots of: report generation form, generated report, report history.
```

#### 9. Settings

```
TEST: Settings Page (5 Sections)

1. Navigate to /settings from the sidebar
2. Test Patient Information section:
   - Edit patient name, DOB, dementia type
   - Edit home address (for Take Me Home)
   - Verify changes persist
3. Test Life Story section:
   - Edit biography (childhood, career, hobbies, music, foods)
   - Verify JSONB data saves correctly
4. Test Daily Schedule section:
   - Edit wake/sleep times, meal times
5. Test Emergency Contacts section:
   - Add a new emergency contact
   - Edit an existing contact
   - Remove a contact
   - Verify JSONB array updates correctly
6. Test Subscription section:
   - View current subscription status
   - Verify Stripe portal link works
7. Test Care Code display:
   - Verify 6-digit code is visible
   - Copy to clipboard works
8. Test GDPR features:
   - Data Export button -> verify download
   - Account Deletion -> verify confirmation dialog and flow

Take screenshots of: each settings section, Care Code display.
```

#### 10. Full Accessibility Audit

```
TEST: Comprehensive Accessibility Audit (WCAG 2.2 AA)

Run this audit across ALL main screens of the dashboard.

CHECK EACH SCREEN FOR:

VISUAL:
- [ ] Font size >= 16px for body text
- [ ] Contrast ratio >= 4.5:1 for text (AA level)
- [ ] Contrast ratio >= 3:1 for large text and UI components
- [ ] No information conveyed by color alone
- [ ] Clear visual hierarchy
- [ ] Dark mode renders correctly

INTERACTION:
- [ ] Touch targets >= 44px x 44px
- [ ] Adequate spacing between interactive elements (>= 8px)
- [ ] No time-limited interactions (or generous timeout with warning)
- [ ] Clear focus indicators for keyboard navigation
- [ ] Tab order follows logical reading order

COGNITIVE:
- [ ] Simple, plain language (no medical jargon)
- [ ] Consistent navigation across all pages
- [ ] Clear error messages with recovery instructions
- [ ] Confirmation dialogs for destructive actions
- [ ] Progress indicators for multi-step processes
- [ ] No auto-playing media or animations

TECHNICAL:
- [ ] All images have meaningful alt text
- [ ] Form inputs have associated labels
- [ ] ARIA landmarks and roles are correct
- [ ] Heading hierarchy is logical (no skipped levels)
- [ ] Skip-to-content link available

REGULATORY:
- [ ] No diagnostic or medical device language
- [ ] Footer disclaimer: "wellness app, not a medical device"
- [ ] No medication dosage suggestions in any AI output

Produce a detailed report organized by screen, with severity ratings.
```

---

## PART 2 -- Playwright E2E Test Suite

### Directory Structure

```
apps/caregiver-web/e2e/
  auth.spec.ts              (existing)
  navigation.spec.ts        (existing)
  legal.spec.ts             (existing)
  accessibility.spec.ts     (existing)
  landing.spec.ts           (existing)
  care-plan.spec.ts         (new)
  crisis-hub.spec.ts        (new)
  care-coach.spec.ts        (new)
  wellbeing.spec.ts         (new)
  family.spec.ts            (new)
  location.spec.ts          (new)
  reports.spec.ts           (new)
  settings.spec.ts          (new)
  onboarding.spec.ts        (new)
  i18n.spec.ts              (new)
  dark-mode.spec.ts         (new)
  helpers/
    auth.ts                 (login/logout helpers)
    accessibility.ts        (custom a11y assertion helpers)
    supabase-seed.ts        (database seeding for tests)
  fixtures/
    test-users.ts           (test caregiver accounts)
    test-patients.ts        (test patient profiles)
    test-care-plans.ts      (seed care plan data)
```

### Setup Prompt

```
Set up additional Playwright E2E tests for the OurTurn web dashboard.

EXISTING CONFIG: apps/caregiver-web/playwright.config.ts
- Already configured for: Chromium, Firefox, WebKit + mobile Chrome/Safari
- Base URL: http://localhost:3000
- Dev server auto-starts with npm run dev
- Screenshots on failure, trace on first retry, 2 retries in CI

CUSTOM ACCESSIBILITY HELPERS (create in e2e/helpers/accessibility.ts):
- assertMinFontSize(locator, minPx) -- verify font >= specified size
- assertMinTouchTarget(locator, minPx) -- verify element >= specified size
- assertContrastRatio(foreground, background, minRatio) -- verify ratio
- assertNoColorOnlyInfo(locator) -- verify info not conveyed by color alone

SEED DATA (create in e2e/helpers/supabase-seed.ts):
- Create a test caregiver user with known credentials
- Create a test household with known Care Code (e.g., 123456)
- Create a test patient profile with pre-populated care plan
- Seed activity completion history for pattern recognition tests

AUTH HELPERS (create in e2e/helpers/auth.ts):
- loginAsCaregiver(page, email, password) -- complete login flow
- logout(page) -- sign out
- setupAuthenticatedPage(page) -- login + wait for dashboard

PRIORITY ORDER for new test files:
1. crisis-hub.spec.ts -- all scenarios accessible, step cards work
2. care-plan.spec.ts -- task CRUD, AI suggestions
3. care-coach.spec.ts -- safety tiers, streaming, situation cards
4. onboarding.spec.ts -- 6-step wizard
5. wellbeing.spec.ts -- slider check-in, SOS, burnout
6. family.spec.ts -- invite, journal, real-time
7. location.spec.ts -- map, safe zones, alerts
8. reports.spec.ts -- generation, history
9. settings.spec.ts -- all 5 sections, GDPR
10. i18n.spec.ts -- language switching, no untranslated strings
11. dark-mode.spec.ts -- theme toggle, all screens render
```

### Playwright Agent Workflow Prompt

```
Use Playwright to build the E2E test suite for OurTurn web dashboard.

STEP 1 -- EXPLORE:
Navigate the running app at http://localhost:3000 and document:
- All user-facing routes and navigation paths
- Form inputs and their validation rules
- Async operations (AI streaming responses, Supabase queries)
- Critical user journeys (login -> onboarding -> dashboard -> care plan -> log activity)
- Edge cases (empty states, error states, subscription gating)
- Accessibility checkpoints per screen

STEP 2 -- GENERATE:
Create Playwright test files following these conventions:
- Use role-based and text-based selectors (match existing test style)
- Group related assertions in test.describe blocks
- Add explicit waits for AI/async operations (no arbitrary sleep())
- Include both happy path and error path tests
- Tag critical tests with @critical for regression runs

STEP 3 -- VERIFY:
Run the generated tests. For any failures:
- Analyze: selector issue? timing issue? actual bug?
- Fix test issues automatically
- Flag application bugs in a separate report
- Re-run fixed tests to confirm they pass

Summary format:
- Total tests: X
- Passing: X
- Failing (test issues fixed): X
- Failing (application bugs found): X
- Coverage gaps identified
```

---

## PART 3 -- Maestro: React Native Mobile App Testing

### Caregiver Mobile App Flows

```yaml
# tests/maestro/caregiver/01-login.yaml
appId: com.ourturn.caregiver
tags:
  - critical
  - auth
---
- launchApp
- assertVisible: "OurTurn"
- tapOn: "Log In"
- tapOn:
    id: "email-input"
- inputText: "test@ourturn.app"
- tapOn:
    id: "password-input"
- inputText: "testpassword123"
- tapOn: "Log In"
- assertVisible: "Dashboard"
- takeScreenshot: caregiver-dashboard
```

```yaml
# tests/maestro/caregiver/02-crisis-hub.yaml
appId: com.ourturn.caregiver
tags:
  - critical
  - safety
---
- launchApp
# Login first
- tapOn: "Log In"
- tapOn:
    id: "email-input"
- inputText: "test@ourturn.app"
- tapOn:
    id: "password-input"
- inputText: "testpassword123"
- tapOn: "Log In"
- assertVisible: "Dashboard"
# Crisis Hub accessible from More tab
- tapOn: "More"
- assertVisible: "Crisis"
- tapOn: "Crisis"
# Verify Crisis Hub loaded
- assertVisible: "Crisis"
# Test scenario grid
- tapOn: "Refusing to Eat"
- assertVisible: "Step 1"
- takeScreenshot: crisis-refusing-to-eat
- back
# Test de-escalation wizard
- tapOn: "Aggression"
- assertVisible: "Step 1"
- tapOn: "Next"
- assertVisible: "Step 2"
- takeScreenshot: crisis-aggression-step2
- back
- back
# Test SOS
- tapOn: "SOS"
- assertVisible: "Emergency"
- takeScreenshot: crisis-sos
```

```yaml
# tests/maestro/caregiver/03-care-plan.yaml
appId: com.ourturn.caregiver
tags:
  - core
  - care-plan
---
- launchApp
- tapOn: "Log In"
- tapOn:
    id: "email-input"
- inputText: "test@ourturn.app"
- tapOn:
    id: "password-input"
- inputText: "testpassword123"
- tapOn: "Log In"
# Navigate to Plan tab
- tapOn: "Plan"
- assertVisible: "Care Plan"
# Verify calendar/task view
- assertVisible: "Monday"
- assertVisible: "Tuesday"
# Add a task
- tapOn: "Add Task"
- assertVisible: "New Task"
- takeScreenshot: care-plan-add-task
```

```yaml
# tests/maestro/caregiver/04-coach.yaml
appId: com.ourturn.caregiver
tags:
  - core
  - ai
---
- launchApp
- tapOn: "Log In"
- tapOn:
    id: "email-input"
- inputText: "test@ourturn.app"
- tapOn:
    id: "password-input"
- inputText: "testpassword123"
- tapOn: "Log In"
# Navigate to Coach tab
- tapOn: "Coach"
- assertVisible: "Care Coach"
# Verify insight card and situation cards
- assertVisible: "Insight"
# Test a situation card
- tapOn: "Refusing.*"
- assertVisible: "Coach"
- takeScreenshot: coach-situation-response
```

```yaml
# tests/maestro/caregiver/05-wellbeing.yaml
appId: com.ourturn.caregiver
tags:
  - core
  - wellbeing
---
- launchApp
- tapOn: "Log In"
- tapOn:
    id: "email-input"
- inputText: "test@ourturn.app"
- tapOn:
    id: "password-input"
- inputText: "testpassword123"
- tapOn: "Log In"
# Navigate to Toolkit via More tab
- tapOn: "More"
- tapOn: "Toolkit"
- assertVisible: "Wellbeing"
# Verify slider check-in
- assertVisible: "Mood"
- assertVisible: "Energy"
- assertVisible: "Stress"
- takeScreenshot: wellbeing-checkin
# Test SOS button
- assertVisible: "SOS"
- tapOn: "SOS"
- assertVisible: "Emergency"
- takeScreenshot: wellbeing-sos
```

```yaml
# tests/maestro/caregiver/06-navigation-all-tabs.yaml
appId: com.ourturn.caregiver
tags:
  - smoke
---
- launchApp
- tapOn: "Log In"
- tapOn:
    id: "email-input"
- inputText: "test@ourturn.app"
- tapOn:
    id: "password-input"
- inputText: "testpassword123"
- tapOn: "Log In"
# Navigate through all tabs
- tapOn: "Dashboard"
- takeScreenshot: tab-dashboard
- tapOn: "Plan"
- takeScreenshot: tab-plan
- tapOn: "Location"
- takeScreenshot: tab-location
- tapOn: "Coach"
- takeScreenshot: tab-coach
- tapOn: "More"
- takeScreenshot: tab-more
# Navigate to modal screens from More
- tapOn: "Family"
- takeScreenshot: modal-family
- back
- tapOn: "Reports"
- takeScreenshot: modal-reports
- back
- tapOn: "Settings"
- takeScreenshot: modal-settings
```

### Patient Companion App Flows

```yaml
# tests/maestro/patient/01-care-code-entry.yaml
appId: com.ourturn.patient
tags:
  - critical
  - auth
  - accessibility
---
- launchApp
- assertVisible: "Welcome"
# Patient app uses 6 individual digit inputs (auto-focus)
# Each digit field auto-advances to the next
- tapOn:
    index: 0
    id: "digit-0"
- inputText: "1"
- inputText: "2"
- inputText: "3"
- inputText: "4"
- inputText: "5"
- inputText: "6"
# Should auto-submit and show personalized greeting
- assertVisible: "Today"
- takeScreenshot: patient-home-today
```

```yaml
# tests/maestro/patient/02-today-tab.yaml
appId: com.ourturn.patient
tags:
  - core
  - daily-plan
---
- launchApp
# Enter Care Code
- tapOn:
    index: 0
    id: "digit-0"
- inputText: "1"
- inputText: "2"
- inputText: "3"
- inputText: "4"
- inputText: "5"
- inputText: "6"
# Verify Today tab
- assertVisible: "Today"
# Verify time-of-day greeting (morning/afternoon/evening/night)
- assertVisible:
    text: ".*Good.*|.*Hello.*"
# Verify task cards display
- takeScreenshot: patient-today-tasks
# Tap a task to complete it
- tapOn:
    text: ".*"
    index: 0
    traits: ["button"]
- takeScreenshot: patient-task-completed
```

```yaml
# tests/maestro/patient/03-activities-tab.yaml
appId: com.ourturn.patient
tags:
  - core
  - activities
---
- launchApp
- tapOn:
    index: 0
    id: "digit-0"
- inputText: "1"
- inputText: "2"
- inputText: "3"
- inputText: "4"
- inputText: "5"
- inputText: "6"
# Navigate to Activities tab
- tapOn: "Activities"
- assertVisible: "Activities"
# Verify activity cards display by domain
# Brain stimulation activities (10 types)
- assertVisible:
    text: ".*Word.*|.*Matching.*|.*Sorting.*|.*Order.*|.*True.*"
# Legacy activities
- assertVisible:
    text: ".*Remember.*|.*Listen.*|.*Move.*|.*Create.*"
- takeScreenshot: patient-activities-grid
# Tap an activity to start it
- tapOn: "Word Association"
- assertVisible:
    text: ".*"
- takeScreenshot: patient-activity-word-association
```

```yaml
# tests/maestro/patient/04-help-tab-take-me-home.yaml
appId: com.ourturn.patient
tags:
  - critical
  - safety
---
- launchApp
- tapOn:
    index: 0
    id: "digit-0"
- inputText: "1"
- inputText: "2"
- inputText: "3"
- inputText: "4"
- inputText: "5"
- inputText: "6"
# Navigate to Help tab
- tapOn: "Help"
- assertVisible: "Help"
# Verify "Take Me Home" button is prominently displayed
- assertVisible: "Take Me Home"
# Verify emergency contacts are visible
- assertVisible:
    text: ".*Emergency.*|.*Contact.*|.*Call.*"
# Verify SOS button
- assertVisible:
    text: ".*Help.*|.*SOS.*"
- takeScreenshot: patient-help-tab
# Test Take Me Home (will trigger location permission + Google Maps deep link)
- tapOn: "Take Me Home"
- takeScreenshot: patient-take-me-home-triggered
```

```yaml
# tests/maestro/patient/05-daily-checkin.yaml
appId: com.ourturn.patient
tags:
  - core
  - checkin
---
- launchApp
- tapOn:
    index: 0
    id: "digit-0"
- inputText: "1"
- inputText: "2"
- inputText: "3"
- inputText: "4"
- inputText: "5"
- inputText: "6"
# Look for check-in prompt on Today tab
- assertVisible: "Today"
# Tap check-in CTA
- tapOn:
    text: ".*check.*|.*Check.*|.*How.*"
# Verify check-in modal/screen
- assertVisible:
    text: ".*mood.*|.*Mood.*|.*feeling.*"
- takeScreenshot: patient-checkin-mood
```

```yaml
# tests/maestro/patient/06-accessibility-sweep.yaml
appId: com.ourturn.patient
tags:
  - accessibility
  - critical
---
- launchApp
- tapOn:
    index: 0
    id: "digit-0"
- inputText: "1"
- inputText: "2"
- inputText: "3"
- inputText: "4"
- inputText: "5"
- inputText: "6"
# Screenshot every main screen for manual accessibility review
# All text must be >= 20px, large touch targets, high contrast
- takeScreenshot: a11y-today-tab
- tapOn: "Activities"
- takeScreenshot: a11y-activities-tab
- tapOn: "Help"
- takeScreenshot: a11y-help-tab
# Verify Take Me Home is always visible on Help tab
- assertVisible: "Take Me Home"
```

```yaml
# tests/maestro/patient/07-language-picker.yaml
appId: com.ourturn.patient
tags:
  - i18n
---
- launchApp
# On Care Code screen, verify language picker exists
- assertVisible: "Welcome"
# Look for globe/language button
- tapOn:
    text: ".*"
    traits: ["button"]
    index: 0
# Should show language options
- takeScreenshot: patient-language-picker
```

```yaml
# tests/maestro/patient/08-offline-mode.yaml
appId: com.ourturn.patient
tags:
  - offline
  - critical
---
- launchApp
- tapOn:
    index: 0
    id: "digit-0"
- inputText: "1"
- inputText: "2"
- inputText: "3"
- inputText: "4"
- inputText: "5"
- inputText: "6"
# Verify today's plan loads from cache even offline
- assertVisible: "Today"
- takeScreenshot: patient-offline-today
# Verify Help tab loads from cache
- tapOn: "Help"
- assertVisible: "Take Me Home"
- takeScreenshot: patient-offline-help
# Note: To test true offline, toggle airplane mode on device
# Maestro command: toggleAirplaneMode (Android only)
```

### Maestro Run Commands

```bash
# Run all caregiver tests
maestro test tests/maestro/caregiver/

# Run all patient tests
maestro test tests/maestro/patient/

# Run only critical flows
maestro test --tags critical tests/maestro/

# Run smoke tests (all tabs)
maestro test --tags smoke tests/maestro/

# Run accessibility tests
maestro test --tags accessibility tests/maestro/

# Run with specific device
maestro test --device "iPhone 15 Pro" tests/maestro/

# Generate HTML report
maestro test --format junit --output test-results/ tests/maestro/
```

---

## PART 4 -- Visual & Accessibility Testing via Simulator

### Visual Accessibility Testing Prompt

```
TEST: Visual Accessibility Audit via Simulator

For each app screen, ANALYZE for:

1. FONT SIZES:
   - Patient app: ALL text >= 20px (critical, non-negotiable)
   - Caregiver apps: body text >= 16px
   - Headings should be proportionally larger

2. TOUCH TARGETS:
   - Patient app: >= 56px x 56px (extra large for cognitive accessibility)
   - Caregiver apps: >= 44px x 44px
   - Adequate spacing between interactive elements (>= 8px)

3. CONTRAST:
   - Text/background combinations meet WCAG AA (4.5:1)
   - Patient app: prefer AAA (7:1)
   - Test with both light and dark themes

4. LAYOUT:
   - No overlapping elements or truncated text
   - Proper spacing and visual hierarchy
   - Time-of-day themes render correctly (patient app: morning/afternoon/evening/night)

5. ORIENTATION:
   - Rotate to landscape, verify layout adapts
   - Verify no content cut off

6. FONT SCALING:
   - Increase system font size to largest setting
   - Navigate through main screens
   - Verify text does not overflow or get cut off

APP PRIORITY ORDER:
1. Patient Companion App (strictest accessibility -- dementia patients)
2. Caregiver Mobile App
3. Caregiver Web Dashboard (tested via Chrome)

For PATIENT APP specifically, also verify:
- All text is extra-large (>= 20px) and high-contrast
- Buttons are prominently sized with clear labels
- "Take Me Home" button is visible on Help tab
- Activities tab has clear domain grouping with large cards
- Voice activation button (if present) is always accessible
- Time-of-day gradients do not reduce text readability
- Maximum 2 levels of navigation depth
- No confusing navigation patterns

Produce a visual accessibility report with annotated screenshots.
```

---

## PART 5 -- Reusable Claude Code Skills

### Directory Structure

```
.claude/
  skills/
    e2e-dashboard/
      SKILL.md
    e2e-caregiver-mobile/
      SKILL.md
    e2e-patient-app/
      SKILL.md
    accessibility-audit/
      SKILL.md
    regression-suite/
      SKILL.md
```

### e2e-dashboard/SKILL.md

````markdown
---
name: e2e-dashboard
version: "1.0.0"
description: End-to-end testing for OurTurn caregiver web dashboard
user-invocable: true
allowed-tools:
  - Bash
  - Read
  - Write
  - Browser
---

# E2E Dashboard Testing Skill

Automated browser testing for the OurTurn caregiver web dashboard.

## Prerequisites
- Dashboard running at http://localhost:3000
- Chrome available (run with `claude --chrome`)
- Test user seeded in Supabase

## Test Execution Order
1. **Critical Safety**: Crisis Hub access and all scenarios
2. **Authentication**: Login, signup, OAuth, onboarding wizard
3. **Core Workflows**: Care Plan CRUD, AI task suggestions, task completion
4. **AI Features**: Care Coach (streaming + safety tiers), Behaviour Playbook
5. **Wellbeing**: Slider check-in, SOS, burnout detection, wellness trends
6. **Family**: Invites, Care Journal, real-time sync, Care Code sharing
7. **Location**: Map, safe zones, alerts, device status
8. **Reports**: Doctor visit report generation, history
9. **Settings**: All 5 sections, GDPR export/delete
10. **Resources**: Journey guide, knowledge library, local support
11. **Accessibility**: Full WCAG 2.1 AA audit
12. **i18n**: Language switching across all screens

## Reporting
- Save screenshots to: test-results/dashboard/screenshots/
- Generate report at: test-results/dashboard/report.md

## Accessibility Standards
- Font size: >= 16px body text
- Touch targets: >= 44px x 44px
- Contrast ratio: >= 4.5:1 (AA)
- No color-only information
- Full keyboard navigation
- Screen reader compatible
- No medical/diagnostic language
````

### e2e-patient-app/SKILL.md

````markdown
---
name: e2e-patient-app
version: "1.0.0"
description: End-to-end testing for OurTurn patient companion app
user-invocable: true
allowed-tools:
  - Bash
  - Read
  - Write
---

# E2E Patient Companion App Testing Skill

Testing for the patient companion app.
This app has the STRICTEST accessibility requirements.

## Critical Requirements
- ALL text must be >= 20px (non-negotiable for dementia patients)
- ALL touch targets must be >= 56px
- Contrast ratio >= 4.5:1 everywhere, prefer 7:1
- "Take Me Home" button visible on Help tab
- SOS / emergency contacts always accessible
- Maximum 2 levels of navigation depth
- No time-limited interactions
- Simple language (no medical jargon, no diagnostic terms)
- Offline mode must work (cached plan + queued writes)
- Time-of-day gradients must not reduce readability

## Test Priority
1. "Take Me Home" -- must ALWAYS work
2. Care Code entry (6-digit numpad with auto-advance)
3. Today tab -- task timeline, completion
4. Activities tab -- 15 brain wellness activities across 8 domains
5. Help tab -- emergency contacts, SOS
6. Daily check-in (mood, sleep, voice note)
7. Offline mode (cached data, queued writes)
8. Language picker on Care Code screen
9. Consent flow (first time only)

## Run
```bash
maestro test tests/maestro/patient/
maestro test --tags critical tests/maestro/patient/
```
````

### e2e-caregiver-mobile/SKILL.md

````markdown
---
name: e2e-caregiver-mobile
version: "1.0.0"
description: End-to-end testing for OurTurn caregiver mobile app
user-invocable: true
allowed-tools:
  - Bash
  - Read
  - Write
---

# E2E Caregiver Mobile App Testing Skill

Testing for the caregiver mobile app (React Native / Expo).

## Tab Structure (5 tabs)
1. Dashboard -- real-time status, task progress, check-in, journal
2. Plan -- 7-day calendar, task CRUD, categories, AI suggestions
3. Location -- Google Maps, safe zones, alerts, device status
4. Coach -- AI hub, situation cards, workflow cards, chat
5. More -- menu to Family, Toolkit, Crisis, Reports, Settings

## Modal Screens (from More tab)
- Family -- caregiver list + Care Journal
- Toolkit -- wellbeing check-in, SOS, exercises, trends
- Crisis -- scenario grid, de-escalation wizard, breathing timer
- Reports -- doctor visit + weekly summary generation
- Settings -- profile, language, subscription, Care Code, GDPR
- Behaviours -- playbook grid, incident logger, timeline
- Resources -- journey guide, articles, local support

## Test Priority
1. Crisis Hub access and de-escalation flows
2. Login + onboarding (6-step wizard)
3. Care Plan task management
4. Coach AI chat with safety pipeline
5. Wellbeing check-in + SOS
6. Family + Journal
7. Location + safe zones
8. Reports generation
9. Settings + GDPR

## Run
```bash
maestro test tests/maestro/caregiver/
maestro test --tags critical tests/maestro/caregiver/
```
````

### accessibility-audit/SKILL.md

````markdown
---
name: accessibility-audit
version: "1.0.0"
description: Comprehensive accessibility audit for all OurTurn apps
user-invocable: true
allowed-tools:
  - Bash
  - Read
  - Write
  - Browser
---

# Accessibility Audit Skill

Comprehensive WCAG 2.2 accessibility audit optimized for cognitive impairment.

## Standards
- WCAG 2.2 Level AA (minimum), AAA (target for patient app)
- EN 301 549 (European accessibility standard)
- OurTurn regulatory constraint: wellness app, NOT a medical device

## Per-App Requirements

### Patient Companion App (STRICTEST)
- Font size >= 20px (all text, no exceptions)
- Touch targets >= 56px
- Contrast >= 4.5:1 (prefer 7:1)
- Maximum 2 navigation levels
- No time-limited interactions
- Offline-capable
- Time-of-day themes must maintain readability

### Caregiver Apps (Web + Mobile)
- Font size >= 16px body text
- Touch targets >= 44px
- Contrast >= 4.5:1
- Full keyboard navigation (web)
- Dark mode support

## Audit Checklist

### Visual Design
- [ ] Font sizes meet per-app minimums
- [ ] Contrast ratios meet per-app standards
- [ ] No information by color alone
- [ ] Consistent iconography with text labels
- [ ] Clear visual hierarchy and whitespace
- [ ] Dark mode renders correctly

### Interaction Design
- [ ] Touch targets meet per-app minimums
- [ ] No time limits or auto-advancing content
- [ ] Generous tap spacing (>= 8px between targets)
- [ ] Clear focus indicators (web)
- [ ] Logical tab/focus order (web)
- [ ] Undo/confirmation for destructive actions

### Cognitive Accessibility
- [ ] Plain language, short sentences
- [ ] No medical jargon or diagnostic terms
- [ ] Consistent navigation patterns
- [ ] Minimal cognitive load per screen
- [ ] Clear error messages with recovery paths
- [ ] Progress indicators for multi-step flows

### Regulatory
- [ ] No diagnostic language in any UI text
- [ ] No medication dosage suggestions
- [ ] Disclaimer visible: "wellness app, not a medical device"
- [ ] AI responses do not provide medical advice

### Technical
- [ ] Semantic HTML / accessible components
- [ ] ARIA labels and landmarks (web)
- [ ] accessibilityLabel on all interactive elements (mobile)
- [ ] Screen reader compatibility
- [ ] Keyboard-only navigation (web)
- [ ] Reduced motion support

## Output
Generate: test-results/accessibility/audit-report.md
Include: screenshots with annotations for each violation
````

### regression-suite/SKILL.md

````markdown
---
name: regression-suite
version: "1.0.0"
description: Quick regression test suite for pre-deployment verification
user-invocable: true
allowed-tools:
  - Bash
  - Read
  - Write
  - Browser
---

# Regression Test Suite

Fast regression checks to run before every deployment.
Covers critical paths only -- full test suite is separate.

## Quick Regression Checklist (< 10 minutes)

### Web Dashboard (via Chrome or Playwright)
1. Login -> Dashboard loads with status cards
2. Crisis Hub -> all scenarios accessible, step cards work
3. Care Plan -> task grid renders, add/edit works
4. Care Coach -> responds to a query (streaming works)
5. Wellbeing -> slider check-in renders, SOS button works
6. Family -> Care Code visible, journal loads
7. Resources -> content loads in EN and DE
8. Settings -> all 5 sections render, Care Code visible
9. Dark mode -> toggle works, all screens render

### Caregiver Mobile (via Maestro)
```bash
maestro test --tags critical tests/maestro/caregiver/
```

### Patient Companion (via Maestro)
```bash
maestro test --tags critical tests/maestro/patient/
```

## Run All
```bash
# Web dashboard (Playwright)
cd apps/caregiver-web && npx playwright test --grep @critical

# Mobile apps (Maestro)
maestro test --tags critical tests/maestro/

# Or via Claude Chrome
claude --chrome "Run the regression checklist against http://localhost:3000"
```

## Pass Criteria
- ALL critical tests pass
- No accessibility regressions in patient app (font >= 20px)
- Crisis Hub fully functional
- "Take Me Home" works on patient app
- SOS button works on all apps
- AI Coach responds without errors
- No console errors on any screen
- No untranslated strings visible
- Dark mode renders without broken styles
````

---

## Quick Reference -- Daily Commands

```bash
# === WEB DASHBOARD TESTING ===

# Exploratory testing with Chrome
claude --chrome
> "Test the Crisis Hub on http://localhost:3000 -- all scenarios"

# Run Playwright E2E suite
cd apps/caregiver-web
npx playwright test
npx playwright test e2e/crisis-hub.spec.ts
npx playwright test --project=mobile-chrome    # mobile viewport
npx playwright test --grep @critical           # critical only

# View test report
npx playwright show-report

# === MOBILE APP TESTING (MAESTRO) ===

# All Maestro tests
maestro test tests/maestro/

# Specific flows
maestro test tests/maestro/caregiver/02-crisis-hub.yaml
maestro test tests/maestro/patient/04-help-tab-take-me-home.yaml

# Critical only (pre-deploy)
maestro test --tags critical tests/maestro/

# === MOBILE APP TESTING (EXPO) ===

# Start patient app in tunnel mode (required for this network)
cd apps/patient-app && npx expo start --tunnel --go

# Start caregiver app in tunnel mode
cd apps/caregiver-app && npx expo start --tunnel --go

# === ACCESSIBILITY ===

# Lighthouse audit (web)
npx lighthouse http://localhost:3000 --only-categories=accessibility --output=html

# Playwright accessibility tests
cd apps/caregiver-web && npx playwright test e2e/accessibility.spec.ts

# === i18n VERIFICATION ===

# Check for untranslated strings
cd apps/caregiver-web && npx playwright test e2e/i18n.spec.ts

# Re-run translations after any string changes
npx tsx scripts/translate-locales.ts --missing-only

# === REGRESSION (run before every deploy) ===

# Full regression
cd apps/caregiver-web && npx playwright test --grep @critical
maestro test --tags critical tests/maestro/

# Or interactive
claude --chrome "Run quick regression checklist against http://localhost:3000"
```

---

## App-Specific Testing Notes

### OurTurn-Specific Gotchas

| Issue | Where | What to check |
|-------|-------|---------------|
| PostgREST one-to-one bug | Supabase queries | `patients.household_id` UNIQUE constraint returns object not array -- use `Array.isArray()` guard |
| Debug console.logs | Patient app | Check for leftover `console.log` in production code |
| Hardcoded strings | All apps | Grep for strings not wrapped in `t()` |
| Stripe placeholder | Web API | Verify actual DB updates in `/api/stripe/webhook/route.ts` |
| Tunnel mode required | Mobile apps | LAN mode fails on this network -- always use `--tunnel --go` |
| Maps unavailable in Expo Go | Caregiver mobile | `react-native-maps` not available -- verify graceful degradation |
| AI Safety audit log | All AI routes | Verify metadata logged to `ai_safety_audit_log` (no message content for GDPR) |
| Time-of-day themes | Patient app | Test at morning/afternoon/evening/night -- verify text remains readable |
| Offline cache keys | Patient app | `cached_tasks_{date}`, `cached_completions_{date}`, `pending_*` keys in AsyncStorage |

### Bundle IDs

| App | iOS | Android |
|-----|-----|---------|
| Patient | `com.ourturn.patient` | `com.ourturn.patient` |
| Caregiver Mobile | `com.ourturn.caregiver` | `com.ourturn.caregiver` |

### Tech Stack Quick Reference

| Layer | Technology |
|-------|-----------|
| Web framework | Next.js 14+ (App Router) |
| Mobile framework | React Native + Expo SDK 54 |
| Styling (web) | Tailwind CSS |
| Styling (mobile) | React Native StyleSheet |
| Backend | Supabase (Postgres + Auth + Realtime + Storage + Edge Functions) |
| AI | Google Gemini 2.5 Flash |
| Speech-to-text | OpenAI Whisper |
| Maps | Google Maps (@vis.gl/react-google-maps web, react-native-maps mobile) |
| Payments (mobile) | RevenueCat |
| Payments (web) | Stripe Checkout |
| State | Zustand |
| Testing (web) | Playwright |
| Testing (mobile) | Maestro |
| i18n | react-i18next (24 EU languages) |
