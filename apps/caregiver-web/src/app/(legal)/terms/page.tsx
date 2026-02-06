import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | MemoGuard',
  description: 'MemoGuard terms of service - rules and guidelines for using our service.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-surface-background">
      {/* Header */}
      <header className="bg-surface-card border-b border-surface-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-2xl font-bold font-display text-brand-600">
            MemoGuard
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold font-display text-text-primary mb-2">Terms of Service</h1>
        <p className="text-text-muted mb-8">Last updated: February 2026</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">1. Acceptance of Terms</h2>
            <p className="text-text-secondary mb-4">
              By accessing or using MemoGuard (&quot;the Service&quot;), you agree to be bound by these
              Terms of Service. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">2. Description of Service</h2>
            <p className="text-text-secondary mb-4">
              MemoGuard is a wellness and daily living support platform that helps families
              coordinate care for loved ones. The Service includes:
            </p>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li>Daily care plan management</li>
              <li>Task reminders and notifications</li>
              <li>Family coordination tools</li>
              <li>Location sharing features</li>
              <li>AI-powered care suggestions</li>
              <li>Wellness tracking</li>
            </ul>
          </section>

          <section className="mb-8 bg-status-amber-bg border border-status-amber/20 rounded-2xl p-6">
            <h2 className="text-xl font-semibold font-display text-status-amber mb-4">
              3. Important Medical Disclaimer
            </h2>
            <p className="text-text-primary mb-4 font-medium">
              MEMOGUARD IS NOT A MEDICAL DEVICE AND DOES NOT PROVIDE MEDICAL ADVICE.
            </p>
            <ul className="list-disc pl-6 text-text-secondary space-y-2">
              <li>The Service does not diagnose, treat, cure, or prevent any disease or condition</li>
              <li>The Service does not monitor or assess cognitive function or disease progression</li>
              <li>AI suggestions are for informational purposes only and do not replace professional medical advice</li>
              <li>Always consult a qualified healthcare provider for medical decisions</li>
              <li>In case of emergency, call your local emergency services (e.g., 911, 112, 999)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">4. User Accounts</h2>
            <h3 className="text-lg font-medium font-display text-text-primary mb-3">4.1 Registration</h3>
            <p className="text-text-secondary mb-4">
              You must provide accurate and complete information when creating an account.
              You are responsible for maintaining the security of your account credentials.
            </p>

            <h3 className="text-lg font-medium font-display text-text-primary mb-3">4.2 Care Codes</h3>
            <p className="text-text-secondary mb-4">
              Care Codes are used to connect patient devices to your household. You are
              responsible for keeping Care Codes secure and sharing them only with authorized
              family members. You can regenerate a Care Code at any time if compromised.
            </p>

            <h3 className="text-lg font-medium font-display text-text-primary mb-3">4.3 Account Responsibility</h3>
            <p className="text-text-secondary mb-4">
              You are responsible for all activity that occurs under your account. Notify us
              immediately if you suspect unauthorized access.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">5. Acceptable Use</h2>
            <p className="text-text-secondary mb-4">You agree NOT to:</p>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Impersonate another person or entity</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Use the Service to harass, abuse, or harm others</li>
              <li>Upload malicious content or code</li>
              <li>Scrape, crawl, or data-mine the Service</li>
              <li>Use the Service for commercial purposes without authorization</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">6. User Content</h2>
            <p className="text-text-secondary mb-4">
              You retain ownership of content you create (care plans, journal entries, photos,
              voice notes). By using the Service, you grant us a limited license to store,
              process, and display this content to provide the Service to you and your family.
            </p>
            <p className="text-text-secondary mb-4">
              You are responsible for ensuring you have the right to share any content you
              upload, including photos and information about others.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">7. Subscriptions and Payments</h2>
            <h3 className="text-lg font-medium font-display text-text-primary mb-3">7.1 Free and Paid Tiers</h3>
            <p className="text-text-secondary mb-4">
              MemoGuard offers both free and paid subscription tiers. Free tier includes
              basic features with limitations. MemoGuard Plus includes additional features
              as described on our pricing page.
            </p>

            <h3 className="text-lg font-medium font-display text-text-primary mb-3">7.2 Billing</h3>
            <p className="text-text-secondary mb-4">
              Paid subscriptions are billed in advance on a monthly or annual basis.
              Subscription fees are non-refundable except as required by law.
            </p>

            <h3 className="text-lg font-medium font-display text-text-primary mb-3">7.3 Cancellation</h3>
            <p className="text-text-secondary mb-4">
              You may cancel your subscription at any time. Access to paid features continues
              until the end of your current billing period.
            </p>

            <h3 className="text-lg font-medium font-display text-text-primary mb-3">7.4 Price Changes</h3>
            <p className="text-text-secondary mb-4">
              We may change subscription prices with 30 days&apos; notice. Price changes do not
              affect current billing periods.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">8. Location Features</h2>
            <p className="text-text-secondary mb-4">
              Location features require explicit consent and device permissions. By enabling
              location features, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li>Location data will be shared with authorized family members</li>
              <li>Location tracking may impact device battery life</li>
              <li>GPS accuracy may vary based on device and environment</li>
              <li>The &quot;Take Me Home&quot; feature uses external navigation apps (Google Maps, Apple Maps)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">9. AI Features</h2>
            <p className="text-text-secondary mb-4">
              MemoGuard uses artificial intelligence for features like the Care Coach and
              activity suggestions. You acknowledge that:
            </p>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li>AI responses are generated automatically and may not always be accurate</li>
              <li>AI suggestions are not medical advice</li>
              <li>You should verify important information independently</li>
              <li>AI interactions may be used to improve our services (anonymized)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">10. Intellectual Property</h2>
            <p className="text-text-secondary mb-4">
              The Service, including its design, features, and content (excluding user content),
              is owned by MemoGuard and protected by intellectual property laws. You may not
              copy, modify, distribute, or create derivative works without permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">11. Limitation of Liability</h2>
            <p className="text-text-secondary mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li>The Service is provided &quot;as is&quot; without warranties of any kind</li>
              <li>We are not liable for any indirect, incidental, or consequential damages</li>
              <li>Our total liability is limited to the amount you paid us in the past 12 months</li>
              <li>We are not responsible for third-party services (Google Maps, payment processors, etc.)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">12. Indemnification</h2>
            <p className="text-text-secondary mb-4">
              You agree to indemnify and hold harmless MemoGuard from any claims, damages,
              or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">13. Termination</h2>
            <p className="text-text-secondary mb-4">
              We may suspend or terminate your access to the Service at any time for
              violation of these Terms or for any other reason with notice. You may
              delete your account at any time through the app settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">14. Changes to Terms</h2>
            <p className="text-text-secondary mb-4">
              We may update these Terms from time to time. We will notify you of material
              changes via email or in-app notification. Continued use of the Service after
              changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">15. Governing Law</h2>
            <p className="text-text-secondary mb-4">
              These Terms are governed by the laws of Romania, European Union. Any disputes shall be
              resolved in the courts of Romania, European Union, except where consumer protection
              laws require otherwise.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">16. Contact</h2>
            <p className="text-text-secondary mb-4">
              For questions about these Terms:
            </p>
            <ul className="list-none text-text-secondary space-y-1">
              <li>Email: legal@memoguard.com</li>
              <li>Address: Bucharest, Romania</li>
            </ul>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-surface-border">
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/privacy" className="hover:text-brand-600">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-brand-600">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
