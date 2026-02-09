import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { OddWordOutContent } from '../../data/bundled-activities';

export default function OddWordOutRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const data = content as OddWordOutContent;

  if (!data) return null;

  const handleSelect = async (index: number) => {
    if (revealed) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(index);

    // Reveal after short delay
    setTimeout(() => setRevealed(true), 300);
  };

  const isCorrect = selected === data.oddIndex;

  const handleDone = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete(
      { correct: isCorrect, selectedIndex: selected },
      { oddIndex: data.oddIndex }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔍</Text>
      <Text style={styles.instruction}>
        {t('patientApp.stim.oddWordOut.instruction')}
      </Text>

      <View style={styles.wordsContainer}>
        {data.words.map((_, index) => {
          const isOdd = index === data.oddIndex;
          const isSelected = index === selected;
          const showCorrect = revealed && isOdd;
          const showWrong = revealed && isSelected && !isCorrect;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.wordCard,
                isSelected && !revealed && styles.wordCardSelected,
                showCorrect && styles.wordCardCorrect,
                showWrong && styles.wordCardWrong,
              ]}
              onPress={() => handleSelect(index)}
              disabled={revealed}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.wordText,
                showCorrect && styles.wordTextCorrect,
              ]}>
                {t(data.wordKeys[index])}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {revealed && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>{isCorrect ? '🎉' : '💡'}</Text>
          <Text style={styles.resultText}>
            {isCorrect
              ? t('patientApp.stim.common.wellDone')
              : t('patientApp.stim.oddWordOut.niceAttempt')}
          </Text>
          <Text style={styles.explanationText}>{t(data.explanationKey)}</Text>
          <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.8}>
            <Text style={styles.doneButtonText}>{t('patientApp.stim.common.greatJob')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {!revealed && (
        <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>{t('common.skip')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 16 },
  emoji: { fontSize: 56, marginBottom: 16 },
  instruction: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 30, marginBottom: 24,
  },
  wordsContainer: { width: '100%', gap: 12, marginBottom: 24 },
  wordCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    paddingVertical: 20, paddingHorizontal: 24, borderWidth: 2,
    borderColor: COLORS.border, ...SHADOWS.sm,
  },
  wordCardSelected: { borderColor: COLORS.cognitive, backgroundColor: COLORS.cognitiveBg },
  wordCardCorrect: { borderColor: COLORS.success, backgroundColor: COLORS.successBg },
  wordCardWrong: { borderColor: COLORS.danger, backgroundColor: COLORS.dangerBg },
  wordText: {
    fontSize: 26, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary,
    textAlign: 'center',
  },
  wordTextCorrect: { color: COLORS.success },
  resultContainer: { alignItems: 'center', marginTop: 8 },
  resultEmoji: { fontSize: 48, marginBottom: 12 },
  resultText: {
    fontSize: 24, fontFamily: FONTS.display, color: COLORS.textPrimary,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 20, fontFamily: FONTS.body, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 28, marginBottom: 24, paddingHorizontal: 8,
  },
  doneButton: {
    backgroundColor: COLORS.success, paddingVertical: 16, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  doneButtonText: { fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  skipButton: { marginTop: 24, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
