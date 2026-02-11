// Generate Daily Brain Activities Edge Function
// Runs daily via cron to create personalized brain wellness activities for each household

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || (Deno.env.get('ENVIRONMENT') === 'production' ? 'https://app.ourturn.com' : '*');

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface Patient {
  id: string;
  name: string;
  household_id: string;
  biography: {
    hobbies?: string;
    career?: string;
    favorite_music?: string;
    favorite_foods?: string;
    important_people?: string;
    key_events?: string;
    childhood_location?: string;
    photos?: string[];
  } | null;
  stage: string;
}

interface ActivityType {
  type: 'reminiscence' | 'photo' | 'word_game' | 'music' | 'creative' | 'orientation';
  weight: number;
}

const ACTIVITY_TYPES: ActivityType[] = [
  { type: 'reminiscence', weight: 30 },
  { type: 'word_game', weight: 20 },
  { type: 'creative', weight: 20 },
  { type: 'orientation', weight: 15 },
  { type: 'music', weight: 15 },
];

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

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDate = tomorrow.toISOString().split('T')[0];

    // Get all patients with Plus subscription
    const { data: households } = await supabase
      .from('households')
      .select('id')
      .eq('subscription_status', 'plus');

    if (!households || households.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No Plus households found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let generated = 0;
    let errors = 0;

    for (const household of households) {
      try {
        // Check if activity already exists for this date
        const { data: existing } = await supabase
          .from('brain_activities')
          .select('id')
          .eq('household_id', household.id)
          .eq('date', targetDate)
          .single();

        if (existing) {
          console.log(`Activity already exists for household ${household.id} on ${targetDate}`);
          continue;
        }

        // Get patient info
        const { data: patient } = await supabase
          .from('patients')
          .select('id, name, biography, stage, household_id')
          .eq('household_id', household.id)
          .single();

        if (!patient) {
          console.log(`No patient found for household ${household.id}`);
          continue;
        }

        // Generate activity
        const activity = await generateActivity(patient as Patient, targetDate);

        // Insert into database
        const insertData: Record<string, unknown> = {
          household_id: household.id,
          date: targetDate,
          activity_type: activity.type,
          prompt_text: activity.prompt,
          follow_up_text: activity.followUp,
          completed: false,
        };
        if (activity.mediaUrl) {
          insertData.media_url = activity.mediaUrl;
        }
        const { error: insertError } = await supabase.from('brain_activities').insert(insertData);

        if (insertError) {
          console.error(`Failed to insert activity for household ${household.id}:`, insertError);
          errors++;
        } else {
          generated++;
        }
      } catch (err) {
        console.error(`Error processing household ${household.id}:`, err);
        errors++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        date: targetDate,
        generated,
        errors,
        total: households.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Activity generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate activities' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function selectActivityType(hasPhotos: boolean): string {
  const types = [...ACTIVITY_TYPES];
  if (hasPhotos) {
    types.push({ type: 'photo', weight: 15 });
  }
  const totalWeight = types.reduce((sum, t) => sum + t.weight, 0);
  let random = Math.random() * totalWeight;

  for (const activityType of types) {
    random -= activityType.weight;
    if (random <= 0) {
      return activityType.type;
    }
  }

  return 'reminiscence';
}

async function generateActivity(
  patient: Patient,
  date: string
): Promise<{ type: string; prompt: string; followUp: string; mediaUrl: string | null }> {
  const bio = patient.biography || {};
  const hasPhotos = Array.isArray(bio.photos) && bio.photos.length > 0;
  const activityType = selectActivityType(hasPhotos);

  // Build context from patient biography
  const bioContext = [
    bio.hobbies ? `Hobbies: ${bio.hobbies}` : '',
    bio.career ? `Career: ${bio.career}` : '',
    bio.favorite_music ? `Favorite music: ${bio.favorite_music}` : '',
    bio.favorite_foods ? `Favorite foods: ${bio.favorite_foods}` : '',
    bio.important_people ? `Important people: ${bio.important_people}` : '',
    bio.key_events ? `Key life events: ${bio.key_events}` : '',
    bio.childhood_location ? `Grew up in: ${bio.childhood_location}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const systemPrompt = `You are a compassionate activity creator for people with ${patient.stage}-stage dementia.
Your task is to create a short, engaging ${activityType} activity for ${patient.name}.

PATIENT BACKGROUND:
${bioContext || 'No biography provided - create a general, universally appealing activity.'}

ACTIVITY TYPE: ${activityType}
Activity type descriptions:
- reminiscence: Ask about a specific memory from their life, use their biography
- photo: A warm reminiscence question about a family photo the patient is looking at
- word_game: Simple word association or naming categories (e.g., "Name 5 fruits")
- creative: Imaginative prompt (e.g., "Describe your perfect vacation")
- orientation: Gentle awareness prompt (e.g., "What season is it now?")
- music: Suggest listening to a specific song they love and ask about a musical memory${activityType === 'music' && bio.favorite_music ? `. Include a specific song suggestion from their favorites: ${bio.favorite_music}` : ''}

RULES:
1. Keep the prompt to 1-2 sentences maximum
2. Use ${patient.name}'s name naturally
3. Never test or score - this is for enjoyment
4. Avoid anything that could cause frustration
5. For ${patient.stage} stage: ${patient.stage === 'early' ? 'Can handle moderate complexity' : patient.stage === 'moderate' ? 'Keep simple and concrete' : 'Very simple, one concept at a time'}
6. Make it warm and inviting
7. Never use medical language

Return JSON in this exact format:
{
  "prompt": "The activity prompt text",
  "followUp": "A warm, encouraging response to use after they answer"${activityType === 'music' ? ',\n  "songName": "The specific song name and artist to search for (if applicable)"' : ''}
}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 256,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Gemini API error:', error);
    // Fallback to default activity
    return getDefaultActivity(activityType, patient.name);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Determine media_url based on activity type
      let mediaUrl: string | null = null;
      if (activityType === 'photo' && hasPhotos) {
        // Pick a random photo from the patient's gallery
        const photoIndex = Math.floor(Math.random() * bio.photos!.length);
        mediaUrl = bio.photos![photoIndex];
      } else if (activityType === 'music' && parsed.songName) {
        // Create YouTube search link for the song
        const query = encodeURIComponent(parsed.songName);
        mediaUrl = `https://www.youtube.com/results?search_query=${query}`;
      }

      return {
        type: activityType,
        prompt: parsed.prompt,
        followUp: parsed.followUp,
        mediaUrl,
      };
    }
  } catch {
    console.error('Failed to parse Gemini response:', text);
  }

  return getDefaultActivity(activityType, patient.name, hasPhotos ? bio.photos! : []);
}

function getDefaultActivity(
  type: string,
  patientName: string,
  photos: string[] = []
): { type: string; prompt: string; followUp: string; mediaUrl: string | null } {
  const defaults: Record<string, { prompt: string; followUp: string }> = {
    reminiscence: {
      prompt: `${patientName}, what's a favorite memory from when you were younger?`,
      followUp: "What a wonderful memory! Thank you for sharing that with us.",
    },
    photo: {
      prompt: `${patientName}, take a look at this photo. Can you tell us about it?`,
      followUp: "What a lovely memory! Thank you for sharing that with us.",
    },
    word_game: {
      prompt: `${patientName}, can you name some of your favorite foods?`,
      followUp: 'Those sound delicious! Great choices.',
    },
    creative: {
      prompt: `${patientName}, if you could visit anywhere in the world, where would you go?`,
      followUp: "That sounds like a beautiful place! What a lovely idea.",
    },
    orientation: {
      prompt: `${patientName}, what season do you think we're in right now?`,
      followUp: "That's right! The weather has been lovely lately.",
    },
    music: {
      prompt: `${patientName}, what kind of music do you enjoy listening to?`,
      followUp: 'Music is such a wonderful part of life. Thank you for sharing!',
    },
  };

  let mediaUrl: string | null = null;
  if (type === 'photo' && photos.length > 0) {
    mediaUrl = photos[Math.floor(Math.random() * photos.length)];
  }

  return {
    type,
    mediaUrl,
    ...(defaults[type] || defaults.reminiscence),
  };
}
