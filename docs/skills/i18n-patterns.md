# Skill: Internationalization (i18n) Patterns

## Principle

OurTurn launches globally. **Every user-facing string must be translatable from day one.** Never hardcode text in components. This applies to all 3 apps.

## Setup

### Library
All 3 apps use the same i18n stack for consistency:
- `i18next` + `react-i18next` + `i18next-http-backend` + `i18next-browser-languagedetector`
- Mobile apps additionally use `expo-localization` for device locale detection

### File Structure

```
apps/patient-app/locales/
  en.json         ← English (launch language)
  de.json         ← German (first translation)
  fr.json         ← French
  es.json         ← Spanish
  ...

apps/caregiver-app/locales/
  en.json
  de.json
  fr.json ... (24 EU languages)
  resources-en.json        ← Separate namespace for Resources tab
  resources-de.json ...    ← Resources translations (24 languages total = 48 files)

apps/caregiver-web/locales/
  en.json                  ← Bundled English (source of truth for web)

apps/caregiver-web/public/locales/
  en.json, de.json ...     ← 24 language files (fetched via HTTP for non-English)
  en-resources.json ...    ← Resources translations (24 files, ~346KB each)
```

### JSON Structure

Organize by feature/screen, not by component:

```json
{
  "common": {
    "appName": "OurTurn",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "done": "Done",
    "skip": "Skip for today",
    "loading": "Loading...",
    "error": "Something went wrong. Please try again.",
    "offline": "You're offline — your data will sync when connected"
  },
  "categories": {
    "medication": "Medication",
    "nutrition": "Meals & Nutrition",
    "physical": "Physical Activity",
    "cognitive": "Brain Wellness",
    "social": "Social & Connection",
    "health": "Health Check"
  },
  "patientApp": {
    "todaysPlan": {
      "title": "Today's Plan",
      "progress": "{{completed}} of {{total}} activities done today",
      "noPlan": "No activities planned for today",
      "overdue": "Overdue",
      "upcoming": "Upcoming",
      "nowBadge": "NOW",
      "doneAt": "Done at {{time}}",
      "greatMorning": "Great morning! ☀️",
      "keepGoing": "You're doing wonderfully!",
      "allDone": "All done for today! 🌟"
    },
    "help": {
      "title": "I Need Help",
      "callSomeone": "Call Someone",
      "getHomeSafely": "Get Home Safely",
      "takeMeHome": "Take Me Home",
      "takeMeHomeDesc": "Tap to get walking directions to your home",
      "emergency": "Emergency",
      "confirmEmergency": "Are you sure you want to call emergency services?"
    },
    "checkin": {
      "greeting": {
        "morning": "Good morning, {{name}}! ☀️",
        "afternoon": "Good afternoon, {{name}}! 🌤️",
        "evening": "Good evening, {{name}}! 🌙"
      },
      "moodQuestion": "How are you feeling today?",
      "moodGood": "Good",
      "moodOkay": "Okay",
      "moodBad": "Not great",
      "sleepQuestion": "Did you sleep well?",
      "sleepGood": "Yes",
      "sleepOkay": "So-so",
      "sleepBad": "Not really",
      "voicePrompt": "Anything you want to tell your family?",
      "voiceTap": "Tap to speak",
      "voiceRecording": "Recording...",
      "send": "Send to family",
      "thankYou": "Thank you! Your family will see this. 💙"
    },
    "activity": {
      "todaysActivity": "Today's Activity",
      "skipForToday": "Skip for today",
      "positiveFeedback": [
        "What a wonderful memory! Thank you for sharing. 💙",
        "That's beautiful! Thank you for telling us. ✨",
        "How lovely! Your family will enjoy hearing this. 🌟",
        "What a great story! Thank you. 😊"
      ]
    },
    "careCode": {
      "welcome": "Welcome to OurTurn",
      "enterCode": "Enter your Care Code",
      "helperText": "Your family member will give you this code.",
      "connect": "Connect",
      "invalidCode": "Please check your code and try again.",
      "connecting": "Connecting..."
    }
  },
  "caregiverApp": {
    "dashboard": {
      "greeting": "Good {{timeOfDay}}, {{name}}",
      "statusGood": "{{patientName}}'s day is going well 💚",
      "statusConcern": "{{patientName}} may need some attention 💛",
      "todaysStatus": "Today's Status",
      "tasksCompleted": "{{completed}} of {{total}} tasks done",
      "dailyCheckin": "Daily Check-In",
      "noCheckinYet": "No check-in submitted yet today",
      "location": "Location",
      "atHome": "{{name}} is at home",
      "lastUpdate": "Last updated: {{time}}",
      "aiInsights": "Insights",
      "quickActions": "Quick Actions"
    },
    "carePlan": {
      "title": "{{name}}'s Daily Plan",
      "addTask": "Add Task",
      "aiSuggest": "AI Suggest Tasks",
      "hintLabel": "Instructions ({{name}} will see this)",
      "hintPlaceholder": "E.g., Your pills are in the kitchen counter pill box",
      "recurrence": "Repeats",
      "daily": "Every day",
      "specificDays": "Specific days",
      "oneTime": "One time",
      "copyDay": "Copy to other days",
      "saved": "Saved ✓",
      "noTasks": "No tasks yet. Add your first task to get started."
    },
    "location": {
      "title": "Location & Safety",
      "currentLocation": "Current Location",
      "safeZones": "Safe Zones",
      "addSafeZone": "Add Safe Zone",
      "alerts": "Alert Settings",
      "leaveZoneAlert": "Notify when {{name}} leaves a safe zone",
      "inactivityAlert": "Notify when no movement for",
      "nightAlert": "Notify when outside after",
      "takeMeHomeAlert": "Notify when {{name}} taps 'Take Me Home'",
      "locationHistory": "Location History",
      "takeMeHomeTapped": "{{name}} tapped 'Take Me Home'",
      "hours": "hours"
    },
    "coach": {
      "title": "AI Care Coach",
      "intro": "Ask me anything about caring for {{name}}. I know their routine, preferences, and general best practices.",
      "placeholder": "Type your question...",
      "disclaimer": "I'm here to support you, not replace medical advice. For health concerns, always consult your doctor.",
      "suggestedTopics": "Suggested topics",
      "addToCarePlan": "Add to care plan",
      "addToDoctorNotes": "Add to doctor notes",
      "newConversation": "New conversation"
    },
    "family": {
      "title": "{{patientName}}'s Care Team",
      "inviteMember": "Invite Family Member",
      "primaryCaregiver": "Primary caregiver",
      "familyMember": "Family member",
      "careCode": "Care Code",
      "careCodeHelp": "Share this code to pair the patient app",
      "regenerateCode": "Regenerate Code",
      "regenerateWarning": "This will disconnect all paired patient devices. They'll need the new code.",
      "journal": "Care Journal",
      "addNote": "Add note",
      "observation": "Observation",
      "note": "Note",
      "milestone": "Milestone"
    },
    "wellbeing": {
      "title": "How are YOU doing, {{name}}? 💙",
      "todaysMood": "Today's mood",
      "moodGood": "Good",
      "moodOkay": "Okay",
      "moodTired": "Tired",
      "moodStressed": "Stressed",
      "moodOverwhelmed": "Overwhelmed",
      "selfCare": "Weekly self-care",
      "tookBreak": "Took a break today",
      "ateWell": "Ate a proper meal",
      "talkedFriend": "Talked to a friend",
      "enjoyable": "Did something enjoyable",
      "exercise": "Got some exercise",
      "sleptWell": "Got enough sleep",
      "supportResources": "Support Resources",
      "burnoutWarning": "You've been feeling stressed lately. That's completely understandable. Would you like to talk to the AI Coach, or access support resources?",
      "selfCareReminder": "Remember: You can't pour from an empty cup. Your wellbeing matters too."
    },
    "reports": {
      "title": "Doctor Visit Report",
      "period": "Report period",
      "lastDays": "Last {{days}} days",
      "generate": "Generate Report",
      "include": "Include in report",
      "moodTrends": "Mood trends and check-in summary",
      "sleepPatterns": "Sleep patterns",
      "activityCompletion": "Activity completion rates",
      "medicationAdherence": "Medication adherence",
      "journalNotes": "Notable care journal observations",
      "locationPatterns": "Location patterns",
      "caregiverConcerns": "Caregiver concerns",
      "customNotes": "Additional notes for the doctor",
      "print": "Print",
      "downloadPdf": "Download PDF",
      "emailDoctor": "Email to doctor",
      "disclaimer": "This summary is based on self-reported wellness data and family observations. It is not a clinical assessment."
    },
    "onboarding": {
      "step1Title": "About You",
      "step2Title": "About Your Loved One",
      "step3Title": "Their Life Story",
      "step4Title": "Daily Routine",
      "step5Title": "Safety Setup",
      "step6Title": "Your Care Code",
      "next": "Next",
      "back": "Back",
      "finish": "Get Started",
      "careCodeInstructions": "Install OurTurn on your loved one's phone and enter this code to connect."
    },
    "settings": {
      "title": "Settings",
      "account": "Account",
      "subscription": "Subscription",
      "notifications": "Notifications",
      "privacy": "Privacy & Data",
      "exportData": "Export My Data",
      "deleteAccount": "Delete Account",
      "deleteWarning": "This will permanently delete all data for this household. This cannot be undone.",
      "language": "Language",
      "about": "About OurTurn"
    }
  },
  "notifications": {
    "taskReminder": "{{patientName}}, it's time for: {{taskTitle}}",
    "taskCompleted": "{{patientName}} completed: {{taskTitle}}",
    "checkinReceived": "{{patientName}} completed today's check-in",
    "leftSafeZone": "{{patientName}} has left {{zoneName}}",
    "inactivity": "No movement detected from {{patientName}} in {{hours}} hours",
    "nightMovement": "{{patientName}} is moving outside at {{time}}",
    "takeMeHome": "🏠 {{patientName}} tapped 'Take Me Home' from {{location}}",
    "eveningSummary": "{{patientName}}'s day: {{completed}}/{{total}} tasks done. Mood: {{mood}}"
  },
  "subscription": {
    "free": "Free",
    "plus": "OurTurn Plus",
    "upgradeTitle": "Unlock OurTurn Plus",
    "upgradeFeature": "This feature requires OurTurn Plus",
    "monthly": "{{price}}/month",
    "annual": "{{price}}/year",
    "annualSavings": "Save {{percent}}%",
    "subscribe": "Subscribe",
    "restore": "Restore Purchase",
    "manage": "Manage Subscription"
  }
}
```

