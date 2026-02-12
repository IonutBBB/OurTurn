'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from './theme-toggle';
import { Logo } from './logo';
import { createBrowserClient } from '@/lib/supabase';

const navItems = [
  { href: '/dashboard', icon: '📊', key: 'dashboard' },
  { href: '/care-plan', icon: '📋', key: 'carePlan' },
  { href: '/location', icon: '📍', key: 'location' },
  { href: '/coach', icon: '🤖', key: 'coach' },
  { href: '/crisis', icon: '🛡️', key: 'crisis' },
  { href: '/family', icon: '👨‍👩‍👧', key: 'family' },
  { href: '/wellbeing', icon: '🧰', key: 'toolkit' },
  { href: '/reports', icon: '📄', key: 'reports' },
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
          aria-label="OurTurn Care - Go to dashboard"
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
                  <span className={`text-lg transition-transform duration-200 ${!isActive ? 'group-hover:scale-110' : ''}`} aria-hidden="true">
                    {item.icon}
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
              Settings
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
          Sign out
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
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
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
