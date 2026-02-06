'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const breadcrumbMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/care-plan': 'Care Plan',
  '/location': 'Location',
  '/coach': 'AI Coach',
  '/family': 'Family',
  '/wellbeing': 'Wellbeing',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export function TopBar() {
  const pathname = usePathname();

  const currentPage = breadcrumbMap[pathname] || 'Dashboard';

  return (
    <div className="hidden lg:flex items-center px-10 py-3 border-b border-surface-border/50">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link href="/dashboard" className="text-text-muted hover:text-text-secondary transition-colors">
          Home
        </Link>
        <span className="text-text-muted">/</span>
        <span className="text-text-primary font-medium">{currentPage}</span>
      </nav>
    </div>
  );
}
