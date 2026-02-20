import { useState, memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import {
  getCategoryIcon,
  getTaskCardLabel,
  formatTimeForScreenReader,
  getTaskCompletionAnnouncement,
  TOUCH_TARGETS,
  getSafeAnimationDuration,
} from '@ourturn/shared';
import type { CarePlanTask, TaskCompletion, MedicationItem } from '@ourturn/shared';
import { getActivityByType } from '../utils/activity-registry';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../theme';
import { useReducedMotion } from '../hooks/use-reduced-motion';

export type TaskStatus = 'upcoming' | 'now' | 'overdue' | 'completed' | 'skipped';

interface TaskCardProps {
  task: CarePlanTask;
  completion?: TaskCompletion;
  status: TaskStatus;
  onComplete: (taskId: string) => Promise<void>;
  onPlayActivity?: (activityType: string, taskId: string) => void;
  simplified?: boolean;
}

function formatTime(time: string): string {
  // Convert 24h time (e.g., "09:00") to 12h format
  const [hours, minutes] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

function formatCompletedTime(isoString: string): string {
  const date = new Date(isoString);
  return formatTime(`${date.getHours()}:${date.getMinutes()}`);
}

function TaskCard({ task, completion, status, onComplete, onPlayActivity, simplified = false }: TaskCardProps) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [checkmarkOpacity] = useState(new Animated.Value(0));

  const isCompleted = status === 'completed' || status === 'skipped';
  const isNow = status === 'now';
  const isOverdue = status === 'overdue';

  // Generate accessible labels
  const formattedTimeForA11y = formatTimeForScreenReader(task.time);
  const taskAccessibilityLabel = getTaskCardLabel(
    task.title,
    formattedTimeForA11y,
    status,
    task.hint_text || undefined
  );

  const handleComplete = async () => {
    if (isCompleted || isLoading) return;

    setIsLoading(true);

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate button press (skip when reduced motion enabled)
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: getSafeAnimationDuration(100, reduceMotion),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: getSafeAnimationDuration(100, reduceMotion),
        useNativeDriver: true,
      }),
    ]).start();

    // Fade in checkmark (instant when reduced motion enabled)
    Animated.timing(checkmarkOpacity, {
      toValue: 1,
      duration: getSafeAnimationDuration(300, reduceMotion),
      useNativeDriver: true,
    }).start();

    try {
      await onComplete(task.id);
      // Success haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Announce completion to screen readers
      if (Platform.OS !== 'web') {
        AccessibilityInfo.announceForAccessibility(
          getTaskCompletionAnnouncement(task.title)
        );
      }
    } catch (error) {
      if (__DEV__) console.error('Failed to complete task:', error);
      // Reset animation on error
      checkmarkOpacity.setValue(0);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Activity task detection
  const activityDef = task.activity_type ? getActivityByType(task.activity_type) : undefined;
  const isActivityTask = !!activityDef;
  const categoryIcon = isActivityTask ? activityDef.emoji : getCategoryIcon(task.category);
  const displayTitle = isActivityTask ? t(activityDef.titleKey) : task.title;

  const handlePlayPress = () => {
    if (isActivityTask && onPlayActivity && task.activity_type) {
      onPlayActivity(task.activity_type, task.id);
    }
  };

  return (
    <View
      style={[
        styles.card,
        isCompleted && styles.cardCompleted,
        isOverdue && styles.cardOverdue,
        isNow && styles.cardNow,
      ]}
      accessible={true}
      accessibilityLabel={taskAccessibilityLabel}
      accessibilityRole="none"
      accessibilityState={{
        disabled: isCompleted,
      }}
    >
      {/* NOW badge */}
      {isNow && (
        <View style={styles.nowBadge}>
          <Text style={styles.nowBadgeText}>{t('patientApp.todaysPlan.nowBadge')}</Text>
        </View>
      )}

      {/* Completed checkmark */}
      {isCompleted && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedBadgeText}>✅</Text>
        </View>
      )}

      {/* Time and category */}
      <View style={styles.header}>
        <Text style={[styles.time, isCompleted && styles.textMuted, simplified && styles.timeSimplified]}>
          🕐 {formatTime(task.time)}
        </Text>
      </View>

      {/* Title with category icon */}
      <View style={styles.titleRow}>
        <Text style={[styles.categoryIcon, simplified && styles.categoryIconSimplified]}>{categoryIcon}</Text>
        <Text style={[styles.title, isCompleted && styles.textMuted, simplified && styles.titleSimplified]}>{displayTitle}</Text>
      </View>

      {/* Medication items list (hidden when completed) */}
      {!isCompleted && task.category === 'medication' && task.medication_items && task.medication_items.length > 0 && (
        <View style={[styles.medList, simplified && styles.medListSimplified]}>
          {task.medication_items.map((med: MedicationItem, index: number) => (
            <View
              key={index}
              style={[
                styles.medItem,
                index < (task.medication_items?.length ?? 0) - 1 && styles.medItemBorder,
              ]}
            >
              {med.photo_url && (
                <Image
                  source={{ uri: med.photo_url }}
                  style={[styles.medPhoto, simplified && styles.medPhotoSimplified]}
                  accessibilityLabel={med.name}
                />
              )}
              <View style={styles.medInfo}>
                <Text style={[styles.medName, simplified && styles.medNameSimplified]}>{med.name}</Text>
                <Text style={[styles.medDosage, simplified && styles.medDosageSimplified]}>{med.dosage}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Task photo for non-medication tasks (hidden when completed) */}
      {!isCompleted && task.category !== 'medication' && task.photo_url && (
        <View style={styles.taskPhotoContainer}>
          <Image
            source={{ uri: task.photo_url }}
            style={[styles.taskPhoto, simplified && styles.taskPhotoSimplified]}
            accessibilityLabel={task.title}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Hint text (hidden in simplified mode and when completed) */}
      {!isCompleted && !simplified && task.hint_text && (
        <Text style={styles.hint}>"{task.hint_text}"</Text>
      )}

      {/* Completed time */}
      {isCompleted && completion?.completed_at && (
        <Text style={styles.completedTime}>
          {t('patientApp.todaysPlan.doneAt', { time: formatCompletedTime(completion.completed_at) })}
        </Text>
      )}

      {/* Action button (hidden when completed) */}
      {!isCompleted && isActivityTask && (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[styles.doneButton, styles.playButton, simplified && styles.doneButtonSimplified]}
            onPress={handlePlayPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${t('patientApp.todaysPlan.playActivity')} ${displayTitle}`}
          >
            <Text style={[styles.doneButtonText, simplified && styles.doneButtonTextSimplified]}>
              {t('patientApp.todaysPlan.playActivity')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      {!isCompleted && !isActivityTask && (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[styles.doneButton, simplified && styles.doneButtonSimplified, isLoading && styles.doneButtonLoading]}
            onPress={handleComplete}
            disabled={isLoading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${t('common.done')} ${displayTitle}`}
            accessibilityHint={t('a11y.doubleTapToComplete')}
            accessibilityState={{
              disabled: isLoading,
              busy: isLoading,
            }}
          >
            <Animated.Text style={[styles.doneButtonText, simplified && styles.doneButtonTextSimplified, { opacity: checkmarkOpacity }]}>
              ✓{' '}
            </Animated.Text>
            <Text style={[styles.doneButtonText, simplified && styles.doneButtonTextSimplified]}>{t('common.done')}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

export default memo(TaskCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS['2xl'],
    padding: 24,
    marginBottom: 20,
    ...SHADOWS.md,
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardCompleted: {
    backgroundColor: COLORS.completedBg,
    opacity: 0.85,
    borderColor: 'transparent',
  },
  cardOverdue: {
    backgroundColor: COLORS.amberBg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.amber,
    borderColor: COLORS.amber + '30',
  },
  cardNow: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.brand500,
    borderColor: COLORS.brand100,
    backgroundColor: COLORS.brand50,
  },
  nowBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    backgroundColor: COLORS.brand600,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: COLORS.brand600,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  nowBadgeText: {
    color: COLORS.textInverse,
    fontSize: 20,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  completedBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    backgroundColor: COLORS.successBg,
    borderRadius: 12,
    padding: 8,
  },
  completedBadgeText: {
    fontSize: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  time: {
    fontSize: 20,
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textPrimary,
    flex: 1,
    letterSpacing: 0.2,
  },
  hint: {
    fontSize: 20,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    lineHeight: 36,
    marginBottom: 24,
    fontStyle: 'italic',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
  },
  completedTime: {
    fontSize: 20,
    color: COLORS.success,
    marginTop: 10,
    fontFamily: FONTS.bodySemiBold,
  },
  doneButton: {
    backgroundColor: COLORS.brand600,
    borderRadius: 16,
    height: 64,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.brand600,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  playButton: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
  },
  doneButtonLoading: {
    opacity: 0.7,
  },
  doneButtonText: {
    fontSize: 20,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textInverse,
    letterSpacing: 0.3,
  },
  textMuted: {
    color: COLORS.textMuted,
  },
  // Simplified mode overrides
  timeSimplified: {
    fontSize: 24,
  },
  categoryIconSimplified: {
    fontSize: 36,
  },
  titleSimplified: {
    fontSize: 28,
  },
  doneButtonSimplified: {
    height: 76,
  },
  doneButtonTextSimplified: {
    fontSize: 24,
  },
  // Task photo (non-medication)
  taskPhotoContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  taskPhoto: {
    width: '100%',
    height: 160,
    borderRadius: 12,
  },
  taskPhotoSimplified: {
    height: 200,
  },
  // Medication items list
  medList: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  medListSimplified: {
    borderRadius: 16,
  },
  medItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  medItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  medPhoto: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
  },
  medPhotoSimplified: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 22,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  medNameSimplified: {
    fontSize: 24,
  },
  medDosage: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
  },
  medDosageSimplified: {
    fontSize: 22,
  },
});
