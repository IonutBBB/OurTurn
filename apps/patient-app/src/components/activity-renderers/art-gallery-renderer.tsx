import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { ArtGalleryContent } from '../../data/bundled-activities';

export default function ArtGalleryRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const [reflectionIndex, setReflectionIndex] = useState(0);
  const data = content as ArtGalleryContent;

  if (!data) return null;

  const handleNextReflection = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (reflectionIndex < data.reflectionKeys.length - 1) {
      setReflectionIndex((i) => i + 1);
    } else {
      onComplete({ activity: 'art_gallery' });
    }
  };

  return (
    <View style={styles.container}>
      {data.imageUrl ? (
        <Image source={{ uri: data.imageUrl }} style={styles.artwork} resizeMode="contain" />
      ) : (
        <View style={styles.artworkPlaceholder}>
          <Text style={styles.placeholderEmoji}>🖼️</Text>
        </View>
      )}

      <Text style={styles.artTitle}>{data.title}</Text>
      <Text style={styles.artArtist}>{data.artist}{data.year ? `, ${data.year}` : ''}</Text>

      {data.descriptionKey && (
        <Text style={styles.description}>{t(data.descriptionKey)}</Text>
      )}

      <View style={styles.reflectionCard}>
        <Text style={styles.reflectionText}>
          {t(data.reflectionKeys[reflectionIndex])}
        </Text>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNextReflection} activeOpacity={0.8}>
        <Text style={styles.nextButtonText}>
          {reflectionIndex < data.reflectionKeys.length - 1
            ? t('patientApp.stim.artGallery.nextReflection')
            : t('patientApp.stim.common.imDone')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.7}>
        <Text style={styles.skipText}>{t('common.skip')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 8 },
  artwork: { width: '100%', height: 280, borderRadius: RADIUS.lg, marginBottom: 16, backgroundColor: COLORS.border },
  artworkPlaceholder: {
    width: '100%', height: 200, borderRadius: RADIUS.lg, marginBottom: 16,
    backgroundColor: COLORS.nutritionBg, justifyContent: 'center', alignItems: 'center',
  },
  placeholderEmoji: { fontSize: 64 },
  artTitle: {
    fontSize: 24, fontFamily: FONTS.display, color: COLORS.textPrimary,
    textAlign: 'center', marginBottom: 4,
  },
  artArtist: {
    fontSize: 20, fontFamily: FONTS.body, color: COLORS.textSecondary,
    textAlign: 'center', marginBottom: 12,
  },
  description: {
    fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted,
    textAlign: 'center', lineHeight: 28, marginBottom: 20, paddingHorizontal: 8,
  },
  reflectionCard: {
    backgroundColor: COLORS.nutritionBg, borderRadius: RADIUS['2xl'],
    paddingVertical: 20, paddingHorizontal: 24, borderWidth: 2,
    borderColor: COLORS.nutrition, marginBottom: 24, width: '100%',
  },
  reflectionText: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.nutrition,
    textAlign: 'center', lineHeight: 30,
  },
  nextButton: {
    backgroundColor: COLORS.brand600, paddingVertical: 18, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  nextButtonText: { fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  skipButton: { marginTop: 24, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
