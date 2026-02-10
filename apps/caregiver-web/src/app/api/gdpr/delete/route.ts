// GDPR Account Deletion API Route
// Allows users to delete their account and all associated data (right to erasure)
// Uses transactional Postgres functions to ensure all-or-nothing deletion

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';
import { createLogger } from '@/lib/logger';

const log = createLogger('gdpr/delete');

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

    // Rate limit: 3 delete attempts per hour per user
    const rl = rateLimit(`gdpr-delete:${user.id}`, { limit: 3, windowSeconds: 3600 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many deletion attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      );
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
      // Primary caregiver with no other members — delete entire household
      // Uses transactional Postgres function (all-or-nothing)
      const { error: rpcError } = await serviceClient.rpc('delete_household_data', {
        p_household_id: householdId,
        p_user_id: user.id,
      });

      if (rpcError) {
        return NextResponse.json(
          { error: 'Failed to delete household data. No data was removed.' },
          { status: 500 }
        );
      }

      // Delete auth user (outside transaction — data is already gone)
      const { error: authError } = await serviceClient.auth.admin.deleteUser(user.id);
      if (authError) {
        // Data is deleted but auth record remains — log for manual cleanup
        log.error('Failed to delete auth user after data deletion', { userId: user.id });
        return NextResponse.json({
          partialFailure: true,
          message: 'Your data has been deleted, but we could not fully remove your login credentials. Please contact support@ourturn.app for manual cleanup.',
          deletedItems: {
            household: true,
            patient: true,
            caregiver: true,
            allHouseholdData: true,
            authRecord: false,
          },
        }, { status: 207 });
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
      // Primary caregiver but others exist — need to transfer ownership first
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
      // Non-primary caregiver — remove themselves only
      // Uses transactional Postgres function (all-or-nothing)
      const { error: rpcError } = await serviceClient.rpc('delete_caregiver_data', {
        p_user_id: user.id,
      });

      if (rpcError) {
        return NextResponse.json(
          { error: 'Failed to delete account data. No data was removed.' },
          { status: 500 }
        );
      }

      // Delete auth user
      const { error: authError } = await serviceClient.auth.admin.deleteUser(user.id);
      if (authError) {
        log.error('Failed to delete auth user after data deletion', { userId: user.id });
        return NextResponse.json({
          partialFailure: true,
          message: 'Your data has been removed from the household, but we could not fully remove your login credentials. Please contact support@ourturn.app for manual cleanup.',
          deletedItems: {
            caregiver: true,
            conversations: true,
            wellbeingLogs: true,
            authRecord: false,
          },
        }, { status: 207 });
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
    log.error('Account deletion failed', { error: error instanceof Error ? error.message : 'Unknown' });
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
