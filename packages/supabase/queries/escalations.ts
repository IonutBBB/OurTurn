import { supabase } from '../client';
import type { AlertEscalation } from '@ourturn/shared';

/**
 * Get active (unresolved) escalations for a household
 */
export async function getActiveEscalations(
  householdId: string
): Promise<AlertEscalation[]> {
  const { data, error } = await supabase
    .from('alert_escalations')
    .select('*')
    .eq('household_id', householdId)
    .eq('resolved', false)
    .order('escalated_at', { ascending: false });

  if (error) throw error;

  return data || [];
}

/**
 * Resolve an escalation (mark as handled)
 */
export async function resolveEscalation(
  escalationId: string,
  resolvedBy: string
): Promise<AlertEscalation> {
  const { data, error } = await supabase
    .from('alert_escalations')
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: resolvedBy,
    })
    .eq('id', escalationId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Resolve all escalations for a specific alert
 */
export async function resolveEscalationsForAlert(
  alertId: string,
  resolvedBy: string
): Promise<void> {
  const { error } = await supabase
    .from('alert_escalations')
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: resolvedBy,
    })
    .eq('alert_id', alertId)
    .eq('resolved', false);

  if (error) throw error;
}
