'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { OrganicBlobs } from '@/components/organic-blobs';

export function LandingContent() {
  const { t } = useTranslation();

  const steps = [
    { step: '01', titleKey: 'step1Title', descKey: 'step1Desc', icon: '🏠' },
    { step: '02', titleKey: 'step2Title', descKey: 'step2Desc', icon: '🔑' },
    { step: '03', titleKey: 'step3Title', descKey: 'step3Desc', icon: '💛' },
  ];

  const features = [
    { icon: '📋', titleKey: 'featureCarePlanTitle', descKey: 'featureCarePlanDesc' },
    { icon: '📍', titleKey: 'featureLocationTitle', descKey: 'featureLocationDesc' },
    { icon: '🤖', titleKey: 'featureCoachTitle', descKey: 'featureCoachDesc' },
    { icon: '🏠', titleKey: 'featureHomeTitle', descKey: 'featureHomeDesc' },
    { icon: '👨‍👩‍👧', titleKey: 'featureFamilyTitle', descKey: 'featureFamilyDesc' },
    { icon: '💙', titleKey: 'featureWellbeingTitle', descKey: 'featureWellbeingDesc' },
  ];

  const exampleTasks = [
    { time: '8:00 AM', icon: '💊', taskKey: 'exampleTask1', done: true },
    { time: '9:30 AM', icon: '🚶', taskKey: 'exampleTask2', done: true },
    { time: '11:00 AM', icon: '🧩', taskKey: 'exampleTask3', done: true },
    { time: '12:30 PM', icon: '🥗', taskKey: 'exampleTask4', done: false },
    { time: '3:00 PM', icon: '💬', taskKey: 'exampleTask5', done: false },
  ];

  return (
    <div className="min-h-screen bg-surface-background overflow-hidden">
      {/* ─── Sticky Header ─── */}
      <header className="sticky top-0 z-50 border-b border-surface-border/60 bg-surface-background/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-bold font-display">M</span>
              </div>
              <span className="text-xl font-display font-bold text-brand-700 dark:text-brand-600">
                OurTurn
              </span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/login"
                className="text-text-secondary hover:text-brand-600 font-medium transition-colors text-sm"
              >
                {t('caregiverApp.landing.logIn')}
              </Link>
              <Link
                href="/signup"
                className="btn-primary text-sm px-5 py-2.5 inline-flex items-center"
              >
                {t('caregiverApp.landing.startFreeTrial')}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* ─── Hero Section ─── */}
        <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32">
          <OrganicBlobs variant="hero" />

          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-7 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100/60 dark:bg-brand-100/20 border border-brand-200/60">
                  <span className="w-2 h-2 rounded-full bg-status-success animate-warm-pulse" />
                  <span className="text-xs font-semibold text-brand-700 dark:text-brand-600 tracking-wide uppercase">
                    {t('caregiverApp.landing.badge')}
                  </span>
                </div>

                <h1 className="heading-display text-5xl sm:text-6xl lg:text-7xl">
                  {t('caregiverApp.landing.heroTitle1')}{' '}
                  <span className="heading-accent text-gradient-warm">
                    {t('caregiverApp.landing.heroAccent')}
                  </span>
                  <br />
                  {t('caregiverApp.landing.heroTitle2')}
                </h1>

                <p className="text-lg sm:text-xl text-text-secondary max-w-xl leading-relaxed">
                  {t('caregiverApp.landing.heroDesc')}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/signup"
                    className="btn-primary text-base px-8 py-4 inline-flex items-center gap-2"
                  >
                    {t('caregiverApp.landing.getStartedFree')}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    href="/login"
                    className="btn-secondary text-base px-8 py-4 inline-flex items-center"
                  >
                    {t('caregiverApp.landing.haveAccount')}
                  </Link>
                </div>

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
                    <span className="font-semibold text-text-secondary">{t('caregiverApp.landing.trusted')}</span> {t('caregiverApp.landing.byFamilyCaregivers')}
                  </div>
                </div>
              </div>

              {/* Preview card */}
              <div className="lg:col-span-5 relative">
                <div className="relative">
                  <div className="absolute -top-3 -left-3 w-full h-full rounded-[24px] bg-brand-100/40 dark:bg-brand-100/10 rotate-2" />
                  <div className="relative card-paper p-6 sm:p-8 space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="section-label mb-1">{t('caregiverApp.landing.todaysPlanFor')}</p>
                        <p className="text-xl font-display font-bold text-text-primary">{t('caregiverApp.landing.exampleName')}</p>
                      </div>
                      <div className="badge badge-success">{t('caregiverApp.landing.exampleProgress')}</div>
                    </div>
                    <div className="divider-wavy" />
                    {exampleTasks.map((item, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                          item.done
                            ? 'bg-status-success-bg/60 dark:bg-status-success-bg'
                            : 'bg-surface-background/80'
                        }`}
                      >
                        <span className="text-xl flex-shrink-0">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${item.done ? 'text-status-success line-through decoration-1' : 'text-text-primary'}`}>
                            {t(`caregiverApp.landing.${item.taskKey}`)}
                          </p>
                          <p className="text-xs text-text-muted">{item.time}</p>
                        </div>
                        {item.done && (
                          <svg className="w-5 h-5 text-status-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="divider-wavy mx-auto max-w-xs" />

        {/* ─── How It Works ─── */}
        <section className="py-20 lg:py-28 relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="section-label mb-3">{t('caregiverApp.landing.howItWorks')}</p>
              <h2 className="heading-display text-3xl sm:text-4xl">
                {t('caregiverApp.landing.threeStepsPrefix')}{' '}
                <span className="heading-accent">{t('caregiverApp.landing.threeStepsAccent')}</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {steps.map((item, i) => (
                <div key={i} className={`animate-fade-in-up stagger-${i + 1} relative`}>
                  <div className="card-paper card-interactive p-8 h-full space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl">{item.icon}</span>
                      <span className="font-display text-3xl font-bold text-brand-200 dark:text-brand-200/40">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-lg font-display font-bold text-text-primary">
                      {t(`caregiverApp.landing.${item.titleKey}`)}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {t(`caregiverApp.landing.${item.descKey}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Features ─── */}
        <section className="py-20 lg:py-28 bg-brand-50/40 dark:bg-brand-50/5 relative">
          <OrganicBlobs variant="subtle" />
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <p className="section-label mb-3">{t('caregiverApp.landing.featuresLabel')}</p>
              <h2 className="heading-display text-3xl sm:text-4xl">
                {t('caregiverApp.landing.featuresTitle')}{' '}
                <span className="heading-accent">{t('caregiverApp.landing.featuresTitleAccent')}</span>{' '}
                {t('caregiverApp.landing.featuresTitleSuffix')}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <div key={i} className={`animate-fade-in-up stagger-${i + 1}`}>
                  <div className="card-paper card-interactive p-7 h-full group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-100/60 dark:bg-brand-100/20 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-base font-display font-bold text-text-primary">
                          {t(`caregiverApp.landing.${feature.titleKey}`)}
                        </h3>
                        <p className="text-sm text-text-secondary leading-relaxed">
                          {t(`caregiverApp.landing.${feature.descKey}`)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="py-20 lg:py-28 relative">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
            <div className="card-paper p-10 sm:p-14 space-y-6">
              <p className="text-4xl">🤲</p>
              <h2 className="heading-display text-3xl sm:text-4xl">
                {t('caregiverApp.landing.ctaTitle')}{' '}
                <span className="heading-accent">{t('caregiverApp.landing.ctaAccent')}</span>
              </h2>
              <p className="text-text-secondary text-lg max-w-lg mx-auto leading-relaxed">
                {t('caregiverApp.landing.ctaDesc')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Link
                  href="/signup"
                  className="btn-primary text-base px-8 py-4 inline-flex items-center gap-2"
                >
                  {t('caregiverApp.landing.startYourTrial')}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
              <p className="text-xs text-text-muted">{t('caregiverApp.landing.trialNote')}</p>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-surface-border py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            {t('caregiverApp.landing.disclaimer')}
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="text-text-muted hover:text-brand-600 transition-colors">
              {t('caregiverApp.landing.privacy')}
            </Link>
            <Link href="/terms" className="text-text-muted hover:text-brand-600 transition-colors">
              {t('caregiverApp.landing.terms')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
