'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { createBrowserClient } from '@/lib/supabase';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch {
      setError(t('common.error'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-surface-background to-surface-background flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-300/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and title */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-600/30 mb-6">
            <span className="text-3xl text-white font-bold">M</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent mb-3">MemoGuard</h1>
          <p className="text-lg text-text-secondary">{t('caregiverApp.auth.welcomeBack')}</p>
        </header>

        {/* Login card */}
        <main
          className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 p-8 shadow-xl shadow-brand-900/5"
          role="main"
          aria-label="Login form"
        >
          {/* OAuth buttons */}
          <div className="space-y-3 mb-6" role="group" aria-label="Sign in with social providers">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              aria-label={t('caregiverApp.auth.continueWithGoogle')}
              aria-busy={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-surface-border rounded-xl bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-text-primary font-medium">
                {t('caregiverApp.auth.continueWithGoogle')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthLogin('apple')}
              disabled={loading}
              aria-label={t('caregiverApp.auth.continueWithApple')}
              aria-busy={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-surface-border rounded-xl bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span className="text-text-primary font-medium">
                {t('caregiverApp.auth.continueWithApple')}
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-8" aria-hidden="true">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-border/60" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 text-text-muted">
                {t('caregiverApp.auth.or')}
              </span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailLogin} className="space-y-5" aria-label="Sign in with email">
            {error && (
              <div
                className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-center gap-3"
                role="alert"
                aria-live="assertive"
              >
                <span className="text-red-500">⚠</span>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-2">
                {t('caregiverApp.auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-required="true"
                aria-describedby={error ? 'login-error' : undefined}
                autoComplete="email"
                className="w-full px-4 py-3.5 border border-surface-border rounded-xl bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-2">
                {t('caregiverApp.auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-required="true"
                autoComplete="current-password"
                className="w-full px-4 py-3.5 border border-surface-border rounded-xl bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-brand-600 hover:text-brand-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 rounded transition-colors"
              >
                {t('caregiverApp.auth.forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? t('common.loading') : t('caregiverApp.auth.login')}
            </button>
          </form>

          {/* Sign up link */}
          <p className="mt-8 text-center text-text-secondary">
            {t('caregiverApp.auth.noAccount')}{' '}
            <Link
              href="/signup"
              className="text-brand-600 hover:text-brand-700 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 rounded transition-colors"
            >
              {t('caregiverApp.auth.signup')}
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}
