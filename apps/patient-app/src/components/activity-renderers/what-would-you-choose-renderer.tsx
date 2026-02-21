import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { WhatWouldYouChooseContent } from '../../data/bundled-activities';

export default function WhatWouldYouChooseRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const items: WhatWouldYouChooseContent[] = Array.isArray(content) ? content : [content as WhatWouldYouChooseContent];
  const [roundIndex, setRoundIndex] = useState(0);
  const [chosen, setChosen] = useState<'a' | 'b' | null>(null);

  if (!items.length || !items[0]) return null;

  const current = items[roundIndex];
  const totalRounds = items.length;
  const isFinalRound = roundIndex + 1 >= totalRounds;

  const handleChoose = useCallback(async (choice: 'a' | 'b') => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setChosen(choice);
  }, []);

  const handleNext = useCallback(async () => {
    if (isFinalRound) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete({ activity: 'what_would_you_choose', roundsCompleted: totalRounds });
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setRoundIndex((prev) => prev + 1);
      setChosen(null);
    }
  }, [isFinalRound, onComplete, totalRounds]);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{'\uD83E\uDD37'}</Text>

      {totalRounds > 1 && (
        <Text style={styles.progress}>
          {t('patientApp.stim.common.round', { current: roundIndex + 1, total: totalRounds })}
        </Text>
      )}

      <Text style={styles.instruction}>
        {t('patientApp.stim.whatWouldYouChoose.instruction')}
      </Text>

      {!chosen && (
        <View style={styles.choiceRow}>
          <TouchableOpacity
            style={styles.choiceCard}
            onPress={() => handleChoose('a')}
            activeOpacity={0.8}
          >
            <Text style={styles.choiceEmoji}>{current.optionA.emoji}</Text>
            <Text style={styles.choiceLabel}>{t(current.optionA.labelKey)}</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>{t('common.or')}</Text>

          <TouchableOpacity
            style={styles.choiceCard}
            onPress={() => handleChoose('b')}
            activeOpacity={0.8}
          >
            <Text style={styles.choiceEmoji}>{current.optionB.emoji}</Text>
            <Text style={styles.choiceLabel}>{t(current.optionB.labelKey)}</Text>
          </TouchableOpacity>
        </View>
      )}

      {chosen && (
        <View style={styles.celebrationCard}>
          <Text style={styles.celebrationEmoji}>{'\uD83C\uDF1F'}</Text>
          <Text style={styles.celebrationText}>
            {t('patientApp.stim.whatWouldYouChoose.greatChoice')}
          </Text>
          <Text style={styles.followUpText}>
            {t(current.followUpKey)}
          </Text>
        </View>
      )}

      {chosen && (
        <TouchableOpacity style={styles.doneButton} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.doneButtonText}>
            {isFinalRound
              ? t('patientApp.stim.common.imDone')
              : t('patientApp.stim.common.next')}
          </Text>
        </TouchableOpacity>
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
    fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary,
    textAlign: 'center', lineHeight: 34, marginBottom: 28, paddingHorizontal: 8,
  },
  choiceRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, marginBottom: 24, width: '100%',
  },
  choiceCard: {
    flex: 1, backgroundColor: COLORS.medicationBg, borderRadius: RADIUS['2xl'],
    borderWidth: 2, borderColor: COLORS.medication, paddingVertical: 28,
    paddingHorizontal: 12, alignItems: 'center',
  },
  choiceEmoji: { fontSize: 56, marginBottom: 12 },
  choiceLabel: {
    fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary,
    textAlign: 'center',
  },
  orText: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.textMuted,
  },
  celebrationCard: {
    backgroundColor: COLORS.successBg, borderRadius: RADIUS['2xl'],
    borderWidth: 2, borderColor: COLORS.success, paddingVertical: 24,
    paddingHorizontal: 24, alignItems: 'center', marginBottom: 24, width: '100%',
  },
  celebrationEmoji: { fontSize: 48, marginBottom: 8 },
  celebrationText: {
    fontSize: 24, fontFamily: FONTS.display, color: COLORS.success,
    textAlign: 'center', marginBottom: 8,
  },
  followUpText: {
    fontSize: 22, fontFamily: FONTS.body, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 30,
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
