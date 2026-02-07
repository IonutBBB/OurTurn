import { supabase } from '../client';
import type { ConsentRecord, ConsentRecordInsert, ConsentType } from '@ourturn/shared';

/**
 * Get all consent records for a household
 */
export async function getConsents(
  householdId: string
): Promise<ConsentRecord[]> {
  const { data, error } = await supabase
    .from('consent_records')
    .select('*')
    .eq('household_id', householdId)
    .order('granted_at', { ascending: false });

  if (error) throw error;

  return data || [];
}

/**
 * Grant consent for a specific type
 */
export async function grantConsent(
  record: ConsentRecordInsert
): Promise<ConsentRecord> {
  const { data, error } = await supabase
    .from('consent_records')
    .upsert(
      {
        household_id: record.household_id,
        granted_by_type: record.granted_by_type,
        granted_by_id: record.granted_by_id,
        consent_type: record.consent_type,
        granted: true,
        granted_at: new Date().toISOString(),
        revoked_at: null,
        ip_address: record.ip_address,
        user_agent: record.user_agent,
      },
      { onConflict: 'household_id,consent_type,granted_by_type' }
    )
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Revoke consent for a specific type
 */
export async function revokeConsent(
  householdId: string,
  consentType: ConsentType,
  grantedByType: 'caregiver' | 'patient'
): Promise<ConsentRecord> {
  const { data, error } = await supabase
    .from('consent_records')
    .update({
      granted: false,
      revoked_at: new Date().toISOString(),
    })
    .eq('household_id', householdId)
    .eq('consent_type', consentType)
    .eq('granted_by_type', grantedByType)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Check if a specific consent is granted
 */
export async function hasConsent(
  householdId: string,
  consentType: ConsentType
): Promise<boolean> {
  const { data, error } = await supabase
    .from('consent_records')
    .select('id')
    .eq('household_id', householdId)
    .eq('consent_type', consentType)
    .eq('granted', true)
    .is('revoked_at', null)
    .limit(1);

  if (error) throw error;

  return (data?.length ?? 0) > 0;
}
