import { createClient as createServerClient } from '@/lib/supabase/server';
import SettingsClient from './settings-client';

export default async function SettingsPage() {
  const supabase = await createServerClient();

  // Get user and caregiver data
  const { data: { user } } = await supabase.auth.getUser();

  const { data: caregiver } = await supabase
    .from('caregivers')
    .select(`
      *,
      households (*)
    `)
    .eq('id', user?.id)
    .single();

  const household = caregiver?.households;

  if (!caregiver || !household) {
    return (
      <div className="page-enter space-y-6">
        <div>
          <h1 className="heading-display text-2xl">
            <span className="heading-accent">Settings</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1">Manage your account and preferences</p>
        </div>
        <div className="card-paper p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-100/60 dark:bg-brand-100/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">⚙️</span>
          </div>
          <h2 className="text-lg font-display font-bold text-text-primary mb-2">Complete Setup First</h2>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">Please complete onboarding first.</p>
          <a href="/onboarding" className="btn-primary inline-flex items-center">Start Onboarding</a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 className="heading-display text-2xl">
          <span className="heading-accent">Settings</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">Manage your account and preferences</p>
      </div>
      <SettingsClient
        caregiver={caregiver}
        household={household}
        careCode={household.care_code}
      />
    </div>
  );
}
