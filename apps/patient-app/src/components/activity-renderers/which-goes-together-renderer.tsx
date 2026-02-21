import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { WhichGoesTogetherContent } from '../../data/bundled-activities';
import { useGameLabel } from '../../utils/game-translate';

type FeedbackState = 'none' | 'correct' | 'incorrect';

export default function WhichGoesTogetherRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const gl = useGameLabel();
  const data = content as WhichGoesTogetherContent;

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
        onComplete({ activity: 'which_goes_together', roundsCompleted: totalRounds });
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
    onComplete({ activity: 'which_goes_together', roundsCompleted: roundIndex + 1 });
  }, [onComplete, roundIndex]);

  const getOptionStyle = (index: number) => {
    if (selectedIndex === null) return { backgroundColor: COLORS.card, borderColor: COLORS.border };
    if (index === current.correctIndex) return { backgroundColor: COLORS.successBg, borderColor: COLORS.success };
    if (index === selectedIndex) return { backgroundColor: COLORS.amberBg, borderColor: COLORS.amber };
    return { backgroundColor: COLORS.card, borderColor: COLORS.border };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🤝</Text>

      <Text style={styles.progress}>
        {t('patientApp.stim.common.round', { current: roundIndex + 1, total: totalRounds })}
      </Text>

      <Text style={styles.instruction}>
        {t('patientApp.stim.whichGoesTogether.instruction')}
      </Text>

      <View style={styles.targetCard}>
        <Text style={styles.targetEmoji}>{current.target.emoji}</Text>
        <Text style={styles.targetLabel}>{gl(current.target.label)}</Text>
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
            <Text style={styles.optionEmoji}>{option.emoji}</Text>
            <Text style={styles.optionText}>{gl(option.label)}</Text>
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
            {t('patientApp.stim.whichGoesTogether.notQuite', { answer: gl(current.options[current.correctIndex].label) })}
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
  targetCard: {
    backgroundColor: COLORS.successBg, borderRadius: RADIUS['2xl'],
    paddingVertical: 20, paddingHorizontal: 24, borderWidth: 2,
    borderColor: COLORS.success, marginBottom: 24, width: '100%', alignItems: 'center',
  },
  targetEmoji: { fontSize: 56, marginBottom: 8 },
  targetLabel: {
    fontSize: 24, fontFamily: FONTS.display, color: COLORS.success, textAlign: 'center',
  },
  optionsList: { width: '100%', gap: 12, marginBottom: 16 },
  optionButton: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 16,
    paddingHorizontal: 20, borderRadius: RADIUS.lg, borderWidth: 2, gap: 12,
  },
  optionEmoji: { fontSize: 36 },
  optionText: {
    fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary, flex: 1,
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
