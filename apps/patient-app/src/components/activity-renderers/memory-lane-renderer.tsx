import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { MemoryLaneContent } from '../../data/bundled-activities';

export default function MemoryLaneRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as MemoryLaneContent;

  if (!data) return null;

  const handleDone = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'memory_lane' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{data.emoji}</Text>
      <Text style={styles.decade}>{t(data.decadeKey)}</Text>

      <View style={styles.sceneCard}>
        <Text style={styles.description}>{t(data.descriptionKey)}</Text>
      </View>

      <View style={styles.promptCard}>
        <Text style={styles.promptText}>{t(data.promptKey)}</Text>
      </View>

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
  emoji: { fontSize: 64, marginBottom: 16 },
  decade: {
    fontSize: 24, fontFamily: FONTS.display, color: COLORS.social,
    marginBottom: 20,
  },
  sceneCard: {
    backgroundColor: COLORS.socialBg, borderRadius: RADIUS['2xl'],
    paddingVertical: 24, paddingHorizontal: 20, borderWidth: 2,
    borderColor: COLORS.social, marginBottom: 20, width: '100%',
  },
  description: {
    fontSize: 22, fontFamily: FONTS.body, color: COLORS.textPrimary,
    lineHeight: 32, textAlign: 'center',
  },
  promptCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    paddingVertical: 16, paddingHorizontal: 20, borderWidth: 1.5,
    borderColor: COLORS.border, marginBottom: 32, width: '100%',
  },
  promptText: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.brand600, textAlign: 'center',
  },
  doneButton: {
    backgroundColor: COLORS.success, paddingVertical: 18, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  doneButtonText: { fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  skipButton: { marginTop: 24, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
