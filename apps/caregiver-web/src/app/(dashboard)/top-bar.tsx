'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const breadcrumbKeys: Record<string, string> = {
  '/dashboard': 'caregiverApp.nav.dashboard',
  '/care-plan': 'caregiverApp.nav.carePlan',
  '/location': 'caregiverApp.nav.location',
  '/coach': 'caregiverApp.nav.coach',
  '/family': 'caregiverApp.nav.family',
  '/wellbeing': 'caregiverApp.nav.toolkit',
  '/reports': 'caregiverApp.nav.reports',
  '/settings': 'caregiverApp.nav.settings',
};

export function TopBar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const key = breadcrumbKeys[pathname];
  const currentPage = key ? t(key) : t('caregiverApp.nav.dashboard');

  return (
    <div className="hidden lg:flex items-center px-10 py-3 border-b border-surface-border/50">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link href="/dashboard" className="text-text-muted hover:text-text-secondary transition-colors">
          {t('common.home')}
        </Link>
        <span className="text-text-muted">/</span>
        <span className="text-text-primary font-medium">{currentPage}</span>
      </nav>
    </div>
  );
}
