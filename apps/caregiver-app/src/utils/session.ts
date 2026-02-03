import * as SecureStore from 'expo-secure-store';
import type { Session } from '@supabase/supabase-js';

const SESSION_KEY = 'memoguard_caregiver_session';

export async function saveSession(session: Session): Promise<void> {
  try {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

export async function getSession(): Promise<Session | null> {
  try {
    const sessionStr = await SecureStore.getItemAsync(SESSION_KEY);
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
    await SecureStore.deleteItemAsync(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}
