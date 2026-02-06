import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { Household, Patient } from '@ourturn/shared';

const SESSION_KEY = 'ourturn_patient_session';
const HOUSEHOLD_KEY = 'ourturn_household_data';
const PATIENT_KEY = 'ourturn_patient_data';

export interface PatientSession {
  householdId: string;
  careCode: string;
  connectedAt: string;
}

// Platform-aware storage functions
async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

/**
 * Save patient session to secure storage
 */
export async function saveSession(session: PatientSession): Promise<void> {
  await setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Get stored session (returns null if not found)
 */
export async function getSession(): Promise<PatientSession | null> {
  try {
    const sessionStr = await getItem(SESSION_KEY);
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
  await deleteItem(SESSION_KEY);
  await deleteItem(HOUSEHOLD_KEY);
  await deleteItem(PATIENT_KEY);
}

/**
 * Save household data to secure storage (for offline access)
 */
export async function saveHouseholdData(household: Household): Promise<void> {
  await setItem(HOUSEHOLD_KEY, JSON.stringify(household));
}

/**
 * Get stored household data
 */
export async function getHouseholdData(): Promise<Household | null> {
  try {
    const dataStr = await getItem(HOUSEHOLD_KEY);
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
  await setItem(PATIENT_KEY, JSON.stringify(patient));
}

/**
 * Get stored patient data
 */
export async function getPatientData(): Promise<Patient | null> {
  try {
    const dataStr = await getItem(PATIENT_KEY);
    if (!dataStr) return null;
    return JSON.parse(dataStr);
  } catch {
    return null;
  }
}
