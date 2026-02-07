import { createClient as createServerClient } from '@/lib/supabase/server';
import CrisisClient from './crisis-client';

export default async function CrisisPage() {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: caregiver } = await supabase
    .from('caregivers')
    .select('*, households(country)')
    .eq('id', user?.id)
    .single();

  if (!caregiver) {
    return (
      <div className="page-enter space-y-6">
        <div>
          <h1 className="heading-display text-2xl">
            Crisis <span className="heading-accent">Toolkit</span>
          </h1>
        </div>
        <div className="card-paper p-12 text-center max-w-lg mx-auto">
          <p className="text-text-secondary">Please complete setup first.</p>
          <a href="/onboarding" className="btn-primary inline-flex items-center mt-4">
            Start Onboarding
          </a>
        </div>
      </div>
    );
  }

  const householdCountry = Array.isArray(caregiver.households)
    ? caregiver.households[0]?.country
    : caregiver.households?.country;

  return (
    <CrisisClient
      caregiverId={caregiver.id}
      householdId={caregiver.household_id}
      country={householdCountry || 'US'}
    />
  );
}
