import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ArticleDefinition } from '@ourturn/shared';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../../theme';

interface ArticleCardProps {
  article: ArticleDefinition;
  onPress: () => void;
}

export function ArticleCard({ article, onPress }: ArticleCardProps) {
  const { t } = useTranslation('resources');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.emoji}>{article.emoji}</Text>
      <Text style={styles.title} numberOfLines={2}>
        {t(article.titleKey)}
      </Text>
      <Text style={styles.summary} numberOfLines={2}>
        {t(article.summaryKey)}
      </Text>
      <Text style={styles.readingTime}>
        {t('articles.readingTime', { minutes: article.readingTimeMinutes })}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING[4],
    gap: SPACING[1],
    ...SHADOWS.sm,
  },
  emoji: {
    fontSize: 28,
    marginBottom: SPACING[1],
  },
  title: {
    fontSize: 15,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  summary: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  readingTime: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: SPACING[1],
  },
});
