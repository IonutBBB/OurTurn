import { createClient as createServerClient } from '@/lib/supabase/server';
import { toISOCountryCode } from '@/utils/country-code-map';
import { ResourcesTab } from './resources-tab';

export default async function ResourcesPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: caregiver } = await supabase
    .from('caregivers')
    .select('id, household_id, households(country)')
    .eq('id', user?.id)
    .single();

  if (!caregiver) return null;

  const rawHouseholds = caregiver.households as { country: string } | { country: string }[] | null;
  const household = Array.isArray(rawHouseholds) ? rawHouseholds[0] : rawHouseholds;
  const countryRaw: string | null = household?.country ?? null;

  // Fetch journey progress
  const { data: progressRows } = await supabase
    .from('resource_journey_progress')
    .select('*')
    .eq('caregiver_id', caregiver.id);

  // Fetch local support for the household's country
  const countryCode = toISOCountryCode(countryRaw);

  let localSupport: any[] = [];
  if (countryCode) {
    const { data } = await supabase
      .from('resource_local_support')
      .select('*')
      .eq('country_code', countryCode)
      .order('sort_order');
    localSupport = data || [];
  }

  return (
    <ResourcesTab
      caregiverId={caregiver.id}
      householdId={caregiver.household_id}
      progressRows={progressRows || []}
      localSupport={localSupport}
      hasLocalSupport={localSupport.length > 0}
    />
  );
}
