// Patient types

export type DementiaStage = 'early' | 'moderate' | 'advanced';

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

export interface PatientBiography {
  childhood_location?: string;
  career?: string;
  hobbies?: string[];
  favorite_music?: string[];
  favorite_foods?: string[];
  important_people?: ImportantPerson[];
  key_events?: KeyEvent[];
}

export interface DeviceToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  last_seen?: string;
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
  device_tokens?: DeviceToken[];
}
