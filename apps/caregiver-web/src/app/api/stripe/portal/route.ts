import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient as createServerClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-01-28.clover',
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    if (!caregiver?.households) {
      return NextResponse.json({ error: 'No household found' }, { status: 400 });
    }

    // Find Stripe customer by email
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

    const customerId = customers.data[0].id;

    // Get the app URL for redirect
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || '';

    // Create Stripe billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/settings`,
    });

    return NextResponse.json({ portalUrl: session.url });
  } catch (error: any) {
    console.error('Stripe portal error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
