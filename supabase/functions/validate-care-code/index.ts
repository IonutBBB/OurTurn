// Validate Care Code Edge Function
// Returns a JWT with household_id claim for patient device authentication

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SignJWT, jwtVerify } from 'https://deno.land/x/jose@v4.14.4/index.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// JWT secret for signing patient tokens (use Supabase JWT secret)
const JWT_SECRET = new TextEncoder().encode(
  Deno.env.get('SUPABASE_JWT_SECRET') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// Token expiration (1 year - patient tokens are long-lived)
const TOKEN_EXPIRATION = '365d';

interface ValidateRequest {
  code: string;
}

interface ValidateResponse {
  success: boolean;
  token?: string;
  householdId?: string;
  patientName?: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { code }: ValidateRequest = await req.json();

    // Validate code format
    if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid code format. Please enter a 6-digit code.',
        } as ValidateResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Look up household by care code
    const { data: household, error: householdError } = await supabase
      .from('households')
      .select('id, timezone, language, country')
      .eq('care_code', code)
      .single();

    if (householdError || !household) {
      console.log('Care code not found:', code);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Care code not found. Please check and try again.',
        } as ValidateResponse),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get patient info for the household
    const { data: patient } = await supabase
      .from('patients')
      .select('id, name, home_latitude, home_longitude, emergency_number, wake_time, sleep_time')
      .eq('household_id', household.id)
      .single();

    if (!patient) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Care profile not set up yet. Please ask your family to complete setup.',
        } as ValidateResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate JWT with household_id claim
    const token = await new SignJWT({
      household_id: household.id,
      patient_id: patient.id,
      role: 'patient',
      aud: 'authenticated',
      iss: 'supabase',
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime(TOKEN_EXPIRATION)
      .setSubject(patient.id)
      .sign(JWT_SECRET);

    // Return success with token and patient info
    const response: ValidateResponse = {
      success: true,
      token,
      householdId: household.id,
      patientName: patient.name,
    };

    // Include additional data the patient app needs
    const extendedResponse = {
      ...response,
      patient: {
        id: patient.id,
        name: patient.name,
        homeLatitude: patient.home_latitude,
        homeLongitude: patient.home_longitude,
        emergencyNumber: patient.emergency_number,
        wakeTime: patient.wake_time,
        sleepTime: patient.sleep_time,
      },
      household: {
        id: household.id,
        timezone: household.timezone,
        language: household.language,
        country: household.country,
      },
    };

    return new Response(JSON.stringify(extendedResponse), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Care code validation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Something went wrong. Please try again.',
      } as ValidateResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper function to verify a patient token (can be used by other Edge Functions)
export async function verifyPatientToken(
  token: string
): Promise<{ valid: boolean; householdId?: string; patientId?: string }> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      valid: true,
      householdId: payload.household_id as string,
      patientId: payload.patient_id as string,
    };
  } catch {
    return { valid: false };
  }
}
