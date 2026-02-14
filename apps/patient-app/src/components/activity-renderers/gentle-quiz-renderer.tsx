import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { GentleQuizContent } from '../../data/bundled-activities';

export default function GentleQuizRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);
  const data = content as GentleQuizContent;

  if (!data) return null;

  // Support both API content (raw strings) and bundled content (i18n keys)
  const question = data.questionKey ? t(data.questionKey) : data.question;
  const correctAnswer = data.correctAnswerKey ? t(data.correctAnswerKey) : data.correctAnswer;
  const answers = data.allAnswerKeys
    ? data.allAnswerKeys.map((k) => t(k))
    : data.allAnswers ?? [];

  const isCorrect = selected === correctAnswer;

  const handleSelect = async (answer: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(answer);
  };

  const handleDone = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'gentle_quiz' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🌟</Text>
      <Text style={styles.question}>{question}</Text>

      <View style={styles.answers}>
        {answers.map((answer) => {
          const isThis = selected === answer;
          const bgColor = !selected
            ? COLORS.card
            : isThis
              ? isCorrect ? COLORS.successBg : COLORS.amberBg
              : COLORS.card;
          const borderColor = !selected
            ? COLORS.border
            : isThis
              ? isCorrect ? COLORS.success : COLORS.amber
              : COLORS.border;

          return (
            <TouchableOpacity
              key={answer}
              style={[styles.answerButton, { backgroundColor: bgColor, borderColor }]}
              onPress={() => handleSelect(answer)}
              activeOpacity={0.8}
              disabled={!!selected}
            >
              <Text style={styles.answerText}>{answer}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selected && (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>
            {isCorrect
              ? t('patientApp.stim.gentleQuiz.correct')
              : t('patientApp.stim.gentleQuiz.goodGuess', { answer: correctAnswer })}
          </Text>
        </View>
      )}

      {selected && (
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
  question: {
    fontSize: 24, fontFamily: FONTS.display, color: COLORS.textPrimary,
    textAlign: 'center', lineHeight: 34, marginBottom: 24, paddingHorizontal: 8,
  },
  answers: { width: '100%', marginBottom: 16 },
  answerButton: {
    paddingVertical: 16, paddingHorizontal: 20, borderRadius: RADIUS.lg,
    borderWidth: 2, marginBottom: 12,
  },
  answerText: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.textPrimary, textAlign: 'center',
  },
  feedbackCard: {
    backgroundColor: COLORS.successBg, borderRadius: RADIUS['2xl'],
    paddingVertical: 16, paddingHorizontal: 24, borderWidth: 2,
    borderColor: COLORS.success, marginBottom: 24, width: '100%',
  },
  feedbackText: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.success, textAlign: 'center',
  },
  doneButton: {
    backgroundColor: COLORS.success, paddingVertical: 18, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  doneButtonText: { fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  skipButton: { marginTop: 24, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
