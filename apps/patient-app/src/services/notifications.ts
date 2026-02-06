import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '@ourturn/supabase';
import type { CarePlanTask } from '@ourturn/shared';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationState {
  expoPushToken: string | null;
  permission: 'granted' | 'denied' | 'undetermined';
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) {
    if (__DEV__) console.log('Push notifications only work on physical devices');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Get the Expo push token
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  try {
    // Get the token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    return tokenData.data;
  } catch (error) {
    if (__DEV__) console.error('Failed to get Expo push token:', error);
    return null;
  }
}

/**
 * Register push token with Supabase
 * Stores tokens in the patients.device_tokens JSONB array
 */
export async function registerPushToken(
  householdId: string,
  token: string
): Promise<void> {
  try {
    // First, get existing tokens from patient
    const { data: patient, error: fetchError } = await supabase
      .from('patients')
      .select('id, device_tokens')
      .eq('household_id', householdId)
      .single();

    if (fetchError) throw fetchError;
    if (!patient) {
      if (__DEV__) console.error('No patient found for household');
      return;
    }

    // Get existing tokens or initialize empty array
    const existingTokens: string[] = patient.device_tokens || [];

    // Only add if not already present
    if (!existingTokens.includes(token)) {
      const updatedTokens = [...existingTokens, token];

      const { error: updateError } = await supabase
        .from('patients')
        .update({ device_tokens: updatedTokens })
        .eq('id', patient.id);

      if (updateError) throw updateError;
    }

    if (__DEV__) console.log('Push token registered successfully');
  } catch (error) {
    if (__DEV__) console.error('Failed to register push token:', error);
  }
}

/**
 * Remove push token from Supabase
 */
export async function unregisterPushToken(
  householdId: string,
  token: string
): Promise<void> {
  try {
    const { data: patient, error: fetchError } = await supabase
      .from('patients')
      .select('id, device_tokens')
      .eq('household_id', householdId)
      .single();

    if (fetchError) throw fetchError;
    if (!patient) return;

    const existingTokens: string[] = patient.device_tokens || [];
    const updatedTokens = existingTokens.filter((t) => t !== token);

    const { error: updateError } = await supabase
      .from('patients')
      .update({ device_tokens: updatedTokens })
      .eq('id', patient.id);

    if (updateError) throw updateError;

    if (__DEV__) console.log('Push token unregistered successfully');
  } catch (error) {
    if (__DEV__) console.error('Failed to unregister push token:', error);
  }
}

/**
 * Schedule a local notification for a task
 */
export async function scheduleTaskReminder(
  task: CarePlanTask,
  patientName?: string
): Promise<string | null> {
  try {
    // Parse task time
    const [hours, minutes] = task.time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, don't schedule
    if (scheduledTime <= now) {
      return null;
    }

    // Calculate seconds until the scheduled time
    const secondsUntilReminder = Math.floor(
      (scheduledTime.getTime() - now.getTime()) / 1000
    );

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: task.title,
        body: task.hint_text || `Time for: ${task.title}`,
        data: { taskId: task.id, type: 'task_reminder' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntilReminder,
      },
    });

    return notificationId;
  } catch (error) {
    if (__DEV__) console.error('Failed to schedule task reminder:', error);
    return null;
  }
}

/**
 * Schedule all task reminders for today
 */
export async function scheduleAllTaskReminders(
  tasks: CarePlanTask[],
  patientName?: string
): Promise<void> {
  // First, cancel all existing reminders
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule reminders for each task
  for (const task of tasks) {
    await scheduleTaskReminder(task, patientName);
  }

  if (__DEV__) console.log(`Scheduled ${tasks.length} task reminders`);
}

/**
 * Cancel a specific notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Set up notification listeners
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
): () => void {
  // Listener for notifications received while app is in foreground
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      if (__DEV__) console.log('Notification received:', notification);
      onNotificationReceived?.(notification);
    }
  );

  // Listener for user interacting with notification
  const responseSubscription =
    Notifications.addNotificationResponseReceivedListener((response) => {
      if (__DEV__) console.log('Notification response:', response);
      onNotificationResponse?.(response);
    });

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Initialize notifications for the patient app
 * Call this in _layout.tsx or on app startup
 */
export async function initializeNotifications(
  householdId?: string | null
): Promise<NotificationState> {
  const state: NotificationState = {
    expoPushToken: null,
    permission: 'undetermined',
  };

  // Request permissions
  const hasPermission = await requestNotificationPermission();
  state.permission = hasPermission ? 'granted' : 'denied';

  if (hasPermission) {
    // Get push token
    const token = await getExpoPushToken();
    state.expoPushToken = token;

    // Register with Supabase if we have a household
    if (token && householdId) {
      await registerPushToken(householdId, token);
    }

    // Set up Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Task Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0D9488',
      });

      await Notifications.setNotificationChannelAsync('alerts', {
        name: 'Safety Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 500, 500],
        lightColor: '#DC2626',
      });
    }
  }

  return state;
}
