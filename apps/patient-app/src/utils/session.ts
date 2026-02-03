import * as SecureStore from 'expo-secure-store';
import type { Household, Patient } from '@memoguard/shared';

const SESSION_KEY = 'memoguard_patient_session';
const HOUSEHOLD_KEY = 'memoguard_household_data';
const PATIENT_KEY = 'memoguard_patient_data';

export interface PatientSession {
  householdId: string;
  careCode: string;
  connectedAt: string;
}

/**
 * Save patient session to secure storage
 */
export async function saveSession(session: PatientSession): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

/**
 * Get stored session (returns null if not found)
 */
export async function getSession(): Promise<PatientSession | null> {
  try {
    const sessionStr = await SecureStore.getItemAsync(SESSION_KEY);
    if (!sessionStr) return null;
    return JSON.parse(sessionStr);
  } catch {
    return null;
  }
}

/**
 * Clear the stored session (logout)
 */
export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
  await SecureStore.deleteItemAsync(HOUSEHOLD_KEY);
  await SecureStore.deleteItemAsync(PATIENT_KEY);
}

/**
 * Save household data to secure storage (for offline access)
 */
export async function saveHouseholdData(household: Household): Promise<void> {
  await SecureStore.setItemAsync(HOUSEHOLD_KEY, JSON.stringify(household));
}

/**
 * Get stored household data
 */
export async function getHouseholdData(): Promise<Household | null> {
  try {
    const dataStr = await SecureStore.getItemAsync(HOUSEHOLD_KEY);
    if (!dataStr) return null;
    return JSON.parse(dataStr);
  } catch {
    return null;
  }
}

/**
 * Save patient data to secure storage (for offline access)
 */
export async function savePatientData(patient: Patient): Promise<void> {
  await SecureStore.setItemAsync(PATIENT_KEY, JSON.stringify(patient));
}

/**
 * Get stored patient data
 */
export async function getPatientData(): Promise<Patient | null> {
  try {
    const dataStr = await SecureStore.getItemAsync(PATIENT_KEY);
    if (!dataStr) return null;
    return JSON.parse(dataStr);
  } catch {
    return null;
  }
}
