'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const navItems = [
  { href: '/dashboard', icon: '📊', key: 'dashboard' },
  { href: '/care-plan', icon: '📋', key: 'carePlan' },
  { href: '/location', icon: '📍', key: 'location' },
  { href: '/coach', icon: '🤖', key: 'coach' },
  { href: '/family', icon: '👨‍👩‍👧', key: 'family' },
  { href: '/wellbeing', icon: '💙', key: 'wellbeing' },
  { href: '/reports', icon: '📄', key: 'reports' },
];

interface SidebarProps {
  userName: string;
  userEmail: string;
}

export function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-surface-border/50 flex flex-col"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-surface-border/50">
        <Link
          href="/dashboard"
          className="text-xl font-bold bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 rounded"
          aria-label="MemoGuard - Go to dashboard"
        >
          MemoGuard
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5" aria-label="Primary">
        <ul className="space-y-1.5 px-3" role="list">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const label = t(`caregiverApp.nav.${item.key}`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-200 ease-out
                    focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2
                    ${isActive
                      ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-600/20'
                      : 'text-text-secondary hover:bg-surface-background hover:text-text-primary hover:translate-x-1'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={label}
                >
                  <span className={`text-lg transition-transform duration-200 ${!isActive ? 'group-hover:scale-110' : ''}`} aria-hidden="true">{item.icon}</span>
                  <span>{label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-surface-border/50">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-background transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
          aria-label={`${userName} - View profile and settings`}
        >
          <div
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow"
            aria-hidden="true"
          >
            <span className="text-white text-sm font-semibold">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{userName}</p>
            <p className="text-xs text-text-muted truncate group-hover:text-brand-600 transition-colors">View profile</p>
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
      </div>
    </aside>
  );
}
