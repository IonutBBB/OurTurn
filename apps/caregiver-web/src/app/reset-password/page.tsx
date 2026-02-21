'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { createBrowserClient } from '@/lib/supabase';
import { OrganicBlobs } from '@/components/organic-blobs';
import { Logo } from '@/components/logo';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('caregiverApp.auth.passwordsMismatch'));
      return;
    }

    if (password.length < 8) {
      setError(t('caregiverApp.auth.passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 2000);
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
            <Logo className="w-11 h-11" />
          </Link>
          <h1 className="heading-display text-2xl mb-1">
            {t('caregiverApp.auth.resetPassword')}
          </h1>
          <p className="text-text-secondary text-sm">
            {t('caregiverApp.auth.resetPasswordDesc')}
          </p>
        </header>

        <main className="card-paper p-8" role="main" aria-label="Reset password form">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-status-success-bg flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-status-success" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h2 className="text-lg font-display font-bold text-text-primary">
                {t('caregiverApp.auth.passwordUpdated')}
              </h2>
              <p className="text-sm text-text-secondary">
                {t('caregiverApp.auth.passwordUpdatedDesc')}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-status-danger-bg border border-status-danger/20 rounded-xl text-status-danger text-sm" role="alert">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-1.5">
                  {t('caregiverApp.auth.newPassword')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="input-warm w-full"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-text-primary mb-1.5">
                  {t('caregiverApp.auth.confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="input-warm w-full"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5"
              >
                {loading ? t('common.loading') : t('caregiverApp.auth.updatePassword')}
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
