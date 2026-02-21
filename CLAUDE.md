# OurTurn — Project Guide

## What This Is

OurTurn is a dementia daily care platform with 3 apps that help families manage daily life with dementia. This is a **wellness app, NOT a medical device**. Read `docs/skills/regulatory-language.md` before writing ANY user-facing text.

### The Three Apps

| App | Location | Tech | User |
|---|---|---|---|
| **Patient App** | `apps/patient-app/` | React Native (Expo) | Person with dementia |
| **Caregiver Mobile** | `apps/caregiver-app/` | React Native (Expo) | Family caregiver |
| **Caregiver Web** | `apps/caregiver-web/` | Next.js (App Router) | Family caregiver |

### How They Connect

- Caregiver creates account (web or mobile) → system generates 6-digit Care Code
- Patient app: enter Care Code once → session persists forever (no login, no password)
- All 3 apps share one Supabase backend with real-time sync
- Shared TypeScript code lives in `packages/shared/` and `packages/supabase/`

## Architecture

```
apps/patient-app/        → Expo (React Native), Expo Router
apps/caregiver-app/      → Expo (React Native), Expo Router
apps/caregiver-web/      → Next.js 16 App Router, Tailwind CSS v4
packages/shared/         → TypeScript types, constants, utils
packages/supabase/       → Supabase client, typed queries, realtime hooks
supabase/migrations/     → SQL migration files
supabase/functions/      → Edge Functions (Deno)
docs/                    → MVP plan, skills, prompts
```

### Tech Stack

| Layer | Technology |
|---|---|
| Mobile framework | React Native with Expo SDK (managed workflow) |
| Web framework | Next.js 16 with App Router |
| Styling (web) | Tailwind CSS v4 (CSS custom properties, no tailwind.config.js) |
| Styling (mobile) | React Native StyleSheet |
| Backend | Supabase (Postgres + Auth + Realtime + Storage + Edge Functions) |
| AI / LLM | Google Gemini 2.5 Flash API |
| Speech-to-text | Google Gemini 2.5 Flash (audio transcription) |
| Maps display | Google Maps API (@vis.gl/react-google-maps for web, react-native-maps for caregiver-app) |
| Navigation home | Google Maps deep links (not in-app navigation) |
| Location tracking | expo-location (background mode) |
| Voice recording | expo-audio |
| Push notifications | expo-notifications + Supabase Edge Functions |
| Email | Resend (direct API via fetch, no npm package) |
| Payments (mobile) | RevenueCat |
| Payments (web) | Stripe Checkout |
| State management | Zustand (mobile apps), React hooks + Context (web) |
| Navigation (mobile) | Expo Router (file-based) |
| Secure storage | expo-secure-store |

## Skills (READ BEFORE CODING)

Before writing code for any domain, read the relevant skill file:

| When building... | Read this skill |
|---|---|
| Patient app screens | `docs/skills/patient-app-ux.md` |
| Any user-facing text | `docs/skills/regulatory-language.md` |
| Database, auth, queries, Edge Functions | `docs/skills/supabase-patterns.md` |
| AI Coach, activity generation, insights | `docs/skills/ai-integration.md` |
| Colors, fonts, components, spacing | `docs/skills/design-system.md` |
| Any translatable string | `docs/skills/i18n-patterns.md` |

The full product specification is at `docs/MVP_PLAN.md`. Reference specific sections when building features.

## Coding Conventions

- TypeScript strict mode everywhere
- Functional components with hooks (no class components)
- File names: `kebab-case.tsx` (e.g., `daily-checkin.tsx`)
- Component names: `PascalCase` (e.g., `DailyCheckIn`)
- All user-facing strings in locale JSON files — NEVER hardcode text
- Export types from `packages/shared/types/`
- Export queries from `packages/supabase/queries/`
- Always handle 3 UI states: loading, error, empty
- Prefer Zustand stores for shared state that crosses components
- Use React Context only for simple, localized state (e.g., a form wizard)
- Use `async/await` (no raw `.then()` chains)
- Error boundaries on every page/tab

## Keeping Documentation Current

When making changes that affect any of the following, update the corresponding docs in the same session:

| Change type | Update these docs |
|---|---|
| New route/page/screen | `CLAUDE.md` build status |
| New/changed AI feature | `docs/skills/ai-integration.md` |
| New migration file | `docs/skills/supabase-patterns.md` (Edge Functions list, migration count) |
| New Edge Function | `docs/skills/supabase-patterns.md` |
| Changed design tokens/colors | `docs/skills/design-system.md` |
| New i18n namespace or locale | `docs/skills/i18n-patterns.md` |
| Patient app UX changes | `docs/skills/patient-app-ux.md` |
| New user-facing language patterns | `docs/skills/regulatory-language.md` |

This is a coding convention, not optional. Outdated docs cause bugs.

## Critical Constraints

1. **Patient app must work OFFLINE** — cache today's plan and Help tab data locally. Queue writes for sync when online.
2. **"Take Me Home" uses Google Maps deep links** — never build in-app navigation.
3. **All text on patient screens must be ≥ 20px** — see `docs/skills/patient-app-ux.md`.
4. **Never use diagnostic/medical language in UI** — see `docs/skills/regulatory-language.md`.
5. **Emergency numbers auto-detect by country** — see `packages/shared/constants/emergency-numbers.ts`.
6. **Location tracking must be battery-efficient** — use significant location changes + geofencing, not continuous GPS.
7. **Voice notes upload to Supabase Storage** — transcribed by Gemini via Edge Function.
8. **AI responses must be streamed** — use server-sent events for Care Coach.
9. **Cross-platform subscription sync** — RevenueCat (mobile) + Stripe (web) both write to `households.subscription_status`.
10. **Web ↔ Mobile feature parity** — When building or changing a feature on caregiver-web, always check if the same feature/change applies to caregiver-app (and vice versa). If applicable, implement it on both platforms in the same session. The three caregiver surfaces (web, mobile app) should stay in sync. This also applies to patient-app if a feature has a caregiver-facing counterpart.

