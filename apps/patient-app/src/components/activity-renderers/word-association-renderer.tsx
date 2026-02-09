import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { WordAssociationContent } from '../../data/bundled-activities';

export default function WordAssociationRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const [started, setStarted] = useState(false);
  const data = content as WordAssociationContent;

  if (!data) return null;

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStarted(true);
  };

  const handleDone = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ completed: true }, { activity: 'word_association' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💬</Text>
      <Text style={styles.instruction}>
        {t('patientApp.stim.wordAssociation.instruction')}
      </Text>

      <View style={styles.wordCard}>
        <Text style={styles.starterWord}>{t(data.starterWordKey)}</Text>
      </View>

      {!started ? (
        <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.8}>
          <Text style={styles.startButtonText}>
            {t('patientApp.stim.common.letsPlay')}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.playArea}>
          <Text style={styles.playHint}>
            {t('patientApp.stim.wordAssociation.sayWord')}
          </Text>
          <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.8}>
            <Text style={styles.doneButtonText}>
              {t('patientApp.stim.common.imDone')}
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
  instruction: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 30, marginBottom: 24, paddingHorizontal: 8,
  },
  wordCard: {
    backgroundColor: COLORS.cognitiveBg, borderRadius: RADIUS['2xl'],
    paddingVertical: 32, paddingHorizontal: 48, borderWidth: 2,
    borderColor: COLORS.cognitive, marginBottom: 32,
  },
  starterWord: {
    fontSize: 40, fontFamily: FONTS.display, color: COLORS.cognitive,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: COLORS.brand600, paddingVertical: 18, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  startButtonText: { fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  playArea: { alignItems: 'center' },
  playHint: {
    fontSize: 22, fontFamily: FONTS.body, color: COLORS.textSecondary,
    textAlign: 'center', marginBottom: 32, lineHeight: 30,
  },
  doneButton: {
    backgroundColor: COLORS.success, paddingVertical: 18, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  doneButtonText: { fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  skipButton: { marginTop: 24, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
