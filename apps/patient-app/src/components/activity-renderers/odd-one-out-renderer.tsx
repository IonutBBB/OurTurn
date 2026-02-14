import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { OddOneOutContent } from '../../data/bundled-activities';

type ItemState = 'default' | 'correct' | 'encourage';

export default function OddOneOutRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as OddOneOutContent;

  const [roundIndex, setRoundIndex] = useState(0);
  const [itemStates, setItemStates] = useState<ItemState[]>(['default', 'default', 'default', 'default']);
  const [feedback, setFeedback] = useState<'correct' | 'tryAgain' | null>(null);
  const [advancing, setAdvancing] = useState(false);

  if (!data?.rounds?.length) return null;

  const totalRounds = data.rounds.length;
  const currentRound = data.rounds[roundIndex];

  const handleItemPress = useCallback(async (index: number) => {
    if (advancing || feedback === 'correct') return;

    const isCorrect = index === currentRound.oddIndex;

    if (isCorrect) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const newStates: ItemState[] = ['default', 'default', 'default', 'default'];
      newStates[index] = 'correct';
      setItemStates(newStates);
      setFeedback('correct');
      setAdvancing(true);

      setTimeout(() => {
        const nextRound = roundIndex + 1;
        if (nextRound >= totalRounds) {
          onComplete({ activity: 'odd_one_out', roundsCompleted: totalRounds });
        } else {
          setRoundIndex(nextRound);
          setItemStates(['default', 'default', 'default', 'default']);
          setFeedback(null);
          setAdvancing(false);
        }
      }, 1200);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newStates: ItemState[] = [...itemStates];
      newStates[index] = 'encourage';
      setItemStates(newStates);
      setFeedback('tryAgain');

      // Reset the encouragement highlight after a moment
      setTimeout(() => {
        setItemStates((prev) => {
          const reset = [...prev];
          reset[index] = 'default';
          return reset;
        });
        setFeedback(null);
      }, 1500);
    }
  }, [advancing, feedback, currentRound, roundIndex, totalRounds, itemStates, onComplete]);

  const handleDone = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'odd_one_out', roundsCompleted: roundIndex + 1 });
  }, [onComplete, roundIndex]);

  const getItemStyle = (state: ItemState) => {
    switch (state) {
      case 'correct':
        return { backgroundColor: COLORS.successBg, borderColor: COLORS.success };
      case 'encourage':
        return { backgroundColor: COLORS.amberBg, borderColor: COLORS.amber };
      default:
        return { backgroundColor: COLORS.card, borderColor: COLORS.border };
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔍</Text>

      <Text style={styles.instruction}>
        {t('patientApp.stim.oddOneOut.instruction')}
      </Text>

      <Text style={styles.roundText}>
        {t('patientApp.stim.common.round', { current: roundIndex + 1, total: totalRounds })}
      </Text>

      <View style={styles.grid}>
        {currentRound.items.map((item, index) => {
          const state = itemStates[index];
          const dynamicStyle = getItemStyle(state);

          return (
            <TouchableOpacity
              key={`${roundIndex}-${index}`}
              style={[styles.itemButton, dynamicStyle]}
              onPress={() => handleItemPress(index)}
              activeOpacity={0.8}
              disabled={advancing}
            >
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={styles.itemLabel}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {feedback === 'correct' && (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackCorrectText}>
            {t('patientApp.stim.oddOneOut.correct')}
          </Text>
        </View>
      )}

      {feedback === 'tryAgain' && (
        <View style={styles.encourageCard}>
          <Text style={styles.feedbackEncourageText}>
            {t('patientApp.stim.oddOneOut.tryAgain')}
          </Text>
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
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  instruction: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  roundText: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
    width: '100%',
  },
  itemButton: {
    width: '44%',
    aspectRatio: 1,
    borderRadius: RADIUS['2xl'],
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: 20,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  feedbackCard: {
    backgroundColor: COLORS.successBg,
    borderRadius: RADIUS['2xl'],
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: COLORS.success,
    marginBottom: 20,
    width: '100%',
  },
  feedbackCorrectText: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.success,
    textAlign: 'center',
  },
  encourageCard: {
    backgroundColor: COLORS.amberBg,
    borderRadius: RADIUS['2xl'],
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: COLORS.amber,
    marginBottom: 20,
    width: '100%',
  },
  feedbackEncourageText: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.amber,
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  doneButtonText: {
    fontSize: 24,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },
  skipButton: {
    marginTop: 24,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
});
