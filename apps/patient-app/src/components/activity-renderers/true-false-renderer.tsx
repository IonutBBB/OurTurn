import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { TrueOrFalseContent } from '../../data/bundled-activities';

type FeedbackState = 'none' | 'correct' | 'incorrect';

export default function TrueFalseRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as TrueOrFalseContent;

  const [roundIndex, setRoundIndex] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>('none');
  const [disabled, setDisabled] = useState(false);

  if (!data?.rounds?.length) return null;

  const totalRounds = data.rounds.length;
  const current = data.rounds[roundIndex];

  const handleAnswer = useCallback(async (answeredTrue: boolean) => {
    if (disabled) return;
    setDisabled(true);

    const isCorrect = answeredTrue === current.isTrue;

    if (isCorrect) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFeedback('correct');
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setFeedback('incorrect');
    }

    setTimeout(() => {
      if (roundIndex + 1 >= totalRounds) {
        onComplete({ activity: 'true_or_false', roundsCompleted: totalRounds });
      } else {
        setRoundIndex((prev) => prev + 1);
        setFeedback('none');
        setDisabled(false);
      }
    }, 2000);
  }, [disabled, current, roundIndex, totalRounds, onComplete]);

  const handleDone = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'true_or_false', roundsCompleted: roundIndex + 1 });
  }, [onComplete, roundIndex]);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>✅</Text>

      <Text style={styles.progress}>
        {t('patientApp.stim.common.round', { current: roundIndex + 1, total: totalRounds })}
      </Text>

      <Text style={styles.instruction}>
        {t('patientApp.stim.trueOrFalse.instruction')}
      </Text>

      <View style={styles.statementCard}>
        <Text style={styles.statementText}>{current.statement}</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.answerButton, styles.trueButton]}
          onPress={() => handleAnswer(true)}
          activeOpacity={0.8}
          disabled={disabled}
        >
          <Text style={styles.answerEmoji}>✅</Text>
          <Text style={styles.answerText}>{t('patientApp.stim.trueOrFalse.true')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.answerButton, styles.falseButton]}
          onPress={() => handleAnswer(false)}
          activeOpacity={0.8}
          disabled={disabled}
        >
          <Text style={styles.answerEmoji}>❌</Text>
          <Text style={styles.answerText}>{t('patientApp.stim.trueOrFalse.false')}</Text>
        </TouchableOpacity>
      </View>

      {feedback === 'correct' && (
        <View style={styles.feedbackCardCorrect}>
          <Text style={styles.feedbackTextCorrect}>
            {t('patientApp.stim.common.correct')}
          </Text>
          <Text style={styles.explanationText}>{current.explanation}</Text>
        </View>
      )}

      {feedback === 'incorrect' && (
        <View style={styles.feedbackCardTryAgain}>
          <Text style={styles.feedbackTextTryAgain}>
            {t('patientApp.stim.trueOrFalse.notQuite', {
              answer: current.isTrue
                ? t('patientApp.stim.trueOrFalse.true')
                : t('patientApp.stim.trueOrFalse.false'),
            })}
          </Text>
          <Text style={styles.explanationText}>{current.explanation}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.8}>
        <Text style={styles.doneButtonText}>
          {t('patientApp.stim.common.imDone')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.7}>
        <Text style={styles.skipText}>{t('common.skip')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 16 },
  emoji: { fontSize: 48, marginBottom: 12 },
  progress: {
    fontSize: 20, fontFamily: FONTS.bodyMedium, color: COLORS.textMuted,
    textAlign: 'center', marginBottom: 4,
  },
  instruction: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 30, marginBottom: 20, paddingHorizontal: 8,
  },
  statementCard: {
    backgroundColor: COLORS.amberBg, borderRadius: RADIUS['2xl'],
    paddingVertical: 24, paddingHorizontal: 24, borderWidth: 2,
    borderColor: COLORS.amber, marginBottom: 24, width: '100%', alignItems: 'center',
  },
  statementText: {
    fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary,
    textAlign: 'center', lineHeight: 34,
  },
  buttonRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 16,
    marginBottom: 20, width: '100%',
  },
  answerButton: {
    flex: 1, paddingVertical: 20, borderRadius: RADIUS.lg, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  trueButton: { backgroundColor: COLORS.successBg, borderColor: COLORS.success },
  falseButton: { backgroundColor: COLORS.dangerBg, borderColor: COLORS.danger },
  answerEmoji: { fontSize: 32, marginBottom: 4 },
  answerText: { fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary },
  feedbackCardCorrect: {
    backgroundColor: COLORS.successBg, borderRadius: RADIUS['2xl'],
    paddingVertical: 16, paddingHorizontal: 24, borderWidth: 2,
    borderColor: COLORS.success, marginBottom: 20, width: '100%',
  },
  feedbackTextCorrect: {
    fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.success,
    textAlign: 'center', marginBottom: 8,
  },
  feedbackCardTryAgain: {
    backgroundColor: COLORS.amberBg, borderRadius: RADIUS['2xl'],
    paddingVertical: 16, paddingHorizontal: 24, borderWidth: 2,
    borderColor: COLORS.amber, marginBottom: 20, width: '100%',
  },
  feedbackTextTryAgain: {
    fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.amber,
    textAlign: 'center', marginBottom: 8,
  },
  explanationText: {
    fontSize: 20, fontFamily: FONTS.body, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 28,
  },
  doneButton: {
    backgroundColor: COLORS.success, paddingVertical: 18,
    paddingHorizontal: 48, borderRadius: RADIUS.lg,
  },
  doneButtonText: {
    fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse,
  },
  skipButton: { marginTop: 24, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
