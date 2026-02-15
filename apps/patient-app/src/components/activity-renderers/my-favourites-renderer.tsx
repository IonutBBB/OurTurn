import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { MyFavouritesContent } from '../../data/bundled-activities';

export default function MyFavouritesRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as MyFavouritesContent;
  const [promptIndex, setPromptIndex] = useState(0);
  const [showFollowUp, setShowFollowUp] = useState(false);

  if (!data?.prompts?.length) return null;

  const totalPrompts = data.prompts.length;
  const current = data.prompts[promptIndex];

  const handleThoughtAboutIt = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowFollowUp(true);
  }, []);

  const handleNext = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (promptIndex + 1 >= totalPrompts) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete({ activity: 'my_favourites', promptsCompleted: totalPrompts });
    } else {
      setPromptIndex((prev) => prev + 1);
      setShowFollowUp(false);
    }
  }, [promptIndex, totalPrompts, onComplete]);

  const handleDone = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'my_favourites', promptsCompleted: promptIndex + 1 });
  }, [onComplete, promptIndex]);

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        {t('patientApp.stim.common.round', { current: promptIndex + 1, total: totalPrompts })}
      </Text>

      <Text style={styles.emoji}>{current.emoji}</Text>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{t(current.questionKey)}</Text>
      </View>

      {!showFollowUp ? (
        <TouchableOpacity style={styles.thoughtButton} onPress={handleThoughtAboutIt} activeOpacity={0.8}>
          <Text style={styles.thoughtButtonText}>
            {t('patientApp.stim.myFavourites.thoughtAboutIt')}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.followUpCard}>
          <Text style={styles.followUpText}>{t(current.followUpKey)}</Text>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextButtonText}>
              {promptIndex + 1 >= totalPrompts
                ? t('patientApp.stim.common.imDone')
                : t('patientApp.stim.common.nextRound')}
            </Text>
          </TouchableOpacity>
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
  progress: {
    fontSize: 20, fontFamily: FONTS.bodyMedium, color: COLORS.textMuted,
    textAlign: 'center', marginBottom: 8,
  },
  emoji: { fontSize: 64, marginBottom: 20 },
  questionCard: {
    backgroundColor: COLORS.medicationBg, borderRadius: RADIUS['2xl'],
    borderWidth: 2, borderColor: COLORS.medication, paddingVertical: 24,
    paddingHorizontal: 24, marginBottom: 24, width: '100%',
  },
  questionText: {
    fontSize: 26, fontFamily: FONTS.display, color: COLORS.textPrimary,
    textAlign: 'center', lineHeight: 36,
  },
  thoughtButton: {
    backgroundColor: COLORS.medication, paddingVertical: 18,
    paddingHorizontal: 36, borderRadius: RADIUS.lg, marginBottom: 16,
  },
  thoughtButtonText: {
    fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse,
  },
  followUpCard: {
    backgroundColor: COLORS.successBg, borderRadius: RADIUS['2xl'],
    borderWidth: 2, borderColor: COLORS.success, paddingVertical: 20,
    paddingHorizontal: 24, marginBottom: 16, width: '100%', alignItems: 'center',
  },
  followUpText: {
    fontSize: 22, fontFamily: FONTS.body, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 30, marginBottom: 16,
  },
  nextButton: {
    backgroundColor: COLORS.success, paddingVertical: 14,
    paddingHorizontal: 32, borderRadius: RADIUS.lg,
  },
  nextButtonText: {
    fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse,
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
