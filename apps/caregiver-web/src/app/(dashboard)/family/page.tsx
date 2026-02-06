import { createClient as createServerClient } from '@/lib/supabase/server';
import FamilyClient from './family-client';

export default async function FamilyPage() {
  const supabase = await createServerClient();

  // Get user and caregiver data
  const { data: { user } } = await supabase.auth.getUser();

  const { data: caregiver } = await supabase
    .from('caregivers')
    .select(`
      *,
      households (
        id,
        care_code
      )
    `)
    .eq('id', user?.id)
    .single();

  const household = caregiver?.households;

  if (!caregiver || !household) {
    return (
      <div className="page-enter space-y-6">
        <div>
          <h1 className="heading-display text-2xl">
            Family <span className="heading-accent">Circle</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1">Share the care journey with your family members</p>
        </div>
        <div className="card-paper p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-100/60 dark:bg-brand-100/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">👨‍👩‍👧</span>
          </div>
          <h2 className="text-lg font-display font-bold text-text-primary mb-2">Complete Setup First</h2>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            Set up your care profile to invite family members and share care updates.
          </p>
          <a href="/onboarding" className="btn-primary inline-flex items-center">
            Start Onboarding
          </a>
        </div>
      </div>
    );
  }

  // Get all caregivers for this household
  const { data: caregivers } = await supabase
    .from('caregivers')
    .select('*')
    .eq('household_id', household.id)
    .order('role', { ascending: true })
    .order('created_at', { ascending: true });

  // Get journal entries with author names
  const { data: journalEntries } = await supabase
    .from('care_journal_entries')
    .select('*, caregivers!author_id(name)')
    .eq('household_id', household.id)
    .order('created_at', { ascending: false })
    .limit(50);

  // Transform journal entries to include author name
  const transformedEntries = (journalEntries || []).map((entry) => ({
    ...entry,
    author_name: (entry.caregivers as any)?.name || 'Unknown',
    caregivers: undefined,
  }));

  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 className="heading-display text-2xl">
          Family <span className="heading-accent">Circle</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">Share the care journey with your family members</p>
      </div>
      <FamilyClient
        householdId={household.id}
        careCode={household.care_code}
        currentCaregiverId={caregiver.id}
        initialCaregivers={caregivers || []}
        initialJournalEntries={transformedEntries}
      />
    </div>
  );
}
