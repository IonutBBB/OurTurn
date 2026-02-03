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
  { href: '/settings', icon: '⚙️', key: 'settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-surface-card border-r border-surface-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-surface-border">
        <Link href="/dashboard" className="text-xl font-bold text-brand-700">
          MemoGuard
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{t(`caregiverApp.nav.${item.key}`)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-surface-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
            <span className="text-brand-700 text-sm font-medium">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">Caregiver</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
