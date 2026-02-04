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
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-6">Family Circle</h1>
        <div className="bg-surface-card rounded-xl border border-surface-border p-8 text-center">
          <p className="text-text-muted">Please complete onboarding first.</p>
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
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Family Circle</h1>
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
