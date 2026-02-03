# MemoGuard — Project Guide

## What This Is

MemoGuard is a dementia daily care platform with 3 apps that help families manage daily life with dementia. This is a **wellness app, NOT a medical device**. Read `docs/skills/regulatory-language.md` before writing ANY user-facing text.

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
apps/caregiver-web/      → Next.js 14+ App Router, Tailwind CSS
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
| Web framework | Next.js 14+ with App Router |
| Styling (web) | Tailwind CSS |
| Styling (mobile) | React Native StyleSheet |
| Backend | Supabase (Postgres + Auth + Realtime + Storage + Edge Functions) |
| AI / LLM | Google Gemini 2.5 Flash API |
| Speech-to-text | OpenAI Whisper API |
| Maps display | Google Maps API (@vis.gl/react-google-maps for web, react-native-maps for mobile) |
| Navigation home | Google Maps deep links (not in-app navigation) |
| Location tracking | expo-location (background mode) |
| Voice recording | expo-av |
| Push notifications | expo-notifications + Supabase Edge Functions |
| Email | Resend |
| Payments (mobile) | RevenueCat |
| Payments (web) | Stripe Checkout |
| State management | Zustand |
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

## Critical Constraints

1. **Patient app must work OFFLINE** — cache today's plan and Help tab data locally. Queue writes for sync when online.
2. **"Take Me Home" uses Google Maps deep links** — never build in-app navigation.
3. **All text on patient screens must be ≥ 20px** — see `docs/skills/patient-app-ux.md`.
4. **Never use diagnostic/medical language in UI** — see `docs/skills/regulatory-language.md`.
5. **Emergency numbers auto-detect by country** — see `packages/shared/constants/emergency-numbers.ts`.
6. **Location tracking must be battery-efficient** — use significant location changes + geofencing, not continuous GPS.
7. **Voice notes upload to Supabase Storage** — transcribed by Whisper via Edge Function.
8. **AI responses must be streamed** — use server-sent events for Care Coach.
9. **Cross-platform subscription sync** — RevenueCat (mobile) + Stripe (web) both write to `households.subscription_status`.

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
- [ ] Today's Plan screen (timeline)
- [ ] Task completion (with animation)
- [ ] Time-of-day adaptive backgrounds
- [ ] Help tab — emergency contacts
- [ ] Help tab — "Take Me Home" button
- [ ] Silent alert on "Take Me Home" tap
- [ ] Daily check-in (mood + sleep + voice)
- [ ] Brain wellness activity
- [ ] Push notification reminders
- [ ] Offline mode (cached plan + queued writes)

### Caregiver Web App
- [ ] Auth (login, signup, OAuth)
- [ ] Onboarding wizard (6 steps)
- [ ] Care Code generation + display
- [ ] App layout shell (sidebar nav)
- [ ] Dashboard (real-time status cards)
- [ ] Care Plan builder (table/grid, inline editing)
- [ ] AI Suggest tasks
- [ ] Location page (map, safe zones, alerts config)
- [ ] AI Care Coach (chat with streaming)
- [ ] Family Circle (invite, roles)
- [ ] Care Journal (shared notes)
- [ ] Caregiver Wellbeing (mood, self-care)
- [ ] Doctor Visit Report generator
- [ ] Settings (account, subscription, Care Code)
- [ ] Email notifications (alerts + daily summary)

### Caregiver Mobile App
- [ ] Auth (mirrors web)
- [ ] Onboarding (mirrors web, adapted for mobile)
- [ ] Dashboard tab
- [ ] Care Plan tab
- [ ] Location tab
- [ ] AI Coach tab
- [ ] More tab (Family, Wellbeing, Settings)
- [ ] Push notifications

### Integration
- [ ] Real-time sync (Supabase Realtime across all 3 apps)
- [ ] Push notification system (Edge Functions + Expo)
- [ ] Email notification system (Edge Functions + Resend)
- [ ] Subscription system (RevenueCat + Stripe + sync)
- [ ] Voice note pipeline (record → upload → transcribe)
- [ ] AI activity generation (daily cron)
- [ ] AI weekly insights (weekly cron)
- [ ] Daily summary email (evening cron)
