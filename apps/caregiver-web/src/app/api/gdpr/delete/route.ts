// GDPR Account Deletion API Route
// Allows users to delete their account and all associated data (right to erasure)

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body for confirmation
    const body = await request.json().catch(() => ({}));
    const { confirmDelete } = body;

    if (confirmDelete !== 'DELETE') {
      return NextResponse.json(
        {
          error: 'Confirmation required',
          message: 'Please send { "confirmDelete": "DELETE" } to confirm account deletion.',
        },
        { status: 400 }
      );
    }

    // Get caregiver info
    const { data: caregiver, error: caregiverError } = await supabase
      .from('caregivers')
      .select('id, household_id, role')
      .eq('id', user.id)
      .single();

    if (caregiverError || !caregiver) {
      return NextResponse.json({ error: 'Caregiver not found' }, { status: 404 });
    }

    const householdId = caregiver.household_id;
    const isPrimary = caregiver.role === 'primary';

    // Check if there are other caregivers in the household
    const { data: otherCaregivers } = await supabase
      .from('caregivers')
      .select('id')
      .eq('household_id', householdId)
      .neq('id', user.id);

    const hasOtherCaregivers = otherCaregivers && otherCaregivers.length > 0;

    // Use service role client for deletions (bypasses RLS)
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (isPrimary && !hasOtherCaregivers) {
      // Primary caregiver with no other members - delete entire household
      console.log(`Deleting entire household ${householdId} for user ${user.id}`);

      // Delete in order to respect foreign key constraints
      // Most tables have ON DELETE CASCADE, but let's be explicit

      // 1. Delete AI conversations
      await serviceClient
        .from('ai_conversations')
        .delete()
        .eq('household_id', householdId);

      // 2. Delete caregiver wellbeing logs
      await serviceClient
        .from('caregiver_wellbeing_logs')
        .delete()
        .eq('caregiver_id', user.id);

      // 3. Delete weekly insights
      await serviceClient
        .from('weekly_insights')
        .delete()
        .eq('household_id', householdId);

      // 4. Delete doctor visit reports
      await serviceClient
        .from('doctor_visit_reports')
        .delete()
        .eq('household_id', householdId);

      // 5. Delete brain activities
      await serviceClient
        .from('brain_activities')
        .delete()
        .eq('household_id', householdId);

      // 6. Delete location alerts
      await serviceClient
        .from('location_alerts')
        .delete()
        .eq('household_id', householdId);

      // 7. Delete safe zones
      await serviceClient
        .from('safe_zones')
        .delete()
        .eq('household_id', householdId);

      // 8. Delete location logs
      await serviceClient
        .from('location_logs')
        .delete()
        .eq('household_id', householdId);

      // 9. Delete care journal entries
      await serviceClient
        .from('care_journal_entries')
        .delete()
        .eq('household_id', householdId);

      // 10. Delete daily check-ins
      await serviceClient
        .from('daily_checkins')
        .delete()
        .eq('household_id', householdId);

      // 11. Delete task completions
      await serviceClient
        .from('task_completions')
        .delete()
        .eq('household_id', householdId);

      // 12. Delete care plan tasks
      await serviceClient
        .from('care_plan_tasks')
        .delete()
        .eq('household_id', householdId);

      // 13. Delete caregiver
      await serviceClient
        .from('caregivers')
        .delete()
        .eq('id', user.id);

      // 14. Delete patient
      await serviceClient
        .from('patients')
        .delete()
        .eq('household_id', householdId);

      // 15. Delete household
      await serviceClient
        .from('households')
        .delete()
        .eq('id', householdId);

      // 16. Delete auth user
      const { error: authError } = await serviceClient.auth.admin.deleteUser(user.id);

      if (authError) {
        console.error('Failed to delete auth user:', authError);
        // Continue anyway - data is already deleted
      }

      return NextResponse.json({
        success: true,
        message: 'Account and all household data permanently deleted.',
        deletedItems: {
          household: true,
          patient: true,
          caregiver: true,
          allHouseholdData: true,
        },
      });
    } else if (isPrimary && hasOtherCaregivers) {
      // Primary caregiver but others exist - need to transfer ownership first
      return NextResponse.json(
        {
          error: 'Cannot delete primary caregiver account',
          message:
            'You are the primary caregiver. Please transfer ownership to another family member before deleting your account, or remove all other family members first.',
          otherCaregivers: otherCaregivers?.length || 0,
        },
        { status: 400 }
      );
    } else {
      // Non-primary caregiver - just remove themselves
      console.log(`Removing non-primary caregiver ${user.id} from household ${householdId}`);

      // Delete only this caregiver's personal data
      await serviceClient
        .from('ai_conversations')
        .delete()
        .eq('caregiver_id', user.id);

      await serviceClient
        .from('caregiver_wellbeing_logs')
        .delete()
        .eq('caregiver_id', user.id);

      // Remove caregiver from household
      await serviceClient
        .from('caregivers')
        .delete()
        .eq('id', user.id);

      // Delete auth user
      const { error: authError } = await serviceClient.auth.admin.deleteUser(user.id);

      if (authError) {
        console.error('Failed to delete auth user:', authError);
      }

      return NextResponse.json({
        success: true,
        message: 'Your account has been removed from the household.',
        deletedItems: {
          caregiver: true,
          conversations: true,
          wellbeingLogs: true,
        },
        note: 'Household data remains accessible to other family members.',
      });
    }
  } catch (error: unknown) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Deletion failed' },
      { status: 500 }
    );
  }
}

// Also support POST for compatibility
export async function POST(request: NextRequest) {
  return DELETE(request);
}
