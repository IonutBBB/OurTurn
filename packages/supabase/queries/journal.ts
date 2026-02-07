import { supabase } from '../client';
import type {
  CareJournalEntry,
  CareJournalEntryInsert,
  CareJournalEntryWithAuthor,
  JournalEntryType,
} from '@ourturn/shared';

/**
 * Create a new journal entry
 */
export async function createEntry(
  householdId: string,
  authorId: string,
  content: string,
  type: JournalEntryType = 'note'
): Promise<CareJournalEntry> {
  const { data, error } = await supabase
    .from('care_journal_entries')
    .insert({
      household_id: householdId,
      author_id: authorId,
      content,
      entry_type: type,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Get journal entries for a household (paginated)
 */
export async function getEntries(
  householdId: string,
  limit: number = 20,
  offset: number = 0
): Promise<CareJournalEntryWithAuthor[]> {
  const { data, error } = await supabase
    .from('care_journal_entries')
    .select(
      `
      *,
      author:caregivers!author_id(name, relationship)
    `
    )
    .eq('household_id', householdId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  // Transform the data to flatten author info
  return data.map((entry) => {
    const { author, ...rest } = entry;
    const authorData = Array.isArray(author) ? author[0] : author;
    return {
      ...rest,
      author_name: authorData?.name || 'Unknown',
      author_relationship: authorData?.relationship,
    };
  });
}

/**
 * Get entries by type
 */
export async function getEntriesByType(
  householdId: string,
  type: JournalEntryType,
  limit: number = 20
): Promise<CareJournalEntryWithAuthor[]> {
  const { data, error } = await supabase
    .from('care_journal_entries')
    .select(
      `
      *,
      author:caregivers!author_id(name, relationship)
    `
    )
    .eq('household_id', householdId)
    .eq('entry_type', type)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data.map((entry) => {
    const { author, ...rest } = entry;
    const authorData = Array.isArray(author) ? author[0] : author;
    return {
      ...rest,
      author_name: authorData?.name || 'Unknown',
      author_relationship: authorData?.relationship,
    };
  });
}

/**
 * Get entries for a date range (for reports)
 */
export async function getEntriesRange(
  householdId: string,
  startDate: string,
  endDate: string
): Promise<CareJournalEntryWithAuthor[]> {
  const { data, error } = await supabase
    .from('care_journal_entries')
    .select(
      `
      *,
      author:caregivers!author_id(name, relationship)
    `
    )
    .eq('household_id', householdId)
    .gte('created_at', `${startDate}T00:00:00.000Z`)
    .lte('created_at', `${endDate}T23:59:59.999Z`)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((entry) => {
    const { author, ...rest } = entry;
    const authorData = Array.isArray(author) ? author[0] : author;
    return {
      ...rest,
      author_name: authorData?.name || 'Unknown',
      author_relationship: authorData?.relationship,
    };
  });
}

/**
 * Update a journal entry
 */
export async function updateEntry(
  entryId: string,
  content: string,
  entryType: JournalEntryType
): Promise<CareJournalEntry> {
  const { data, error } = await supabase
    .from('care_journal_entries')
    .update({ content, entry_type: entryType })
    .eq('id', entryId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Delete a journal entry
 */
export async function deleteEntry(entryId: string): Promise<void> {
  const { error } = await supabase
    .from('care_journal_entries')
    .delete()
    .eq('id', entryId);

  if (error) throw error;
}

/**
 * Get entry count for a household
 */
export async function getEntryCount(householdId: string): Promise<number> {
  const { count, error } = await supabase
    .from('care_journal_entries')
    .select('*', { count: 'exact', head: true })
    .eq('household_id', householdId);

  if (error) throw error;

  return count || 0;
}
