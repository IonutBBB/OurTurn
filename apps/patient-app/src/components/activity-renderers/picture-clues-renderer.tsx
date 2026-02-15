import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { PictureCluesContent } from '../../data/bundled-activities';

type FeedbackState = 'none' | 'correct' | 'incorrect';

export default function PictureCluesRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as PictureCluesContent;

  const [roundIndex, setRoundIndex] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>('none');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [disabled, setDisabled] = useState(false);

  if (!data?.rounds?.length) return null;

  const totalRounds = data.rounds.length;
  const current = data.rounds[roundIndex];

  const handleSelect = useCallback(async (index: number) => {
    if (disabled) return;
    setDisabled(true);
    setSelectedIndex(index);

    const isCorrect = index === current.correctIndex;

    if (isCorrect) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFeedback('correct');
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setFeedback('incorrect');
    }

    setTimeout(() => {
      if (roundIndex + 1 >= totalRounds) {
        onComplete({ activity: 'picture_clues', roundsCompleted: totalRounds });
      } else {
        setRoundIndex((prev) => prev + 1);
        setFeedback('none');
        setSelectedIndex(null);
        setDisabled(false);
      }
    }, 1500);
  }, [disabled, current, roundIndex, totalRounds, onComplete]);

  const handleDone = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'picture_clues', roundsCompleted: roundIndex + 1 });
  }, [onComplete, roundIndex]);

  const getOptionStyle = (index: number) => {
    if (selectedIndex === null) return { backgroundColor: COLORS.card, borderColor: COLORS.border };
    if (index === current.correctIndex) return { backgroundColor: COLORS.successBg, borderColor: COLORS.success };
    if (index === selectedIndex) return { backgroundColor: COLORS.amberBg, borderColor: COLORS.amber };
    return { backgroundColor: COLORS.card, borderColor: COLORS.border };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🖼️</Text>

      <Text style={styles.progress}>
        {t('patientApp.stim.common.round', { current: roundIndex + 1, total: totalRounds })}
      </Text>

      <Text style={styles.instruction}>
        {t('patientApp.stim.pictureClues.instruction')}
      </Text>

      <View style={styles.cluesCard}>
        <Text style={styles.cluesText}>{current.clues.join('  ')}</Text>
      </View>

      <View style={styles.optionsList}>
        {current.options.map((option, index) => (
          <TouchableOpacity
            key={`${roundIndex}-${index}`}
            style={[styles.optionButton, getOptionStyle(index)]}
            onPress={() => handleSelect(index)}
            activeOpacity={0.8}
            disabled={disabled}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {feedback === 'correct' && (
        <View style={styles.feedbackCardCorrect}>
          <Text style={styles.feedbackTextCorrect}>{t('patientApp.stim.common.correct')}</Text>
        </View>
      )}

      {feedback === 'incorrect' && (
        <View style={styles.feedbackCardTryAgain}>
          <Text style={styles.feedbackTextTryAgain}>
            {t('patientApp.stim.pictureClues.notQuite', { answer: current.options[current.correctIndex] })}
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.8}>
        <Text style={styles.doneButtonText}>{t('patientApp.stim.common.imDone')}</Text>
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
  cluesCard: {
    backgroundColor: COLORS.amberBg, borderRadius: RADIUS['2xl'],
    paddingVertical: 28, paddingHorizontal: 24, borderWidth: 2,
    borderColor: COLORS.amber, marginBottom: 24, width: '100%', alignItems: 'center',
  },
  cluesText: { fontSize: 48, textAlign: 'center' },
  optionsList: { width: '100%', gap: 12, marginBottom: 16 },
  optionButton: {
    paddingVertical: 18, paddingHorizontal: 24, borderRadius: RADIUS.lg,
    borderWidth: 2, alignItems: 'center',
  },
  optionText: {
    fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary, textAlign: 'center',
  },
  feedbackCardCorrect: {
    backgroundColor: COLORS.successBg, borderRadius: RADIUS['2xl'],
    paddingVertical: 16, paddingHorizontal: 24, borderWidth: 2,
    borderColor: COLORS.success, marginBottom: 20, width: '100%',
  },
  feedbackTextCorrect: {
    fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.success, textAlign: 'center',
  },
  feedbackCardTryAgain: {
    backgroundColor: COLORS.amberBg, borderRadius: RADIUS['2xl'],
    paddingVertical: 16, paddingHorizontal: 24, borderWidth: 2,
    borderColor: COLORS.amber, marginBottom: 20, width: '100%',
  },
  feedbackTextTryAgain: {
    fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.amber, textAlign: 'center',
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
