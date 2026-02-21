import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { GentleQuizContent } from '../../data/bundled-activities';

// API content has allAnswers (raw strings); bundled content has allAnswerKeys (i18n keys)
type QuizItem = GentleQuizContent | { question: string; correctAnswer: string; incorrectAnswers: string[]; allAnswers: string[] };

export default function GentleQuizRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const items: QuizItem[] = Array.isArray(content) ? content : [content as QuizItem];
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  if (!items.length || !items[0]) return null;

  const current = items[roundIndex];
  const totalRounds = items.length;
  const isFinalRound = roundIndex + 1 >= totalRounds;

  // Support both API content (raw strings) and bundled content (i18n keys)
  const bundled = current as GentleQuizContent;
  const question = bundled.questionKey ? t(bundled.questionKey) : current.question;
  const correctAnswer = bundled.correctAnswerKey ? t(bundled.correctAnswerKey) : current.correctAnswer;
  const answers: string[] = bundled.allAnswerKeys
    ? bundled.allAnswerKeys.map((k: string) => t(k))
    : ('allAnswers' in current ? (current as { allAnswers: string[] }).allAnswers : []);

  const isCorrect = selected === correctAnswer;

  const handleSelect = async (answer: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(answer);
  };

  const handleNext = async () => {
    if (isFinalRound) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete({ activity: 'gentle_quiz', roundsCompleted: totalRounds });
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setRoundIndex((prev) => prev + 1);
      setSelected(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🌟</Text>

      {totalRounds > 1 && (
        <Text style={styles.progress}>
          {t('patientApp.stim.common.round', { current: roundIndex + 1, total: totalRounds })}
        </Text>
      )}

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
