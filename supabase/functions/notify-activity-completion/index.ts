// Notify Caregiver of Activity Completion
// Triggered by database webhook on activity_sessions UPDATE (when completed_at is set)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || (Deno.env.get('ENVIRONMENT') === 'production' ? 'https://app.ourturn.com' : '*');

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface ActivitySession {
  id: string;
  household_id: string;
  activity_type: string;
  cognitive_domain: string;
  completed_at: string | null;
  skipped: boolean;
}

interface Caregiver {
  id: string;
  name: string;
  device_tokens: string[];
  notification_preferences: {
    activity_updates?: boolean;
  };
}

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

const ACTIVITY_LABELS: Record<string, string> = {
  word_association: 'Word Association',
  proverbs: 'Proverbs',
  word_search: 'Word Search',
  word_scramble: 'Word Scramble',
  photo_pairs: 'Photo Pairs',
  color_sequence: 'Colour Sequence',
  spot_the_difference: 'Spot the Difference',
  odd_one_out: 'Odd One Out',
  pattern_sequence: 'Pattern Sequence',
  category_sort: 'Category Sort',
  gentle_quiz: 'Gentle Quiz',
  number_puzzles: 'Number Puzzles',
  rhyme_time: 'Rhyme Time',
  finish_the_sentence: 'Finish the Sentence',
  what_changed: 'What Changed?',
  emoji_count: 'Emoji Count',
  which_goes_together: 'Which Goes Together?',
  what_comes_next: 'What Comes Next?',
  picture_clues: 'Picture Clues',
  true_or_false: 'True or False',
  clock_reading: 'Clock Reading',
  coin_counting: 'Coin Counting',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { record, old_record } = await req.json();
    const session = record as ActivitySession;

    // Only notify for actual completions (not skips, not already completed)
    if (
      !session ||
      !session.household_id ||
      !session.completed_at ||
      session.skipped ||
      old_record?.completed_at // was already completed before this update
    ) {
      return new Response(
        JSON.stringify({ message: 'Not a new completion, skipping' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get patient name
    const { data: patient } = await supabase
      .from('patients')
      .select('name')
      .eq('household_id', session.household_id)
      .single();

    // Get caregivers with activity_updates enabled and device tokens
    const { data: caregivers } = await supabase
      .from('caregivers')
      .select('id, name, device_tokens, notification_preferences')
      .eq('household_id', session.household_id);

    if (!caregivers || caregivers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No caregivers found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const patientName = patient?.name || 'Your loved one';
    const activityLabel = ACTIVITY_LABELS[session.activity_type] || session.activity_type;

    // Collect tokens from caregivers who have activity_updates enabled (default: true)
    const tokens: string[] = [];
    caregivers.forEach((caregiver: Caregiver) => {
      if (
        caregiver.notification_preferences?.activity_updates !== false &&
        caregiver.device_tokens &&
        Array.isArray(caregiver.device_tokens)
      ) {
        tokens.push(...caregiver.device_tokens);
      }
    });

    if (tokens.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No device tokens found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const title = 'Mind Game Completed';
    const body = `${patientName} just finished "${activityLabel}" — well done!`;

    const messages: ExpoPushMessage[] = tokens.map((token) => ({
      to: token,
      title,
      body,
      sound: 'default',
      priority: 'normal',
      channelId: 'activity-updates',
      data: {
        sessionId: session.id,
        activityType: session.activity_type,
        householdId: session.household_id,
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
      const error = await response.text();
      console.error('Expo push error:', error);
      throw new Error(`Failed to send push notifications: ${error}`);
    }

    const result = await response.json();
    console.log('Activity completion notification result:', result);

    return new Response(
      JSON.stringify({ success: true, sent_to: tokens.length, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending activity completion notification:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
