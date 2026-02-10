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
      // Copy failed silently
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
        <h3 className="text-xl font-semibold font-display text-text-primary mb-2">
          {t('caregiverApp.onboarding.allSet')}
        </h3>
        <p className="text-text-secondary">
          {t('caregiverApp.onboarding.careCodeInstructions')}
        </p>
      </div>

      {/* Care Code display */}
      <div className="bg-brand-50 dark:bg-brand-900/30 border-2 border-brand-200 dark:border-brand-700 rounded-[20px] p-8">
        <p className="text-sm font-medium text-brand-700 dark:text-brand-300 mb-2 uppercase tracking-wide">
          {t('caregiverApp.onboarding.careCodeLabel')}
        </p>
        <p className="text-5xl font-mono font-bold text-brand-700 dark:text-brand-300 tracking-[0.2em]">
          {formattedCode}
        </p>
      </div>

      {/* Copy button */}
      <button
        type="button"
        onClick={copyCode}
        className="btn-secondary inline-flex items-center gap-2"
      >
        {copied ? (
          <>
            <span className="text-status-success">✓</span>
            <span className="text-status-success">{t('caregiverApp.onboarding.copied')}</span>
          </>
        ) : (
          <>
            <span>📋</span>
            <span>{t('caregiverApp.onboarding.copyCode')}</span>
          </>
        )}
      </button>

      {/* Instructions */}
      <div className="text-left bg-surface-background rounded-2xl p-4 space-y-3">
        <h4 className="font-medium font-display text-text-primary">{t('caregiverApp.onboarding.nextSteps')}</h4>
        <ol className="space-y-2 text-sm text-text-secondary">
          <li className="flex gap-2">
            <span className="font-semibold text-brand-600">1.</span>
            {t('caregiverApp.onboarding.nextStep1', { name: data.patientName })}
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-brand-600">2.</span>
            {t('caregiverApp.onboarding.nextStep2')}
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-brand-600">3.</span>
            {t('caregiverApp.onboarding.nextStep3', { name: data.patientName })}
          </li>
        </ol>
      </div>
    </div>
  );
}
