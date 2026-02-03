import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase';

export default async function Home() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard');
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-surface-background">
      {/* Header */}
      <header className="border-b border-surface-border bg-surface-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-brand-700">MemoGuard</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-text-secondary hover:text-text-primary font-medium"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl md:text-6xl">
              <span className="block">Daily care support for</span>
              <span className="block text-brand-600">families living with dementia</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-text-secondary">
              MemoGuard helps you create structure, stay connected, and care with confidence.
              A simple app for your loved one. A powerful dashboard for you.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-lg bg-brand-600 px-8 py-4 text-lg font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                Start free trial
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-surface-border px-8 py-4 text-lg font-semibold text-text-primary hover:bg-surface-card transition-colors"
              >
                Log in
              </Link>
            </div>
          </div>

          {/* Features grid */}
          <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-surface-border bg-surface-card p-8">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Daily Care Plan</h3>
              <p className="text-text-secondary">
                Create a simple, visual schedule for your loved one. Medication reminders, meals, activities — all in one place.
              </p>
            </div>
            <div className="rounded-xl border border-surface-border bg-surface-card p-8">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Location & Safety</h3>
              <p className="text-text-secondary">
                Know where they are. Set safe zones. Get alerts if something seems wrong. Peace of mind, wherever you are.
              </p>
            </div>
            <div className="rounded-xl border border-surface-border bg-surface-card p-8">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">AI Care Coach</h3>
              <p className="text-text-secondary">
                Get personalized guidance, activity suggestions, and answers to your caregiving questions — 24/7.
              </p>
            </div>
            <div className="rounded-xl border border-surface-border bg-surface-card p-8">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Take Me Home</h3>
              <p className="text-text-secondary">
                One tap gives your loved one walking directions home. You get notified instantly. Safety made simple.
              </p>
            </div>
            <div className="rounded-xl border border-surface-border bg-surface-card p-8">
              <div className="text-4xl mb-4">👨‍👩‍👧</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Family Circle</h3>
              <p className="text-text-secondary">
                Invite family members to share the care. Shared journal, coordinated schedules, everyone on the same page.
              </p>
            </div>
            <div className="rounded-xl border border-surface-border bg-surface-card p-8">
              <div className="text-4xl mb-4">💙</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Caregiver Wellbeing</h3>
              <p className="text-text-secondary">
                You matter too. Track your own mood, set self-care reminders, and get support when you need it.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-surface-card py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-text-muted">
            MemoGuard is a wellness app, not a medical device. Always consult healthcare professionals for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
