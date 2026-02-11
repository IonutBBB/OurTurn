'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const breadcrumbKeyMap: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/care-plan': 'carePlan',
  '/location': 'location',
  '/coach': 'coach',
  '/family': 'family',
  '/wellbeing': 'toolkit',
  '/reports': 'reports',
  '/settings': 'settings',
};

export function TopBar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navKey = breadcrumbKeyMap[pathname] || 'dashboard';
  const currentPage = t(`caregiverApp.nav.${navKey}`);

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
