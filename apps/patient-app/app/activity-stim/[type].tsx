/**
 * Dynamic activity player for all 15 engagement activities.
 * No scoring, no difficulty — focused on enjoyment and engagement.
 */

import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../src/stores/auth-store';
import { getActivityByType } from '../../src/utils/activity-registry';
import { useActivityContent } from '../../src/hooks/use-activity-content';
import { RENDERER_MAP } from '../../src/components/activity-renderers';
import { createActivitySession, completeActivitySession, skipActivitySession } from '@ourturn/supabase';
import { formatDateForDb } from '../../src/utils/time-of-day';
import { COLORS, FONTS } from '../../src/theme';
import type { StimActivityType } from '@ourturn/shared';

export default function ActivityStimPlayer() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const { t } = useTranslation();
  const { patient, session } = useAuthStore();
  const householdId = session?.householdId;
  const activityType = type as StimActivityType;

  const definition = getActivityByType(activityType);
  const { content, isLoading } = useActivityContent(activityType, householdId);

  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const [completed, setCompleted] = useState(false);

  // Create DB session on mount
  const createSession = useCallback(async () => {
    if (!householdId || !definition || sessionIdRef.current) return;
    try {
      const row = await createActivitySession({
        household_id: householdId,
        activity_type: activityType,
        cognitive_domain: definition.cognitiveDomain,
        date: formatDateForDb(),
      });
      sessionIdRef.current = row.id;
    } catch {
      // Offline — session will be tracked via AsyncStorage only
    }
  }, [householdId, activityType, definition]);

  // Create session once content is loaded
  if (!isLoading && !sessionIdRef.current && householdId) {
    createSession();
  }

  const handleComplete = useCallback(
    async (responseData?: Record<string, unknown>) => {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      setCompleted(true);

      // Mark complete in AsyncStorage
      const today = formatDateForDb();
      await AsyncStorage.setItem(`activity_completed_${activityType}_${today}`, 'true');

      // Update DB session — no score_data
      if (sessionIdRef.current) {
        try {
          await completeActivitySession(sessionIdRef.current, undefined, responseData, duration);
        } catch {
          // Offline
        }
      }

      // Celebrate and navigate back
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => router.back(), 800);
    },
    [activityType]
  );

  const handleSkip = useCallback(async () => {
    if (sessionIdRef.current) {
      try {
        await skipActivitySession(sessionIdRef.current);
      } catch {
        // Offline
      }
    }
    router.back();
  }, []);

  // Error state
  if (!definition) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t('common.error')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const Renderer = RENDERER_MAP[activityType];

  if (isLoading || !content) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.brand600} />
        </View>
      </SafeAreaView>
    );
  }

  if (completed) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationText}>{t('patientApp.stim.common.wellDone')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t(definition.titleKey)}</Text>
        </View>

        {/* Renderer */}
        <Renderer
          content={content}
          onComplete={handleComplete}
          onSkip={handleSkip}
          patientName={patient?.name ?? ''}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 8 },
  headerTitle: {
    fontSize: 28, fontFamily: FONTS.display, color: COLORS.textPrimary, textAlign: 'center',
  },
  errorText: { fontSize: 22, fontFamily: FONTS.body, color: COLORS.textSecondary, textAlign: 'center' },
  celebrationEmoji: { fontSize: 72, marginBottom: 16 },
  celebrationText: { fontSize: 28, fontFamily: FONTS.display, color: COLORS.textPrimary },
});
