'use client';

import { useTranslation } from 'react-i18next';

export function CoachSetupPrompt() {
  const { t } = useTranslation();

  return (
    <div className="card-paper p-12 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-brand-100/60 dark:bg-brand-100/20 flex items-center justify-center mx-auto mb-5">
        <span className="text-3xl">{'\u{1F917}'}</span>
      </div>
      <h2 className="text-lg font-display font-bold text-text-primary mb-2">
        {t('caregiverApp.coach.completeSetupFirst')}
      </h2>
      <p className="text-sm text-text-secondary mb-6 leading-relaxed">
        {t('caregiverApp.coach.setupDesc')}
      </p>
      <a href="/onboarding" className="btn-primary inline-flex items-center">
        {t('caregiverApp.coach.startOnboarding')}
      </a>
    </div>
  );
}
