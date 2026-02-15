import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { DescribeTheSceneContent } from '../../data/bundled-activities';

export default function DescribeTheSceneRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as DescribeTheSceneContent;
  const [questionIndex, setQuestionIndex] = useState(0);

  if (!data?.questions?.length) return null;

  const totalQuestions = data.questions.length;

  const handleNext = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (questionIndex + 1 >= totalQuestions) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete({ activity: 'describe_the_scene' });
    } else {
      setQuestionIndex((prev) => prev + 1);
    }
  }, [questionIndex, totalQuestions, onComplete]);

  const handleDone = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'describe_the_scene' });
  }, [onComplete]);

  return (
    <View style={styles.container}>
      <View style={styles.sceneCard}>
        <Text style={styles.sceneEmojis}>{data.scene}</Text>
        <Text style={styles.sceneTitle}>{t(data.titleKey)}</Text>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{t(data.questions[questionIndex])}</Text>
      </View>

      <Text style={styles.progress}>
        {t('patientApp.stim.common.round', { current: questionIndex + 1, total: totalQuestions })}
      </Text>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
        <Text style={styles.nextButtonText}>
          {questionIndex + 1 >= totalQuestions
            ? t('patientApp.stim.common.imDone')
            : t('patientApp.stim.describeTheScene.nextQuestion')}
        </Text>
      </TouchableOpacity>

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
  sceneCard: {
    backgroundColor: COLORS.physicalBg, borderRadius: RADIUS['2xl'],
    borderWidth: 2, borderColor: COLORS.physical, paddingVertical: 24,
    paddingHorizontal: 24, marginBottom: 24, width: '100%', alignItems: 'center',
  },
  sceneEmojis: {
    fontSize: 44, textAlign: 'center', marginBottom: 12, letterSpacing: 4,
  },
  sceneTitle: {
    fontSize: 24, fontFamily: FONTS.display, color: COLORS.physical,
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS['2xl'],
    borderWidth: 2, borderColor: COLORS.border, paddingVertical: 24,
    paddingHorizontal: 24, marginBottom: 16, width: '100%',
  },
  questionText: {
    fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary,
    textAlign: 'center', lineHeight: 34,
  },
  progress: {
    fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted,
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: COLORS.physical, paddingVertical: 18,
    paddingHorizontal: 48, borderRadius: RADIUS.lg, marginBottom: 12,
  },
  nextButtonText: {
    fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse,
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
