import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { getCategoryIcon } from '@memoguard/shared';
import type { CarePlanTask, TaskCompletion } from '@memoguard/shared';

// Design system colors
const COLORS = {
  background: '#FAFAF8',
  card: '#FFFFFF',
  border: '#E7E5E4',
  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  textMuted: '#A8A29E',
  brand600: '#0D9488',
  brand700: '#0F766E',
  success: '#16A34A',
  amber: '#D97706',
  amberBg: '#FFFBEB',
  completedBg: '#F5F5F4',
};

export type TaskStatus = 'upcoming' | 'now' | 'overdue' | 'completed' | 'skipped';

interface TaskCardProps {
  task: CarePlanTask;
  completion?: TaskCompletion;
  status: TaskStatus;
  onComplete: (taskId: string) => Promise<void>;
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

export default function TaskCard({ task, completion, status, onComplete }: TaskCardProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [checkmarkOpacity] = useState(new Animated.Value(0));

  const isCompleted = status === 'completed' || status === 'skipped';
  const isNow = status === 'now';
  const isOverdue = status === 'overdue';

  const handleComplete = async () => {
    if (isCompleted || isLoading) return;

    setIsLoading(true);

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade in checkmark
    Animated.timing(checkmarkOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    try {
      await onComplete(task.id);
      // Success haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to complete task:', error);
      // Reset animation on error
      checkmarkOpacity.setValue(0);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const categoryIcon = getCategoryIcon(task.category);

  return (
    <View
      style={[
        styles.card,
        isCompleted && styles.cardCompleted,
        isOverdue && styles.cardOverdue,
        isNow && styles.cardNow,
      ]}
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
        <Text style={[styles.time, isCompleted && styles.textMuted]}>
          🕐 {formatTime(task.time)}
        </Text>
      </View>

      {/* Title with category icon */}
      <View style={styles.titleRow}>
        <Text style={styles.categoryIcon}>{categoryIcon}</Text>
        <Text style={[styles.title, isCompleted && styles.textMuted]}>{task.title}</Text>
      </View>

      {/* Hint text (hidden when completed) */}
      {!isCompleted && task.hint_text && (
        <Text style={styles.hint}>"{task.hint_text}"</Text>
      )}

      {/* Completed time */}
      {isCompleted && completion?.completed_at && (
        <Text style={styles.completedTime}>
          {t('patientApp.todaysPlan.doneAt', { time: formatCompletedTime(completion.completed_at) })}
        </Text>
      )}

      {/* Done button (hidden when completed) */}
      {!isCompleted && (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[styles.doneButton, isLoading && styles.doneButtonLoading]}
            onPress={handleComplete}
            disabled={isLoading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('common.done')}
          >
            <Animated.Text style={[styles.doneButtonText, { opacity: checkmarkOpacity }]}>
              ✓{' '}
            </Animated.Text>
            <Text style={styles.doneButtonText}>{t('common.done')}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
  },
  cardCompleted: {
    backgroundColor: COLORS.completedBg,
    opacity: 0.8,
  },
  cardOverdue: {
    backgroundColor: COLORS.amberBg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.amber,
  },
  cardNow: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.brand600,
  },
  nowBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: COLORS.brand600,
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  nowBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  completedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  completedBadgeText: {
    fontSize: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  time: {
    fontSize: 18,
    color: COLORS.textMuted,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  hint: {
    fontSize: 20,
    color: COLORS.textSecondary,
    lineHeight: 28,
    marginBottom: 20,
  },
  completedTime: {
    fontSize: 18,
    color: COLORS.success,
    marginTop: 8,
  },
  doneButton: {
    backgroundColor: COLORS.brand600,
    borderRadius: 12,
    height: 64,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonLoading: {
    opacity: 0.7,
  },
  doneButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  textMuted: {
    color: COLORS.textMuted,
  },
});
