import { AppState } from 'react-native';
import { supabase } from '@ourturn/supabase';

const HEARTBEAT_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

let intervalId: ReturnType<typeof setInterval> | null = null;
let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

async function sendHeartbeat(patientId: string): Promise<void> {
  try {
    await supabase
      .from('patients')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', patientId);
  } catch {
    // Best effort — don't crash on failure
    if (__DEV__) console.error('Heartbeat failed');
  }
}

/**
 * Start the heartbeat service. Updates patients.last_seen_at every 10 minutes
 * when the app is in the foreground.
 */
export function startHeartbeat(patientId: string): void {
  stopHeartbeat();

  // Send immediately
  sendHeartbeat(patientId);

  // Set up interval
  intervalId = setInterval(() => {
    if (AppState.currentState === 'active') {
      sendHeartbeat(patientId);
    }
  }, HEARTBEAT_INTERVAL_MS);

  // Also send when app comes back to foreground
  appStateSubscription = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active') {
      sendHeartbeat(patientId);
    }
  });
}

/**
 * Stop the heartbeat service.
 */
export function stopHeartbeat(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
}
