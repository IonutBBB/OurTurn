// Care Journal types

export type JournalEntryType = 'observation' | 'note' | 'milestone' | 'crisis';

export interface CareJournalEntry {
  id: string;
  household_id: string;
  author_id: string;
  content: string;
  entry_type: JournalEntryType;
  created_at: string;
  updated_at: string | null;
}

export interface CareJournalEntryInsert {
  household_id: string;
  author_id: string;
  content: string;
  entry_type?: JournalEntryType;
}

// Extended entry with author info for display
export interface CareJournalEntryWithAuthor extends CareJournalEntry {
  author_name: string;
  author_relationship?: string;
}
