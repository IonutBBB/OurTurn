/**
 * Dynamic activity player for all 15 engagement activities.
 * No scoring, no difficulty — focused on enjoyment and engagement.
 */

import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
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
import { createActivitySession, completeActivitySession, skipActivitySession, completeTask } from '@ourturn/supabase';
import { formatDateForDb } from '../../src/utils/time-of-day';
import { queueCompletion } from '../../src/utils/offline-cache';
import { COLORS, FONTS, RADIUS } from '../../src/theme';
import type { StimActivityType } from '@ourturn/shared';

interface CompletionData {
  roundsCompleted: number;
  durationSeconds: number;
}

export default function ActivityStimPlayer() {
  const { type, taskId } = useLocalSearchParams<{ type: string; taskId?: string }>();
  const { t } = useTranslation();
  const { patient, session } = useAuthStore();
  const householdId = session?.householdId;
  const activityType = type as StimActivityType;

  const definition = getActivityByType(activityType);
  const { content, isLoading } = useActivityContent(activityType, householdId);

  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);

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
      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      const roundsCompleted = (responseData?.roundsCompleted as number) ?? 1;

      setCompletionData({ roundsCompleted, durationSeconds });

      // Mark complete in AsyncStorage
      const today = formatDateForDb();
      await AsyncStorage.setItem(`activity_completed_${activityType}_${today}`, 'true');

      // Update DB session — no score_data
      if (sessionIdRef.current) {
        try {
          await completeActivitySession(sessionIdRef.current, undefined, responseData, durationSeconds);
        } catch {
          // Offline
        }
      }

      // Auto-complete the care plan task if launched from one
      if (taskId && householdId) {
        const today2 = formatDateForDb();
        try {
          await completeTask(taskId, householdId, today2);
        } catch {
          // Queue for offline sync
          await queueCompletion({
            taskId,
            householdId,
            date: today2,
            completedAt: new Date().toISOString(),
          });
        }
      }

      // Celebrate haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [activityType, taskId, householdId]
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

  // Completion summary screen
  if (completionData) {
    const minutes = Math.floor(completionData.durationSeconds / 60);
    const seconds = completionData.durationSeconds % 60;
    const timeText = minutes > 0
      ? t('patientApp.stim.summary.timeSpent', { minutes, seconds })
      : t('patientApp.stim.summary.timeSpentSeconds', { seconds });

    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <Text style={styles.summaryEmoji}>🎉</Text>
          <Text style={styles.summaryHeading}>{t('patientApp.stim.common.wellDone')}</Text>

          <View style={styles.summaryCard}>
            {completionData.roundsCompleted > 1 && (
              <Text style={styles.summaryDetail}>
                {t('patientApp.stim.summary.roundsCompleted', { count: completionData.roundsCompleted })}
              </Text>
            )}
            <Text style={styles.summaryDetail}>{timeText}</Text>
          </View>

          <Text style={styles.encouragementText}>
            {t('patientApp.stim.summary.encouragement')}
          </Text>

          <TouchableOpacity
            style={styles.summaryDoneButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.summaryDoneText}>
              {t('patientApp.stim.common.imDone')}
            </Text>
          </TouchableOpacity>
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

  // Completion summary styles
  summaryEmoji: { fontSize: 72, marginBottom: 16 },
  summaryHeading: {
    fontSize: 28, fontFamily: FONTS.display, color: COLORS.textPrimary,
    textAlign: 'center', marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: COLORS.successBg, borderRadius: RADIUS['2xl'],
    borderWidth: 2, borderColor: COLORS.success,
    paddingVertical: 20, paddingHorizontal: 32,
    marginBottom: 24, width: '100%', alignItems: 'center',
  },
  summaryDetail: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.success,
    textAlign: 'center', lineHeight: 32,
  },
  encouragementText: {
    fontSize: 22, fontFamily: FONTS.body, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 30, marginBottom: 32, paddingHorizontal: 16,
  },
  summaryDoneButton: {
    backgroundColor: COLORS.success, paddingVertical: 18,
    paddingHorizontal: 56, borderRadius: RADIUS.lg,
  },
  summaryDoneText: {
    fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse,
  },
});
