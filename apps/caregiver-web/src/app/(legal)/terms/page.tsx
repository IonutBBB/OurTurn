'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function TermsOfServicePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-surface-background">
      {/* Header */}
      <header className="bg-surface-card border-b border-surface-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-2xl font-bold font-display text-brand-600">
            {t('common.appName')}
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold font-display text-text-primary mb-2">{t('caregiverApp.legal.terms.title')}</h1>
        <p className="text-text-muted mb-8">{t('caregiverApp.legal.terms.lastUpdated')}</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.terms.s1Title')}</h2>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.terms.s1p1')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.terms.s2Title')}</h2>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.terms.s2Intro')}
            </p>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li>{t('caregiverApp.legal.terms.s2_carePlan')}</li>
              <li>{t('caregiverApp.legal.terms.s2_reminders')}</li>
              <li>{t('caregiverApp.legal.terms.s2_family')}</li>
              <li>{t('caregiverApp.legal.terms.s2_location')}</li>
              <li>{t('caregiverApp.legal.terms.s2_ai')}</li>
              <li>{t('caregiverApp.legal.terms.s2_wellness')}</li>
            </ul>
          </section>

          <section className="mb-8 bg-status-amber-bg border border-status-amber/20 rounded-2xl p-6">
            <h2 className="text-xl font-semibold font-display text-status-amber mb-4">
              {t('caregiverApp.legal.terms.s3Title')}
            </h2>
            <p className="text-text-primary mb-4 font-medium">
              {t('caregiverApp.legal.terms.s3p1')}
            </p>
            <ul className="list-disc pl-6 text-text-secondary space-y-2">
              <li>{t('caregiverApp.legal.terms.s3_noDiagnosis')}</li>
              <li>{t('caregiverApp.legal.terms.s3_noMonitor')}</li>
              <li>{t('caregiverApp.legal.terms.s3_aiInfo')}</li>
              <li>{t('caregiverApp.legal.terms.s3_consult')}</li>
              <li>{t('caregiverApp.legal.terms.s3_emergency')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.terms.s4Title')}</h2>
            <h3 className="text-lg font-medium font-display text-text-primary mb-3">{t('caregiverApp.legal.terms.s4_1Title')}</h3>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.terms.s4_1p1')}
            </p>

            <h3 className="text-lg font-medium font-display text-text-primary mb-3">{t('caregiverApp.legal.terms.s4_2Title')}</h3>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.terms.s4_2p1')}
            </p>

            <h3 className="text-lg font-medium font-display text-text-primary mb-3">{t('caregiverApp.legal.terms.s4_3Title')}</h3>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.terms.s4_3p1')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.terms.s5Title')}</h2>
            <p className="text-text-secondary mb-4">{t('caregiverApp.legal.terms.s5Intro')}</p>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li>{t('caregiverApp.legal.terms.s5_unlawful')}</li>
              <li>{t('caregiverApp.legal.terms.s5_impersonate')}</li>
              <li>{t('caregiverApp.legal.terms.s5_interfere')}</li>
              <li>{t('caregiverApp.legal.terms.s5_unauthorized')}</li>
              <li>{t('caregiverApp.legal.terms.s5_harass')}</li>
              <li>{t('caregiverApp.legal.terms.s5_malicious')}</li>
              <li>{t('caregiverApp.legal.terms.s5_scrape')}</li>
              <li>{t('caregiverApp.legal.terms.s5_commercial')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.terms.s6Title')}</h2>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.terms.s6p1')}
            </p>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.terms.s6p2')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.terms.s7Title')}</h2>
            <h3 className="text-lg font-medium font-display text-text-primary mb-3">{t('caregiverApp.legal.terms.s7_1Title')}</h3>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.terms.s7_1p1')}
            </p>

            <h3 className="text-lg font-medium font-display text-text-primary mb-3">{t('caregiverApp.legal.terms.s7_2Title')}</h3>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.terms.s7_2p1')}
            </p>

            <h3 className="text-lg font-medium font-display text-text-primary mb-3">{t('caregiverApp.legal.terms.s7_3Title')}</h3>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.terms.s7_3p1')}
            </p>

            <h3 className="text-lg font-medium font-display text-text-primary mb-3">{t('caregiverApp.legal.terms.s7_4Title')}</h3>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.terms.s7_4p1')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.terms.s8Title')}</h2>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.terms.s8Intro')}
            </p>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li>{t('caregiverApp.legal.terms.s8_shared')}</li>
              <li>{t('caregiverApp.legal.terms.s8_battery')}</li>
              <li>{t('caregiverApp.legal.terms.s8_accuracy')}</li>
              <li>{t('caregiverApp.legal.terms.s8_takeMeHome')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.terms.s9Title')}</h2>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.terms.s9Intro')}
            </p>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li>{t('caregiverApp.legal.terms.s9_auto')}</li>
              <li>{t('caregiverApp.legal.terms.s9_notMedical')}</li>
              <li>{t('caregiverApp.legal.terms.s9_verify')}</li>
              <li>{t('caregiverApp.legal.terms.s9_improve')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.terms.s10Title')}</h2>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.terms.s10p1')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.terms.s11Title')}</h2>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.terms.s11Intro')}
            </p>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li>{t('caregiverApp.legal.terms.s11_asIs')}</li>
              <li>{t('caregiverApp.legal.terms.s11_noIndirect')}</li>
              <li>{t('caregiverApp.legal.terms.s11_limitAmount')}</li>
              <li>{t('caregiverApp.legal.terms.s11_thirdParty')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.terms.s12Title')}</h2>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.terms.s12p1')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.terms.s13Title')}</h2>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.terms.s13p1')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.terms.s14Title')}</h2>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.terms.s14p1')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.terms.s15Title')}</h2>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.terms.s15p1')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.terms.s16Title')}</h2>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.terms.s16Intro')}
            </p>
            <ul className="list-none text-text-secondary space-y-1">
              <li>{t('caregiverApp.legal.terms.s16Email')}</li>
              <li>{t('caregiverApp.legal.terms.s16Address')}</li>
            </ul>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-surface-border">
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/privacy" className="hover:text-brand-600">
              {t('caregiverApp.legal.privacyPolicy')}
            </Link>
            <Link href="/" className="hover:text-brand-600">
              {t('caregiverApp.legal.backToHome')}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
