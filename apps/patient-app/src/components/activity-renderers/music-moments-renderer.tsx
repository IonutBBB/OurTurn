import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { MusicMomentsContent } from '../../data/bundled-activities';

export default function MusicMomentsRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as MusicMomentsContent;

  if (!data) return null;

  const handleDone = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({ activity: 'music_moments' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎵</Text>

      <View style={styles.pieceCard}>
        <Text style={styles.pieceTitle}>{t(data.titleKey)}</Text>
        <Text style={styles.composer}>{t(data.composerKey)}</Text>
        <Text style={styles.era}>{t(data.eraKey)}</Text>
      </View>

      <Text style={styles.instruction}>
        {t('patientApp.stim.musicMoments.instruction')}
      </Text>

      {data.promptKeys.map((key, i) => (
        <View key={i} style={styles.promptCard}>
          <Text style={styles.promptText}>{t(key)}</Text>
        </View>
      ))}

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
  emoji: { fontSize: 56, marginBottom: 16 },
  pieceCard: {
    backgroundColor: COLORS.infoBg, borderRadius: RADIUS['2xl'],
    paddingVertical: 24, paddingHorizontal: 24, borderWidth: 2,
    borderColor: COLORS.info, marginBottom: 24, width: '100%', alignItems: 'center',
  },
  pieceTitle: {
    fontSize: 26, fontFamily: FONTS.display, color: COLORS.info, textAlign: 'center',
  },
  composer: {
    fontSize: 22, fontFamily: FONTS.body, color: COLORS.textSecondary,
    marginTop: 4, textAlign: 'center',
  },
  era: {
    fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted,
    marginTop: 4, textAlign: 'center',
  },
  instruction: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary,
    textAlign: 'center', marginBottom: 20, lineHeight: 30,
  },
  promptCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    paddingVertical: 12, paddingHorizontal: 20, borderWidth: 1,
    borderColor: COLORS.border, marginBottom: 12, width: '100%',
  },
  promptText: {
    fontSize: 20, fontFamily: FONTS.body, color: COLORS.textPrimary, textAlign: 'center',
  },
  doneButton: {
    backgroundColor: COLORS.success, paddingVertical: 18, paddingHorizontal: 48,
    borderRadius: RADIUS.lg, marginTop: 12,
  },
  doneButtonText: { fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  skipButton: { marginTop: 24, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
