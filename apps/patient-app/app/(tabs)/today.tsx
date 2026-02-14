import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { getProgressLabel, getCategoryIcon } from '@ourturn/shared';
import { useAuthStore } from '../../src/stores/auth-store';
import TaskCard, { type TaskStatus } from '../../src/components/task-card';
import {
  getTimeOfDay,
  getGreetingEmoji,
  getGreetingKey,
  getBackgroundGradient,
  getDayOfWeek,
  formatDateForDb,
  formatCurrentTime,
  getDayOfWeekLong,
  getYesterdayDateForDb,
  timeToMinutes,
  getCurrentTimeInMinutes,
  isTaskOverdue,
  formatTimeDisplay,
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
} from '@ourturn/supabase';
import type { CarePlanTask, TaskCompletion } from '@ourturn/shared';
import { useComplexity } from '../../src/hooks/use-complexity';
import { COLORS, FONTS, RADIUS, SHADOWS, GRADIENT_TEXT_COLOR } from '../../src/theme';
import { scheduleAllTaskReminders } from '../../src/services/notifications';

export default function TodayScreen() {
  const { t, i18n } = useTranslation();
  const { patient, session } = useAuthStore();
  const complexity = useComplexity();
  const isSimplified = complexity === 'simplified';

  const [tasks, setTasks] = useState<CarePlanTask[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [yesterdayCompletedCount, setYesterdayCompletedCount] = useState<number | null>(null);
  const [checkedInToday, setCheckedInToday] = useState<boolean | null>(null);
  const [currentTime, setCurrentTime] = useState(formatCurrentTime(i18n.language));
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const timeOfDay = getTimeOfDay();
  const greeting = getGreetingKey(timeOfDay);
  const emoji = getGreetingEmoji(timeOfDay);
  const gradient = getBackgroundGradient(timeOfDay);
  const gradientTextColor = GRADIENT_TEXT_COLOR[timeOfDay];

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

      // Schedule task notifications
      const uncompletedTasks = fetchedTasks.filter((task) => {
        const comp = fetchedCompletions.find((c) => c.task_id === task.id);
        return !comp?.completed && !comp?.skipped;
      });
      scheduleAllTaskReminders(uncompletedTasks, patient?.name);

      // Check if daily check-in is done (non-blocking)
      try {
        const { data: checkinData } = await supabase
          .from('daily_checkins')
          .select('id')
          .eq('household_id', householdId)
          .eq('date', today)
          .single();
        setCheckedInToday(!!checkinData);
      } catch {
        setCheckedInToday(false);
      }

      // Fetch yesterday's completed count (non-blocking)
      try {
        const yesterdayDate = getYesterdayDateForDb();
        const yesterdayCompletions = await getTodaysCompletions(householdId, yesterdayDate);
        const count = yesterdayCompletions.filter((c) => c.completed).length;
        setYesterdayCompletedCount(count);
      } catch {
        setYesterdayCompletedCount(null);
      }
    } catch (err) {
      if (__DEV__) console.error('Failed to fetch tasks:', err);

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

  // Live clock — update every minute
  useEffect(() => {
    clockRef.current = setInterval(() => {
      setCurrentTime(formatCurrentTime(i18n.language));
    }, 60000);
    return () => {
      if (clockRef.current) clearInterval(clockRef.current);
    };
  }, [i18n.language]);

  // Realtime subscription for care plan changes
  useEffect(() => {
    if (!householdId) return;
    const channel = supabase
      .channel(`tasks-${householdId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'care_plan_tasks',
        filter: `household_id=eq.${householdId}`,
      }, () => { fetchData(); })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'task_completions',
        filter: `household_id=eq.${householdId}`,
      }, () => { fetchData(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [householdId, fetchData]);

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
      if (__DEV__) console.error('Failed to complete task:', err);

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

  // Find next uncompleted task for "Coming Up Next" card
  const nextTask = sortedTasks.find((task) => {
    const comp = completions.find((c) => c.task_id === task.id);
    if (comp?.completed || comp?.skipped) return false;
    return timeToMinutes(task.time) >= getCurrentTimeInMinutes() - 30;
  });

  // Loading state
  if (isLoading) {
    return (
      <View
        style={[styles.container, styles.centered]}
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityLabel={t('common.loading')}
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

          {/* Compact Orientation Header */}
          <View style={styles.greetingContainer}>
            <Text
              style={[styles.orientationLine, { color: gradientTextColor }]}
              accessibilityRole="header"
            >
              {getDayOfWeekLong(new Date(), i18n.language)}  ·  {new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long' }).format(new Date())}  ·  {currentTime}
            </Text>
            <Text
              style={[styles.greeting, isSimplified && styles.greetingSimplified, { color: gradientTextColor }]}
              accessibilityLabel={t(greeting, { name: patient?.name || '' })}
            >
              {t(greeting, { name: patient?.name || '' })} {emoji}
            </Text>
            {yesterdayCompletedCount != null && yesterdayCompletedCount > 0 && (
              <Text style={[styles.yesterdayText, { color: gradientTextColor }]}>
                {t('patientApp.todaysPlan.yesterdayCompleted', { count: yesterdayCompletedCount })}
              </Text>
            )}
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

          {/* Daily Check-in card */}
          {checkedInToday !== null && (
            <TouchableOpacity
              style={[
                styles.checkinCard,
                checkedInToday && styles.checkinCardDone,
              ]}
              onPress={() => router.push('/checkin')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={
                checkedInToday
                  ? t('patientApp.checkin.alreadyDone')
                  : t('patientApp.checkin.tapToCheckin')
              }
              accessibilityHint={t('patientApp.checkin.opensCheckin')}
            >
              <View style={styles.checkinContent}>
                <View
                  style={[
                    styles.checkinIcon,
                    checkedInToday && styles.checkinIconDone,
                  ]}
                >
                  <Text style={styles.checkinIconText}>
                    {checkedInToday ? '✓' : '?'}
                  </Text>
                </View>
                <View style={styles.checkinTextContainer}>
                  <Text style={styles.checkinTitle}>
                    {t('patientApp.checkin.moodQuestion')}
                  </Text>
                  <Text
                    style={[
                      styles.checkinSubtitle,
                      checkedInToday && styles.checkinSubtitleDone,
                    ]}
                  >
                    {checkedInToday
                      ? t('patientApp.checkin.alreadyDone')
                      : t('patientApp.checkin.tapToCheckin')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Coming Up Next card */}
          {nextTask && (
            <View style={styles.comingUpCard}>
              <Text style={styles.comingUpLabel}>{t('patientApp.todaysPlan.comingUp')}</Text>
              <View style={styles.comingUpContent}>
                <Text style={styles.comingUpIcon}>{getCategoryIcon(nextTask.category)}</Text>
                <View style={styles.comingUpTextContainer}>
                  <Text style={styles.comingUpTitle} numberOfLines={1}>{nextTask.title}</Text>
                  <Text style={styles.comingUpTime}>🕐 {formatTimeDisplay(nextTask.time, i18n.language)}</Text>
                </View>
              </View>
            </View>
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
                simplified={isSimplified}
              />
            );
          })}

          {/* Add a Reminder card */}
          <TouchableOpacity
            style={styles.addReminderCard}
            onPress={() => router.push('/add-reminder')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('patientApp.addReminder.cardTitle')}
            accessibilityHint={t('patientApp.addReminder.cardSubtitle')}
          >
            <View style={styles.addReminderContent}>
              <View style={styles.addReminderIcon}>
                <Text style={styles.addReminderIconText}>{'+'}</Text>
              </View>
              <View style={styles.addReminderTextContainer}>
                <Text style={styles.addReminderTitle}>
                  {t('patientApp.addReminder.cardTitle')}
                </Text>
                <Text style={styles.addReminderSubtitle}>
                  {t('patientApp.addReminder.cardSubtitle')}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

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
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  offlineBanner: {
    backgroundColor: COLORS.textMuted,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    fontSize: 20,
    color: COLORS.textInverse,
    textAlign: 'center',
    fontFamily: FONTS.bodyMedium,
  },
  greetingContainer: {
    marginBottom: 20,
  },
  orientationLine: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    lineHeight: 36,
  },
  greeting: {
    fontSize: 28,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    lineHeight: 36,
    letterSpacing: 0,
    marginTop: 8,
  },
  greetingSimplified: {
    fontSize: 32,
    lineHeight: 40,
  },
  yesterdayText: {
    fontSize: 22,
    fontFamily: FONTS.body,
    marginTop: 4,
    lineHeight: 36,
    opacity: 0.85,
  },
  progressContainer: {
    marginBottom: 28,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS['2xl'],
    padding: 20,
    ...SHADOWS.md,
  },
  progressText: {
    fontSize: 20,
    color: COLORS.textSecondary,
    marginBottom: 12,
    fontFamily: FONTS.bodyMedium,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: COLORS.brand50,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.brand600,
    borderRadius: 6,
  },
  encouragingText: {
    fontSize: 20,
    color: COLORS.brand600,
    marginTop: 12,
    fontFamily: FONTS.bodySemiBold,
  },
  errorContainer: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.danger + '40',
  },
  errorText: {
    fontSize: 20,
    color: COLORS.danger,
    fontFamily: FONTS.bodyMedium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyEmoji: {
    fontSize: 72,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 22,
    color: COLORS.textSecondary,
    paddingHorizontal: 32,
    lineHeight: 38,
    fontFamily: FONTS.bodyMedium,
  },
  bottomPadding: {
    height: 120,
  },
  checkinCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS['2xl'],
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.brand400,
    ...SHADOWS.md,
  },
  checkinCardDone: {
    borderColor: COLORS.success,
    opacity: 0.7,
  },
  checkinContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkinIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.brand50,
    borderWidth: 2,
    borderColor: COLORS.brand400,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  checkinIconDone: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
  },
  checkinIconText: {
    fontSize: 24,
    fontFamily: FONTS.bodyBold,
    color: COLORS.brand600,
  },
  checkinTextContainer: {
    flex: 1,
  },
  checkinTitle: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
  },
  checkinSubtitle: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.brand600,
    marginTop: 4,
  },
  checkinSubtitleDone: {
    color: COLORS.success,
  },
  comingUpCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS['2xl'],
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.brand200,
    ...SHADOWS.md,
  },
  comingUpLabel: {
    fontSize: 20,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.brand600,
    marginBottom: 12,
  },
  comingUpContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comingUpIcon: {
    fontSize: 36,
    marginRight: 14,
  },
  comingUpTextContainer: {
    flex: 1,
  },
  comingUpTitle: {
    fontSize: 22,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  comingUpTime: {
    fontSize: 20,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  addReminderCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS['2xl'],
    padding: 20,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.brand200,
  },
  addReminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addReminderIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.brand50,
    borderWidth: 1,
    borderColor: COLORS.brand200,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  addReminderIconText: {
    fontSize: 28,
    fontFamily: FONTS.bodyBold,
    color: COLORS.brand600,
  },
  addReminderTextContainer: {
    flex: 1,
  },
  addReminderTitle: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
  },
  addReminderSubtitle: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
