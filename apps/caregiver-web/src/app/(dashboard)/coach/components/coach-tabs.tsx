'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const TABS = [
  { href: '/coach', key: 'chat', icon: '🤖' },
  { href: '/coach/behaviours', key: 'behaviours', icon: '📋' },
  { href: '/coach/resources', key: 'resources', icon: '📚' },
] as const;

export function CoachTabs() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const isActive = (href: string) => {
    if (href === '/coach') {
      return pathname === '/coach';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav aria-label="Coach tabs" className="border-b border-surface-border">
      <div className="flex gap-1">
        {TABS.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                active
                  ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                  : 'border-transparent text-text-muted hover:text-text-secondary hover:border-surface-border'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{t(`caregiverApp.coach.tabs.${tab.key}`)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
