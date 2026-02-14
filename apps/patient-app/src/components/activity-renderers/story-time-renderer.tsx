import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { StoryContent } from '../../data/bundled-activities';

export default function StoryTimeRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const [pageIndex, setPageIndex] = useState(0);
  const data = content as StoryContent;

  if (!data) return null;

  const totalPages = data.paragraphKeys.length + 1; // paragraphs + discussion
  const isLastPage = pageIndex >= data.paragraphKeys.length;

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPageIndex((p) => p + 1);
  };

  const handleDone = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'story_time' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📖</Text>
      <Text style={styles.storyTitle}>{t(data.titleKey)}</Text>

      <View style={styles.storyCard}>
        {!isLastPage ? (
          <Text style={styles.paragraph}>{t(data.paragraphKeys[pageIndex])}</Text>
        ) : (
          <Text style={styles.discussion}>{t(data.discussionKey)}</Text>
        )}
      </View>

      <Text style={styles.pageIndicator}>
        {pageIndex + 1} / {totalPages}
      </Text>

      {!isLastPage ? (
        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.nextButtonText}>
            {t('patientApp.stim.storyTime.nextPage')}
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
  emoji: { fontSize: 56, marginBottom: 12 },
  storyTitle: {
    fontSize: 26, fontFamily: FONTS.display, color: COLORS.textPrimary,
    textAlign: 'center', marginBottom: 24,
  },
  storyCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS['2xl'],
    paddingVertical: 24, paddingHorizontal: 20, borderWidth: 1.5,
    borderColor: COLORS.border, marginBottom: 16, width: '100%',
  },
  paragraph: {
    fontSize: 22, fontFamily: FONTS.body, color: COLORS.textPrimary,
    lineHeight: 34, textAlign: 'left',
  },
  discussion: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.brand600,
    lineHeight: 32, textAlign: 'center',
  },
  pageIndicator: {
    fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted,
    marginBottom: 20,
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
