import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { DailyReflectionContent } from '../../data/bundled-activities';

export default function DailyReflectionRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const [response, setResponse] = useState('');
  const [shared, setShared] = useState(false);
  const data = content as DailyReflectionContent;

  if (!data) return null;

  const handleShare = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShared(true);
    setTimeout(() => {
      onComplete({ response, activity: 'daily_reflection' });
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💭</Text>
      <Text style={styles.prompt}>{t(data.promptKey)}</Text>

      {!shared ? (
        <>
          <TextInput
            style={styles.input}
            placeholder={t('patientApp.stim.dailyReflection.placeholder')}
            placeholderTextColor={COLORS.textMuted}
            value={response}
            onChangeText={setResponse}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.shareButton, !response.trim() && styles.shareButtonDisabled]}
            onPress={handleShare}
            activeOpacity={0.8}
            disabled={!response.trim()}
          >
            <Text style={styles.shareButtonText}>
              {t('patientApp.stim.dailyReflection.share')}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.affirmation}>
          <Text style={styles.affirmationText}>{t(data.affirmationKey)}</Text>
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
  prompt: {
    fontSize: 24, fontFamily: FONTS.display, color: COLORS.textPrimary,
    textAlign: 'center', lineHeight: 34, marginBottom: 24, paddingHorizontal: 8,
  },
  input: {
    width: '100%', minHeight: 120, backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.border,
    padding: 16, fontSize: 22, fontFamily: FONTS.body, color: COLORS.textPrimary,
    lineHeight: 30, marginBottom: 24,
  },
  shareButton: {
    backgroundColor: COLORS.brand600, paddingVertical: 18, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  shareButtonDisabled: { opacity: 0.5 },
  shareButtonText: { fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  affirmation: {
    backgroundColor: COLORS.successBg, borderRadius: RADIUS['2xl'],
    paddingVertical: 24, paddingHorizontal: 32, borderWidth: 2,
    borderColor: COLORS.success,
  },
  affirmationText: {
    fontSize: 24, fontFamily: FONTS.display, color: COLORS.success, textAlign: 'center',
  },
  skipButton: { marginTop: 24, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
