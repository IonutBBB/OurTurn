import { useEffect, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import {
  initializeNotifications,
  setupNotificationListeners,
  scheduleAllTaskReminders,
  type NotificationState,
} from '../services/notifications';
import type { CarePlanTask } from '@ourturn/shared';

interface UseNotificationsOptions {
  householdId?: string | null;
  tasks?: CarePlanTask[];
  patientName?: string;
}

interface UseNotificationsReturn extends NotificationState {
  isInitialized: boolean;
  refreshReminders: () => Promise<void>;
}

/**
 * Hook for managing notifications in the patient app
 */
export function useNotifications({
  householdId,
  tasks = [],
  patientName,
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
      const state = await initializeNotifications(householdId);
      if (isMounted) {
        setNotificationState(state);
        setIsInitialized(true);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [householdId]);

  // Set up notification listeners
  useEffect(() => {
    const handleNotificationResponse = (
      response: Notifications.NotificationResponse
    ) => {
      const data = response.notification.request.content.data;

      // Handle task reminder tap
      if (data?.type === 'task_reminder') {
        // Navigate to Today tab
        router.replace('/(tabs)');
      }

      // Handle other notification types
      if (data?.type === 'checkin_reminder') {
        router.push('/checkin');
      }
    };

    const cleanup = setupNotificationListeners(undefined, handleNotificationResponse);

    return cleanup;
  }, []);

  // Schedule task reminders when tasks change
  useEffect(() => {
    if (isInitialized && notificationState.permission === 'granted' && tasks.length > 0) {
      // Filter out completed tasks if completions are available
      const uncompletedTasks = tasks.filter(
        (task) => !(task as any).completion?.completed
      );
      scheduleAllTaskReminders(uncompletedTasks, patientName);
    }
  }, [isInitialized, notificationState.permission, tasks, patientName]);

  // Manual refresh function
  const refreshReminders = useCallback(async () => {
    if (notificationState.permission === 'granted' && tasks.length > 0) {
      const uncompletedTasks = tasks.filter(
        (task) => !(task as any).completion?.completed
      );
      await scheduleAllTaskReminders(uncompletedTasks, patientName);
    }
  }, [notificationState.permission, tasks, patientName]);

  return {
    ...notificationState,
    isInitialized,
    refreshReminders,
  };
}
