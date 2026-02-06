'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { createBrowserClient } from '@/lib/supabase';
import { OrganicBlobs } from '@/components/organic-blobs';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-background flex items-center justify-center p-4 relative overflow-hidden">
      <OrganicBlobs variant="subtle" />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo */}
        <header className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
              <span className="text-white text-lg font-bold font-display">M</span>
            </div>
          </Link>
          <h1 className="heading-display text-2xl mb-1">
            {t('caregiverApp.auth.forgotPassword')}
          </h1>
          <p className="text-text-secondary text-sm">
            {t('caregiverApp.auth.forgotPasswordDesc')}
          </p>
        </header>

        <main className="card-paper p-8" role="main" aria-label="Forgot password form">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-status-success-bg flex items-center justify-center mx-auto">
                <span className="text-3xl">✉️</span>
              </div>
              <h2 className="text-lg font-display font-bold text-text-primary">
                {t('caregiverApp.auth.resetEmailSent')}
              </h2>
              <p className="text-sm text-text-secondary">
                {t('caregiverApp.auth.resetEmailSentDesc')}
              </p>
              <Link href="/login" className="btn-primary inline-block mt-4">
                {t('caregiverApp.auth.backToLogin')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-status-danger-bg border border-status-danger/20 rounded-xl text-status-danger text-sm" role="alert">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-1.5">
                  {t('caregiverApp.auth.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="input-warm w-full"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5"
              >
                {loading ? t('common.loading') : t('caregiverApp.auth.sendResetLink')}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-text-secondary">
            <Link href="/login" className="text-brand-600 hover:text-brand-700 font-semibold transition-colors">
              {t('caregiverApp.auth.backToLogin')}
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}
