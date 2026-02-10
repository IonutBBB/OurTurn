'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/logo';

const NAV_LINKS = [
  { href: '#how-it-works', key: 'nav.howItWorks' },
  { href: '#features', key: 'nav.features' },
  { href: '#pricing', key: 'nav.pricing' },
  { href: '#faq', key: 'nav.faq' },
];

export function LandingNav() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const lt = (key: string) => t(`caregiverApp.landing.${key}`);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface-background/90 backdrop-blur-lg border-b border-surface-border/60 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="w-9 h-9" />
            <span className="text-xl font-display font-bold text-brand-700 dark:text-brand-600">
              OurTurn
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-secondary hover:text-brand-600 transition-colors"
              >
                {lt(link.key)}
              </a>
            ))}
            <Link
              href="/login"
              className="text-sm font-medium text-text-secondary hover:text-brand-600 transition-colors"
            >
              {lt('logIn')}
            </Link>
            <Link
              href="/signup"
              className="btn-primary text-sm px-5 py-2.5 inline-flex items-center"
            >
              {lt('startFreeTrial')}
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-text-primary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={lt(mobileOpen ? 'nav.close' : 'nav.menu')}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <nav className="md:hidden pb-6 pt-2 space-y-3 border-t border-surface-border/40">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-2 text-sm font-medium text-text-secondary hover:text-brand-600 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {lt(link.key)}
              </a>
            ))}
            <div className="flex flex-col gap-3 pt-3">
              <Link
                href="/login"
                className="text-sm font-medium text-text-secondary hover:text-brand-600 transition-colors py-2"
              >
                {lt('logIn')}
              </Link>
              <Link
                href="/signup"
                className="btn-primary text-sm px-5 py-2.5 text-center"
              >
                {lt('startFreeTrial')}
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
