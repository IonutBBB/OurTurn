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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Settings</h1>
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Please complete onboarding first.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Settings</h1>
      <SettingsClient
        caregiver={caregiver}
        household={household}
        careCode={household.care_code}
      />
    </div>
  );
}
