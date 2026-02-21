import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { ThisDayInHistoryContent } from '../../data/bundled-activities';
import { useGameLabel } from '../../utils/game-translate';

export default function ThisDayInHistoryRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const gl = useGameLabel();
  const data = content as ThisDayInHistoryContent;
  const [eventIndex, setEventIndex] = useState(0);
  const [showDiscussion, setShowDiscussion] = useState(false);

  if (!data?.events?.length) return null;

  const totalEvents = data.events.length;
  const current = data.events[eventIndex];

  const handleLearnMore = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowDiscussion(true);
  }, []);

  const handleNext = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (eventIndex + 1 >= totalEvents) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete({ activity: 'this_day_in_history', eventsViewed: totalEvents });
    } else {
      setEventIndex((prev) => prev + 1);
      setShowDiscussion(false);
    }
  }, [eventIndex, totalEvents, onComplete]);

  const handleDone = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'this_day_in_history', eventsViewed: eventIndex + 1 });
  }, [onComplete, eventIndex]);

  return (
    <View style={styles.container}>
      <Text style={styles.monthLabel}>{t(data.monthKey)}</Text>

      <Text style={styles.progress}>
        {t('patientApp.stim.common.round', { current: eventIndex + 1, total: totalEvents })}
      </Text>

      <View style={styles.eventCard}>
        <View style={styles.yearBadge}>
          <Text style={styles.yearText}>{current.year}</Text>
        </View>
        <Text style={styles.eventEmoji}>{current.emoji}</Text>
        <Text style={styles.eventDescription}>{gl(current.description)}</Text>
      </View>

      {!showDiscussion ? (
        <TouchableOpacity style={styles.learnMoreButton} onPress={handleLearnMore} activeOpacity={0.8}>
          <Text style={styles.learnMoreText}>
            {t('patientApp.stim.thisDayInHistory.tellMeMore')}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.discussionCard}>
          {current.discussionKeys.map((key, i) => (
            <Text key={i} style={styles.discussionText}>{t(key)}</Text>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
        <Text style={styles.nextButtonText}>
          {eventIndex + 1 >= totalEvents
            ? t('patientApp.stim.common.imDone')
            : t('patientApp.stim.thisDayInHistory.nextEvent')}
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
  monthLabel: {
    fontSize: 26, fontFamily: FONTS.display, color: COLORS.amber,
    textAlign: 'center', marginBottom: 4,
  },
  progress: {
    fontSize: 20, fontFamily: FONTS.bodyMedium, color: COLORS.textMuted,
    textAlign: 'center', marginBottom: 16,
  },
  eventCard: {
    backgroundColor: COLORS.amberBg, borderRadius: RADIUS['2xl'],
    borderWidth: 2, borderColor: COLORS.amber, paddingVertical: 24,
    paddingHorizontal: 24, marginBottom: 20, width: '100%', alignItems: 'center',
  },
  yearBadge: {
    backgroundColor: COLORS.amber, borderRadius: RADIUS.lg,
    paddingVertical: 8, paddingHorizontal: 20, marginBottom: 12,
  },
  yearText: {
    fontSize: 24, fontFamily: FONTS.display, color: COLORS.textInverse,
  },
  eventEmoji: { fontSize: 48, marginBottom: 12 },
  eventDescription: {
    fontSize: 22, fontFamily: FONTS.body, color: COLORS.textPrimary,
    textAlign: 'center', lineHeight: 32,
  },
  learnMoreButton: {
    backgroundColor: COLORS.amber, paddingVertical: 16,
    paddingHorizontal: 36, borderRadius: RADIUS.lg, marginBottom: 16,
  },
  learnMoreText: {
    fontSize: 22, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse,
  },
  discussionCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS['2xl'],
    borderWidth: 2, borderColor: COLORS.border, paddingVertical: 20,
    paddingHorizontal: 24, marginBottom: 16, width: '100%', gap: 12,
  },
  discussionText: {
    fontSize: 22, fontFamily: FONTS.body, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 30,
  },
  nextButton: {
    backgroundColor: COLORS.amber, paddingVertical: 18,
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
