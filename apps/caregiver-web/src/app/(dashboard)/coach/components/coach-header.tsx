'use client';

import { useTranslation } from 'react-i18next';

interface CoachHeaderProps {
  patientName?: string;
}

export function CoachHeader({ patientName }: CoachHeaderProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="heading-display text-2xl">
        <span className="heading-accent">{t('caregiverApp.coach.pageTitle')}</span>
      </h1>
      <p className="text-text-secondary text-sm mt-1">
        {patientName
          ? t('caregiverApp.coach.pageSubtitle', { name: patientName })
          : t('caregiverApp.coach.pageSubtitleGeneric')}
      </p>
    </div>
  );
}
