import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { ThisDayContent } from '../../data/bundled-activities';

export default function ThisDayRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const [eventIndex, setEventIndex] = useState(0);
  const data = content as ThisDayContent;

  if (!data?.events?.length) return null;

  const event = data.events[eventIndex];
  const hasMore = eventIndex < data.events.length - 1;

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEventIndex((i) => i + 1);
  };

  const handleDone = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'this_day_in_history' });
  };

  // Display text — from API (raw text) or bundled (i18n key)
  const eventText = event.textKey ? t(event.textKey) : event.text;

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📅</Text>

      <View style={styles.yearBadge}>
        <Text style={styles.yearText}>
          {t('patientApp.stim.history.onThisDay', { year: event.year })}
        </Text>
      </View>

      <View style={styles.eventCard}>
        <Text style={styles.eventText}>{eventText}</Text>
      </View>

      <View style={styles.reflectionCard}>
        <Text style={styles.reflectionText}>{t(event.reflectionKey)}</Text>
      </View>

      {data.events.length > 1 && (
        <Text style={styles.indicator}>
          {eventIndex + 1} / {data.events.length}
        </Text>
      )}

      {hasMore ? (
        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.nextButtonText}>
            {t('patientApp.stim.history.nextEvent')}
          </Text>
        </TouchableOpacity>
      ) : (
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
  yearBadge: {
    backgroundColor: COLORS.socialBg, paddingVertical: 8, paddingHorizontal: 20,
    borderRadius: RADIUS.full, marginBottom: 20,
  },
  yearText: {
    fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.social,
  },
  eventCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS['2xl'],
    paddingVertical: 24, paddingHorizontal: 20, borderWidth: 1.5,
    borderColor: COLORS.border, marginBottom: 20, width: '100%',
  },
  eventText: {
    fontSize: 22, fontFamily: FONTS.body, color: COLORS.textPrimary,
    lineHeight: 32, textAlign: 'center',
  },
  reflectionCard: {
    backgroundColor: COLORS.socialBg, borderRadius: RADIUS.lg,
    paddingVertical: 16, paddingHorizontal: 20, borderWidth: 2,
    borderColor: COLORS.social, marginBottom: 24, width: '100%',
  },
  reflectionText: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.social, textAlign: 'center',
  },
  indicator: {
    fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted, marginBottom: 16,
  },
  nextButton: {
    backgroundColor: COLORS.brand600, paddingVertical: 18, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  nextButtonText: { fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  doneButton: {
    backgroundColor: COLORS.success, paddingVertical: 18, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  doneButtonText: { fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  skipButton: { marginTop: 24, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
