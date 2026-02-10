'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicyPage() {
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
        <h1 className="text-3xl font-bold font-display text-text-primary mb-2">{t('caregiverApp.legal.privacy.title')}</h1>
        <p className="text-text-muted mb-8">{t('caregiverApp.legal.privacy.lastUpdated')}</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.privacy.s1Title')}</h2>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.privacy.s1p1')}
            </p>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.privacy.s1p2')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.privacy.s2Title')}</h2>

            <h3 className="text-lg font-medium font-display text-text-primary mb-3">{t('caregiverApp.legal.privacy.s2_1Title')}</h3>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li><strong>{t('caregiverApp.legal.privacy.s2_1_account')}</strong></li>
              <li><strong>{t('caregiverApp.legal.privacy.s2_1_careProfile')}</strong></li>
              <li><strong>{t('caregiverApp.legal.privacy.s2_1_carePlan')}</strong></li>
              <li><strong>{t('caregiverApp.legal.privacy.s2_1_checkin')}</strong></li>
              <li><strong>{t('caregiverApp.legal.privacy.s2_1_journal')}</strong></li>
              <li><strong>{t('caregiverApp.legal.privacy.s2_1_voice')}</strong></li>
            </ul>

            <h3 className="text-lg font-medium font-display text-text-primary mb-3">{t('caregiverApp.legal.privacy.s2_2Title')}</h3>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li><strong>{t('caregiverApp.legal.privacy.s2_2_location')}</strong></li>
              <li><strong>{t('caregiverApp.legal.privacy.s2_2_device')}</strong></li>
              <li><strong>{t('caregiverApp.legal.privacy.s2_2_usage')}</strong></li>
              <li><strong>{t('caregiverApp.legal.privacy.s2_2_push')}</strong></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.privacy.s3Title')}</h2>
            <p className="text-text-secondary mb-4">{t('caregiverApp.legal.privacy.s3Intro')}</p>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li>{t('caregiverApp.legal.privacy.s3_provide')}</li>
              <li>{t('caregiverApp.legal.privacy.s3_sync')}</li>
              <li>{t('caregiverApp.legal.privacy.s3_reminders')}</li>
              <li>{t('caregiverApp.legal.privacy.s3_ai')}</li>
              <li>{t('caregiverApp.legal.privacy.s3_improve')}</li>
              <li>{t('caregiverApp.legal.privacy.s3_communicate')}</li>
              <li>{t('caregiverApp.legal.privacy.s3_security')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.privacy.s4Title')}</h2>
            <p className="text-text-secondary mb-4">
              <strong>{t('caregiverApp.legal.privacy.s4Intro')}</strong>
            </p>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li><strong>{t('caregiverApp.legal.privacy.s4_careCircle')}</strong></li>
              <li><strong>{t('caregiverApp.legal.privacy.s4_providers')}</strong></li>
              <li><strong>{t('caregiverApp.legal.privacy.s4_legal')}</strong></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.privacy.s5Title')}</h2>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li>{t('caregiverApp.legal.privacy.s5_euStorage')}</li>
              <li>{t('caregiverApp.legal.privacy.s5_encrypted')}</li>
              <li>{t('caregiverApp.legal.privacy.s5_security')}</li>
              <li>{t('caregiverApp.legal.privacy.s5_voiceEncrypted')}</li>
              <li>{t('caregiverApp.legal.privacy.s5_locationRetention')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.privacy.s6Title')}</h2>
            <p className="text-text-secondary mb-4">{t('caregiverApp.legal.privacy.s6Intro')}</p>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li><strong>{t('caregiverApp.legal.privacy.s6_access')}</strong></li>
              <li><strong>{t('caregiverApp.legal.privacy.s6_rectification')}</strong></li>
              <li><strong>{t('caregiverApp.legal.privacy.s6_erasure')}</strong></li>
              <li><strong>{t('caregiverApp.legal.privacy.s6_portability')}</strong></li>
              <li><strong>{t('caregiverApp.legal.privacy.s6_restriction')}</strong></li>
              <li><strong>{t('caregiverApp.legal.privacy.s6_objection')}</strong></li>
              <li><strong>{t('caregiverApp.legal.privacy.s6_withdraw')}</strong></li>
            </ul>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.privacy.s6Contact')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.privacy.s7Title')}</h2>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.privacy.s7Intro')}
            </p>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li>{t('caregiverApp.legal.privacy.s7_toggle')}</li>
              <li>{t('caregiverApp.legal.privacy.s7_family')}</li>
              <li>{t('caregiverApp.legal.privacy.s7_zones')}</li>
            </ul>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.privacy.s7Retention')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.privacy.s8Title')}</h2>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.privacy.s8p1')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.privacy.s9Title')}</h2>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li>{t('caregiverApp.legal.privacy.s9_account')}</li>
              <li>{t('caregiverApp.legal.privacy.s9_carePlan')}</li>
              <li>{t('caregiverApp.legal.privacy.s9_checkin')}</li>
              <li>{t('caregiverApp.legal.privacy.s9_location')}</li>
              <li>{t('caregiverApp.legal.privacy.s9_voice')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.privacy.s10Title')}</h2>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.privacy.s10p1')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.privacy.s11Title')}</h2>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.privacy.s11p1')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">{t('caregiverApp.legal.privacy.s12Title')}</h2>
            <p className="text-text-secondary mb-4">
              {t('caregiverApp.legal.privacy.s12Intro')}
            </p>
            <ul className="list-none text-text-secondary space-y-1">
              <li>{t('caregiverApp.legal.privacy.s12Email')}</li>
              <li>{t('caregiverApp.legal.privacy.s12Address')}</li>
            </ul>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-surface-border">
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/terms" className="hover:text-brand-600">
              {t('caregiverApp.legal.termsOfService')}
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
