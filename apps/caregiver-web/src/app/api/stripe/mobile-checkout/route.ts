import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';
import { createLogger } from '@/lib/logger';

const log = createLogger('stripe/mobile-checkout');

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(key, {
      apiVersion: '2026-01-28.clover',
    });
  }
  return stripeInstance;
}

function getSupabaseWithToken(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate via Bearer token (mobile sends JWT, not cookies)
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const supabase = getSupabaseWithToken(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 5 checkout attempts per hour per user
    const rl = rateLimit(`stripe-mobile-checkout:${user.id}`, { limit: 5, windowSeconds: 3600 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many checkout attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      );
    }

    // Get caregiver and household data
    const { data: caregiver } = await supabase
      .from('caregivers')
      .select(`
        *,
        households (*)
      `)
      .eq('id', user.id)
      .single();

    if (!caregiver?.households) {
      return NextResponse.json({ error: 'No household found' }, { status: 400 });
    }

    const household = Array.isArray(caregiver.households)
      ? caregiver.households[0]
      : caregiver.households;

    // Check if already subscribed
    if (household.subscription_status === 'plus') {
      return NextResponse.json(
        { error: 'Already subscribed to Plus' },
        { status: 400 }
      );
    }

    // Parse optional plan parameter (default to annual as recommended)
    let plan: 'monthly' | 'annual' = 'annual';
    try {
      const body = await request.json();
      if (body.plan === 'monthly' || body.plan === 'annual') {
        plan = body.plan;
      }
    } catch {
      // No body or invalid JSON — use default
    }

    const priceId = plan === 'annual'
      ? process.env.STRIPE_ANNUAL_PRICE_ID
      : process.env.STRIPE_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: `Stripe price ID not configured for ${plan} plan` },
        { status: 500 }
      );
    }

    const stripe = getStripe();

    // Get or create Stripe customer
    let customerId = household.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: caregiver.email,
        name: caregiver.name,
        metadata: {
          household_id: household.id,
          caregiver_id: caregiver.id,
        },
      });
      customerId = customer.id;

      await supabase
        .from('households')
        .update({ stripe_customer_id: customerId })
        .eq('id', household.id);
    }

    // Create Stripe Checkout session with mobile redirect URLs
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: 'ourturn-caregiver://stripe-callback?status=success',
      cancel_url: 'ourturn-caregiver://stripe-callback?status=cancelled',
      subscription_data: {
        metadata: {
          household_id: household.id,
          plan,
        },
      },
      metadata: {
        household_id: household.id,
        caregiver_id: caregiver.id,
        plan,
      },
      // Show localized prices for international customers (USD, EUR, etc.)
      adaptive_pricing: { enabled: true },
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    log.error('Mobile checkout failed', { error: error instanceof Error ? error.message : 'Unknown' });
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
