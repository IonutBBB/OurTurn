'use client';

import { useTranslation } from 'react-i18next';

interface BurnoutBannerProps {
  visible: boolean;
}

export function BurnoutBanner({ visible }: BurnoutBannerProps) {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <div className="bg-status-amber-bg border border-status-amber/30 rounded-[20px] p-5 flex items-start gap-4">
      <span className="text-2xl flex-shrink-0">💛</span>
      <div className="flex-1">
        <h3 className="font-semibold text-status-amber mb-1">
          {t('caregiverApp.toolkit.burnout.title')}
        </h3>
        <p className="text-sm text-text-secondary">
          {t('caregiverApp.toolkit.burnout.message')}
        </p>
        <div className="flex gap-3 mt-3">
          <a href="/coach" className="btn-primary text-sm px-4 py-2">
            {t('caregiverApp.toolkit.burnout.talkToCoach')}
          </a>
          <a href="/crisis" className="btn-secondary text-sm px-4 py-2">
            {t('caregiverApp.toolkit.burnout.viewResources')}
          </a>
        </div>
      </div>
    </div>
  );
}
