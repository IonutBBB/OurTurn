import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { ProverbContent } from '../../data/bundled-activities';

export default function ProverbsRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const items: ProverbContent[] = Array.isArray(content) ? content : [content as ProverbContent];
  const [roundIndex, setRoundIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  if (!items.length || !items[0]) return null;

  const current = items[roundIndex];
  const totalRounds = items.length;
  const isFinalRound = roundIndex + 1 >= totalRounds;

  const handleReveal = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRevealed(true);
  };

  const handleNext = async () => {
    if (isFinalRound) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete({ activity: 'proverbs', roundsCompleted: totalRounds });
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setRoundIndex((prev) => prev + 1);
      setRevealed(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📜</Text>

      {totalRounds > 1 && (
        <Text style={styles.progress}>
          {t('patientApp.stim.common.round', { current: roundIndex + 1, total: totalRounds })}
        </Text>
      )}

      <Text style={styles.instruction}>
        {t('patientApp.stim.proverbs.instruction')}
      </Text>

      <View style={styles.proverbCard}>
        <Text style={styles.firstHalf}>{t(current.firstHalfKey)}</Text>
        {revealed ? (
          <Text style={styles.secondHalf}>{t(current.secondHalfKey)}</Text>
        ) : (
          <Text style={styles.dots}>...</Text>
        )}
      </View>

      {!revealed ? (
        <TouchableOpacity style={styles.revealButton} onPress={handleReveal} activeOpacity={0.8}>
          <Text style={styles.revealButtonText}>
            {t('patientApp.stim.proverbs.reveal')}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.revealedArea}>
          <Text style={styles.encouragement}>
            {t('patientApp.stim.proverbs.youKnowIt')}
          </Text>
          <TouchableOpacity style={styles.doneButton} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.doneButtonText}>
              {isFinalRound
                ? t('patientApp.stim.common.imDone')
                : t('patientApp.stim.common.nextProverb')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.7}>
        <Text style={styles.skipText}>{t('common.skip')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 16 },
  emoji: { fontSize: 56, marginBottom: 16 },
  progress: {
    fontSize: 20, fontFamily: FONTS.bodyMedium, color: COLORS.textMuted,
    textAlign: 'center', marginBottom: 4,
  },
  instruction: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 30, marginBottom: 24,
  },
  proverbCard: {
    backgroundColor: COLORS.cognitiveBg, borderRadius: RADIUS['2xl'],
    paddingVertical: 32, paddingHorizontal: 24, borderWidth: 2,
    borderColor: COLORS.cognitive, marginBottom: 32, width: '100%',
  },
  firstHalf: {
    fontSize: 28, fontFamily: FONTS.display, color: COLORS.cognitive,
    textAlign: 'center', lineHeight: 38,
  },
  secondHalf: {
    fontSize: 28, fontFamily: FONTS.display, color: COLORS.brand600,
    textAlign: 'center', marginTop: 8, lineHeight: 38,
  },
  dots: {
    fontSize: 36, fontFamily: FONTS.display, color: COLORS.textMuted,
    textAlign: 'center', marginTop: 8,
  },
  revealButton: {
    backgroundColor: COLORS.brand600, paddingVertical: 18, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  revealButtonText: { fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  revealedArea: { alignItems: 'center' },
  encouragement: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.success,
    textAlign: 'center', marginBottom: 24,
  },
  doneButton: {
    backgroundColor: COLORS.success, paddingVertical: 18, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  doneButtonText: { fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  skipButton: { marginTop: 24, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
