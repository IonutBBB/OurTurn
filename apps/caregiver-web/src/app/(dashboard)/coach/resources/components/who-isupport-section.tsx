'use client';

import { useTranslation } from 'react-i18next';
import { WHO_ISUPPORT_ARTICLE } from '@ourturn/shared';
import type { ArticleDefinition } from '@ourturn/shared';

interface WhoIsupportSectionProps {
  onSelectArticle: (article: ArticleDefinition) => void;
}

export function WhoIsupportSection({ onSelectArticle }: WhoIsupportSectionProps) {
  const { t } = useTranslation('resources');

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xs font-display font-medium uppercase tracking-widest text-text-muted">
          {t('whoIsupport.sectionTitle')}
        </h2>
        <p className="text-sm text-text-muted mt-1">{t('whoIsupport.sectionSubtitle')}</p>
      </div>

      <button
        onClick={() => onSelectArticle(WHO_ISUPPORT_ARTICLE)}
        className="w-full text-left card-paper p-6 hover:shadow-md transition-shadow space-y-3"
      >
        <div className="flex items-start gap-4">
          <span className="text-4xl shrink-0">{WHO_ISUPPORT_ARTICLE.emoji}</span>
          <div className="space-y-2 min-w-0">
            <h3 className="text-base font-display font-bold text-text-primary">
              {t(WHO_ISUPPORT_ARTICLE.titleKey)}
            </h3>
            <p className="text-xs font-medium text-brand-600 dark:text-brand-400">
              {t('whoIsupport.whoExplanation')}
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              {t(WHO_ISUPPORT_ARTICLE.summaryKey)}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-text-muted">
                {t('articles.readingTime', { minutes: WHO_ISUPPORT_ARTICLE.readingTimeMinutes })}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400">
                {t('whoIsupport.badge')}
              </span>
            </div>
          </div>
        </div>
      </button>
    </section>
  );
}
