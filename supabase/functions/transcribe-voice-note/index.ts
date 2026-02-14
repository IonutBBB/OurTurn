// Transcribe Voice Note Edge Function
// Uses Gemini 2.5 Flash to transcribe voice notes and updates the database

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { encode as base64Encode } from 'https://deno.land/std@0.168.0/encoding/base64.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || (Deno.env.get('ENVIRONMENT') === 'production' ? 'https://app.ourturn.com' : '*');

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

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
    if (!GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY is not configured');
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

    const audioBytes = new Uint8Array(await audioResponse.arrayBuffer());
    const audioBase64 = base64Encode(audioBytes);

    // Call Gemini API with inline audio data
    console.log('Calling Gemini API for transcription...');
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType: 'audio/mp4', data: audioBase64 } },
            { text: 'Transcribe this audio recording exactly. Return only the transcript text, nothing else.' },
          ],
        }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const result = await geminiResponse.json();
    const transcript = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (!transcript) {
      throw new Error('Gemini returned empty transcript');
    }

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