## Usage Pattern

### In React Native Components

```tsx
import { useTranslation } from 'react-i18next';

function TaskCard({ task, patientName }) {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{task.title}</Text>
      <Text>{task.hint}</Text>
      <Button title={t('common.done')} onPress={handleComplete} />
    </View>
  );
}
```

### Interpolation

```tsx
// String: "{{completed}} of {{total}} activities done today"
t('patientApp.todaysPlan.progress', { completed: 4, total: 7 })
// → "4 of 7 activities done today"

// String: "Good morning, {{name}}! ☀️"
t('patientApp.checkin.greeting.morning', { name: patient.name })
// → "Good morning, Maria! ☀️"
```

### Plurals

```json
{
  "hours_one": "{{count}} hour",
  "hours_other": "{{count}} hours"
}
```

```tsx
t('hours', { count: 2 }) // → "2 hours"
t('hours', { count: 1 }) // → "1 hour"
```

## Auto-Detection

### Mobile (Expo)

```typescript
import * as Localization from 'expo-localization';
import i18n from 'i18next';

i18n.init({
  lng: Localization.locale.split('-')[0], // 'en', 'de', 'fr', etc.
  fallbackLng: 'en',
  resources: { en: { translation: enJson }, de: { translation: deJson } },
});
```

### Web (Next.js)

