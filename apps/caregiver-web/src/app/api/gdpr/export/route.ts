// GDPR Data Export API Route
// Allows users to download all their household data (right to portability)

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 5 export requests per hour per user
    const rl = rateLimit(`gdpr-export:${user.id}`, { limit: 5, windowSeconds: 3600 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many export requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      );
    }

    // Get caregiver and household info
    const { data: caregiver, error: caregiverError } = await supabase
      .from('caregivers')
      .select('id, household_id, name, email, relationship, role')
      .eq('id', user.id)
      .single();

    if (caregiverError || !caregiver) {
      return NextResponse.json({ error: 'Caregiver not found' }, { status: 404 });
    }

    const householdId = caregiver.household_id;

    // Fetch all household data in parallel
    const [
      householdResult,
      patientResult,
      caregiversResult,
      tasksResult,
      completionsResult,
      checkinsResult,
      journalResult,
      locationLogsResult,
      safeZonesResult,
      alertsResult,
      conversationsResult,
      wellbeingResult,
      activitiesResult,
      reportsResult,
      insightsResult,
    ] = await Promise.all([
      // Household
      supabase
        .from('households')
        .select('id, care_code, timezone, language, country, subscription_status, created_at')
        .eq('id', householdId)
        .single(),

      // Patient
      supabase
        .from('patients')
        .select('*')
        .eq('household_id', householdId)
        .single(),

      // All caregivers in household
      supabase
        .from('caregivers')
        .select('id, name, email, relationship, role, created_at')
        .eq('household_id', householdId),

      // Care plan tasks
      supabase
        .from('care_plan_tasks')
        .select('*')
        .eq('household_id', householdId)
        .order('time', { ascending: true }),

      // Task completions
      supabase
        .from('task_completions')
        .select('*')
        .eq('household_id', householdId)
        .order('date', { ascending: false })
        .limit(1000),

      // Daily check-ins
      supabase
        .from('daily_checkins')
        .select('*')
        .eq('household_id', householdId)
        .order('date', { ascending: false })
        .limit(365),

      // Care journal entries
      supabase
        .from('care_journal_entries')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false }),

      // Location logs (last 30 days only due to retention policy)
      supabase
        .from('location_logs')
        .select('*')
        .eq('household_id', householdId)
        .order('timestamp', { ascending: false })
        .limit(1000),

      // Safe zones
      supabase
        .from('safe_zones')
        .select('*')
        .eq('household_id', householdId),

      // Location alerts
      supabase
        .from('location_alerts')
        .select('*')
        .eq('household_id', householdId)
        .order('triggered_at', { ascending: false })
        .limit(500),

      // AI conversations (for requesting user only)
      supabase
        .from('ai_conversations')
        .select('*')
        .eq('caregiver_id', user.id)
        .order('updated_at', { ascending: false }),

      // Caregiver wellbeing logs (for requesting user only)
      supabase
        .from('caregiver_wellbeing_logs')
        .select('*')
        .eq('caregiver_id', user.id)
        .order('date', { ascending: false }),

      // Brain activities
      supabase
        .from('brain_activities')
        .select('*')
        .eq('household_id', householdId)
        .order('date', { ascending: false })
        .limit(365),

      // Doctor visit reports
      supabase
        .from('doctor_visit_reports')
        .select('*')
        .eq('household_id', householdId)
        .order('generated_at', { ascending: false }),

      // Weekly insights
      supabase
        .from('weekly_insights')
        .select('*')
        .eq('household_id', householdId)
        .order('week_start', { ascending: false })
        .limit(52),
    ]);

    // Compile the export data
    const exportData = {
      exportDate: new Date().toISOString(),
      exportedBy: {
        id: user.id,
        email: user.email,
        name: caregiver.name,
      },
      household: householdResult.data,
      patient: patientResult.data
        ? {
            ...patientResult.data,
            // Remove sensitive device tokens from export
            device_tokens: '[REDACTED - Device tokens not exported for security]',
          }
        : null,
      caregivers: (caregiversResult.data || []).map((c) => ({
        ...c,
        // Don't export other caregivers' IDs for privacy
        id: c.id === user.id ? c.id : '[REDACTED]',
      })),
      carePlan: {
        tasks: tasksResult.data || [],
        completions: completionsResult.data || [],
      },
      dailyCheckins: checkinsResult.data || [],
      careJournal: journalResult.data || [],
      location: {
        safeZones: safeZonesResult.data || [],
        alerts: alertsResult.data || [],
        logs: locationLogsResult.data || [],
      },
      aiConversations: conversationsResult.data || [],
      caregiverWellbeing: wellbeingResult.data || [],
      brainActivities: activitiesResult.data || [],
      doctorReports: reportsResult.data || [],
      weeklyInsights: insightsResult.data || [],
      metadata: {
        version: '1.0',
        format: 'MemoGuard GDPR Export',
        dataRetentionNote:
          'Location data older than 30 days is automatically deleted per our privacy policy.',
      },
    };

    // Return as downloadable JSON file
    const filename = `memoguard-export-${new Date().toISOString().split('T')[0]}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    console.error('GDPR export error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Export failed' },
      { status: 500 }
    );
  }
}
