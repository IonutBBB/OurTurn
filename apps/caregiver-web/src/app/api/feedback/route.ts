// Feedback submission API route
// Accepts bug reports, feature suggestions, and general feedback
// Supports both cookie auth (web) and Bearer token auth (mobile)

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';

const VALID_CATEGORIES = ['bug_report', 'feature_suggestion', 'general_feedback'] as const;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FEEDBACK_EMAIL = 'support@ourturn.app';

export async function POST(request: NextRequest) {
  try {
    // Dual auth: Bearer token (mobile) or cookie (web)
    const authHeader = request.headers.get('authorization');
    let supabase;
    let user;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      );
      const { data: { user: tokenUser } } = await supabase.auth.getUser(token);
      user = tokenUser;
    } else {
      supabase = await createServerClient();
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get caregiver + household
    const { data: caregiver } = await supabase
      .from('caregivers')
      .select('id, household_id, name')
      .eq('user_id', user.id)
      .single();

    if (!caregiver) {
      return NextResponse.json({ error: 'Caregiver not found' }, { status: 404 });
    }

    // Rate limit: 5 submissions per hour per user
    const rl = rateLimit(`feedback:${caregiver.id}`, { limit: 5, windowSeconds: 3600 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      );
    }

    // Parse and validate body
    const { category, message, appVersion, platform } = await request.json();

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be one of: bug_report, feature_suggestion, general_feedback' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message too long (max 5000 characters)' }, { status: 400 });
    }

    // Insert feedback
    const { error: insertError } = await supabase
      .from('feedback')
      .insert({
        household_id: caregiver.household_id,
        caregiver_id: caregiver.id,
        category,
        message: message.trim(),
        app_version: appVersion || null,
        platform: platform || null,
      });

    if (insertError) {
      console.error('Failed to insert feedback:', insertError);
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    // Fire-and-forget email notification to team
    if (RESEND_API_KEY) {
      const categoryLabel = category === 'bug_report' ? 'Bug Report'
        : category === 'feature_suggestion' ? 'Feature Suggestion'
        : 'General Feedback';

      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'OurTurn Feedback <feedback@ourturn.app>',
          to: [FEEDBACK_EMAIL],
          subject: `[${categoryLabel}] New feedback from ${caregiver.name || 'a caregiver'}`,
          html: `
            <h2>${categoryLabel}</h2>
            <p><strong>From:</strong> ${caregiver.name || 'Unknown'}</p>
            <p><strong>Platform:</strong> ${platform || 'Unknown'}</p>
            <p><strong>App Version:</strong> ${appVersion || 'Unknown'}</p>
            <hr />
            <p>${message.trim().replace(/\n/g, '<br />')}</p>
          `,
        }),
      }).catch((err) => {
        console.error('Failed to send feedback notification email:', err);
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
