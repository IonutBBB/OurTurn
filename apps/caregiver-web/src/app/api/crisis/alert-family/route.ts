import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createLogger } from '@/lib/logger';

const log = createLogger('crisis/alert-family');
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { householdId } = await request.json();

    if (!householdId) {
      return NextResponse.json({ error: 'householdId is required' }, { status: 400 });
    }

    // Get requesting caregiver's name
    const { data: requestingCaregiver } = await supabase
      .from('caregivers')
      .select('name, household_id')
      .eq('id', user.id)
      .single();

    if (!requestingCaregiver || requestingCaregiver.household_id !== householdId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get patient name
    const { data: patient } = await supabase
      .from('patients')
      .select('name')
      .eq('household_id', householdId)
      .limit(1)
      .single();

    const patientName = patient?.name || 'your loved one';

    // Get all other caregivers in household with device tokens
    const { data: caregivers } = await supabase
      .from('caregivers')
      .select('id, name, device_tokens')
      .eq('household_id', householdId)
      .neq('id', user.id);

    if (!caregivers || caregivers.length === 0) {
      return NextResponse.json({ success: true, notified: 0 });
    }

    // Collect all device tokens
    const tokens: string[] = [];
    for (const cg of caregivers) {
      if (cg.device_tokens && Array.isArray(cg.device_tokens)) {
        for (const dt of cg.device_tokens) {
          if (dt.token) {
            tokens.push(dt.token);
          }
        }
      }
    }

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, notified: 0 });
    }

    // Send Expo push notifications
    const messages = tokens.map((token) => ({
      to: token,
      title: 'Crisis Alert',
      body: `${requestingCaregiver.name} needs help with ${patientName}. Please check in.`,
      sound: 'default' as const,
      priority: 'high' as const,
      channelId: 'safety-alerts',
      data: {
        type: 'crisis_alert',
        householdId,
        senderId: user.id,
      },
    }));

    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      await response.text();
      log.error('Expo push notification delivery failed');
      return NextResponse.json(
        { error: 'Failed to send notifications' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, notified: tokens.length });
  } catch (error) {
    log.error('Alert family failed', { error: error instanceof Error ? error.message : 'Unknown' });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
