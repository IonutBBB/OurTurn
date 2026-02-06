import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { createLogger } from '@/lib/logger';

const log = createLogger('stripe/checkout');

// Lazy initialization to avoid build-time errors when env vars are not set
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 5 checkout attempts per hour per user
    const rl = rateLimit(`stripe-checkout:${user.id}`, { limit: 5, windowSeconds: 3600 });
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

    const household = caregiver.households;

    // Check if already subscribed
    if (household.subscription_status === 'plus') {
      return NextResponse.json(
        { error: 'Already subscribed to Plus' },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Get or create Stripe customer
    let customerId = household.stripe_customer_id;

    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: caregiver.email,
        name: caregiver.name,
        metadata: {
          household_id: household.id,
          caregiver_id: caregiver.id,
        },
      });
      customerId = customer.id;

      // Store the customer ID in the household
      await supabase
        .from('households')
        .update({ stripe_customer_id: customerId })
        .eq('id', household.id);
    }

    // Get the app URL for redirects
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || '';

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // MemoGuard Plus price ID
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/settings?subscription=success`,
      cancel_url: `${appUrl}/settings?subscription=cancelled`,
      subscription_data: {
        metadata: {
          household_id: household.id,
        },
      },
      metadata: {
        household_id: household.id,
        caregiver_id: caregiver.id,
      },
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    log.error('Checkout failed', { error: error instanceof Error ? error.message : 'Unknown' });
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
