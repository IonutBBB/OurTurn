'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ARTICLES, ARTICLE_CATEGORIES } from '@ourturn/shared';
import type { ArticleDefinition, ArticleCategory } from '@ourturn/shared';

interface ArticleSectionProps {
  onSelectArticle: (article: ArticleDefinition) => void;
}

export function ArticleSection({ onSelectArticle }: ArticleSectionProps) {
  const { t } = useTranslation('resources');
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | 'all'>('all');

  const filteredArticles =
    selectedCategory === 'all'
      ? ARTICLES
      : ARTICLES.filter((a) => a.category === selectedCategory);

  const categories: Array<ArticleCategory | 'all'> = ['all', ...ARTICLE_CATEGORIES];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xs font-display font-medium uppercase tracking-widest text-text-muted">
          {t('articles.sectionTitle')}
        </h2>
        <p className="text-sm text-text-muted mt-1">{t('articles.sectionSubtitle')}</p>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                isActive
                  ? 'bg-brand-100 dark:bg-brand-900/30 border-brand-600 text-brand-700 dark:text-brand-400'
                  : 'bg-surface-card border-surface-border text-text-secondary hover:text-text-primary hover:border-text-muted'
              }`}
            >
              {t(`articles.categories.${cat}`)}
            </button>
          );
        })}
      </div>

      {/* Article Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArticles.map((article) => (
          <button
            key={article.slug}
            onClick={() => onSelectArticle(article)}
            className="text-left card-paper p-5 space-y-2 hover:shadow-md transition-shadow"
          >
            <span className="text-3xl">{article.emoji}</span>
            <h3 className="text-sm font-semibold text-text-primary line-clamp-2">{t(article.titleKey)}</h3>
            <p className="text-xs text-text-secondary line-clamp-2">{t(article.summaryKey)}</p>
            <p className="text-xs text-text-muted">
              {t('articles.readingTime', { minutes: article.readingTimeMinutes })}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
