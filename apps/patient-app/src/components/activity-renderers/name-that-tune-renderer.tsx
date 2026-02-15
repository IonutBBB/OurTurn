import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { NameThatTuneContent } from '../../data/bundled-activities';

type FeedbackState = 'none' | 'correct' | 'incorrect';

export default function NameThatTuneRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as NameThatTuneContent;

  const [roundIndex, setRoundIndex] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>('none');
  const [disabled, setDisabled] = useState(false);

  if (!data?.rounds?.length) return null;

  const totalRounds = data.rounds.length;
  const current = data.rounds[roundIndex];

  const handleAnswer = useCallback(async (answerIndex: number) => {
    if (disabled) return;
    setDisabled(true);

    const isCorrect = answerIndex === current.correctIndex;

    if (isCorrect) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFeedback('correct');
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setFeedback('incorrect');
    }

    setTimeout(() => {
      if (roundIndex + 1 >= totalRounds) {
        onComplete({ activity: 'name_that_tune', roundsCompleted: totalRounds });
      } else {
        setRoundIndex((prev) => prev + 1);
        setFeedback('none');
        setDisabled(false);
      }
    }, 3000);
  }, [disabled, current, roundIndex, totalRounds, onComplete]);

  const handleDone = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'name_that_tune', roundsCompleted: roundIndex + 1 });
  }, [onComplete, roundIndex]);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{'\uD83C\uDFB5'}</Text>

      <Text style={styles.progress}>
        {t('patientApp.stim.common.round', { current: roundIndex + 1, total: totalRounds })}
      </Text>

      <Text style={styles.instruction}>
        {t('patientApp.stim.nameThatTune.instruction')}
      </Text>

      <View style={styles.lyricCard}>
        <Text style={styles.lyricText}>{current.lyricSnippet}</Text>
        <Text style={styles.melodicHint}>{current.melodicHint}</Text>
      </View>

      {feedback === 'none' && (
        <View style={styles.optionsContainer}>
          {current.options.map((option, i) => (
            <TouchableOpacity
              key={i}
              style={styles.optionButton}
              onPress={() => handleAnswer(i)}
              activeOpacity={0.8}
              disabled={disabled}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {feedback === 'correct' && (
        <View style={styles.feedbackCardCorrect}>
          <Text style={styles.feedbackTextCorrect}>
            {t('patientApp.stim.common.correct')}
          </Text>
          <Text style={styles.funFactText}>{current.funFact}</Text>
        </View>
      )}

      {feedback === 'incorrect' && (
        <View style={styles.feedbackCardTryAgain}>
          <Text style={styles.feedbackTextTryAgain}>
            {t('patientApp.stim.nameThatTune.notQuite', {
              answer: current.options[current.correctIndex],
            })}
          </Text>
          <Text style={styles.funFactText}>{current.funFact}</Text>
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
  emoji: { fontSize: 48, marginBottom: 8 },
  progress: {
    fontSize: 20, fontFamily: FONTS.bodyMedium, color: COLORS.textMuted,
    textAlign: 'center', marginBottom: 4,
  },
  instruction: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 30, marginBottom: 20, paddingHorizontal: 8,
  },
  lyricCard: {
    backgroundColor: COLORS.socialBg, borderRadius: RADIUS['2xl'],
    paddingVertical: 24, paddingHorizontal: 24, borderWidth: 2,
    borderColor: COLORS.social, marginBottom: 24, width: '100%', alignItems: 'center',
  },
  lyricText: {
    fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary,
    textAlign: 'center', lineHeight: 34, marginBottom: 12,
    fontStyle: 'italic',
  },
  melodicHint: {
    fontSize: 22, fontFamily: FONTS.body, color: COLORS.textMuted,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%', gap: 12, marginBottom: 20,
  },
  optionButton: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 2, borderColor: COLORS.border, paddingVertical: 16,
    paddingHorizontal: 20, alignItems: 'center',
  },
  optionText: {
    fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary,
  },
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
  funFactText: {
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
