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
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-6">Settings</h1>
        <div className="bg-surface-card rounded-xl border border-surface-border p-8 text-center">
          <p className="text-text-muted">Please complete onboarding first.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Settings</h1>
      <SettingsClient
        caregiver={caregiver}
        household={household}
        careCode={household.care_code}
      />
    </div>
  );
}
