'use client';

import { useEffect } from 'react';

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Onboarding error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-surface-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-status-danger-bg flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold font-display text-text-primary mb-3">
          Something went wrong
        </h1>
        <p className="text-text-secondary mb-8">
          An error occurred during onboarding. Your progress has been saved — please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            Try again
          </button>
          <a href="/dashboard" className="px-4 py-2 border border-surface-border rounded-2xl text-text-secondary hover:bg-brand-50 dark:hover:bg-surface-elevated transition-colors">
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
