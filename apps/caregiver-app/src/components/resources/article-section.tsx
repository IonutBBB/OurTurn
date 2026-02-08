import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ARTICLES, ARTICLE_CATEGORIES } from '@ourturn/shared';
import type { ArticleDefinition, ArticleCategory } from '@ourturn/shared';
import { ArticleCard } from './article-card';
import { createThemedStyles, FONTS, RADIUS, SPACING } from '../../theme';

interface ArticleSectionProps {
  onSelectArticle: (article: ArticleDefinition) => void;
}

export function ArticleSection({ onSelectArticle }: ArticleSectionProps) {
  const { t } = useTranslation('resources');
  const styles = useStyles();
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | 'all'>('all');

  const filteredArticles =
    selectedCategory === 'all'
      ? ARTICLES
      : ARTICLES.filter((a) => a.category === selectedCategory);

  const categories: Array<ArticleCategory | 'all'> = ['all', ...ARTICLE_CATEGORIES];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>{t('articles.sectionTitle')}</Text>
      <Text style={styles.sectionSubLabel}>{t('articles.sectionSubtitle')}</Text>

      {/* Category Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {t(`articles.categories.${cat}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Article Grid */}
      <View style={styles.grid}>
        {filteredArticles.map((article) => (
          <ArticleCard
            key={article.slug}
            article={article}
            onPress={() => onSelectArticle(article)}
          />
        ))}
      </View>
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
  chips: {
    gap: SPACING[2],
    paddingVertical: SPACING[1],
  },
  chip: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: {
    backgroundColor: colors.brand100,
    borderColor: colors.brand600,
  },
  chipText: {
    fontSize: 13,
    fontFamily: FONTS.bodyMedium,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.brand700,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
  },
}));
