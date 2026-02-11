import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/sidebar';
import { TopBar } from './top-bar';
import { DashboardErrorWrapper } from './dashboard-error-wrapper';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user has completed onboarding
  const { data: caregiver } = await supabase
    .from('caregivers')
    .select('household_id, name, email')
    .eq('id', user.id)
    .single();

  if (!caregiver?.household_id) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen bg-surface-background transition-colors duration-200">
      {/* Skip link for keyboard navigation — hardcoded for a11y since this is a server component */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>
      <Sidebar userName={caregiver?.name || user.email || 'Caregiver'} userEmail={user.email || ''} />
      <main
        id="main-content"
        className="lg:pl-64 min-h-screen"
        role="main"
        aria-label="Main content"
        tabIndex={-1}
      >
        <TopBar />
        <div className="p-6 lg:p-10 max-w-7xl mx-auto pt-16 lg:pt-10">
          <DashboardErrorWrapper>
            {children}
          </DashboardErrorWrapper>
        </div>
      </main>
    </div>
  );
}
