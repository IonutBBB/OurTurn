import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../src/stores/auth-store';
import { grantConsent } from '@ourturn/supabase';
import type { ConsentType } from '@ourturn/shared';
import { COLORS, FONTS, RADIUS } from '../../src/theme';

const CONSENT_TOPICS: { type: ConsentType; icon: string; key: string }[] = [
  { type: 'location_tracking', icon: '📍', key: 'locationTracking' },
  { type: 'data_collection', icon: '📊', key: 'dataCollection' },
  { type: 'push_notifications', icon: '🔔', key: 'pushNotifications' },
  { type: 'data_sharing_caregivers', icon: '👨‍👩‍👧', key: 'dataSharing' },
  { type: 'voice_recording', icon: '🎤', key: 'voiceRecording' },
];

export default function ConsentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentTopic = CONSENT_TOPICS[currentIndex];
  const isLast = currentIndex === CONSENT_TOPICS.length - 1;

  const handleResponse = async (granted: boolean) => {
    if (isSubmitting || !session?.householdId) return;
    setIsSubmitting(true);

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await grantConsent({
        household_id: session.householdId,
        granted_by_type: 'patient',
        consent_type: currentTopic.type,
        granted,
      });
    } catch {
      // Best effort — continue even if save fails
    }

    if (isLast) {
      router.replace('/(tabs)/today');
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
    setIsSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          {CONSENT_TOPICS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i <= currentIndex && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        {/* Icon */}
        <Text style={styles.icon}>{currentTopic.icon}</Text>

        {/* Title */}
        <Text style={styles.title}>
          {t(`patientApp.consent.${currentTopic.key}.title`)}
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          {t(`patientApp.consent.${currentTopic.key}.description`)}
        </Text>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.yesButton}
            onPress={() => handleResponse(true)}
            disabled={isSubmitting}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('patientApp.consent.yes')}
          >
            <Text style={styles.yesButtonText}>{t('patientApp.consent.yes')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.noButton}
            onPress={() => handleResponse(false)}
            disabled={isSubmitting}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('patientApp.consent.no')}
          >
            <Text style={styles.noButtonText}>{t('patientApp.consent.no')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 48,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },
  progressDotActive: {
    backgroundColor: COLORS.brand600,
  },
  icon: {
    fontSize: 72,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 22,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 32,
  },
  buttons: {
    width: '100%',
    gap: 16,
  },
  yesButton: {
    backgroundColor: COLORS.success,
    borderRadius: RADIUS['2xl'],
    paddingVertical: 20,
    alignItems: 'center',
    minHeight: 64,
  },
  yesButtonText: {
    fontSize: 24,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textInverse,
  },
  noButton: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADIUS['2xl'],
    paddingVertical: 20,
    alignItems: 'center',
    minHeight: 64,
    borderWidth: 2,
    borderColor: COLORS.danger,
  },
  noButtonText: {
    fontSize: 24,
    fontFamily: FONTS.bodyBold,
    color: COLORS.danger,
  },
});
