// Runtime environment variable validation for caregiver-web
// Checks at import time so the app fails fast with clear errors

interface EnvVar {
  key: string;
  required: boolean;
  description: string;
}

const ENV_VARS: EnvVar[] = [
  { key: 'NEXT_PUBLIC_SUPABASE_URL', required: true, description: 'Supabase project URL' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true, description: 'Supabase anonymous key' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Supabase service role key (for admin operations)' },
  { key: 'NEXT_PUBLIC_APP_URL', required: false, description: 'App URL for redirects (falls back to request origin)' },
  { key: 'GOOGLE_AI_API_KEY', required: false, description: 'Google AI API key (for AI Coach)' },
  { key: 'STRIPE_SECRET_KEY', required: false, description: 'Stripe secret key (for subscriptions)' },
  { key: 'STRIPE_WEBHOOK_SECRET', required: false, description: 'Stripe webhook signing secret' },
  { key: 'STRIPE_PRICE_ID', required: false, description: 'Stripe price ID for OurTurn Plus' },
  { key: 'RESEND_API_KEY', required: false, description: 'Resend API key (for emails)' },
  { key: 'OPENAI_API_KEY', required: false, description: 'OpenAI API key (for voice transcription)' },
];

export interface EnvStatus {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

export function validateEnv(): EnvStatus {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const v of ENV_VARS) {
    if (!process.env[v.key]) {
      if (v.required) {
        missing.push(`${v.key} — ${v.description}`);
      } else {
        warnings.push(`${v.key} — ${v.description}`);
      }
    }
  }

  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    console.error(
      `[ENV] Missing required environment variables:\n${missing.map((m) => `  - ${m}`).join('\n')}`
    );
  }

  if (warnings.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn(
      `[ENV] Missing optional environment variables (some features will be disabled):\n${warnings.map((w) => `  - ${w}`).join('\n')}`
    );
  }

  return { valid: missing.length === 0, missing, warnings };
}
