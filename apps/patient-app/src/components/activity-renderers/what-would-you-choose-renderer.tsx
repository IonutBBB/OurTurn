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
  const data = content as WhatWouldYouChooseContent;
  const [chosen, setChosen] = useState<'a' | 'b' | null>(null);

  if (!data) return null;

  const handleChoose = useCallback(async (choice: 'a' | 'b') => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setChosen(choice);
  }, []);

  const handleDone = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'what_would_you_choose' });
  }, [onComplete]);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{'\uD83E\uDD37'}</Text>

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
            <Text style={styles.choiceEmoji}>{data.optionA.emoji}</Text>
            <Text style={styles.choiceLabel}>{t(data.optionA.labelKey)}</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>{t('common.or')}</Text>

          <TouchableOpacity
            style={styles.choiceCard}
            onPress={() => handleChoose('b')}
            activeOpacity={0.8}
          >
            <Text style={styles.choiceEmoji}>{data.optionB.emoji}</Text>
            <Text style={styles.choiceLabel}>{t(data.optionB.labelKey)}</Text>
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
            {t(data.followUpKey)}
          </Text>
        </View>
      )}

      {chosen && (
        <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.8}>
          <Text style={styles.doneButtonText}>
            {t('patientApp.stim.common.imDone')}
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
