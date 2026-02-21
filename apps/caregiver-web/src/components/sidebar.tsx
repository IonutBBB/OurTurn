'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from './theme-toggle';
import { Logo } from './logo';
import { createBrowserClient } from '@/lib/supabase';

function NavIcon({ name, className }: { name: string; className?: string }) {
  const cls = className || 'w-5 h-5';
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    clipboard: <><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></>,
    location: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></>,
    chat: <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    people: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></>,
    heart: <><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></>,
    document: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>,
  };
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

const navItems = [
  { href: '/dashboard', icon: 'grid', key: 'dashboard' },
  { href: '/care-plan', icon: 'clipboard', key: 'carePlan' },
  { href: '/location', icon: 'location', key: 'location' },
  { href: '/coach', icon: 'chat', key: 'coach' },
  { href: '/crisis', icon: 'shield', key: 'crisis' },
  { href: '/family', icon: 'people', key: 'family' },
  { href: '/wellbeing', icon: 'heart', key: 'toolkit' },
  { href: '/reports', icon: 'document', key: 'reports' },
];

interface SidebarProps {
  userName: string;
  userEmail: string;
}

export function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const sidebarContent = (
    <>
      {/* Logo area */}
      <div className="px-5 pt-6 pb-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 rounded-lg"
          aria-label={t('common.goToDashboardLabel')}
          onClick={() => setMobileOpen(false)}
        >
          <div className="group-hover:scale-105 transition-transform">
            <Logo className="w-9 h-9 shadow-sm group-hover:shadow-md transition-shadow rounded-xl" />
          </div>
          <span className="text-lg font-display font-bold text-brand-700 dark:text-brand-600">
            OurTurn Care
          </span>
        </Link>
      </div>

      <div className="divider-wavy mx-5 mb-2" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Primary">
        <ul className="space-y-1" role="list">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const label = t(`caregiverApp.nav.${item.key}`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`sidebar-nav-item focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={label}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className={`transition-transform duration-200 ${!isActive ? 'group-hover:scale-110' : ''}`} aria-hidden="true">
                    <NavIcon name={item.icon} className="w-5 h-5" />
                  </span>
                  <span className="flex-1">{label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Theme toggle */}
      <div className="px-4 py-2">
        <ThemeToggle />
      </div>

      {/* User section */}
      <div className="p-4 border-t border-surface-border">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-brand-50 dark:hover:bg-brand-50/10 transition-all group focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
          aria-label={`${userName} - View profile and settings`}
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow"
            aria-hidden="true"
          >
            <span className="text-white text-sm font-semibold font-display">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{userName}</p>
            <p className="text-xs text-text-muted truncate group-hover:text-brand-600 transition-colors">
              {t('common.settings')}
            </p>
          </div>
          <svg
            className="w-4 h-4 text-text-muted group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full mt-1 px-3 py-1.5 text-xs text-status-danger hover:bg-status-danger-bg rounded-xl transition-colors text-left focus:outline-none focus:ring-2 focus:ring-status-danger focus:ring-offset-2"
        >
          {t('common.signOut')}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 rounded-xl bg-surface-card border border-surface-border shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? t('common.closeMenu') : t('common.openMenu')}
      >
        {mobileOpen ? (
          <svg className="w-6 h-6 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar (always visible on lg+) */}
      <aside
        className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-surface-border bg-surface-card/95 dark:bg-surface-card/95 backdrop-blur-xl transition-colors duration-200"
        role="navigation"
        aria-label="Main navigation"
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar (slide-in) */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-surface-border bg-surface-card/95 dark:bg-surface-card/95 backdrop-blur-xl transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        {sidebarContent}
      </aside>
    </>
  );
}
