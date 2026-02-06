import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateEnv } from '@/lib/validate-env';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, { status: 'ok' | 'fail'; ms?: number; error?: string }> = {};

  // 1. Environment variables
  const env = validateEnv();
  checks.env = env.valid
    ? { status: 'ok' }
    : { status: 'fail', error: `Missing: ${env.missing.join(', ')}` };

  // 2. Database connectivity
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const dbStart = Date.now();
      const supabase = createClient(url, key);
      const { error } = await supabase.from('households').select('id').limit(1);
      checks.database = error
        ? { status: 'fail', error: error.message, ms: Date.now() - dbStart }
        : { status: 'ok', ms: Date.now() - dbStart };
    } else {
      checks.database = { status: 'fail', error: 'Supabase credentials not configured' };
    }
  } catch (err) {
    checks.database = { status: 'fail', error: err instanceof Error ? err.message : 'Unknown error' };
  }

  // 3. External services reachability
  checks.stripe = process.env.STRIPE_SECRET_KEY ? { status: 'ok' } : { status: 'fail', error: 'Not configured' };
  checks.google_ai = process.env.GOOGLE_AI_API_KEY ? { status: 'ok' } : { status: 'fail', error: 'Not configured' };
  checks.resend = process.env.RESEND_API_KEY ? { status: 'ok' } : { status: 'fail', error: 'Not configured' };

  const allOk = Object.values(checks).every((c) => c.status === 'ok');
  const totalMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime?.() ?? null,
      responseTime: `${totalMs}ms`,
      checks,
    },
    { status: allOk ? 200 : 503 }
  );
}
