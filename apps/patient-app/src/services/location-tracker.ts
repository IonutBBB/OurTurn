import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { logLocation } from '@ourturn/supabase';
import { getSession, getPatientData } from '../utils/session';
import { queueLocationLog } from '../utils/offline-cache';

const BACKGROUND_LOCATION_TASK = 'ourturn-background-location';

// Define the background task at module level (required by expo-task-manager)
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    if (__DEV__) console.error('Background location task error:', error);
    return;
  }

  const { locations } = data as { locations: Location.LocationObject[] };
  if (!locations || locations.length === 0) return;

  const session = await getSession();
  const patient = await getPatientData();
  if (!session?.householdId || !patient?.id) return;

  // Process the most recent location
  const location = locations[locations.length - 1];
  const { latitude, longitude, accuracy } = location.coords;

  try {
    await logLocation(
      patient.id,
      session.householdId,
      latitude,
      longitude,
      accuracy ?? undefined,
      'background'
    );
  } catch {
    // Network failure — queue for later sync
    await queueLocationLog({
      patientId: patient.id,
      householdId: session.householdId,
      latitude,
      longitude,
      accuracy: accuracy ?? undefined,
      timestamp: new Date(location.timestamp).toISOString(),
    });
  }
});

/**
 * Start background location tracking.
 * Requests foreground + background permissions, then starts location updates.
 * NOTE: Background tasks require a development build — they do NOT work in Expo Go.
 */
export async function startLocationTracking(): Promise<void> {
  // Check if already running
  const isRunning = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(() => false);
  if (isRunning) return;

  // Request foreground permission first
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') {
    if (__DEV__) console.log('Foreground location permission denied');
    return;
  }

  // Request background permission
  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  if (backgroundStatus !== 'granted') {
    if (__DEV__) console.log('Background location permission denied');
    return;
  }

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: 100, // meters
    timeInterval: 300_000, // 5 minutes
    showsBackgroundLocationIndicator: true, // iOS blue bar
    foregroundService: {
      notificationTitle: 'OurTurn is keeping you safe',
      notificationBody: 'Your family can see you are okay',
      notificationColor: '#B85A2F',
    },
  });
}

/**
 * Stop background location tracking.
 */
export async function stopLocationTracking(): Promise<void> {
  const isRunning = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(() => false);
  if (isRunning) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
}
