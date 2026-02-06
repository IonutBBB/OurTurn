import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | MemoGuard',
  description: 'MemoGuard privacy policy - how we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage() {
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
        <h1 className="text-3xl font-bold font-display text-text-primary mb-2">Privacy Policy</h1>
        <p className="text-text-muted mb-8">Last updated: February 2026</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">1. Introduction</h2>
            <p className="text-text-secondary mb-4">
              MemoGuard (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use our mobile applications and web services (collectively,
              the &quot;Service&quot;).
            </p>
            <p className="text-text-secondary mb-4">
              MemoGuard is a wellness and daily living support tool for families. It is NOT a
              medical device and does not provide medical advice, diagnosis, or treatment.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">2. Information We Collect</h2>

            <h3 className="text-lg font-medium font-display text-text-primary mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li><strong>Account Information:</strong> Email address, name, password (encrypted)</li>
              <li><strong>Care Profile:</strong> Information about your loved one including name, date of birth, home address, emergency contacts, and biographical details you choose to share</li>
              <li><strong>Care Plan Data:</strong> Daily tasks, schedules, and instructions you create</li>
              <li><strong>Check-in Data:</strong> Mood ratings, sleep quality ratings, and voice notes</li>
              <li><strong>Journal Entries:</strong> Notes and observations you record</li>
              <li><strong>Voice Recordings:</strong> Audio recordings made through the app (transcribed and stored)</li>
            </ul>

            <h3 className="text-lg font-medium font-display text-text-primary mb-3">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li><strong>Location Data:</strong> GPS location when using location features (with explicit consent)</li>
              <li><strong>Device Information:</strong> Device type, operating system, app version</li>
              <li><strong>Usage Data:</strong> Features used, timestamps, app interactions</li>
              <li><strong>Push Notification Tokens:</strong> For delivering notifications to your devices</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">3. How We Use Your Information</h2>
            <p className="text-text-secondary mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li>Provide and maintain the Service</li>
              <li>Sync data between family members in your care circle</li>
              <li>Send task reminders and safety alerts</li>
              <li>Generate AI-powered care suggestions (processed securely)</li>
              <li>Improve our services and develop new features</li>
              <li>Communicate with you about your account and updates</li>
              <li>Ensure the security of our Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-text-secondary mb-4">
              <strong>We do not sell your personal data.</strong> We may share information:
            </p>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li><strong>Within your Care Circle:</strong> Family members you invite can see shared care data</li>
              <li><strong>Service Providers:</strong> We use trusted third parties for hosting (Supabase), email (Resend), AI processing (Google), and payments (Stripe, RevenueCat)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">5. Data Storage and Security</h2>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li>Data is stored on secure servers in the European Union (GDPR-compliant)</li>
              <li>All data is encrypted at rest and in transit</li>
              <li>We implement industry-standard security measures</li>
              <li>Voice notes are stored with encryption</li>
              <li>Location data is retained for 30 days, then automatically deleted</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">6. Your Rights (GDPR)</h2>
            <p className="text-text-secondary mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Erasure:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
              <li><strong>Data Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Restriction:</strong> Limit how we process your data</li>
              <li><strong>Objection:</strong> Object to certain types of processing</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="text-text-secondary mb-4">
              To exercise these rights, go to Settings &gt; Privacy &amp; Data in the app, or contact us at privacy@memoguard.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">7. Location Data</h2>
            <p className="text-text-secondary mb-4">
              Location tracking is optional and requires explicit consent. You can:
            </p>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li>Enable or disable location features at any time</li>
              <li>Choose which family members can see location</li>
              <li>Set up safe zones that trigger notifications</li>
            </ul>
            <p className="text-text-secondary mb-4">
              Location data older than 30 days is automatically deleted.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">8. Children&apos;s Privacy</h2>
            <p className="text-text-secondary mb-4">
              MemoGuard is not intended for children under 18. We do not knowingly collect
              information from children. If you believe a child has provided us with personal
              information, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">9. Data Retention</h2>
            <ul className="list-disc pl-6 text-text-secondary mb-4 space-y-2">
              <li>Account data: Retained until you delete your account</li>
              <li>Care plan data: Retained until you delete your account</li>
              <li>Check-in history: Retained for 2 years or until account deletion</li>
              <li>Location data: Automatically deleted after 30 days</li>
              <li>Voice recordings: Retained until you delete them or your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">10. International Transfers</h2>
            <p className="text-text-secondary mb-4">
              Your data is primarily stored in the EU. When we use service providers outside
              the EU, we ensure appropriate safeguards are in place (Standard Contractual Clauses
              or equivalent).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">11. Changes to This Policy</h2>
            <p className="text-text-secondary mb-4">
              We may update this Privacy Policy from time to time. We will notify you of
              significant changes via email or in-app notification. Continued use of the
              Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-display text-text-primary mb-4">12. Contact Us</h2>
            <p className="text-text-secondary mb-4">
              For privacy-related questions or to exercise your rights:
            </p>
            <ul className="list-none text-text-secondary space-y-1">
              <li>Email: privacy@memoguard.com</li>
              <li>Address: Bucharest, Romania</li>
            </ul>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-surface-border">
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/terms" className="hover:text-brand-600">
              Terms of Service
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
