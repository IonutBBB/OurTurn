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
      <Sidebar />
      <main className="pl-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
