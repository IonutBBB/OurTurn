// Patient types
import type { DeviceToken } from './common';

export type DementiaStage = 'early' | 'moderate' | 'advanced';
export type AppComplexity = 'full' | 'simplified' | 'essential';

export interface Medication {
  name: string;
  dosage: string;
  times: string[];
  notes?: string;
}

export interface ImportantPerson {
  name: string;
  relationship: string;
}

export interface KeyEvent {
  description: string;
  year?: number;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface PatientBiography {
  childhood_location?: string;
  career?: string;
  hobbies?: string[];
  favorite_music?: string[];
  favorite_foods?: string[];
  important_people?: ImportantPerson[];
  key_events?: KeyEvent[];
}

export interface Patient {
  id: string;
  household_id: string;
  name: string;
  date_of_birth: string | null;
  dementia_type: string | null;
  stage: DementiaStage;
  home_address_formatted: string | null;
  home_latitude: number | null;
  home_longitude: number | null;
  medications: Medication[];
  biography: PatientBiography;
  photos: string[];
  wake_time: string;
  sleep_time: string;
  emergency_number: string | null;
  emergency_contacts: EmergencyContact[];
  app_complexity: AppComplexity;
  last_seen_at: string | null;
  calming_strategies: string[] | null;
  device_tokens: DeviceToken[];
  created_at: string;
  updated_at: string;
}

export interface PatientInsert {
  household_id: string;
  name: string;
  date_of_birth?: string;
  dementia_type?: string;
  stage?: DementiaStage;
  home_address_formatted?: string;
  home_latitude?: number;
  home_longitude?: number;
  medications?: Medication[];
  biography?: PatientBiography;
  photos?: string[];
  wake_time?: string;
  sleep_time?: string;
  emergency_number?: string;
  emergency_contacts?: EmergencyContact[];
  calming_strategies?: string[];
}

export interface PatientUpdate {
  name?: string;
  date_of_birth?: string;
  dementia_type?: string;
  stage?: DementiaStage;
  home_address_formatted?: string;
  home_latitude?: number;
  home_longitude?: number;
  medications?: Medication[];
  biography?: PatientBiography;
  photos?: string[];
  wake_time?: string;
  sleep_time?: string;
  emergency_number?: string;
  emergency_contacts?: EmergencyContact[];
  calming_strategies?: string[];
  device_tokens?: DeviceToken[];
  app_complexity?: AppComplexity;
  last_seen_at?: string;
}
