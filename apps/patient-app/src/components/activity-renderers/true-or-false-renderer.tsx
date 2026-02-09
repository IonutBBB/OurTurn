import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { TrueOrFalseContent } from '../../data/bundled-activities';

export default function TrueOrFalseRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [revealed, setRevealed] = useState(false);
  const data = content as TrueOrFalseContent;

  if (!data) return null;

  const handleAnswer = async (guess: boolean) => {
    if (revealed) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAnswer(guess);
    setTimeout(() => setRevealed(true), 300);
  };

  const isCorrect = answer === data.isTrue;

  const handleDone = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete(
      { correct: isCorrect, answer, actual: data.isTrue },
      { statement: data.statementKey }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>✅</Text>

      <View style={styles.statementCard}>
        <Text style={styles.statementText}>{t(data.statementKey)}</Text>
      </View>

      {!revealed ? (
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.answerButton, styles.trueButton]}
            onPress={() => handleAnswer(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.answerEmoji}>👍</Text>
            <Text style={styles.answerText}>{t('patientApp.stim.trueOrFalse.true')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.answerButton, styles.falseButton]}
            onPress={() => handleAnswer(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.answerEmoji}>👎</Text>
            <Text style={styles.answerText}>{t('patientApp.stim.trueOrFalse.false')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>{isCorrect ? '🎉' : '💡'}</Text>
          <Text style={styles.resultText}>
            {isCorrect
              ? t('patientApp.stim.common.wellDone')
              : t('patientApp.stim.trueOrFalse.niceGuess')}
          </Text>

          <View style={[
            styles.answerReveal,
            data.isTrue ? styles.answerRevealTrue : styles.answerRevealFalse,
          ]}>
            <Text style={styles.answerRevealText}>
              {data.isTrue
                ? t('patientApp.stim.trueOrFalse.itsTrue')
                : t('patientApp.stim.trueOrFalse.itsFalse')}
            </Text>
          </View>

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
  emoji: { fontSize: 48, marginBottom: 16 },
  statementCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS['2xl'],
    padding: 24, borderWidth: 2, borderColor: COLORS.border, width: '100%',
    marginBottom: 32, ...SHADOWS.sm,
  },
  statementText: {
    fontSize: 26, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary,
    textAlign: 'center', lineHeight: 36,
  },
  buttonsRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  answerButton: {
    flex: 1, paddingVertical: 24, borderRadius: RADIUS.xl,
    borderWidth: 3, alignItems: 'center', ...SHADOWS.sm,
  },
  trueButton: { backgroundColor: COLORS.successBg, borderColor: COLORS.success },
  falseButton: { backgroundColor: COLORS.dangerBg, borderColor: COLORS.danger },
  answerEmoji: { fontSize: 40, marginBottom: 8 },
  answerText: { fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary },
  resultContainer: { alignItems: 'center', width: '100%' },
  resultEmoji: { fontSize: 48, marginBottom: 8 },
  resultText: { fontSize: 24, fontFamily: FONTS.display, color: COLORS.textPrimary, marginBottom: 12 },
  answerReveal: {
    paddingVertical: 10, paddingHorizontal: 24, borderRadius: RADIUS.lg,
    marginBottom: 16,
  },
  answerRevealTrue: { backgroundColor: COLORS.successBg },
  answerRevealFalse: { backgroundColor: COLORS.dangerBg },
  answerRevealText: { fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary },
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
