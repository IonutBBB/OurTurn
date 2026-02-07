import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CarePlanTask, TaskCompletion, Patient, BrainActivity } from '@ourturn/shared';

// Cache keys
const CACHE_KEYS = {
  TASKS: (date: string) => `cached_tasks_${date}`,
  COMPLETIONS: (date: string) => `cached_completions_${date}`,
  PATIENT_PROFILE: 'cached_patient_profile',
  ACTIVITY: (date: string) => `cached_activity_${date}`,
  PENDING_COMPLETIONS: 'pending_completions',
  PENDING_CHECKIN: 'pending_checkin',
  PENDING_ALERTS: 'pending_location_alerts',
  PENDING_LOCATION_LOGS: 'pending_location_logs',
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
    if (__DEV__) console.error('Failed to cache tasks:', error);
  }
}

// Get cached tasks for a specific date
export async function getCachedTasks(date: string): Promise<CarePlanTask[] | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.TASKS(date));
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    if (__DEV__) console.error('Failed to get cached tasks:', error);
    return null;
  }
}

// Cache completions for a specific date
export async function cacheCompletions(date: string, completions: TaskCompletion[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.COMPLETIONS(date), JSON.stringify(completions));
  } catch (error) {
    if (__DEV__) console.error('Failed to cache completions:', error);
  }
}

// Get cached completions for a specific date
export async function getCachedCompletions(date: string): Promise<TaskCompletion[] | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.COMPLETIONS(date));
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    if (__DEV__) console.error('Failed to get cached completions:', error);
    return null;
  }
}

// Cache patient profile
export async function cachePatientProfile(patient: Patient): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.PATIENT_PROFILE, JSON.stringify(patient));
  } catch (error) {
    if (__DEV__) console.error('Failed to cache patient profile:', error);
  }
}

// Get cached patient profile
export async function getCachedPatientProfile(): Promise<Patient | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.PATIENT_PROFILE);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    if (__DEV__) console.error('Failed to get cached patient profile:', error);
    return null;
  }
}

// Cache brain activity for a specific date
export async function cacheActivity(date: string, activity: BrainActivity): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.ACTIVITY(date), JSON.stringify(activity));
  } catch (error) {
    if (__DEV__) console.error('Failed to cache activity:', error);
  }
}

// Get cached activity for a specific date
export async function getCachedActivity(date: string): Promise<BrainActivity | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.ACTIVITY(date));
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    if (__DEV__) console.error('Failed to get cached activity:', error);
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
    if (__DEV__) console.error('Failed to queue completion:', error);
  }
}

// Get all pending completions
export async function getPendingCompletions(): Promise<PendingCompletion[]> {
  try {
    const pendingStr = await AsyncStorage.getItem(CACHE_KEYS.PENDING_COMPLETIONS);
    return pendingStr ? JSON.parse(pendingStr) : [];
  } catch (error) {
    if (__DEV__) console.error('Failed to get pending completions:', error);
    return [];
  }
}

// Clear pending completions
export async function clearPendingCompletions(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEYS.PENDING_COMPLETIONS);
  } catch (error) {
    if (__DEV__) console.error('Failed to clear pending completions:', error);
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
    if (__DEV__) console.error('Failed to queue alert:', error);
  }
}

// Get all pending alerts
export async function getPendingAlerts(): Promise<PendingAlert[]> {
  try {
    const pendingStr = await AsyncStorage.getItem(CACHE_KEYS.PENDING_ALERTS);
    return pendingStr ? JSON.parse(pendingStr) : [];
  } catch (error) {
    if (__DEV__) console.error('Failed to get pending alerts:', error);
    return [];
  }
}

// Clear pending alerts
export async function clearPendingAlerts(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEYS.PENDING_ALERTS);
  } catch (error) {
    if (__DEV__) console.error('Failed to clear pending alerts:', error);
  }
}

// Queue a check-in for later sync
export interface PendingCheckin {
  householdId: string;
  date: string;
  mood: number;
  sleepQuality: number;
  voiceNoteUrl?: string;
  submittedAt: string;
}

export async function queueCheckin(checkin: PendingCheckin): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.PENDING_CHECKIN, JSON.stringify(checkin));
  } catch (error) {
    if (__DEV__) console.error('Failed to queue check-in:', error);
  }
}

export async function getPendingCheckin(): Promise<PendingCheckin | null> {
  try {
    const pendingStr = await AsyncStorage.getItem(CACHE_KEYS.PENDING_CHECKIN);
    return pendingStr ? JSON.parse(pendingStr) : null;
  } catch (error) {
    if (__DEV__) console.error('Failed to get pending check-in:', error);
    return null;
  }
}

export async function clearPendingCheckin(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEYS.PENDING_CHECKIN);
  } catch (error) {
    if (__DEV__) console.error('Failed to clear pending check-in:', error);
  }
}

// Types for pending location logs
export interface PendingLocationLog {
  patientId: string;
  householdId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

// Queue a location log for later sync
export async function queueLocationLog(log: PendingLocationLog): Promise<void> {
  try {
    const pendingStr = await AsyncStorage.getItem(CACHE_KEYS.PENDING_LOCATION_LOGS);
    const pending: PendingLocationLog[] = pendingStr ? JSON.parse(pendingStr) : [];
    pending.push(log);
    // Keep max 100 pending logs to avoid unbounded growth
    const trimmed = pending.slice(-100);
    await AsyncStorage.setItem(CACHE_KEYS.PENDING_LOCATION_LOGS, JSON.stringify(trimmed));
  } catch (error) {
    if (__DEV__) console.error('Failed to queue location log:', error);
  }
}

// Get all pending location logs
export async function getPendingLocationLogs(): Promise<PendingLocationLog[]> {
  try {
    const pendingStr = await AsyncStorage.getItem(CACHE_KEYS.PENDING_LOCATION_LOGS);
    return pendingStr ? JSON.parse(pendingStr) : [];
  } catch (error) {
    if (__DEV__) console.error('Failed to get pending location logs:', error);
    return [];
  }
}

// Clear pending location logs
export async function clearPendingLocationLogs(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEYS.PENDING_LOCATION_LOGS);
  } catch (error) {
    if (__DEV__) console.error('Failed to clear pending location logs:', error);
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
    if (__DEV__) console.error('Failed to cleanup old cache:', error);
  }
}
