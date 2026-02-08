import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  AppState,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { createThemedStyles, useColors, FONTS, RADIUS } from '../../theme';

const DE_ESCALATION_STEPS = [
  { key: 'stayCalm', icon: '🧘' },
  { key: 'validateFeelings', icon: '💙' },
  { key: 'simplifyEnvironment', icon: '🔇' },
  { key: 'redirectAttention', icon: '🎵' },
  { key: 'useGentleTouch', icon: '🤝' },
  { key: 'giveSpace', icon: '🕐' },
];

const BREATHING_DURATION = 30;
const STEP_DURATION = 60;

type Phase = 'breathing' | 'steps' | 'completion';

interface DeEscalationWizardProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (notes: string) => void;
}

export function DeEscalationWizard({
  visible,
  onClose,
  onComplete,
}: DeEscalationWizardProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const colors = useColors();
  const [phase, setPhase] = useState<Phase>('breathing');
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BREATHING_DURATION);
  const [notes, setNotes] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset state when opening
  useEffect(() => {
    if (visible) {
      setPhase('breathing');
      setCurrentStep(0);
      setTimeLeft(BREATHING_DURATION);
      setNotes('');
    } else {
      clearTimer();
    }
  }, [visible, clearTimer]);

  // Timer tick
  useEffect(() => {
    if (!visible || phase === 'completion') return;

    const duration = phase === 'breathing' ? BREATHING_DURATION : STEP_DURATION;
    setTimeLeft(duration);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (phase === 'breathing') {
            setPhase('steps');
            setCurrentStep(0);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } else {
            if (currentStep < DE_ESCALATION_STEPS.length - 1) {
              setCurrentStep((s) => s + 1);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } else {
              setPhase('completion');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [visible, phase, currentStep, clearTimer]);

  // Pause on background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') clearTimer();
    });
    return () => sub.remove();
  }, [clearTimer]);

  const handleSkipBreathing = () => {
    clearTimer();
    setPhase('steps');
    setCurrentStep(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleThisHelped = () => {
    clearTimer();
    setPhase('completion');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleTryNext = () => {
    clearTimer();
    if (currentStep < DE_ESCALATION_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      setPhase('completion');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSaveAndClose = () => {
    onComplete(notes);
  };

  const handleCloseWithoutSaving = () => {
    onComplete('');
  };

  const totalDuration = phase === 'breathing' ? BREATHING_DURATION : STEP_DURATION;
  const progress = (totalDuration - timeLeft) / totalDuration;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Breathing Phase */}
        {phase === 'breathing' && (
          <View style={styles.centeredContent}>
            <Text style={styles.phaseTitle}>
              {t('caregiverApp.crisis.wizard.breathingTitle')}
            </Text>
            <Text style={styles.phaseInstruction}>
              {t('caregiverApp.crisis.wizard.breathingInstruction')}
            </Text>

            <View style={styles.timerContainer}>
              <View
                style={[
                  styles.timerCircle,
                  { borderColor: colors.brand200 },
                ]}
              >
                <Text style={styles.timerText}>{timeLeft}</Text>
              </View>
              <View
                style={[
                  styles.progressRing,
                  { opacity: progress, borderColor: colors.brand500 },
                ]}
              />
            </View>

            <TouchableOpacity onPress={handleSkipBreathing}>
              <Text style={styles.skipText}>
                {t('caregiverApp.crisis.wizard.skip')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Steps Phase */}
        {phase === 'steps' && (
          <View style={styles.centeredContent}>
            <Text style={styles.stepIndicator}>
              {t('caregiverApp.crisis.wizard.stepOf', {
                current: currentStep + 1,
                total: DE_ESCALATION_STEPS.length,
              })}
            </Text>

            <View style={styles.timerContainer}>
              <View
                style={[
                  styles.timerCircleSmall,
                  { borderColor: colors.brand200 },
                ]}
              >
                <Text style={styles.timerTextSmall}>{timeLeft}</Text>
              </View>
              <View
                style={[
                  styles.progressRingSmall,
                  { opacity: progress, borderColor: colors.brand500 },
                ]}
              />
            </View>

            <Text style={styles.stepEmoji}>
              {DE_ESCALATION_STEPS[currentStep].icon}
            </Text>
            <Text style={styles.stepTitle}>
              {t(
                `caregiverApp.crisis.steps.${DE_ESCALATION_STEPS[currentStep].key}.title`
              )}
            </Text>
            <Text style={styles.stepDetail}>
              {t(
                `caregiverApp.crisis.steps.${DE_ESCALATION_STEPS[currentStep].key}.detail`
              )}
            </Text>

            {/* Script phrase */}
            <View style={styles.scriptCard}>
              <Text style={styles.scriptText}>
                &ldquo;
                {t(
                  `caregiverApp.crisis.steps.${DE_ESCALATION_STEPS[currentStep].key}.script`
                )}
                &rdquo;
              </Text>
            </View>

            {/* Action buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleThisHelped}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryButtonText}>
                  {t('caregiverApp.crisis.wizard.thisHelped')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleTryNext}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>
                  {t('caregiverApp.crisis.wizard.tryNext')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Step dots */}
            <View style={styles.stepDots}>
              {DE_ESCALATION_STEPS.map((_, i) => (
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

        {/* Completion Phase */}
        {phase === 'completion' && (
          <View style={styles.centeredContent}>
            <Text style={styles.completionEmoji}>✨</Text>
            <Text style={styles.phaseTitle}>
              {t('caregiverApp.crisis.wizard.completionTitle')}
            </Text>
            <Text style={styles.phaseInstruction}>
              {t('caregiverApp.crisis.wizard.completionDesc')}
            </Text>

            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('caregiverApp.crisis.wizard.crisisNotesPlaceholder')}
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSaveAndClose}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryButtonText}>
                  {t('caregiverApp.crisis.wizard.saveAndClose')}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleCloseWithoutSaving}>
              <Text style={styles.skipText}>
                {t('caregiverApp.crisis.wizard.closeWithoutSaving')}
              </Text>
            </TouchableOpacity>
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
    marginBottom: 20,
  },
  headerSpacer: {
    width: 40,
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
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  phaseTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  phaseInstruction: {
    fontSize: 15,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  timerContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  timerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
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
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  timerCircleSmall: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  timerTextSmall: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: colors.brand600,
  },
  progressRingSmall: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  stepIndicator: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    marginBottom: 16,
  },
  stepEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDetail: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  scriptCard: {
    backgroundColor: colors.brand50,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  scriptText: {
    fontSize: 14,
    fontStyle: 'italic',
    fontFamily: FONTS.body,
    color: colors.brand700,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: colors.brand600,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
  },
  secondaryButton: {
    backgroundColor: colors.brand100,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: colors.brand200,
  },
  secondaryButtonText: {
    color: colors.brand700,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
  },
  skipText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    textDecorationLine: 'underline',
    marginTop: 8,
  },
  stepDots: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 24,
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
  completionEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  notesInput: {
    width: '100%',
    height: 120,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: RADIUS.lg,
    padding: 14,
    fontSize: 15,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
    marginBottom: 20,
  },
}));
