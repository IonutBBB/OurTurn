import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { Session } from '@supabase/supabase-js';

const SESSION_KEY = 'memoguard_caregiver_session';

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

export async function saveSession(session: Session): Promise<void> {
  try {
    await setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

export async function getSession(): Promise<Session | null> {
  try {
    const sessionStr = await getItem(SESSION_KEY);
    if (sessionStr) {
      return JSON.parse(sessionStr) as Session;
    }
    return null;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    await deleteItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}
