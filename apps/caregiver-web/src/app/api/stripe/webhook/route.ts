import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';
import { createLogger } from '@/lib/logger';

const log = createLogger('stripe/webhook');

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

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase environment variables are not configured');
  }
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  // Rate limit webhooks by IP: 100 per minute (generous for Stripe)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rl = rateLimit(`stripe-webhook:${ip}`, { limit: 100, windowSeconds: 60 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    log.error('STRIPE_WEBHOOK_SECRET not configured — ignoring webhook');
    return NextResponse.json({ received: true });
  }

  let event: Stripe.Event;
  let stripe: Stripe;

  try {
    stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    log.error('Webhook signature verification failed');
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const householdId = session.metadata?.household_id;

      if (householdId) {
        // Update household subscription status
        const { error } = await supabase
          .from('households')
          .update({
            subscription_status: 'plus',
            subscription_platform: 'web',
          })
          .eq('id', householdId);

        if (error) {
          log.error('Failed to update subscription status');
        }
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const householdId = subscription.metadata?.household_id;

      if (householdId) {
        // Check if subscription is still active
        const isActive = ['active', 'trialing'].includes(subscription.status);

        const { error } = await supabase
          .from('households')
          .update({
            subscription_status: isActive ? 'plus' : 'cancelled',
          })
          .eq('id', householdId);

        if (error) {
          log.error('Failed to update subscription status');
        }
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const householdId = subscription.metadata?.household_id;

      if (householdId) {
        // Mark subscription as cancelled
        const { error } = await supabase
          .from('households')
          .update({
            subscription_status: 'cancelled',
          })
          .eq('id', householdId);

        if (error) {
          log.error('Failed to update subscription status');
        }
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer?.id;

      if (customerId) {
        // Look up household by stripe_customer_id
        const { data: household } = await supabase
          .from('households')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (household) {
          // Mark subscription as past_due so the app can show a warning
          await supabase
            .from('households')
            .update({ subscription_status: 'past_due' })
            .eq('id', household.id);
        }
      }
      break;
    }

    default:
      // Unhandled event type - no action needed
  }

  return NextResponse.json({ received: true });
}
