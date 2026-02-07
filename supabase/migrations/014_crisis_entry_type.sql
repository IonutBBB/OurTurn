-- Migration 014: Add 'crisis' to care_journal_entries entry_type

ALTER TABLE care_journal_entries DROP CONSTRAINT IF EXISTS care_journal_entries_entry_type_check;
ALTER TABLE care_journal_entries ADD CONSTRAINT care_journal_entries_entry_type_check
  CHECK (entry_type IN ('observation', 'note', 'milestone', 'crisis'));
