'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function CrisisError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error('Crisis error:', error);
  }, [error]);

  return (
    <div className="card-paper p-8 text-center my-8">
      <span className="text-4xl mb-4 block">⚠️</span>
      <h2 className="text-lg font-display font-bold text-text-primary mb-2">
        {t('common.somethingWentWrong')}
      </h2>
      <p className="text-sm text-text-muted mb-4">
        {error.message || t('common.unexpectedErrorPage')}
      </p>
      <button
        onClick={reset}
        className="btn-primary px-4 py-2"
      >
        {t('common.tryAgain')}
      </button>
    </div>
  );
}
