import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';
import { createLogger } from '@/lib/logger';

const log = createLogger('stripe/mobile-portal');

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

    // Rate limit: 10 portal requests per hour per user
    const rl = rateLimit(`stripe-mobile-portal:${user.id}`, { limit: 10, windowSeconds: 3600 });
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

    // Create Stripe billing portal session with mobile return URL
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'ourturn-caregiver://stripe-callback?status=portal-return',
    });

    return NextResponse.json({ portalUrl: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create portal session';
    log.error('Mobile portal session failed', { error: error instanceof Error ? error.message : 'Unknown' });
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
