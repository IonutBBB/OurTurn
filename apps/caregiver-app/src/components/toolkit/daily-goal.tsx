import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { supabase } from '@ourturn/supabase';
import type { CaregiverWellbeingLog } from '@ourturn/shared';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../theme';

interface DailyGoalProps {
  caregiverId: string;
  initialLog: CaregiverWellbeingLog | null;
  recentLogs: CaregiverWellbeingLog[];
}

export function DailyGoal({ caregiverId, initialLog, recentLogs }: DailyGoalProps) {
  const { t } = useTranslation();
  const today = new Date().toISOString().split('T')[0];

  const [goal, setGoal] = useState(initialLog?.daily_goal || '');
  const [goalCompleted, setGoalCompleted] = useState(initialLog?.goal_completed || false);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const log = recentLogs.find((l) => l.date === dateStr);
    return {
      date: dateStr,
      day: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      hasGoal: !!log?.daily_goal,
      completed: !!log?.goal_completed,
    };
  });

  const save = useCallback(async (newGoal: string, completed: boolean) => {
    try {
      await supabase
        .from('caregiver_wellbeing_logs')
        .upsert(
          {
            caregiver_id: caregiverId,
            date: today,
            daily_goal: newGoal || null,
            goal_completed: completed,
          },
          { onConflict: 'caregiver_id,date' }
        );
    } catch {
      // Silent fail
    }
  }, [caregiverId, today]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (goal !== (initialLog?.daily_goal || '')) {
        save(goal, goalCompleted);
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [goal, goalCompleted, save, initialLog?.daily_goal]);

  const toggleComplete = async () => {
    const newCompleted = !goalCompleted;
    setGoalCompleted(newCompleted);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    save(goal, newCompleted);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('caregiverApp.toolkit.goal.title')}</Text>

      <View style={styles.inputRow}>
        <TextInput
          value={goal}
          onChangeText={setGoal}
          placeholder={t('caregiverApp.toolkit.goal.placeholder')}
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
        />
        {goal.length > 0 && (
          <TouchableOpacity
            onPress={toggleComplete}
            style={[styles.doneButton, goalCompleted && styles.doneButtonComplete]}
            activeOpacity={0.7}
          >
            <Text style={[styles.doneText, goalCompleted && styles.doneTextComplete]}>
              {goalCompleted ? '✓' : t('caregiverApp.toolkit.goal.done')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Weekly dots */}
      <View style={styles.weekSection}>
        <Text style={styles.weekLabel}>{t('caregiverApp.toolkit.goal.weekLabel')}</Text>
        <View style={styles.dotsRow}>
          {last7Days.map((day) => (
            <View key={day.date} style={styles.dayColumn}>
              <View
                style={[
                  styles.dayDot,
                  day.completed && styles.dayDotCompleted,
                  day.hasGoal && !day.completed && styles.dayDotHasGoal,
                ]}
              />
              <Text style={styles.dayLabel}>{day.day}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.brand200,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
  },
  doneButtonComplete: {
    backgroundColor: COLORS.success,
  },
  doneText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textMuted,
  },
  doneTextComplete: {
    color: 'white',
  },
  weekSection: {
    marginTop: 4,
  },
  weekLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    marginBottom: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 4,
  },
  dayDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.border,
  },
  dayDotCompleted: {
    backgroundColor: COLORS.success,
  },
  dayDotHasGoal: {
    backgroundColor: COLORS.amber + '66',
  },
  dayLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
  },
});
