import Link from 'next/link';
import { Logo } from '@/components/logo';
import { landingT } from '@/lib/landing-t';

const t = (key: string) => landingT(`caregiverApp.landing.${key}`);

export function LandingFooter() {
  return (
    <footer className="border-t border-surface-border bg-surface-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Logo className="w-8 h-8" />
              <span className="text-lg font-display font-bold text-brand-700 dark:text-brand-600">
                OurTurn
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">
              {t('footer.product')}
            </h4>
            <ul className="space-y-3">
              {[
                { label: t('nav.features'), href: '#features' },
                { label: t('nav.pricing'), href: '#pricing' },
                { label: t('nav.howItWorks'), href: '#how-it-works' },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-text-secondary hover:text-brand-600 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">
              {t('footer.company')}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-text-secondary hover:text-brand-600 transition-colors">
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-text-secondary hover:text-brand-600 transition-colors">
                  {t('terms')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">
              {t('footer.connect')}
            </h4>
            <p className="text-sm text-text-secondary">
              {t('footer.madeWith')}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-surface-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">{t('footer.copyright')}</p>
          <p className="text-xs text-text-muted max-w-md text-center sm:text-right">
            {t('footer.disclaimer')}
          </p>
        </div>
      </div>
    </footer>
  );
}
