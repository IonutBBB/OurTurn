import Link from 'next/link';
import { landingT } from '@/lib/landing-t';

const t = (key: string) => landingT(`caregiverApp.landing.pricing.${key}`);

const FREE_FEATURES = ['freeFeat1', 'freeFeat2', 'freeFeat3', 'freeFeat4'];
const PLUS_FEATURES = ['plusFeat1', 'plusFeat2', 'plusFeat3', 'plusFeat4', 'plusFeat5', 'plusFeat6', 'plusFeat7'];

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 flex-shrink-0 ${className}`} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

export function PricingPreview() {
  return (
    <section id="pricing" className="landing-section">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="heading-display text-3xl sm:text-4xl">{t('title')}</h2>
          <p className="text-text-secondary text-lg mt-4">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Free plan */}
          <div className="card-paper p-8 space-y-6">
            <div>
              <h3 className="text-xl font-display font-bold text-text-primary">{t('freeTitle')}</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-display font-bold text-text-primary">{t('freePrice')}</span>
                <span className="text-sm text-text-muted">{t('freePriceNote')}</span>
              </div>
            </div>
            <ul className="space-y-3">
              {FREE_FEATURES.map((key) => (
                <li key={key} className="flex items-center gap-3 text-sm text-text-secondary">
                  <CheckIcon className="text-text-muted" />
                  {t(key)}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="btn-secondary text-sm w-full py-3 text-center block"
            >
              {landingT('caregiverApp.landing.getStartedFree')}
            </Link>
          </div>

          {/* Plus plan */}
          <div className="card-paper p-8 space-y-6 ring-2 ring-brand-500 relative">
            <span className="absolute -top-3 left-6 badge badge-brand text-xs">
              {t('plusBadge')}
            </span>
            <div>
              <h3 className="text-xl font-display font-bold text-text-primary">{t('plusTitle')}</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-display font-bold text-gradient-warm">{t('plusPrice')}</span>
                <span className="text-sm text-text-muted">{t('plusPriceNote')}</span>
              </div>
            </div>
            <ul className="space-y-3">
              {PLUS_FEATURES.map((key) => (
                <li key={key} className="flex items-center gap-3 text-sm text-text-secondary">
                  <CheckIcon className="text-status-success" />
                  {t(key)}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="btn-primary text-sm w-full py-3 text-center block"
            >
              {landingT('caregiverApp.landing.startFreeTrial')}
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-text-muted mt-8">
          {t('trialNotice')}
        </p>
      </div>
    </section>
  );
}
