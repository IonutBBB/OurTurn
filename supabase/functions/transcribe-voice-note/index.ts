// Transcribe Voice Note Edge Function
// Uses OpenAI Whisper API to transcribe voice notes and updates the database

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

interface TranscribeRequest {
  voiceNoteUrl: string;
  checkinId?: string;
  activityId?: string;
  householdId: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { voiceNoteUrl, checkinId, activityId, householdId }: TranscribeRequest =
      await req.json();

    if (!voiceNoteUrl || !householdId) {
      return new Response(
        JSON.stringify({ error: 'voiceNoteUrl and householdId are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Download the audio file from Supabase Storage
    console.log('Downloading audio from:', voiceNoteUrl);

    const audioResponse = await fetch(voiceNoteUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio: ${audioResponse.statusText}`);
    }

    const audioBlob = await audioResponse.blob();

    // Prepare form data for Whisper API
    const formData = new FormData();
    formData.append('file', audioBlob, 'voice_note.m4a');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en'); // Can be dynamic based on household.language
    formData.append('response_format', 'json');

    // Call Whisper API
    console.log('Calling Whisper API...');
    const whisperResponse = await fetch(WHISPER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('Whisper API error:', errorText);
      throw new Error(`Whisper API error: ${whisperResponse.status}`);
    }

    const result = await whisperResponse.json();
    const transcript = result.text;

    console.log('Transcription complete:', transcript.substring(0, 100) + '...');

    // Update the appropriate table with the transcript
    if (checkinId) {
      // Update daily check-in
      const { error } = await supabase
        .from('daily_checkins')
        .update({ voice_note_transcript: transcript })
        .eq('id', checkinId)
        .eq('household_id', householdId);

      if (error) {
        console.error('Failed to update daily_checkins:', error);
        throw error;
      }
    } else if (activityId) {
      // Update brain activity
      const { error } = await supabase
        .from('brain_activities')
        .update({ patient_response_text: transcript })
        .eq('id', activityId)
        .eq('household_id', householdId);

      if (error) {
        console.error('Failed to update brain_activities:', error);
        throw error;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        transcript,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Transcription error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to transcribe voice note' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
