'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';

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

interface TopBarProps {
  userName: string;
}

export function TopBar({ userName }: TopBarProps) {
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createBrowserClient();

  const currentPage = breadcrumbMap[pathname] || 'Dashboard';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

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

      {/* Right side: notification bell + avatar dropdown */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button
          className="relative p-2 rounded-xl hover:bg-brand-50 dark:hover:bg-surface-elevated transition-colors"
          aria-label="Notifications"
        >
          <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        {/* User avatar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-brand-50 dark:hover:bg-surface-elevated transition-colors"
            aria-label="User menu"
            aria-expanded={showDropdown}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <svg className={`w-4 h-4 text-text-muted transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 card-paper py-2 shadow-lg z-50">
              <div className="px-4 py-2 border-b border-surface-border">
                <p className="text-sm font-semibold text-text-primary truncate">{userName}</p>
              </div>
              <Link
                href="/settings"
                className="block px-4 py-2 text-sm text-text-secondary hover:bg-brand-50 dark:hover:bg-surface-elevated transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-status-danger hover:bg-status-danger-bg transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
