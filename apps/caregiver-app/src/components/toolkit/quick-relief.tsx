import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ReliefExercise, SliderValue } from '@ourturn/shared';
import { getRecommendedExercises } from '@ourturn/shared';
import { ExercisePlayer } from './exercise-player';
import { createThemedStyles, FONTS, RADIUS, SHADOWS } from '../../theme';

interface QuickReliefProps {
  stress: SliderValue | null;
  energy: SliderValue | null;
  sleep: SliderValue | null;
  onExerciseComplete: (exerciseId: string) => void;
}

export function QuickRelief({ stress, energy, sleep, onExerciseComplete }: QuickReliefProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const [activeExercise, setActiveExercise] = useState<ReliefExercise | null>(null);

  const exercises = getRecommendedExercises(stress, energy, sleep);

  const isRecommended = (exercise: ReliefExercise): boolean => {
    const isHighStress = stress !== null && stress >= 4;
    const isLowEnergy = energy !== null && energy <= 2;
    const isPoorSleep = sleep !== null && sleep <= 2;
    return (
      (isHighStress && exercise.recommended_for.high_stress) ||
      (isLowEnergy && exercise.recommended_for.low_energy) ||
      (isPoorSleep && exercise.recommended_for.poor_sleep)
    );
  };

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.title}>{t('caregiverApp.toolkit.relief.title')}</Text>
        <View style={styles.grid}>
          {exercises.map((exercise) => {
            const recommended = isRecommended(exercise);
            return (
              <TouchableOpacity
                key={exercise.id}
                style={[styles.exerciseCard, recommended && styles.exerciseCardRecommended]}
                onPress={() => setActiveExercise(exercise)}
                activeOpacity={0.7}
              >
                {recommended && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{t('caregiverApp.toolkit.relief.recommended')}</Text>
                  </View>
                )}
                <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
                <Text style={styles.exerciseName}>{t(`caregiverApp.toolkit.relief.exercises.${exercise.id}.name`)}</Text>
                <Text style={styles.exerciseDuration}>
                  {t('caregiverApp.toolkit.relief.duration', { min: exercise.duration_minutes })}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {activeExercise && (
        <ExercisePlayer
          exercise={activeExercise}
          onComplete={(id) => {
            onExerciseComplete(id);
            setActiveExercise(null);
          }}
          onClose={() => setActiveExercise(null)}
        />
      )}
    </>
  );
}

const useStyles = createThemedStyles((colors) => ({
  card: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...SHADOWS.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  exerciseCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  exerciseCardRecommended: {
    borderColor: colors.brand300,
    backgroundColor: colors.brand50,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -4,
    backgroundColor: colors.brand600,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: FONTS.bodyBold,
  },
  exerciseIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  exerciseDuration: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: FONTS.body,
    marginTop: 4,
  },
}));
