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
    <div className="hidden lg:flex items-center justify-between px-10 py-3 border-b border-surface-border/50">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link href="/dashboard" className="text-text-muted hover:text-text-secondary transition-colors">
          Home
        </Link>
        <span className="text-text-muted">/</span>
        <span className="text-text-primary font-medium">{currentPage}</span>
      </nav>

      {/* Notification bell */}
      <button
        className="relative p-2 rounded-xl hover:bg-brand-50 dark:hover:bg-surface-elevated transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>
    </div>
  );
}
