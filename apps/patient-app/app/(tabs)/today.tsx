import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { getProgressLabel } from '@memoguard/shared';
import { useAuthStore } from '../../src/stores/auth-store';
import TaskCard, { type TaskStatus } from '../../src/components/task-card';
import {
  getTimeOfDay,
  getGreetingEmoji,
  getGreetingKey,
  getBackgroundGradient,
  getDayOfWeek,
  formatDateForDb,
  timeToMinutes,
  getCurrentTimeInMinutes,
  isTaskOverdue,
} from '../../src/utils/time-of-day';
import {
  cacheTasks,
  getCachedTasks,
  cacheCompletions,
  getCachedCompletions,
  queueCompletion,
} from '../../src/utils/offline-cache';
import {
  getTodaysTasks,
  getTodaysCompletions,
  completeTask,
  supabase,
} from '@memoguard/supabase';
import type { CarePlanTask, TaskCompletion } from '@memoguard/shared';

// Design system colors
const COLORS = {
  background: '#FAFAF8',
  card: '#FFFFFF',
  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  textMuted: '#A8A29E',
  brand600: '#0D9488',
  brand700: '#0F766E',
  brand200: '#99F6E4',
};

export default function TodayScreen() {
  const { t } = useTranslation();
  const { patient, session } = useAuthStore();

  const [tasks, setTasks] = useState<CarePlanTask[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCheckedIn, setHasCheckedIn] = useState(true); // Assume true initially

  const timeOfDay = getTimeOfDay();
  const greeting = getGreetingKey(timeOfDay);
  const emoji = getGreetingEmoji(timeOfDay);
  const gradient = getBackgroundGradient(timeOfDay);

  const today = formatDateForDb();
  const dayOfWeek = getDayOfWeek();
  const householdId = session?.householdId;

  // Calculate task status
  const getTaskStatus = useCallback(
    (task: CarePlanTask, completion?: TaskCompletion): TaskStatus => {
      if (completion?.completed) return 'completed';
      if (completion?.skipped) return 'skipped';

      const taskMinutes = timeToMinutes(task.time);
      const currentMinutes = getCurrentTimeInMinutes();

      // Find the next uncompleted task
      const uncompletedTasks = tasks.filter((t) => {
        const comp = completions.find((c) => c.task_id === t.id);
        return !comp?.completed && !comp?.skipped;
      });

      // Sort by time
      const sortedUncompleted = [...uncompletedTasks].sort(
        (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
      );

      // Find the first task that is due now or in the future
      const nowTask = sortedUncompleted.find((t) => {
        const tMinutes = timeToMinutes(t.time);
        return tMinutes >= currentMinutes - 30; // Within 30 minutes
      });

      if (nowTask?.id === task.id) return 'now';
      if (isTaskOverdue(task.time)) return 'overdue';
      return 'upcoming';
    },
    [tasks, completions]
  );

  // Fetch tasks and completions
  const fetchData = useCallback(async () => {
    if (!householdId) return;

    try {
      setError(null);

      const [fetchedTasks, fetchedCompletions] = await Promise.all([
        getTodaysTasks(householdId, dayOfWeek),
        getTodaysCompletions(householdId, today),
      ]);

      setTasks(fetchedTasks);
      setCompletions(fetchedCompletions);
      setIsOffline(false);

      // Cache for offline use
      await cacheTasks(today, fetchedTasks);
      await cacheCompletions(today, fetchedCompletions);

      // Check if user has done their daily check-in
      const { data: checkin } = await supabase
        .from('daily_checkins')
        .select('id')
        .eq('household_id', householdId)
        .eq('date', today)
        .single();

      setHasCheckedIn(!!checkin);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);

      // Try to load from cache
      const cachedTasks = await getCachedTasks(today);
      const cachedCompletions = await getCachedCompletions(today);

      if (cachedTasks) {
        setTasks(cachedTasks);
        setCompletions(cachedCompletions || []);
        setIsOffline(true);
      } else {
        setError(t('common.error'));
      }
    }
  }, [householdId, dayOfWeek, today, t]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchData();
      setIsLoading(false);
    };
    loadData();
  }, [fetchData]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  }, [fetchData]);

  // Handle task completion
  const handleCompleteTask = async (taskId: string) => {
    if (!householdId) return;

    // Optimistic update
    const now = new Date().toISOString();
    const newCompletion: TaskCompletion = {
      id: `temp-${taskId}`,
      task_id: taskId,
      household_id: householdId,
      date: today,
      completed: true,
      completed_at: now,
      skipped: false,
    };

    setCompletions((prev) => {
      const existing = prev.findIndex((c) => c.task_id === taskId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], completed: true, completed_at: now };
        return updated;
      }
      return [...prev, newCompletion];
    });

    try {
      // Try to save to database
      await completeTask(taskId, householdId, today);

      // Update cache
      const updatedCompletions = completions.filter((c) => c.task_id !== taskId);
      updatedCompletions.push({
        ...newCompletion,
        id: newCompletion.id, // Will be replaced by actual ID on next fetch
      });
      await cacheCompletions(today, updatedCompletions);
    } catch (err) {
      console.error('Failed to complete task:', err);

      // Queue for later sync if offline
      await queueCompletion({
        taskId,
        householdId,
        date: today,
        completedAt: now,
      });
    }
  };

  // Calculate progress
  const completedCount = completions.filter((c) => c.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Get encouraging message
  const getEncouragingMessage = () => {
    if (progressPercent >= 100) return t('patientApp.todaysPlan.allDone');
    if (progressPercent >= 50) return t('patientApp.todaysPlan.keepGoing');
    if (progressPercent >= 30) return t('patientApp.todaysPlan.greatMorning');
    return null;
  };

  // Sort tasks by time
  const sortedTasks = [...tasks].sort(
    (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
  );

  // Loading state
  if (isLoading) {
    return (
      <View
        style={[styles.container, styles.centered]}
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityLabel={t('common.loading') || 'Loading'}
        accessibilityState={{ busy: true }}
      >
        <ActivityIndicator size="large" color={COLORS.brand600} />
      </View>
    );
  }

  return (
    <LinearGradient colors={[gradient.start, gradient.end]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.brand600}
            />
          }
        >
          {/* Offline banner */}
          {isOffline && (
            <View style={styles.offlineBanner}>
              <Text style={styles.offlineText}>{t('common.offline')}</Text>
            </View>
          )}

          {/* Greeting */}
          <View style={styles.greetingContainer}>
            <Text
              style={styles.greeting}
              accessibilityRole="header"
              accessibilityLabel={t(greeting, { name: patient?.name || '' })}
            >
              {t(greeting, { name: patient?.name || '' })} {emoji}
            </Text>
          </View>

          {/* Progress bar */}
          {totalCount > 0 && (
            <View
              style={styles.progressContainer}
              accessible={true}
              accessibilityRole="progressbar"
              accessibilityLabel={getProgressLabel(completedCount, totalCount, 'tasks')}
              accessibilityValue={{
                min: 0,
                max: totalCount,
                now: completedCount,
                text: `${Math.round(progressPercent)}%`,
              }}
            >
              <Text style={styles.progressText}>
                {t('patientApp.todaysPlan.progress', {
                  completed: completedCount,
                  total: totalCount,
                })}{' '}
                {progressPercent >= 50 && '🌟'}
              </Text>
              <View
                style={styles.progressBarBackground}
                importantForAccessibility="no-hide-descendants"
              >
                <View
                  style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
                />
              </View>
              {getEncouragingMessage() && (
                <Text style={styles.encouragingText} accessibilityLiveRegion="polite">
                  {getEncouragingMessage()}
                </Text>
              )}
            </View>
          )}

          {/* Daily Check-in Card */}
          {!hasCheckedIn && (
            <TouchableOpacity
              style={styles.checkinCard}
              onPress={() => router.push('/checkin')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`${t('patientApp.checkin.moodQuestion')}. Tap to check in`}
              accessibilityHint="Opens the daily check-in screen"
            >
              <View style={styles.checkinContent} importantForAccessibility="no-hide-descendants">
                <Text style={styles.checkinEmoji}>👋</Text>
                <View style={styles.checkinTextContainer}>
                  <Text style={styles.checkinTitle}>{t('patientApp.checkin.moodQuestion')}</Text>
                  <Text style={styles.checkinSubtitle}>Tap to check in</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Error state */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Empty state */}
          {!error && tasks.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyText}>{t('patientApp.todaysPlan.noPlan')} 💙</Text>
            </View>
          )}

          {/* Task list */}
          {sortedTasks.map((task) => {
            const completion = completions.find((c) => c.task_id === task.id);
            const status = getTaskStatus(task, completion);

            return (
              <TaskCard
                key={task.id}
                task={task}
                completion={completion}
                status={status}
                onComplete={handleCompleteTask}
              />
            );
          })}

          {/* Bottom padding for tab bar */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  offlineBanner: {
    backgroundColor: COLORS.textMuted,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  offlineText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  greetingContainer: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 36,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: COLORS.card,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.brand600,
    borderRadius: 4,
  },
  encouragingText: {
    fontSize: 18,
    color: COLORS.brand600,
    marginTop: 8,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#DC2626',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 28,
  },
  bottomPadding: {
    height: 100,
  },
  checkinCard: {
    backgroundColor: '#E0F2F1',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.brand600,
  },
  checkinContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkinEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  checkinTextContainer: {
    flex: 1,
  },
  checkinTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  checkinSubtitle: {
    fontSize: 16,
    color: COLORS.brand700,
    marginTop: 4,
  },
});
