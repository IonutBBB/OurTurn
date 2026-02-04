import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/sidebar';

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
    .select('household_id')
    .eq('id', user.id)
    .single();

  if (!caregiver?.household_id) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen bg-surface-background">
      {/* Skip link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700"
      >
        Skip to main content
      </a>
      <Sidebar />
      <main
        id="main-content"
        className="pl-64"
        role="main"
        aria-label="Main content"
        tabIndex={-1}
      >
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
