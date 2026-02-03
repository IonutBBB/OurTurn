import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import {
  initializeNotifications,
  setupNotificationListeners,
  type NotificationState,
} from '../services/notifications';

interface UseNotificationsOptions {
  householdId?: string | null;
  caregiverId?: string | null;
}

interface UseNotificationsReturn extends NotificationState {
  isInitialized: boolean;
}

/**
 * Hook for managing notifications in the caregiver app
 */
export function useNotifications({
  householdId,
  caregiverId,
}: UseNotificationsOptions): UseNotificationsReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [notificationState, setNotificationState] = useState<NotificationState>({
    expoPushToken: null,
    permission: 'undetermined',
  });

  // Initialize notifications
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const state = await initializeNotifications(householdId, caregiverId);
      if (isMounted) {
        setNotificationState(state);
        setIsInitialized(true);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [householdId, caregiverId]);

  // Set up notification listeners
  useEffect(() => {
    const handleNotificationResponse = (
      response: Notifications.NotificationResponse
    ) => {
      const data = response.notification.request.content.data;

      // Handle different notification types
      switch (data?.type) {
        case 'location_alert':
        case 'left_safe_zone':
        case 'take_me_home':
          // Navigate to location tab
          router.replace('/(tabs)/location');
          break;
        case 'checkin':
          // Navigate to dashboard
          router.replace('/(tabs)/dashboard');
          break;
        case 'task_completed':
          // Navigate to plan tab
          router.replace('/(tabs)/plan');
          break;
        default:
          // Navigate to dashboard by default
          router.replace('/(tabs)/dashboard');
      }
    };

    const cleanup = setupNotificationListeners(undefined, handleNotificationResponse);

    return cleanup;
  }, []);

  return {
    ...notificationState,
    isInitialized,
  };
}
