import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { NatureSoundsContent } from '../../data/bundled-activities';

export default function NatureSoundsRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const [listening, setListening] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const data = content as NatureSoundsContent;

  if (!data) return null;

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setListening(true);
  };

  useEffect(() => {
    if (!listening) return;
    intervalRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [listening]);

  const handleDone = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'nature_sounds', listenedSeconds: elapsed });
  };

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{data.emoji}</Text>
      <Text style={styles.sceneName}>{t(data.nameKey)}</Text>
      <Text style={styles.description}>{t(data.descriptionKey)}</Text>

      {!listening ? (
        <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.8}>
          <Text style={styles.startButtonText}>
            {t('patientApp.stim.natureSounds.listen')}
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          <View style={styles.listeningCard}>
            <Text style={styles.breatheText}>{t(data.breathingPromptKey)}</Text>
            <Text style={styles.timer}>
              {minutes}:{String(seconds).padStart(2, '0')}
            </Text>
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.8}>
            <Text style={styles.doneButtonText}>
              {t('patientApp.stim.common.imDone')}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.7}>
        <Text style={styles.skipText}>{t('common.skip')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 16 },
  emoji: { fontSize: 72, marginBottom: 16 },
  sceneName: {
    fontSize: 26, fontFamily: FONTS.display, color: COLORS.textPrimary,
    textAlign: 'center', marginBottom: 8,
  },
  description: {
    fontSize: 22, fontFamily: FONTS.body, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 30, marginBottom: 32, paddingHorizontal: 8,
  },
  startButton: {
    backgroundColor: COLORS.brand600, paddingVertical: 18, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  startButtonText: { fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  listeningCard: {
    backgroundColor: COLORS.physicalBg, borderRadius: RADIUS['2xl'],
    paddingVertical: 32, paddingHorizontal: 24, borderWidth: 2,
    borderColor: COLORS.physical, marginBottom: 24, width: '100%', alignItems: 'center',
  },
  breatheText: {
    fontSize: 24, fontFamily: FONTS.bodyMedium, color: COLORS.physical,
    textAlign: 'center', marginBottom: 12,
  },
  timer: {
    fontSize: 28, fontFamily: FONTS.display, color: COLORS.textPrimary,
  },
  doneButton: {
    backgroundColor: COLORS.success, paddingVertical: 18, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  doneButtonText: { fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  skipButton: { marginTop: 24, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
