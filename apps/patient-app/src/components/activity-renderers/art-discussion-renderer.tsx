import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { ArtDiscussionContent } from '../../data/bundled-activities';

export default function ArtDiscussionRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const [questionIdx, setQuestionIdx] = useState(0);
  const [response, setResponse] = useState('');
  const [done, setDone] = useState(false);
  const data = content as ArtDiscussionContent;

  if (!data) return null;

  const currentQuestion = data.questionKeys[questionIdx];
  const isLastQuestion = questionIdx >= data.questionKeys.length - 1;

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isLastQuestion) {
      setDone(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete(
        { questionsAnswered: questionIdx + 1 },
        { artwork: data.titleKey, response }
      );
    } else {
      setQuestionIdx((prev) => prev + 1);
      setResponse('');
    }
  };

  if (done) return null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        {/* Artwork representation */}
        <View style={styles.artCard}>
          <Text style={styles.artEmoji}>{data.emoji}</Text>
          <Text style={styles.artTitle}>{t(data.titleKey)}</Text>
          <Text style={styles.artArtist}>{t(data.artistKey)}</Text>
          <Text style={styles.artDescription}>{t(data.descriptionKey)}</Text>
        </View>

        {/* Discussion question */}
        <Text style={styles.question}>{t(currentQuestion)}</Text>

        <TextInput
          style={styles.textInput}
          value={response}
          onChangeText={setResponse}
          placeholder={t('patientApp.stim.art.typeThoughts')}
          placeholderTextColor={COLORS.textMuted}
          multiline
          maxLength={500}
        />

        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.nextButtonText}>
            {isLastQuestion
              ? t('patientApp.stim.common.imDone')
              : t('patientApp.stim.art.nextQuestion')}
          </Text>
        </TouchableOpacity>

        <Text style={styles.questionCount}>
          {t('patientApp.stim.art.questionOf', {
            current: questionIdx + 1,
            total: data.questionKeys.length,
          })}
        </Text>

        <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>{t('common.skip')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 16 },
  artCard: {
    backgroundColor: COLORS.nutritionBg, borderRadius: RADIUS['2xl'],
    padding: 24, borderWidth: 2, borderColor: COLORS.nutrition,
    width: '100%', alignItems: 'center', marginBottom: 24,
  },
  artEmoji: { fontSize: 64, marginBottom: 12 },
  artTitle: {
    fontSize: 24, fontFamily: FONTS.display, color: COLORS.textPrimary,
    textAlign: 'center', marginBottom: 4,
  },
  artArtist: {
    fontSize: 20, fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary,
    marginBottom: 12,
  },
  artDescription: {
    fontSize: 20, fontFamily: FONTS.body, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 28, fontStyle: 'italic',
  },
  question: {
    fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary,
    textAlign: 'center', lineHeight: 34, marginBottom: 16,
  },
  textInput: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.lg, padding: 16,
    fontSize: 20, fontFamily: FONTS.body, color: COLORS.textPrimary,
    minHeight: 100, textAlignVertical: 'top', width: '100%', marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  nextButton: {
    backgroundColor: COLORS.brand600, paddingVertical: 16, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  nextButtonText: { fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  questionCount: {
    fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted, marginTop: 12,
  },
  skipButton: { marginTop: 16, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