Use browser's `navigator.language` or `Accept-Language` header. Store preference in user's Supabase profile.

## Dynamic Content

Some content is generated by AI or configured by users and should NOT go through i18n:
- Patient's name
- Caregiver's name
- Task titles and hints (written by caregiver in their language)
- AI Coach responses (Claude responds in user's language via system prompt)
- Brain activity prompts (generated in patient's language)
- Care Journal entries (written by caregivers)
- Voice note transcripts

These are stored in the database in whatever language they were created.

## Emergency Numbers

Emergency numbers are country-specific, not language-specific:

```typescript
// packages/shared/constants/emergency-numbers.ts
export const EMERGENCY_NUMBERS: Record<string, { primary: string; secondary?: string; label: string }> = {
  GB: { primary: '999', secondary: '111', label: 'Emergency' },
  US: { primary: '911', label: 'Emergency' },
  DE: { primary: '112', label: 'Notruf' },
  FR: { primary: '112', secondary: '15', label: 'Urgences' },
  IT: { primary: '112', label: 'Emergenza' },
  ES: { primary: '112', label: 'Emergencia' },
  PT: { primary: '112', label: 'Emergência' },
  NL: { primary: '112', label: 'Noodgeval' },
  PL: { primary: '112', label: 'Pogotowie' },
  RO: { primary: '112', label: 'Urgență' },
  AT: { primary: '112', label: 'Notruf' },
  CH: { primary: '112', secondary: '144', label: 'Notfall' },
  BE: { primary: '112', label: 'Noodoproep' },
  SE: { primary: '112', label: 'Nödsamtal' },
  NO: { primary: '113', label: 'Nødnummer' },
  DK: { primary: '112', label: 'Nødopkald' },
  FI: { primary: '112', label: 'Hätänumero' },
  IE: { primary: '999', secondary: '112', label: 'Emergency' },
  GR: { primary: '112', label: 'Έκτακτη Ανάγκη' },
  CZ: { primary: '112', label: 'Tísňové volání' },
  HU: { primary: '112', label: 'Segélyhívó' },
  JP: { primary: '119', secondary: '110', label: '緊急' },
  AU: { primary: '000', label: 'Emergency' },
  NZ: { primary: '111', label: 'Emergency' },
  CA: { primary: '911', label: 'Emergency' },
  IN: { primary: '112', label: 'Emergency' },
  BR: { primary: '192', secondary: '190', label: 'Emergência' },
  MX: { primary: '911', label: 'Emergencia' },
  KR: { primary: '119', label: '긴급' },
  ZA: { primary: '10111', secondary: '10177', label: 'Emergency' },
  default: { primary: '112', label: 'Emergency' },
};

export function getEmergencyNumber(countryCode: string) {
  return EMERGENCY_NUMBERS[countryCode] || EMERGENCY_NUMBERS.default;
}
```

## Localization Status

| App | Languages | Status |
|---|---|---|
| Patient App | 24 EU languages | Full translation via locale files |
| Caregiver Mobile | 24 EU languages | Full translation via locale files |
| Caregiver Web | English only | Other languages pending |

The mobile apps have full translations for 24 EU languages. The caregiver web app currently supports English only — additional languages will be added based on user demand.

### Resources Namespace

The Resources tab uses a separate i18n namespace (`resources`) with its own locale files (`resources-{lang}.json`) due to its large content volume (~119KB for English). Load it separately to avoid bloating the main bundle:

```typescript
// Load resources namespace on demand
i18n.loadNamespaces('resources');
const { t } = useTranslation('resources');
```

## Right-to-Left (RTL) Support

Not for MVP, but architecture should not prevent it:
- Use logical CSS properties (`start`/`end` not `left`/`right`) where possible
- React Native: `I18nManager.forceRTL()` when needed
- Tailwind: RTL plugin available when needed
- Store `direction: 'ltr' | 'rtl'` per language in config
