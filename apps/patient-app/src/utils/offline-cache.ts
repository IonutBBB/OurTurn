import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CarePlanTask, TaskCompletion, Patient, BrainActivity } from '@memoguard/shared';

// Cache keys
const CACHE_KEYS = {
  TASKS: (date: string) => `cached_tasks_${date}`,
  COMPLETIONS: (date: string) => `cached_completions_${date}`,
  PATIENT_PROFILE: 'cached_patient_profile',
  ACTIVITY: (date: string) => `cached_activity_${date}`,
  PENDING_COMPLETIONS: 'pending_completions',
  PENDING_CHECKIN: 'pending_checkin',
  PENDING_ALERTS: 'pending_location_alerts',
};

// Types for pending operations
export interface PendingCompletion {
  taskId: string;
  householdId: string;
  date: string;
  completedAt: string;
}

export interface PendingAlert {
  householdId: string;
  type: string;
  latitude: number;
  longitude: number;
  triggeredAt: string;
}

// Cache tasks for a specific date
export async function cacheTasks(date: string, tasks: CarePlanTask[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.TASKS(date), JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to cache tasks:', error);
  }
}

// Get cached tasks for a specific date
export async function getCachedTasks(date: string): Promise<CarePlanTask[] | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.TASKS(date));
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Failed to get cached tasks:', error);
    return null;
  }
}

// Cache completions for a specific date
export async function cacheCompletions(date: string, completions: TaskCompletion[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.COMPLETIONS(date), JSON.stringify(completions));
  } catch (error) {
    console.error('Failed to cache completions:', error);
  }
}

// Get cached completions for a specific date
export async function getCachedCompletions(date: string): Promise<TaskCompletion[] | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.COMPLETIONS(date));
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Failed to get cached completions:', error);
    return null;
  }
}

// Cache patient profile
export async function cachePatientProfile(patient: Patient): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.PATIENT_PROFILE, JSON.stringify(patient));
  } catch (error) {
    console.error('Failed to cache patient profile:', error);
  }
}

// Get cached patient profile
export async function getCachedPatientProfile(): Promise<Patient | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.PATIENT_PROFILE);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Failed to get cached patient profile:', error);
    return null;
  }
}

// Cache brain activity for a specific date
export async function cacheActivity(date: string, activity: BrainActivity): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.ACTIVITY(date), JSON.stringify(activity));
  } catch (error) {
    console.error('Failed to cache activity:', error);
  }
}

// Get cached activity for a specific date
export async function getCachedActivity(date: string): Promise<BrainActivity | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.ACTIVITY(date));
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Failed to get cached activity:', error);
    return null;
  }
}

// Queue a task completion for later sync
export async function queueCompletion(completion: PendingCompletion): Promise<void> {
  try {
    const pendingStr = await AsyncStorage.getItem(CACHE_KEYS.PENDING_COMPLETIONS);
    const pending: PendingCompletion[] = pendingStr ? JSON.parse(pendingStr) : [];

    // Avoid duplicates
    const exists = pending.some(
      (p) => p.taskId === completion.taskId && p.date === completion.date
    );
    if (!exists) {
      pending.push(completion);
      await AsyncStorage.setItem(CACHE_KEYS.PENDING_COMPLETIONS, JSON.stringify(pending));
    }
  } catch (error) {
    console.error('Failed to queue completion:', error);
  }
}

// Get all pending completions
export async function getPendingCompletions(): Promise<PendingCompletion[]> {
  try {
    const pendingStr = await AsyncStorage.getItem(CACHE_KEYS.PENDING_COMPLETIONS);
    return pendingStr ? JSON.parse(pendingStr) : [];
  } catch (error) {
    console.error('Failed to get pending completions:', error);
    return [];
  }
}

// Clear pending completions
export async function clearPendingCompletions(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEYS.PENDING_COMPLETIONS);
  } catch (error) {
    console.error('Failed to clear pending completions:', error);
  }
}

// Queue a location alert for later sync
export async function queueAlert(alert: PendingAlert): Promise<void> {
  try {
    const pendingStr = await AsyncStorage.getItem(CACHE_KEYS.PENDING_ALERTS);
    const pending: PendingAlert[] = pendingStr ? JSON.parse(pendingStr) : [];
    pending.push(alert);
    await AsyncStorage.setItem(CACHE_KEYS.PENDING_ALERTS, JSON.stringify(pending));
  } catch (error) {
    console.error('Failed to queue alert:', error);
  }
}

// Get all pending alerts
export async function getPendingAlerts(): Promise<PendingAlert[]> {
  try {
    const pendingStr = await AsyncStorage.getItem(CACHE_KEYS.PENDING_ALERTS);
    return pendingStr ? JSON.parse(pendingStr) : [];
  } catch (error) {
    console.error('Failed to get pending alerts:', error);
    return [];
  }
}

// Clear pending alerts
export async function clearPendingAlerts(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEYS.PENDING_ALERTS);
  } catch (error) {
    console.error('Failed to clear pending alerts:', error);
  }
}

// Clean up old cache entries (keep last 7 days)
export async function cleanupOldCache(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const datePattern = /\d{4}-\d{2}-\d{2}$/;
    const keysToRemove: string[] = [];

    for (const key of allKeys) {
      const match = key.match(datePattern);
      if (match) {
        const keyDate = new Date(match[0]);
        if (keyDate < sevenDaysAgo) {
          keysToRemove.push(key);
        }
      }
    }

    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }
  } catch (error) {
    console.error('Failed to cleanup old cache:', error);
  }
}
