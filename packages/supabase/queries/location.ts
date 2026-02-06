import { supabase } from '../client';
import type {
  LocationLog,
  LocationLogInsert,
  SafeZone,
  SafeZoneInsert,
  SafeZoneUpdate,
  LocationAlert,
  LocationAlertInsert,
  LocationAlertUpdate,
  LocationAlertType,
} from '@ourturn/shared';

// ============================================================================
// LOCATION LOGS
// ============================================================================

/**
 * Log a location point
 */
export async function logLocation(
  patientId: string,
  householdId: string,
  latitude: number,
  longitude: number,
  accuracy?: number,
  label?: string
): Promise<LocationLog> {
  const { data, error } = await supabase
    .from('location_logs')
    .insert({
      patient_id: patientId,
      household_id: householdId,
      latitude,
      longitude,
      accuracy_meters: accuracy,
      location_label: label || 'unknown',
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Get the latest location for a household
 */
export async function getLatestLocation(
  householdId: string
): Promise<LocationLog | null> {
  const { data, error } = await supabase
    .from('location_logs')
    .select('*')
    .eq('household_id', householdId)
    .order('timestamp', { ascending: false })
    .limit(1)
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
 * Get location history for a specific date
 */
export async function getLocationHistory(
  householdId: string,
  date: string
): Promise<LocationLog[]> {
  const startOfDay = `${date}T00:00:00.000Z`;
  const endOfDay = `${date}T23:59:59.999Z`;

  const { data, error } = await supabase
    .from('location_logs')
    .select('*')
    .eq('household_id', householdId)
    .gte('timestamp', startOfDay)
    .lte('timestamp', endOfDay)
    .order('timestamp', { ascending: true });

  if (error) throw error;

  return data;
}

// ============================================================================
// SAFE ZONES
// ============================================================================

/**
 * Get all active safe zones for a household
 */
export async function getSafeZones(householdId: string): Promise<SafeZone[]> {
  const { data, error } = await supabase
    .from('safe_zones')
    .select('*')
    .eq('household_id', householdId)
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data;
}

/**
 * Create a new safe zone
 */
export async function createSafeZone(
  householdId: string,
  zone: Omit<SafeZoneInsert, 'household_id'>
): Promise<SafeZone> {
  const { data, error } = await supabase
    .from('safe_zones')
    .insert({
      household_id: householdId,
      name: zone.name,
      latitude: zone.latitude,
      longitude: zone.longitude,
      radius_meters: zone.radius_meters || 200,
      active: zone.active ?? true,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Update a safe zone
 */
export async function updateSafeZone(
  zoneId: string,
  updates: SafeZoneUpdate
): Promise<SafeZone> {
  const { data, error } = await supabase
    .from('safe_zones')
    .update(updates)
    .eq('id', zoneId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Delete a safe zone (soft delete - set active = false)
 */
export async function deleteSafeZone(zoneId: string): Promise<void> {
  const { error } = await supabase
    .from('safe_zones')
    .update({ active: false })
    .eq('id', zoneId);

  if (error) throw error;
}

// ============================================================================
// LOCATION ALERTS
// ============================================================================

/**
 * Create a location alert
 */
export async function createLocationAlert(
  householdId: string,
  alert: Omit<LocationAlertInsert, 'household_id'>
): Promise<LocationAlert> {
  const { data, error } = await supabase
    .from('location_alerts')
    .insert({
      household_id: householdId,
      type: alert.type,
      latitude: alert.latitude,
      longitude: alert.longitude,
      location_label: alert.location_label,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Get recent alerts for a household
 */
export async function getRecentAlerts(
  householdId: string,
  hours: number = 24
): Promise<LocationAlert[]> {
  const since = new Date();
  since.setHours(since.getHours() - hours);

  const { data, error } = await supabase
    .from('location_alerts')
    .select('*')
    .eq('household_id', householdId)
    .gte('triggered_at', since.toISOString())
    .order('triggered_at', { ascending: false });

  if (error) throw error;

  return data;
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(
  alertId: string,
  caregiverId: string
): Promise<LocationAlert> {
  const { data, error } = await supabase
    .from('location_alerts')
    .update({
      acknowledged: true,
      acknowledged_by: caregiverId,
    })
    .eq('id', alertId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Get unacknowledged alerts for a household
 */
export async function getUnacknowledgedAlerts(
  householdId: string
): Promise<LocationAlert[]> {
  const { data, error } = await supabase
    .from('location_alerts')
    .select('*')
    .eq('household_id', householdId)
    .eq('acknowledged', false)
    .order('triggered_at', { ascending: false });

  if (error) throw error;

  return data;
}

/**
 * Get alerts by type
 */
export async function getAlertsByType(
  householdId: string,
  type: LocationAlertType,
  days: number = 7
): Promise<LocationAlert[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('location_alerts')
    .select('*')
    .eq('household_id', householdId)
    .eq('type', type)
    .gte('triggered_at', since.toISOString())
    .order('triggered_at', { ascending: false });

  if (error) throw error;

  return data;
}
