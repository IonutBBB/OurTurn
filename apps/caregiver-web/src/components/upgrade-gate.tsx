'use client';

import { useTranslation } from 'react-i18next';

interface UpgradeGateProps {
  feature: string;
  children: React.ReactNode;
  isLocked: boolean;
}

/**
 * Wraps a feature with a subscription upgrade prompt when the user is on the free tier.
 * If `isLocked` is false, renders children normally.
 * If `isLocked` is true, shows an overlay with upgrade messaging.
 */
export function UpgradeGate({ feature, children, isLocked }: UpgradeGateProps) {
  const { t } = useTranslation();

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-40 blur-[1px] select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="card-paper p-8 text-center max-w-md mx-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-brand-100/60 dark:bg-brand-100/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✨</span>
          </div>
          <h3 className="text-lg font-display font-bold text-text-primary mb-2">
            {t('subscription.upgradeTitle')}
          </h3>
          <p className="text-sm text-text-secondary mb-5">
            {t('subscription.upgradeFeature')}
          </p>
          <a href="/settings" className="btn-primary inline-flex items-center">
            {t('subscription.subscribe')}
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline upgrade banner shown when a limit is reached (e.g., task limit).
 */
export function UpgradeBanner({ message }: { message: string }) {
  const { t } = useTranslation();

  return (
    <div className="card-paper border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/20 p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-xl">✨</span>
        <p className="text-sm text-text-secondary">{message}</p>
      </div>
      <a href="/settings" className="btn-primary text-sm whitespace-nowrap">
        {t('subscription.subscribe')}
      </a>
    </div>
  );
}
