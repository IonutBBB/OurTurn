'use client';

import { useTranslation } from 'react-i18next';

export function NeedSupport() {
  const { t } = useTranslation();

  return (
    <div className="card-paper p-5">
      <h3 className="text-sm font-display font-bold text-text-primary mb-2">
        {t('caregiverApp.toolkit.needSupport.title')}
      </h3>
      <p className="text-xs text-text-secondary mb-3 leading-relaxed">
        {t('caregiverApp.toolkit.needSupport.description')}
      </p>

      <div className="space-y-2">
        <a
          href="tel:+18002723900"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-elevated hover:bg-surface-border/40 transition-colors"
        >
          <span className="text-sm">📞</span>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-text-primary">
              {t('caregiverApp.toolkit.needSupport.alzHelpline')}
            </span>
            <p className="text-xs text-brand-600 dark:text-brand-400">1-800-272-3900</p>
          </div>
          <span className="text-xs font-medium text-brand-600 dark:text-brand-400">
            {t('caregiverApp.toolkit.needSupport.callNow')}
          </span>
        </a>

        <a
          href="https://www.alz.org/help-support/caregiving"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-elevated hover:bg-surface-border/40 transition-colors"
        >
          <span className="text-sm">🌐</span>
          <span className="text-sm text-brand-600 dark:text-brand-400">
            {t('caregiverApp.toolkit.needSupport.onlineResources')}
          </span>
        </a>
      </div>

      <p className="text-[10px] text-text-muted mt-3 leading-relaxed">
        {t('caregiverApp.toolkit.needSupport.disclaimer')}
      </p>
    </div>
  );
}
