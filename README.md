# OurTurn

AI-powered daily care platform for families living with dementia. Three coordinated apps — a radically simple companion for the person with dementia, and an AI-powered care dashboard for family caregivers (mobile + web).

**This is a wellness app, NOT a medical device.** See `docs/skills/regulatory-language.md`.

## The Three Apps

| App | Location | Tech | User |
|---|---|---|---|
| **Patient App** | `apps/patient-app/` | React Native (Expo) | Person with dementia |
| **Caregiver Mobile** | `apps/caregiver-app/` | React Native (Expo) | Family caregiver |
| **Caregiver Web** | `apps/caregiver-web/` | Next.js (App Router) | Family caregiver |

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile framework | React Native with Expo SDK (managed workflow) |
| Web framework | Next.js 14+ with App Router |
| Styling (web) | Tailwind CSS |
| Styling (mobile) | React Native StyleSheet |
| Backend | Supabase (Postgres + Auth + Realtime + Storage + Edge Functions) |
| AI / LLM | Google Gemini 2.5 Flash API |
| Speech-to-text | Google Gemini 2.5 Flash |
| Maps | Google Maps API |
| Payments (mobile) | RevenueCat |
| Payments (web) | Stripe Checkout |
| State management | Zustand |
| i18n | i18next + react-i18next |

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- Supabase CLI (`npm install -g supabase`)
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (for mobile development)

### Install

```bash
npm install
```

### Environment Variables

Each app needs a `.env.local` file. See `docs/skills/supabase-patterns.md` for the full list.

Required for all apps:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Additional for caregiver-web:
- `GOOGLE_AI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Run

```bash
# Caregiver Web (Next.js)
cd apps/caregiver-web && npm run dev
# → http://localhost:3000

# Caregiver Mobile (Expo)
cd apps/caregiver-app && npx expo start --tunnel --go

# Patient App (Expo)
cd apps/patient-app && npx expo start --tunnel --go

# Supabase (local development)
supabase start
```

## Project Structure

```
apps/
  patient-app/         React Native (Expo) — patient companion
  caregiver-app/       React Native (Expo) — caregiver mobile
  caregiver-web/       Next.js 14+ — caregiver web dashboard
packages/
  shared/              TypeScript types, constants, utils
  supabase/            Supabase client, typed queries, realtime hooks
supabase/
  migrations/          SQL migration files (001–028)
  functions/           Edge Functions (13 Deno functions)
docs/
  MVP_PLAN.md          Full product specification
  TESTING_GUIDE.md     Testing guide (Playwright, Maestro, manual)
  skills/              Domain-specific development guides
```

## Documentation

- **Development guide:** `CLAUDE.md` — conventions, constraints, build status
- **Product spec:** `docs/MVP_PLAN.md` — full feature specification
- **AI integration:** `docs/skills/ai-integration.md` — Gemini, safety pipeline
- **Database:** `docs/skills/supabase-patterns.md` — auth, RLS, Edge Functions
- **Design system:** `docs/skills/design-system.md` — colors, fonts, components
- **Patient UX:** `docs/skills/patient-app-ux.md` — accessibility rules
- **i18n:** `docs/skills/i18n-patterns.md` — translation patterns
- **Regulatory:** `docs/skills/regulatory-language.md` — medical device avoidance
- **Testing:** `docs/TESTING_GUIDE.md` — Playwright, Maestro, manual testing

## How It Works

1. Caregiver signs up (web or mobile) and creates a care profile
2. System generates a **6-digit Care Code**
3. Patient app: enter Care Code once → session persists forever (no login needed)
4. All 3 apps sync in real-time via Supabase Realtime
5. AI Care Coach helps caregivers with daily care decisions
6. Patient follows their daily plan with large, simple task cards
