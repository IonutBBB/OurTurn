// Location types

export type LocationAlertType =
  | 'left_safe_zone'
  | 'inactive'
  | 'night_movement'
  | 'take_me_home_tapped'
  | 'sos_triggered';

export interface LocationLog {
  id: string;
  patient_id: string;
  household_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  location_label: string;
  accuracy_meters: number | null;
}

export interface LocationLogInsert {
  patient_id: string;
  household_id: string;
  latitude: number;
  longitude: number;
  location_label?: string;
  accuracy_meters?: number;
}

export interface SafeZone {
  id: string;
  household_id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  active: boolean;
  created_at: string;
}

export interface SafeZoneInsert {
  household_id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters?: number;
  active?: boolean;
}

export interface SafeZoneUpdate {
  name?: string;
  latitude?: number;
  longitude?: number;
  radius_meters?: number;
  active?: boolean;
}

export interface LocationAlert {
  id: string;
  household_id: string;
  type: LocationAlertType;
  triggered_at: string;
  latitude: number | null;
  longitude: number | null;
  location_label: string | null;
  acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
}

export interface AlertEscalation {
  id: string;
  alert_id: string;
  household_id: string;
  escalation_level: number;
  escalated_at: string;
  next_escalation_at: string;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
}

export interface LocationAlertInsert {
  household_id: string;
  type: LocationAlertType;
  latitude?: number;
  longitude?: number;
  location_label?: string;
}

export interface LocationAlertUpdate {
  acknowledged?: boolean;
  acknowledged_by?: string;
}

// Helper to calculate distance between two points (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Check if a point is inside a safe zone
export function isInsideSafeZone(
  lat: number,
  lon: number,
  zone: SafeZone
): boolean {
  const distance = calculateDistance(lat, lon, zone.latitude, zone.longitude);
  return distance <= zone.radius_meters;
}
