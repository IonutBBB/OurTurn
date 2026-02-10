import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { LandingContent } from './landing-content';

export default async function Home() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return <LandingContent />;
}
