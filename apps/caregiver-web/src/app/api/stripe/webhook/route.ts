import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-01-28.clover',
});

// Use service role client for webhooks (not user-scoped)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

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
          console.error('Failed to update subscription status:', error);
        } else {
          console.log(`Subscription activated for household ${householdId}`);
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
          console.error('Failed to update subscription status:', error);
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
          console.error('Failed to update subscription status:', error);
        } else {
          console.log(`Subscription cancelled for household ${householdId}`);
        }
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      // Log failed payment - customer ID can help identify the household
      const customerId = typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer?.id;

      console.log(`Payment failed for customer: ${customerId}`);
      // In a production app, you would look up the household by customer ID
      // and send a notification to the caregiver about the failed payment
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

// Disable body parsing for webhooks (Stripe needs raw body)
export const config = {
  api: {
    bodyParser: false,
  },
};
