import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { HistoryFactContent } from '../../data/bundled-activities';

export default function HistoryRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const [response, setResponse] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const data = content as HistoryFactContent;

  if (!data) return null;

  const handleShare = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowFollowUp(true);
  };

  const handleDone = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onComplete(
      { responded: response.length > 0 },
      { fact: data.factKey, response }
    );
  };

  if (showFollowUp) {
    return (
      <View style={styles.container}>
        <Text style={styles.celebrationEmoji}>💙</Text>
        <Text style={styles.celebrationText}>{t('patientApp.stim.common.thankYouSharing')}</Text>
        <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.8}>
          <Text style={styles.doneButtonText}>{t('common.done')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        <Text style={styles.emoji}>📅</Text>
        <Text style={styles.dateLabel}>
          {t('patientApp.stim.history.onThisDay', { year: data.year })}
        </Text>

        <View style={styles.factCard}>
          <Text style={styles.factText}>{t(data.factKey)}</Text>
        </View>

        <Text style={styles.followUpQuestion}>{t(data.followUpKey)}</Text>

        <TextInput
          style={styles.textInput}
          value={response}
          onChangeText={setResponse}
          placeholder={t('patientApp.stim.history.typeThoughts')}
          placeholderTextColor={COLORS.textMuted}
          multiline
          maxLength={500}
        />

        <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.8}>
          <Text style={styles.shareButtonText}>
            {response.trim() ? t('patientApp.stim.common.imDone') : t('patientApp.stim.common.interesting')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>{t('common.skip')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 16 },
  emoji: { fontSize: 56, marginBottom: 12 },
  dateLabel: {
    fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.textSecondary, marginBottom: 16,
  },
  factCard: {
    backgroundColor: COLORS.socialBg, borderRadius: RADIUS['2xl'],
    padding: 24, borderWidth: 2, borderColor: COLORS.social, width: '100%', marginBottom: 24,
  },
  factText: {
    fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary,
    textAlign: 'center', lineHeight: 34,
  },
  followUpQuestion: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 30, marginBottom: 16,
  },
  textInput: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.lg, padding: 16,
    fontSize: 20, fontFamily: FONTS.body, color: COLORS.textPrimary,
    minHeight: 100, textAlignVertical: 'top', width: '100%', marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  shareButton: {
    backgroundColor: COLORS.brand600, paddingVertical: 16, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  shareButtonText: { fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  celebrationEmoji: { fontSize: 64, marginBottom: 16 },
  celebrationText: {
    fontSize: 24, fontFamily: FONTS.bodyMedium, color: COLORS.textPrimary,
    textAlign: 'center', lineHeight: 32, marginBottom: 24,
  },
  doneButton: {
    backgroundColor: COLORS.brand600, paddingVertical: 16, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  doneButtonText: { fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  skipButton: { marginTop: 24, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
