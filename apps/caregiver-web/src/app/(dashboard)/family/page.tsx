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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Family Circle</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Invite family members and share care notes</p>
        </div>
        <div className="bg-white dark:bg-[#1E1E1E] shadow-lg dark:shadow-black/20 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">👨‍👩‍👧</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Complete Setup First</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Set up your care profile to invite family members and share care updates.
          </p>
          <a
            href="/onboarding"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 dark:from-teal-500 dark:to-teal-400 text-white font-semibold rounded-xl shadow-lg shadow-teal-600/25 dark:shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-600/30 dark:hover:shadow-teal-500/30 transition-all duration-200 hover:-translate-y-0.5"
          >
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Family Circle</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage caregivers and share care notes</p>
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
