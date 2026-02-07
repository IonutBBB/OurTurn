import { supabase } from '../client';
import type { HelpRequest, HelpRequestInsert } from '@ourturn/shared';

/**
 * Create a help request
 */
export async function createHelpRequest(
  data: HelpRequestInsert
): Promise<HelpRequest> {
  const { data: request, error } = await supabase
    .from('caregiver_help_requests')
    .insert({
      requester_id: data.requester_id,
      household_id: data.household_id,
      message: data.message,
      template_key: data.template_key || null,
    })
    .select()
    .single();

  if (error) throw error;

  return request;
}

/**
 * Get help requests for a household
 */
export async function getHelpRequests(
  householdId: string,
  limit: number = 10
): Promise<HelpRequest[]> {
  const { data, error } = await supabase
    .from('caregiver_help_requests')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data;
}

/**
 * Respond to (accept) a help request
 */
export async function respondToHelpRequest(
  requestId: string,
  responderId: string
): Promise<HelpRequest> {
  const { data, error } = await supabase
    .from('caregiver_help_requests')
    .update({
      status: 'accepted',
      responded_by: responderId,
      responded_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Complete a help request
 */
export async function completeHelpRequest(
  requestId: string
): Promise<HelpRequest> {
  const { data, error } = await supabase
    .from('caregiver_help_requests')
    .update({ status: 'completed' })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Get count of pending requests from a specific requester today (for rate limiting)
 */
export async function getPendingRequestCount(
  requesterId: string
): Promise<number> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('caregiver_help_requests')
    .select('*', { count: 'exact', head: true })
    .eq('requester_id', requesterId)
    .gte('created_at', todayStart.toISOString());

  if (error) throw error;

  return count || 0;
}
