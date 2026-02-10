import Link from 'next/link';
import { landingT } from '@/lib/landing-t';

const t = (key: string) => landingT(`caregiverApp.landing.${key}`);

export function FinalCta() {
  return (
    <section className="landing-section">
      <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
        <div className="card-paper p-10 sm:p-14 space-y-6">
          <h2 className="heading-display text-3xl sm:text-4xl">
            {t('ctaTitle')}{' '}
            <span className="heading-accent">{t('ctaAccent')}</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-lg mx-auto leading-relaxed">
            {t('ctaDesc')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="btn-primary text-base px-8 py-4 inline-flex items-center gap-2"
            >
              {t('startYourTrial')}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          <p className="text-xs text-text-muted">{t('trialNote')}</p>
        </div>
      </div>
    </section>
  );
}
