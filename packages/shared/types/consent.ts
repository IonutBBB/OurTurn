// Consent types

export type ConsentType =
  | 'location_tracking'
  | 'data_collection'
  | 'ai_personalization'
  | 'push_notifications'
  | 'data_sharing_caregivers'
  | 'voice_recording';

export interface ConsentRecord {
  id: string;
  household_id: string;
  granted_by_type: 'caregiver' | 'patient';
  granted_by_id: string | null;
  consent_type: ConsentType;
  granted: boolean;
  granted_at: string;
  revoked_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
}

export interface ConsentRecordInsert {
  household_id: string;
  granted_by_type: 'caregiver' | 'patient';
  granted_by_id?: string;
  consent_type: ConsentType;
  granted: boolean;
  ip_address?: string;
  user_agent?: string;
}
