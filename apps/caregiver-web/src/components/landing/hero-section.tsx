import Link from 'next/link';
import { landingT } from '@/lib/landing-t';
import { HeroProductPreview } from './hero-product-preview';

const t = (key: string) => landingT(`caregiverApp.landing.${key}`);

export function HeroSection() {
  return (
    <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
      {/* Static organic blobs (no client JS) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <svg
          className="absolute -top-24 -right-24 w-[520px] h-[520px]"
          viewBox="0 0 520 520"
          fill="none"
        >
          <path
            d="M260 20C340 10 430 60 470 140C510 220 490 310 440 380C390 450 310 490 230 480C150 470 80 420 40 350C0 280 -10 190 30 120C70 50 180 30 260 20Z"
            fill="var(--brand-200)"
            fillOpacity={0.22}
          />
        </svg>
        <svg
          className="absolute -bottom-36 -left-36 w-[560px] h-[560px]"
          viewBox="0 0 560 560"
          fill="none"
        >
          <path
            d="M280 10C380 0 480 70 520 170C560 270 540 380 470 450C400 520 300 560 210 530C120 500 50 430 20 340C-10 250 10 150 70 80C130 10 180 20 280 10Z"
            fill="var(--brand-100)"
            fillOpacity={0.22}
          />
        </svg>
        <svg
          className="absolute top-16 left-16 w-32 h-32 opacity-30"
          viewBox="0 0 128 128"
          fill="none"
        >
          <circle cx="20" cy="20" r="3" fill="var(--brand-400)" />
          <circle cx="50" cy="12" r="2" fill="var(--brand-300)" />
          <circle cx="80" cy="24" r="4" fill="var(--brand-200)" />
          <circle cx="32" cy="50" r="2.5" fill="var(--brand-300)" />
          <circle cx="65" cy="55" r="3" fill="var(--brand-400)" />
          <circle cx="100" cy="48" r="2" fill="var(--brand-200)" />
          <circle cx="18" cy="85" r="2" fill="var(--brand-200)" />
          <circle cx="48" cy="90" r="3.5" fill="var(--brand-300)" />
          <circle cx="85" cy="80" r="2" fill="var(--brand-400)" />
          <circle cx="110" cy="95" r="3" fill="var(--brand-200)" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100/60 dark:bg-brand-100/20 border border-brand-200/60">
              <span className="w-2 h-2 rounded-full bg-status-success animate-warm-pulse" />
              <span className="text-xs font-semibold text-brand-700 dark:text-brand-600 tracking-wide uppercase">
                {t('badge')}
              </span>
            </div>

            {/* H1 — server-rendered for SEO */}
            <h1 className="heading-display text-5xl sm:text-6xl lg:text-7xl">
              {t('heroTitle1')}{' '}
              <span className="heading-accent text-gradient-warm">
                {t('heroAccent')}
              </span>
              <br />
              {t('heroTitle2')}
            </h1>

            <p className="text-lg sm:text-xl text-text-secondary max-w-xl leading-relaxed">
              {t('heroDesc')}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/signup"
                className="btn-primary text-base px-8 py-4 inline-flex items-center gap-2"
              >
                {t('getStartedFree')}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="btn-secondary text-base px-8 py-4 inline-flex items-center"
              >
                {t('haveAccount')}
              </Link>
            </div>

            {/* Social proof avatars */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {['#E0895A', '#4A7C59', '#4A6FA5', '#B85A6F'].map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-surface-background flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: color, zIndex: 4 - i }}
                  >
                    {['S', 'M', 'J', 'A'][i]}
                  </div>
                ))}
              </div>
              <div className="text-sm text-text-muted">
                <span className="font-semibold text-text-secondary">
                  {t('trusted')}
                </span>{' '}
                {t('byFamilyCaregivers')}
              </div>
            </div>
          </div>

          {/* Preview card — client island */}
          <div className="lg:col-span-5 relative">
            <div className="relative">
              <div className="absolute -top-3 -left-3 w-full h-full rounded-[24px] bg-brand-100/40 dark:bg-brand-100/10 rotate-2" />
              <HeroProductPreview />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
