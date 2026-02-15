// Caregiver types
import type { DeviceToken } from './common';

export type CaregiverRole = 'primary' | 'family_member';

export interface CaregiverPermissions {
  can_edit_plan: boolean;
  receives_alerts: boolean;
}

export interface NotificationPreferences {
  safety_alerts: boolean;
  daily_summary: boolean;
  email_notifications: boolean;
  summary_time?: string;
  respite_reminders?: boolean;
  activity_updates?: boolean;
}

export interface Caregiver {
  id: string;
  household_id: string;
  name: string;
  email: string;
  relationship: string | null;
  role: CaregiverRole;
  permissions: CaregiverPermissions;
  language_preference: string;
  notification_preferences: NotificationPreferences;
  device_tokens: DeviceToken[];
  created_at: string;
  updated_at: string;
}

export interface CaregiverInsert {
  id?: string;
  household_id: string;
  name: string;
  email: string;
  relationship?: string;
  role?: CaregiverRole;
  permissions?: CaregiverPermissions;
  language_preference?: string;
  notification_preferences?: NotificationPreferences;
}

export interface CaregiverUpdate {
  name?: string;
  relationship?: string;
  role?: CaregiverRole;
  permissions?: CaregiverPermissions;
  language_preference?: string;
  notification_preferences?: NotificationPreferences;
  device_tokens?: DeviceToken[];
}
