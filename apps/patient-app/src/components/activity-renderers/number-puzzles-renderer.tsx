import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { NumberPuzzlesContent } from '../../data/bundled-activities';

type FeedbackState = 'none' | 'correct' | 'incorrect';

export default function NumberPuzzlesRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as NumberPuzzlesContent;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>('none');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [disabled, setDisabled] = useState(false);

  if (!data?.questions?.length) return null;

  const totalQuestions = data.questions.length;
  const currentQuestion = data.questions[currentIndex];

  const advanceToNext = useCallback(() => {
    if (currentIndex + 1 >= totalQuestions) {
      // All questions done — auto-complete
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete({ activity: 'number_puzzles', questionsAnswered: totalQuestions });
    } else {
      setCurrentIndex((prev) => prev + 1);
      setFeedback('none');
      setSelectedIndex(null);
      setDisabled(false);
    }
  }, [currentIndex, totalQuestions, onComplete]);

  const handleSelect = useCallback(
    async (optionIndex: number) => {
      if (disabled) return;
      setDisabled(true);
      setSelectedIndex(optionIndex);

      const isCorrect = optionIndex === currentQuestion.correctIndex;

      if (isCorrect) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setFeedback('correct');
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setFeedback('incorrect');
      }

      // Pause briefly so the user can see feedback, then advance
      setTimeout(() => {
        advanceToNext();
      }, 1500);
    },
    [disabled, currentQuestion, advanceToNext],
  );

  const handleDone = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'number_puzzles', questionsAnswered: currentIndex + 1 });
  }, [onComplete, currentIndex]);

  const getOptionStyle = (index: number) => {
    if (selectedIndex === null) {
      return { backgroundColor: COLORS.card, borderColor: COLORS.border };
    }
    if (index === currentQuestion.correctIndex) {
      return { backgroundColor: COLORS.successBg, borderColor: COLORS.success };
    }
    if (index === selectedIndex && selectedIndex !== currentQuestion.correctIndex) {
      return { backgroundColor: COLORS.amberBg, borderColor: COLORS.amber };
    }
    return { backgroundColor: COLORS.card, borderColor: COLORS.border };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔢</Text>

      <Text style={styles.progress}>
        {t('patientApp.stim.numberPuzzles.questionOf', {
          current: currentIndex + 1,
          total: totalQuestions,
        })}
      </Text>

      <Text style={styles.instruction}>
        {t('patientApp.stim.numberPuzzles.instruction')}
      </Text>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
      </View>

      <View style={styles.grid}>
        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={`${currentIndex}-${index}`}
            style={[styles.optionButton, getOptionStyle(index)]}
            onPress={() => handleSelect(index)}
            activeOpacity={0.8}
            disabled={disabled}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {feedback === 'correct' && (
        <View style={styles.feedbackCardCorrect}>
          <Text style={styles.feedbackTextCorrect}>
            {t('patientApp.stim.numberPuzzles.correct')}
          </Text>
        </View>
      )}

      {feedback === 'incorrect' && (
        <View style={styles.feedbackCardTryAgain}>
          <Text style={styles.feedbackTextTryAgain}>
            {t('patientApp.stim.numberPuzzles.tryAgain', {
              answer: currentQuestion.options[currentQuestion.correctIndex],
            })}
          </Text>
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
  emoji: { fontSize: 56, marginBottom: 12 },
  progress: {
    fontSize: 20,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  instruction: {
    fontSize: 22,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  questionCard: {
    backgroundColor: COLORS.infoBg,
    borderRadius: RADIUS['2xl'],
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: COLORS.info,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 28,
    fontFamily: FONTS.display,
    color: COLORS.info,
    textAlign: 'center',
    lineHeight: 38,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  optionButton: {
    width: '48%',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 24,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  feedbackCardCorrect: {
    backgroundColor: COLORS.successBg,
    borderRadius: RADIUS['2xl'],
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: COLORS.success,
    marginBottom: 20,
    width: '100%',
  },
  feedbackTextCorrect: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.success,
    textAlign: 'center',
  },
  feedbackCardTryAgain: {
    backgroundColor: COLORS.amberBg,
    borderRadius: RADIUS['2xl'],
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: COLORS.amber,
    marginBottom: 20,
    width: '100%',
  },
  feedbackTextTryAgain: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.amber,
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  doneButtonText: {
    fontSize: 24,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },
  skipButton: { marginTop: 24, paddingVertical: 12 },
  skipText: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
});
