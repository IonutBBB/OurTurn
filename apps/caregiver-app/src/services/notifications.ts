import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '@memoguard/supabase';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
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
    console.log('Push notifications only work on physical devices');
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
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    return tokenData.data;
  } catch (error) {
    console.error('Failed to get Expo push token:', error);
    return null;
  }
}

/**
 * Register push token with Supabase
 * Stores tokens in the caregivers.device_tokens JSONB array
 */
export async function registerPushToken(
  householdId: string,
  caregiverId: string,
  token: string
): Promise<void> {
  try {
    // First, get existing tokens
    const { data: caregiver, error: fetchError } = await supabase
      .from('caregivers')
      .select('device_tokens')
      .eq('id', caregiverId)
      .single();

    if (fetchError) throw fetchError;

    // Get existing tokens or initialize empty array
    const existingTokens: string[] = caregiver?.device_tokens || [];

    // Only add if not already present
    if (!existingTokens.includes(token)) {
      const updatedTokens = [...existingTokens, token];

      const { error: updateError } = await supabase
        .from('caregivers')
        .update({ device_tokens: updatedTokens })
        .eq('id', caregiverId);

      if (updateError) throw updateError;
    }

    console.log('Push token registered successfully');
  } catch (error) {
    console.error('Failed to register push token:', error);
  }
}

/**
 * Remove push token from Supabase
 * Call this on logout or when user disables notifications
 */
export async function unregisterPushToken(
  caregiverId: string,
  token: string
): Promise<void> {
  try {
    const { data: caregiver, error: fetchError } = await supabase
      .from('caregivers')
      .select('device_tokens')
      .eq('id', caregiverId)
      .single();

    if (fetchError) throw fetchError;

    const existingTokens: string[] = caregiver?.device_tokens || [];
    const updatedTokens = existingTokens.filter((t) => t !== token);

    const { error: updateError } = await supabase
      .from('caregivers')
      .update({ device_tokens: updatedTokens })
      .eq('id', caregiverId);

    if (updateError) throw updateError;

    console.log('Push token unregistered successfully');
  } catch (error) {
    console.error('Failed to unregister push token:', error);
  }
}

/**
 * Set up notification listeners
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
): () => void {
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('Notification received:', notification);
      onNotificationReceived?.(notification);
    }
  );

  const responseSubscription =
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      onNotificationResponse?.(response);
    });

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
 * Initialize notifications for the caregiver app
 */
export async function initializeNotifications(
  householdId?: string | null,
  caregiverId?: string | null
): Promise<NotificationState> {
  const state: NotificationState = {
    expoPushToken: null,
    permission: 'undetermined',
  };

  const hasPermission = await requestNotificationPermission();
  state.permission = hasPermission ? 'granted' : 'denied';

  if (hasPermission) {
    const token = await getExpoPushToken();
    state.expoPushToken = token;

    if (token && householdId && caregiverId) {
      await registerPushToken(householdId, caregiverId, token);
    }

    if (Platform.OS === 'android') {
      // Safety alerts channel - highest priority
      await Notifications.setNotificationChannelAsync('safety_alerts', {
        name: 'Safety Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 500, 500],
        lightColor: '#DC2626',
        bypassDnd: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      // Updates channel - medium priority
      await Notifications.setNotificationChannelAsync('updates', {
        name: 'Care Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0D9488',
      });

      // Default channel
      await Notifications.setNotificationChannelAsync('default', {
        name: 'General',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  }

  return state;
}
