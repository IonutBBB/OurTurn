'use client';

import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import type { ArticleDefinition } from '@ourturn/shared';

interface ArticleDetailProps {
  article: ArticleDefinition;
  onClose: () => void;
}

export function ArticleDetail({ article, onClose }: ArticleDetailProps) {
  const { t } = useTranslation('resources');

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onClose}
        className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
      >
        &larr; {t('journey.backToResources')}
      </button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <span className="text-4xl">{article.emoji}</span>
        <div>
          <h2 className="text-xl font-display font-bold text-text-primary">{t(article.titleKey)}</h2>
          <p className="text-sm text-text-muted mt-1">
            {t('articles.readingTime', { minutes: article.readingTimeMinutes })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="card-paper p-6 lg:p-8">
        <div className="text-sm text-text-primary leading-relaxed">
          <Markdown
            components={{
              h1: ({ children }) => <h1 className="text-xl font-bold font-display text-text-primary mt-6 mb-3 first:mt-0">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-semibold font-display text-text-primary mt-5 mb-2 first:mt-0">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-semibold font-display text-text-primary mt-4 mb-2 first:mt-0">{children}</h3>,
              h4: ({ children }) => <h4 className="text-sm font-semibold text-text-primary mt-3 mb-1.5">{children}</h4>,
              p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-outside pl-5 mb-3 space-y-1.5">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-outside pl-5 mb-3 space-y-1.5">{children}</ol>,
              li: ({ children }) => <li className="pl-0.5">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              hr: () => <hr className="my-4 border-surface-border" />,
              blockquote: ({ children }) => <blockquote className="border-l-4 border-brand-300 pl-4 my-3 text-text-muted italic">{children}</blockquote>,
            }}
          >
            {t(article.contentKey)}
          </Markdown>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-text-muted italic">{t('articles.disclaimer')}</p>
    </div>
  );
}
