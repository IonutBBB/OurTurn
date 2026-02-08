import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, AppState } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import type { ReliefExercise } from '@ourturn/shared';
import { createThemedStyles, FONTS, RADIUS } from '../../theme';

interface ExercisePlayerProps {
  exercise: ReliefExercise;
  onComplete: (exerciseId: string) => void;
  onClose: () => void;
}

export function ExercisePlayer({ exercise, onComplete, onClose }: ExercisePlayerProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(exercise.steps[0].duration_seconds);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const advanceStep = useCallback(() => {
    if (currentStep < exercise.steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setTimeLeft(exercise.steps[nextStep].duration_seconds);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      setIsComplete(true);
      clearTimer();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete(exercise.id);
    }
  }, [currentStep, exercise, clearTimer, onComplete]);

  useEffect(() => {
    if (isPaused || isComplete) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          advanceStep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isPaused, isComplete, currentStep, advanceStep, clearTimer]);

  // Pause when app goes to background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') setIsPaused(true);
    });
    return () => sub.remove();
  }, []);

  const step = exercise.steps[currentStep];
  const progress = step ? (step.duration_seconds - timeLeft) / step.duration_seconds : 1;

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.exerciseName}>{exercise.icon} {t(`caregiverApp.toolkit.relief.exercises.${exercise.id}.name`)}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {isComplete ? (
          <View style={styles.completeContainer}>
            <Text style={styles.completeEmoji}>✨</Text>
            <Text style={styles.completeText}>
              {t('caregiverApp.toolkit.relief.complete')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.doneButton}>
              <Text style={styles.doneButtonText}>{t('caregiverApp.toolkit.relief.close')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.playerContent}>
            {/* Step indicator */}
            <Text style={styles.stepIndicator}>
              {t('caregiverApp.toolkit.relief.stepOf', {
                current: currentStep + 1,
                total: exercise.steps.length,
              })}
            </Text>

            {/* Timer circle */}
            <View style={styles.timerContainer}>
              <View style={styles.timerCircle}>
                <Text style={styles.timerText}>{timeLeft}</Text>
              </View>
              {/* Progress ring */}
              <View style={[styles.progressRing, { opacity: progress }]} />
            </View>

            {/* Instruction */}
            <Text style={styles.instruction}>{t(`caregiverApp.toolkit.relief.exercises.${exercise.id}.step${currentStep}`)}</Text>

            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity
                onPress={() => setIsPaused(!isPaused)}
                style={styles.pauseButton}
                activeOpacity={0.7}
              >
                <Text style={styles.pauseButtonText}>
                  {isPaused
                    ? t('caregiverApp.toolkit.relief.resume')
                    : t('caregiverApp.toolkit.relief.pause')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.cancelText}>{t('caregiverApp.toolkit.relief.close')}</Text>
              </TouchableOpacity>
            </View>

            {/* Step dots */}
            <View style={styles.stepDots}>
              {exercise.steps.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.stepDot,
                    i < currentStep && styles.stepDotCompleted,
                    i === currentStep && styles.stepDotCurrent,
                  ]}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const useStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 18,
    color: colors.textMuted,
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  completeEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  completeText: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textPrimary,
    marginBottom: 24,
  },
  doneButton: {
    backgroundColor: colors.brand600,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
  },
  playerContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  stepIndicator: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: FONTS.body,
    marginBottom: 24,
  },
  timerContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  timerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    borderColor: colors.brand200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  timerText: {
    fontSize: 40,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: colors.brand600,
  },
  progressRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    borderColor: colors.brand500,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  instruction: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 16,
    minHeight: 84,
    marginBottom: 32,
  },
  controls: {
    alignItems: 'center',
    gap: 16,
  },
  pauseButton: {
    backgroundColor: colors.brand100,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: colors.brand200,
  },
  pauseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.brand700,
  },
  cancelText: {
    fontSize: 14,
    color: colors.textMuted,
    textDecorationLine: 'underline',
    fontFamily: FONTS.body,
  },
  stepDots: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 40,
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stepDot: {
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  stepDotCompleted: {
    backgroundColor: colors.brand500,
  },
  stepDotCurrent: {
    backgroundColor: colors.brand300,
    width: 16,
  },
}));
