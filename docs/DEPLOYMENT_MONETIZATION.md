# Monetization Deployment Checklist

## Overview

OurTurn uses an **optimized freemium + contextual 14-day trial** model:
- **Free tier**: 10 tasks/day, 1 caregiver, 3 AI Coach messages/month, emergency features always available
- **Plus tier**: Unlimited everything — £12.99/month or £99.99/year (36% savings)
- **Trial**: 14 days, no credit card required, triggered contextually when users hit limits

Annual plan is presented as the default/recommended option everywhere.

---

## Stripe Configuration

### 1. Create Annual Price in Stripe Dashboard

1. Go to **Stripe Dashboard > Products**
2. Find the existing "OurTurn Plus" product (the one linked to `STRIPE_PRICE_ID`)
3. Click **Add another price**
4. Set:
   - **Pricing model**: Standard
   - **Amount**: £99.99
   - **Billing period**: Yearly
   - **Currency**: GBP
5. Save and copy the new price ID (starts with `price_`)

### 2. Set Environment Variables

Add to your `.env` / deployment config:

```bash
# Existing (monthly)
STRIPE_PRICE_ID=price_xxxxxxxxx

# New (annual)
STRIPE_ANNUAL_PRICE_ID=price_xxxxxxxxx
```

The web checkout route (`/api/stripe/checkout`) reads these env vars. The checkout route accepts a `plan` parameter in the POST body:

```json
{ "plan": "annual" }   // default — uses STRIPE_ANNUAL_PRICE_ID
{ "plan": "monthly" }  // uses STRIPE_PRICE_ID
```

### 3. Run Database Migration

Apply migration `028_subscription_plan.sql`:

```sql
ALTER TABLE households ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT NULL;
```

This adds a `subscription_plan` column (`'monthly'` | `'annual'` | `NULL`) to the households table. The Stripe webhook writes this automatically on checkout completion.

Via Supabase CLI:
```bash
supabase db push
```

Or manually in the Supabase SQL Editor.

### 4. RevenueCat Configuration (Mobile)

All mobile users use RevenueCat (native IAP). Stripe is web-only.

1. Create an annual subscription product in **App Store Connect** and **Google Play Console**
2. Add the product to your RevenueCat **Offering** as a new package
3. The mobile app's `useSubscription` hook already handles multiple packages via `subscription.offerings.availablePackages`

---

## What Changed (Code)

### Free Tier Limits
- `packages/shared/utils/subscription.ts` — `FREE_LIMITS.maxTasks`: 20 → 10, `FREE_LIMITS.aiMessages`: 5 → 3

### Types
- `packages/shared/types/household.ts` — Added `SubscriptionPlan` type, `subscription_plan` field, `past_due` status

### Stripe Routes
- `apps/caregiver-web/src/app/api/stripe/checkout/route.ts` — Accepts `plan` param, routes to correct price ID (web only)
- `apps/caregiver-web/src/app/api/stripe/webhook/route.ts` — Stores `subscription_plan` from metadata

### UI Components
- `apps/caregiver-web/src/components/contextual-trial-prompt.tsx` — **New** contextual trial CTA
- `apps/caregiver-web/src/components/landing/pricing-plan-toggle.tsx` — **New** monthly/annual toggle
- `apps/caregiver-app/src/components/contextual-trial-prompt.tsx` — **New** mobile equivalent
- `apps/caregiver-web/src/components/upgrade-gate.tsx` — Updated to use trial messaging
- `apps/caregiver-web/src/components/landing/pricing-preview.tsx` — Uses plan toggle

### Integration Points (contextual trial prompts)
- `care-plan-client.tsx` — Task limit → ContextualTrialPrompt
- `family-client.tsx` (web) — Caregiver limit → ContextualTrialPrompt
- `coach-conversation.tsx` — AI message limit → ContextualTrialPrompt
- `family/index.tsx` (mobile) — Caregiver limit → ContextualTrialPrompt

### i18n Keys Added
- `subscription.contextualTrial.*` — Trial prompt copy (both web + mobile locales)
- `subscription.planToggle.*` — Monthly/Annual toggle labels
- `caregiverApp.landing.pricing.plusPriceMonthly/Annual` — New pricing display keys

---

## Pricing Reference

| Plan | Price | Effective Monthly | Savings |
|------|-------|-------------------|---------|
| Monthly | £12.99/month | £12.99 | — |
| Annual | £99.99/year | £8.33 | 36% |

One subscription covers the entire household (all caregivers + patient app).

---

## What NOT to Gate (Safety)

These features must ALWAYS be available on the free tier:
- Emergency contacts & emergency number
- "Take Me Home" button on patient app
- Daily check-ins (mood, sleep)
- Basic care plan (up to 10 tasks)
- Patient app functionality (never cut off)
