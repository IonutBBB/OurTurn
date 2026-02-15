import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { CoinCountingContent } from '../../data/bundled-activities';

type FeedbackState = 'none' | 'correct' | 'incorrect';

export default function CoinCountingRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as CoinCountingContent;

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
        onComplete({ activity: 'coin_counting', roundsCompleted: totalRounds });
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
    onComplete({ activity: 'coin_counting', roundsCompleted: roundIndex + 1 });
  }, [onComplete, roundIndex]);

  const getOptionStyle = (index: number) => {
    if (selectedIndex === null) return { backgroundColor: COLORS.card, borderColor: COLORS.border };
    if (index === current.correctIndex) return { backgroundColor: COLORS.successBg, borderColor: COLORS.success };
    if (index === selectedIndex) return { backgroundColor: COLORS.amberBg, borderColor: COLORS.amber };
    return { backgroundColor: COLORS.card, borderColor: COLORS.border };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💰</Text>

      <Text style={styles.progress}>
        {t('patientApp.stim.common.round', { current: roundIndex + 1, total: totalRounds })}
      </Text>

      <Text style={styles.instruction}>
        {t('patientApp.stim.coinCounting.instruction')}
      </Text>

      <View style={styles.coinsCard}>
        <View style={styles.coinsRow}>
          {current.coins.map((coin, index) => (
            <View key={index} style={styles.coinBadge}>
              <Text style={styles.coinText}>{coin.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.questionText}>
        {t('patientApp.stim.coinCounting.howMuch')}
      </Text>

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
            {t('patientApp.stim.coinCounting.notQuite', { answer: current.correctTotal })}
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
  coinsCard: {
    backgroundColor: COLORS.infoBg, borderRadius: RADIUS['2xl'],
    paddingVertical: 24, paddingHorizontal: 16, borderWidth: 2,
    borderColor: COLORS.info, marginBottom: 16, width: '100%', alignItems: 'center',
  },
  coinsRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 16, flexWrap: 'wrap',
  },
  coinBadge: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.amber,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#A67220',
  },
  coinText: {
    fontSize: 22, fontFamily: FONTS.display, color: COLORS.textInverse, textAlign: 'center',
  },
  questionText: {
    fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary,
    textAlign: 'center', marginBottom: 16,
  },
  optionsList: { width: '100%', gap: 12, marginBottom: 16 },
  optionButton: {
    paddingVertical: 18, paddingHorizontal: 24, borderRadius: RADIUS.lg,
    borderWidth: 2, alignItems: 'center',
  },
  optionText: {
    fontSize: 28, fontFamily: FONTS.display, color: COLORS.textPrimary, textAlign: 'center',
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
