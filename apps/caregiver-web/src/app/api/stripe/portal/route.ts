import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { createLogger } from '@/lib/logger';

const log = createLogger('stripe/portal');

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

    // Rate limit: 10 portal requests per hour per user
    const rl = rateLimit(`stripe-portal:${user.id}`, { limit: 10, windowSeconds: 3600 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      );
    }

    // Get caregiver data
    const { data: caregiver } = await supabase
      .from('caregivers')
      .select(`
        *,
        households (*)
      `)
      .eq('id', user.id)
      .single();

    const household = Array.isArray(caregiver?.households)
      ? caregiver.households[0]
      : caregiver?.households;

    if (!household) {
      return NextResponse.json({ error: 'No household found' }, { status: 400 });
    }

    const stripe = getStripe();

    // Use stored stripe_customer_id, fall back to email search
    let customerId = household.stripe_customer_id;

    if (!customerId) {
      const customers = await stripe.customers.list({
        email: caregiver.email,
        limit: 1,
      });

      if (customers.data.length === 0) {
        return NextResponse.json(
          { error: 'No subscription found. Please contact support.' },
          { status: 400 }
        );
      }

      customerId = customers.data[0].id;
    }

    // Get the app URL for redirect
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || '';

    // Create Stripe billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/settings`,
    });

    return NextResponse.json({ portalUrl: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create portal session';
    log.error('Portal session failed', { error: error instanceof Error ? error.message : 'Unknown' });
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
