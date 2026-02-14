import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { SingAlongContent } from '../../data/bundled-activities';

export default function SingAlongRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const [lineIndex, setLineIndex] = useState(0);
  const data = content as SingAlongContent;

  if (!data) return null;

  const isLastLine = lineIndex >= data.lyricsKeys.length - 1;

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isLastLine) {
      setLineIndex((i) => i + 1);
    }
  };

  const handleDone = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'sing_along' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎤</Text>
      <Text style={styles.songTitle}>{t(data.titleKey)}</Text>

      <Text style={styles.prompt}>
        {t('patientApp.stim.singAlong.instruction')}
      </Text>

      <View style={styles.lyricsCard}>
        {data.lyricsKeys.slice(0, lineIndex + 1).map((key, i) => (
          <Text
            key={i}
            style={[styles.lyricLine, i === lineIndex && styles.currentLine]}
          >
            {t(key)}
          </Text>
        ))}
      </View>

      {!isLastLine ? (
        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.nextButtonText}>
            {t('patientApp.stim.singAlong.nextLine')}
          </Text>
        </TouchableOpacity>
      ) : (
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
  emoji: { fontSize: 56, marginBottom: 12 },
  songTitle: {
    fontSize: 26, fontFamily: FONTS.display, color: COLORS.textPrimary,
    textAlign: 'center', marginBottom: 8,
  },
  prompt: {
    fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted,
    textAlign: 'center', marginBottom: 24,
  },
  lyricsCard: {
    backgroundColor: COLORS.infoBg, borderRadius: RADIUS['2xl'],
    paddingVertical: 24, paddingHorizontal: 20, borderWidth: 2,
    borderColor: COLORS.info, marginBottom: 24, width: '100%',
  },
  lyricLine: {
    fontSize: 24, fontFamily: FONTS.body, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 36, marginBottom: 4,
  },
  currentLine: {
    fontFamily: FONTS.display, color: COLORS.info,
  },
  nextButton: {
    backgroundColor: COLORS.brand600, paddingVertical: 18, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  nextButtonText: { fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  doneButton: {
    backgroundColor: COLORS.success, paddingVertical: 18, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  doneButtonText: { fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  skipButton: { marginTop: 24, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
