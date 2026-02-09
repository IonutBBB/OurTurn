import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { SoundIdContent } from '../../data/bundled-activities';

export default function SoundIdRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const data = content as SoundIdContent;

  if (!data) return null;

  const handleSelect = async (index: number) => {
    if (revealed) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(index);
    setTimeout(() => setRevealed(true), 300);
  };

  const isCorrect = selected === data.correctIndex;

  const handleDone = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete(
      { correct: isCorrect, selectedIndex: selected },
      { sound: data.soundDescriptionKey }
    );
  };

  return (
    <View style={styles.container}>
      {/* Sound description as text */}
      <View style={styles.soundCard}>
        <Text style={styles.soundEmoji}>🔊</Text>
        <Text style={styles.soundText}>{t(data.soundDescriptionKey)}</Text>
      </View>

      <Text style={styles.instruction}>
        {t('patientApp.stim.soundId.whatMakesThisSound')}
      </Text>

      {/* Answer options */}
      <View style={styles.optionsContainer}>
        {data.options.map((option, index) => {
          const isSelected = index === selected;
          const showCorrect = revealed && index === data.correctIndex;
          const showWrong = revealed && isSelected && !isCorrect;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionCard,
                isSelected && !revealed && styles.optionSelected,
                showCorrect && styles.optionCorrect,
                showWrong && styles.optionWrong,
              ]}
              onPress={() => handleSelect(index)}
              disabled={revealed}
              activeOpacity={0.8}
            >
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <Text style={styles.optionLabel}>{t(option.labelKey)}</Text>
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
              : t('patientApp.stim.soundId.goodGuess')}
          </Text>
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
  soundCard: {
    backgroundColor: COLORS.infoBg, borderRadius: RADIUS['2xl'],
    paddingVertical: 24, paddingHorizontal: 32, borderWidth: 2,
    borderColor: COLORS.info, alignItems: 'center', marginBottom: 24,
    width: '100%',
  },
  soundEmoji: { fontSize: 56, marginBottom: 12 },
  soundText: {
    fontSize: 28, fontFamily: FONTS.display, color: COLORS.info,
    textAlign: 'center', fontStyle: 'italic',
  },
  instruction: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary,
    textAlign: 'center', marginBottom: 20,
  },
  optionsContainer: { width: '100%', gap: 12, marginBottom: 16 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl, paddingVertical: 18, paddingHorizontal: 20,
    borderWidth: 2, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  optionSelected: { borderColor: COLORS.cognitive, backgroundColor: COLORS.cognitiveBg },
  optionCorrect: { borderColor: COLORS.success, backgroundColor: COLORS.successBg },
  optionWrong: { borderColor: COLORS.danger, backgroundColor: COLORS.dangerBg },
  optionEmoji: { fontSize: 36, marginRight: 16 },
  optionLabel: { fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary },
  resultContainer: { alignItems: 'center', marginTop: 8 },
  resultEmoji: { fontSize: 48, marginBottom: 8 },
  resultText: { fontSize: 24, fontFamily: FONTS.display, color: COLORS.textPrimary, marginBottom: 16 },
  doneButton: {
    backgroundColor: COLORS.success, paddingVertical: 16, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  doneButtonText: { fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  skipButton: { marginTop: 24, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
