'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { OnboardingData } from '../page';

interface Props {
  data: OnboardingData;
}

export function Step6CareCode({ data }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(data.careCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Format code with space in middle (123 456)
  const formattedCode = data.careCode
    ? `${data.careCode.slice(0, 3)} ${data.careCode.slice(3)}`
    : '--- ---';

  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 mx-auto bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center">
        <span className="text-4xl">🎉</span>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          You&apos;re all set!
        </h3>
        <p className="text-text-secondary">
          {t('caregiverApp.onboarding.careCodeInstructions')}
        </p>
      </div>

      {/* Care Code display */}
      <div className="bg-brand-50 dark:bg-brand-900/30 border-2 border-brand-200 dark:border-brand-700 rounded-xl p-8">
        <p className="text-sm font-medium text-brand-700 dark:text-brand-300 mb-2 uppercase tracking-wide">
          Care Code
        </p>
        <p className="text-5xl font-mono font-bold text-brand-700 dark:text-brand-300 tracking-[0.2em]">
          {formattedCode}
        </p>
      </div>

      {/* Copy button */}
      <button
        type="button"
        onClick={copyCode}
        className="inline-flex items-center gap-2 px-6 py-3 border border-surface-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-text-primary"
      >
        {copied ? (
          <>
            <span className="text-green-600">✓</span>
            <span className="text-green-600">Copied!</span>
          </>
        ) : (
          <>
            <span>📋</span>
            <span>{t('caregiverApp.onboarding.copyCode')}</span>
          </>
        )}
      </button>

      {/* Instructions */}
      <div className="text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-text-primary">Next steps:</h4>
        <ol className="space-y-2 text-sm text-text-secondary">
          <li className="flex gap-2">
            <span className="font-semibold text-brand-600">1.</span>
            Install MemoGuard on {data.patientName}&apos;s phone (iOS or Android)
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-brand-600">2.</span>
            Open the app and enter the Care Code above
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-brand-600">3.</span>
            That&apos;s it! {data.patientName}&apos;s daily plan will appear on their phone
          </li>
        </ol>
      </div>
    </div>
  );
}
