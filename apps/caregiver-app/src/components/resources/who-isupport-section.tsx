import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WHO_ISUPPORT_ARTICLE } from '@ourturn/shared';
import type { ArticleDefinition } from '@ourturn/shared';
import { createThemedStyles, FONTS, RADIUS, SHADOWS, SPACING } from '../../theme';

interface WhoIsupportSectionProps {
  onSelectArticle: (article: ArticleDefinition) => void;
}

export function WhoIsupportSection({ onSelectArticle }: WhoIsupportSectionProps) {
  const { t } = useTranslation('resources');
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>{t('whoIsupport.sectionTitle')}</Text>
      <Text style={styles.sectionSubLabel}>{t('whoIsupport.sectionSubtitle')}</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => onSelectArticle(WHO_ISUPPORT_ARTICLE)}
        activeOpacity={0.7}
      >
        <View style={styles.row}>
          <Text style={styles.emoji}>{WHO_ISUPPORT_ARTICLE.emoji}</Text>
          <View style={styles.content}>
            <Text style={styles.title}>{t(WHO_ISUPPORT_ARTICLE.titleKey)}</Text>
            <Text style={styles.whoExplanation}>{t('whoIsupport.whoExplanation')}</Text>
            <Text style={styles.summary} numberOfLines={3}>
              {t(WHO_ISUPPORT_ARTICLE.summaryKey)}
            </Text>
            <View style={styles.meta}>
              <Text style={styles.readingTime}>
                {t('articles.readingTime', { minutes: WHO_ISUPPORT_ARTICLE.readingTimeMinutes })}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{t('whoIsupport.badge')}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const useStyles = createThemedStyles((colors) => ({
  container: {
    gap: SPACING[3],
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: FONTS.displayMedium,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: colors.textMuted,
  },
  sectionSubLabel: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    marginBottom: SPACING[1],
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: RADIUS.md,
    padding: SPACING[4],
    ...SHADOWS.sm,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  emoji: {
    fontSize: 36,
  },
  content: {
    flex: 1,
    gap: SPACING[2],
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.displayBold,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  whoExplanation: {
    fontSize: 12,
    fontFamily: FONTS.bodyMedium,
    fontWeight: '500',
    color: colors.brand600,
  },
  summary: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    marginTop: SPACING[1],
  },
  readingTime: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: colors.textMuted,
  },
  badge: {
    paddingHorizontal: SPACING[3],
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    backgroundColor: colors.brand100,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: FONTS.bodyMedium,
    fontWeight: '500',
    color: colors.brand700,
  },
}));
