import { supabase } from '../client';
import type {
  Caregiver,
  CaregiverInsert,
  CaregiverUpdate,
  CaregiverRole,
  Household,
} from '@ourturn/shared';

/**
 * Get caregiver profile by user ID
 */
export async function getCaregiver(
  userId: string
): Promise<(Caregiver & { household: Household }) | null> {
  const { data, error } = await supabase
    .from('caregivers')
    .select(
      `
      *,
      household:households(*)
    `
    )
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  const { household: households, ...caregiver } = data;
  return {
    ...caregiver,
    household: Array.isArray(households) ? households[0] : households,
  };
}

/**
 * Get all caregivers for a household
 */
export async function getCaregiversByHousehold(
  householdId: string
): Promise<Caregiver[]> {
  const { data, error } = await supabase
    .from('caregivers')
    .select('*')
    .eq('household_id', householdId)
    .order('role', { ascending: true }) // primary first
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data;
}

/**
 * Update caregiver profile
 */
export async function updateCaregiver(
  caregiverId: string,
  updates: CaregiverUpdate
): Promise<Caregiver> {
  const { data, error } = await supabase
    .from('caregivers')
    .update(updates)
    .eq('id', caregiverId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Invite a new caregiver to the household
 */
export async function inviteCaregiver(
  householdId: string,
  email: string,
  name: string,
  relationship?: string,
  role: CaregiverRole = 'family_member'
): Promise<Caregiver> {
  // Note: The actual user account creation happens through Supabase Auth
  // This creates a pending caregiver record that will be linked when they sign up
  const { data, error } = await supabase
    .from('caregivers')
    .insert({
      household_id: householdId,
      email,
      name,
      relationship,
      role,
      permissions: {
        can_edit_plan: role === 'primary',
        receives_alerts: true,
      },
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Remove a caregiver from the household
 */
export async function removeCaregiver(caregiverId: string): Promise<void> {
  const { error } = await supabase
    .from('caregivers')
    .delete()
    .eq('id', caregiverId);

  if (error) throw error;
}

/**
 * Update caregiver role
 */
export async function updateCaregiverRole(
  caregiverId: string,
  role: CaregiverRole
): Promise<Caregiver> {
  const permissions =
    role === 'primary'
      ? { can_edit_plan: true, receives_alerts: true }
      : { can_edit_plan: false, receives_alerts: true };

  const { data, error } = await supabase
    .from('caregivers')
    .update({ role, permissions })
    .eq('id', caregiverId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Get caregiver by email
 */
export async function getCaregiverByEmail(
  email: string
): Promise<Caregiver | null> {
  const { data, error } = await supabase
    .from('caregivers')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Update caregiver device tokens (for push notifications)
 */
export async function addDeviceToken(
  caregiverId: string,
  token: string,
  platform: 'ios' | 'android' | 'web'
): Promise<Caregiver> {
  // Get current tokens
  const { data: caregiver, error: fetchError } = await supabase
    .from('caregivers')
    .select('device_tokens')
    .eq('id', caregiverId)
    .single();

  if (fetchError) throw fetchError;

  const currentTokens = caregiver.device_tokens || [];
  const existingIndex = currentTokens.findIndex(
    (t: { token: string }) => t.token === token
  );

  if (existingIndex >= 0) {
    // Update existing token
    currentTokens[existingIndex] = { token, platform };
  } else {
    // Add new token
    currentTokens.push({ token, platform });
  }

  const { data, error } = await supabase
    .from('caregivers')
    .update({ device_tokens: currentTokens })
    .eq('id', caregiverId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Remove a device token
 */
export async function removeDeviceToken(
  caregiverId: string,
  token: string
): Promise<Caregiver> {
  const { data: caregiver, error: fetchError } = await supabase
    .from('caregivers')
    .select('device_tokens')
    .eq('id', caregiverId)
    .single();

  if (fetchError) throw fetchError;

  const currentTokens = (caregiver.device_tokens || []).filter(
    (t: { token: string }) => t.token !== token
  );

  const { data, error } = await supabase
    .from('caregivers')
    .update({ device_tokens: currentTokens })
    .eq('id', caregiverId)
    .select()
    .single();

  if (error) throw error;

  return data;
}
