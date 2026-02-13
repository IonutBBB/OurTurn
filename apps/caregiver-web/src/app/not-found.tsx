'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-surface-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-brand-100/60 dark:bg-brand-100/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔍</span>
        </div>
        <h1 className="text-3xl font-bold font-display text-text-primary mb-3">
          {t('common.pageNotFound')}
        </h1>
        <p className="text-text-secondary mb-8">
          {t('common.pageNotFoundDesc')}
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard" className="btn-primary">
            {t('common.goToDashboard')}
          </Link>
          <Link href="/" className="btn-secondary">
            {t('common.home')}
          </Link>
        </div>
      </div>
    </div>
  );
}
