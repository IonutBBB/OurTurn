import { useEffect, useState, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, AppState, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { useFonts } from 'expo-font';
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import NetInfo from '@react-native-community/netinfo';
import { useAuthStore } from '../src/stores/auth-store';
import { ErrorBoundary } from '../src/components/error-boundary';
import { useNotifications } from '../src/hooks/use-notifications';
import {
  getPendingCompletions,
  clearPendingCompletions,
  getPendingAlerts,
  clearPendingAlerts,
  getPendingCheckin,
  clearPendingCheckin,
  getPendingLocationLogs,
  clearPendingLocationLogs,
  cleanupOldCache,
} from '../src/utils/offline-cache';
import { completeTask, createLocationAlert, logLocation, supabase } from '@ourturn/supabase';
import { startHeartbeat, stopHeartbeat } from '../src/services/heartbeat';
import { startLocationTracking, stopLocationTracking } from '../src/services/location-tracker';
import { COLORS } from '../src/theme';

// Initialize i18n
import '../src/i18n';
import { initLanguageFromHousehold } from '../src/i18n';
import { validateEnv } from '../src/utils/validate-env';

validateEnv();

/** Sync any offline-queued completions and alerts to Supabase */
async function syncOfflineData(householdId?: string | null) {
  if (!householdId) return;

  // Sync pending task completions
  const pendingCompletions = await getPendingCompletions();
  if (pendingCompletions.length > 0) {
    const failed = [];
    for (const pc of pendingCompletions) {
      try {
        await completeTask(pc.taskId, pc.householdId, pc.date);
      } catch {
        failed.push(pc);
      }
    }
    if (failed.length === 0) {
      await clearPendingCompletions();
    }
  }

  // Sync pending location alerts
  const pendingAlerts = await getPendingAlerts();
  if (pendingAlerts.length > 0) {
    const failed = [];
    for (const alert of pendingAlerts) {
      try {
        await createLocationAlert(alert.householdId, {
          type: alert.type as 'left_safe_zone' | 'inactive' | 'night_movement' | 'take_me_home_tapped' | 'sos_triggered',
          latitude: alert.latitude,
          longitude: alert.longitude,
        });
      } catch {
        failed.push(alert);
      }
    }
    if (failed.length === 0) {
      await clearPendingAlerts();
    }
  }

  // Sync pending location logs
  const pendingLogs = await getPendingLocationLogs();
  if (pendingLogs.length > 0) {
    const failed = [];
    for (const log of pendingLogs) {
      try {
        await logLocation(
          log.patientId,
          log.householdId,
          log.latitude,
          log.longitude,
          log.accuracy
        );
      } catch {
        failed.push(log);
      }
    }
    if (failed.length === 0) {
      await clearPendingLocationLogs();
    }
  }

  // Sync pending check-in
  const pendingCheckin = await getPendingCheckin();
  if (pendingCheckin) {
    try {
      await supabase.from('daily_checkins').upsert({
        household_id: pendingCheckin.householdId,
        date: pendingCheckin.date,
        mood: pendingCheckin.mood,
        sleep_quality: pendingCheckin.sleepQuality,
        voice_note_url: pendingCheckin.voiceNoteUrl || null,
      });
      await clearPendingCheckin();
    } catch {
      // Will retry on next sync
    }
  }
}

export default function RootLayout() {
  const { isInitialized, initialize, session, patient, refreshFromServer } = useAuthStore();
  const [fontTimeout, setFontTimeout] = useState(false);
  const appState = useRef(AppState.currentState);

  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  // Wire up push notifications
  useNotifications({
    householdId: session?.householdId,
    patientName: patient?.name,
  });

  useEffect(() => {
    initialize();
    // Hide Android navigation bar so it doesn't cover tab buttons
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
  }, [initialize]);

  // Clean up old cache on startup & sync offline data
  useEffect(() => {
    cleanupOldCache();
    syncOfflineData(session?.householdId);
  }, [session?.householdId]);

  // Sync offline data and refresh patient data when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        syncOfflineData(session?.householdId);
        refreshFromServer().catch(() => {});
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [session?.householdId, refreshFromServer]);

  // Sync offline data and refresh when network connectivity is restored
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        syncOfflineData(session?.householdId);
        refreshFromServer().catch(() => {});
      }
    });
    return () => unsubscribe();
  }, [session?.householdId, refreshFromServer]);

  // Heartbeat: update last_seen_at every 10 minutes
  useEffect(() => {
    if (patient?.id) {
      startHeartbeat(patient.id);
    }
    return () => stopHeartbeat();
  }, [patient?.id]);

  // Background location tracking for safe zone violation detection
  useEffect(() => {
    if (patient?.id && session?.householdId) {
      startLocationTracking();
    }
    return () => {
      stopLocationTracking();
    };
  }, [patient?.id, session?.householdId]);

  // Realtime sync: detect when caregiver changes household or patient data
  useEffect(() => {
    if (!session?.householdId) return;
    const channel = supabase
      .channel(`household-sync-${session.householdId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'households',
          filter: `id=eq.${session.householdId}`,
        },
        (payload) => {
          const newLang = (payload.new as { language?: string }).language;
          if (newLang) {
            initLanguageFromHousehold(newLang).catch(() => {});
          }
          // Refresh full data to pick up any household changes
          refreshFromServer().catch(() => {});
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'patients',
          filter: `household_id=eq.${session.householdId}`,
        },
        () => {
          // Refresh to pick up name, emergency contacts, home address changes
          refreshFromServer().catch(() => {});
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.householdId, refreshFromServer]);

  // Font loading timeout - don't block forever
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!fontsLoaded) {
        setFontTimeout(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  // Show loading screen while initializing - but don't block forever
  const fontsReady = fontsLoaded || fontTimeout || !!fontError;
  if (!isInitialized || !fontsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.brand600} />
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="checkin"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="sos-confirmation"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="activity"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="activity-remember"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="activity-listen"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="activity-move"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="activity-create"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="activity-stim/[type]"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="consent"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="essential-mode"
          options={{
            animation: 'fade',
          }}
        />
      </Stack>
      <StatusBar style="dark" />
    </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
