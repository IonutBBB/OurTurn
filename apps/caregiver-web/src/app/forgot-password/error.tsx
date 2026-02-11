'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Forgot password error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-surface-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-status-danger-bg flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold font-display text-text-primary mb-3">
          {t('common.somethingWentWrong')}
        </h1>
        <p className="text-text-secondary mb-8">
          {t('common.unexpectedError')}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            {t('common.tryAgain')}
          </button>
          <a href="/login" className="px-4 py-2 border border-surface-border rounded-2xl text-text-secondary hover:bg-brand-50 dark:hover:bg-surface-elevated transition-colors">
            {t('caregiverApp.auth.backToLogin')}
          </a>
        </div>
      </div>
    </div>
  );
}