## Current Build Status

<!-- UPDATE THIS AFTER EVERY SESSION -->

### Foundation
- [x] Supabase project created and configured
- [x] Database schema migration applied
- [x] Shared TypeScript types
- [x] Supabase client + typed queries
- [x] Constants (categories, emergency numbers)
- [x] i18n setup with English strings

### Patient App
- [x] Care Code entry screen
- [x] Session persistence (auto-login)
- [x] Bottom tab navigation (Today + Help)
- [x] Today's Plan screen (timeline)
- [x] Task completion (with animation)
- [x] Time-of-day adaptive backgrounds
- [x] Offline mode (cached plan + queued writes)
- [x] Help tab — emergency contacts
- [x] Help tab — "Take Me Home" button
- [x] Silent alert on "Take Me Home" tap
- [x] Daily check-in (mood + sleep + voice)
- [x] Brain wellness activities (24 mind games — see below)
- [x] Push notification reminders
- [x] 24 evidence-based mind games across 7 cognitive categories (CST-aligned)
- [x] Mind games integrated into care plan (activity tasks with "Play" button, auto-complete on game finish)

### Caregiver Web App
- [x] Auth (login, signup, OAuth)
- [x] Onboarding wizard (6 steps)
- [x] Care Code generation + display
- [x] App layout shell (sidebar nav)
- [x] Dashboard (real-time status cards)
- [x] Care Plan builder (table/grid, inline editing)
- [x] AI Suggest tasks (including mind game suggestions)
- [x] Activity template picker (24 mind games assignable to care plan)
- [x] Location page (map, safe zones, alerts config)
- [x] AI Care Coach (chat with streaming)
- [x] Family Circle (invite, roles)
- [x] Care Journal (shared notes)
- [x] Caregiver Wellbeing (mood, self-care)
- [x] Doctor Visit Report generator
- [x] Settings (account, subscription, Care Code)
- [x] Email notifications (alerts + daily summary)
- [x] Crisis Hub (de-escalation wizard, scenario cards)
- [x] Behaviour Playbook
- [x] Resources & Journey Guide
- [x] Wellbeing Insights

### Caregiver Mobile App
- [x] Auth (mirrors web: login, signup, OAuth)
- [x] Onboarding (6-step wizard, simplified for mobile)
- [x] Dashboard tab (real-time stats, check-in, journal, alerts)
- [x] Care Plan tab (with mind game template picker + AI suggest)
- [x] Location tab (map, safe zones, recent alerts)
- [x] AI Coach tab (proactive insights, situation/workflow cards)
- [x] Coach conversation (streaming, markdown, add-to-plan)
- [x] Crisis Hub (de-escalation, scenario cards)
- [x] Behaviour Playbooks
- [x] Resources & Journey Guide
- [x] Family Circle (invite, roles)
- [x] Caregiver Wellbeing / Toolkit (mood, burnout detection, AI companion, SOS)
- [x] Doctor Visit Reports
- [x] Settings (account, subscription, Care Code, language, GDPR)
- [x] Push notifications
- [x] Subscription management (RevenueCat)
- [x] Multi-language support (24 languages)

### Integration
- [x] Real-time sync (Supabase Realtime across all 3 apps)
- [x] Push notification system (Edge Functions + Expo)
- [x] Email notification system (Edge Functions + Resend)
- [x] Subscription system (Stripe for web + RevenueCat for mobile)
- [x] Voice note pipeline (record → upload → transcribe via Gemini)
- [x] AI activity generation (daily cron via Edge Function)
- [x] AI weekly insights (weekly cron via Edge Function)
- [x] Daily summary email (evening cron)
- [x] Care Code validation Edge Function
- [x] Safe zone violation checker Edge Function
- [x] Device connectivity checker Edge Function
- [x] Alert escalation Edge Function
- [x] Help request notification Edge Function
- [x] Task reminders Edge Function
- [x] Safety alert email Edge Function
- [x] Activity completion notification Edge Function
- [x] Daily metrics aggregation Edge Function
- [x] Feedback system (bug reports + feature suggestions)

### Realtime Hooks (packages/supabase/hooks/)
- [x] useRealtimeTasks — tasks + completions combined
- [x] useRealtimeCompletions — standalone task completions
- [x] useRealtimeCheckins — daily check-ins
- [x] useRealtimeLocation — location logs
- [x] useRealtimeAlerts — location alerts
- [x] useRealtimeJournal — care journal entries

### GDPR Compliance (Beta Readiness)
- [x] Privacy Policy page (/privacy)
- [x] Terms of Service page (/terms)
- [x] Data Export API (GET /api/gdpr/export)
- [x] Account Deletion API (DELETE /api/gdpr/delete)
- [x] Settings page integration with GDPR features

## Build Complete — All 20 Prompts Done ✅

The MVP is feature-complete with 34 migrations, 14 Edge Functions, and 24 languages. Next steps:
1. Private beta with 50 families
2. Iterate based on feedback
3. App Store / Play Store submission
4. Launch
