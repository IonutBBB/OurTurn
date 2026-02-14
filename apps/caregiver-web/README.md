# OurTurn — Caregiver Web Dashboard

Next.js 14+ web application for family caregivers. Full care management dashboard with AI-powered coaching, care plan building, location tracking, and doctor visit reports.

## Prerequisites

- Node.js 18+
- Supabase project with migrations applied
- Environment variables (see below)

## Environment Variables

Create `.env.local` in this directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GOOGLE_AI_API_KEY=...
GOOGLE_MAPS_API_KEY=AIza...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

## Run Locally

```bash
npm run dev
# → http://localhost:3000
```

## Key Routes

| Route | Feature |
|---|---|
| `/` | Landing page |
| `/dashboard` | Real-time status overview |
| `/care-plan` | Care plan builder (task CRUD, AI suggestions) |
| `/location` | Map, safe zones, alerts |
| `/coach` | AI Care Coach (streaming chat) |
| `/coach/behaviours` | Behaviour Playbook |
| `/resources` | Resources & Journey Guide |
| `/family` | Family Circle + Care Journal |
| `/wellbeing` | Caregiver Toolkit |
| `/wellbeing/insights` | Wellbeing Insights |
| `/crisis` | Crisis Hub (de-escalation wizard) |
| `/reports` | Doctor Visit Reports |
| `/settings` | Account, subscription, Care Code, GDPR |

## Architecture

- **Framework:** Next.js 14+ with App Router
- **Styling:** Tailwind CSS
- **AI:** Google Gemini 2.5 Flash via 5 API routes in `src/app/api/ai/`
- **Safety:** 10-file AI safety pipeline at `src/lib/ai-safety/`
- **Auth:** Supabase Auth (email + OAuth)
- **Payments:** Stripe Checkout + Customer Portal

See the root `CLAUDE.md` and `docs/` for detailed documentation.
