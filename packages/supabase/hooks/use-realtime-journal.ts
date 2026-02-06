import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../client';
import type { CareJournalEntry } from '@ourturn/shared';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeJournalOptions {
  householdId: string | null | undefined;
  limit?: number;
  enabled?: boolean;
}

interface UseRealtimeJournalReturn {
  entries: CareJournalEntry[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

/**
 * Hook for subscribing to real-time care journal entry updates
 * Used in Family Circle page and Dashboard to show shared notes
 *
 * This hook watches the care_journal_entries table for INSERT events
 * so caregivers see new notes from family members in real-time.
 */
export function useRealtimeJournal({
  householdId,
  limit = 20,
  enabled = true,
}: UseRealtimeJournalOptions): UseRealtimeJournalReturn {
  const [entries, setEntries] = useState<CareJournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  // Fetch initial data
  const fetchData = useCallback(
    async (reset = true) => {
      if (!householdId || !enabled) {
        setIsLoading(false);
        return;
      }

      if (reset) {
        setIsLoading(true);
        setOffset(0);
      }
      setError(null);

      try {
        const currentOffset = reset ? 0 : offset;

        const { data: fetchedEntries, error: entriesError } = await supabase
          .from('care_journal_entries')
          .select('*')
          .eq('household_id', householdId)
          .order('created_at', { ascending: false })
          .range(currentOffset, currentOffset + limit - 1);

        if (entriesError) throw entriesError;

        const newEntries = fetchedEntries || [];

        if (reset) {
          setEntries(newEntries);
        } else {
          setEntries((prev) => [...prev, ...newEntries]);
        }

        setHasMore(newEntries.length === limit);
        setOffset(currentOffset + newEntries.length);
      } catch (err) {
        console.error('Failed to fetch journal entries:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch journal entries'));
      } finally {
        setIsLoading(false);
      }
    },
    [householdId, limit, enabled, offset]
  );

  // Load more entries
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchData(false);
  }, [fetchData, hasMore, isLoading]);

  // Initial fetch
  useEffect(() => {
    fetchData(true);
  }, [householdId, limit, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to real-time updates
  useEffect(() => {
    if (!householdId || !enabled) return;

    let journalChannel: RealtimeChannel | null = null;

    // Subscribe to journal entry changes (INSERT when someone adds a note)
    journalChannel = supabase
      .channel(`journal:${householdId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'care_journal_entries',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          const entry = payload.new as CareJournalEntry;

          setEntries((prev: CareJournalEntry[]) => {
            // Avoid duplicates
            if (prev.find((e: CareJournalEntry) => e.id === entry.id)) return prev;
            // Add to the beginning (most recent first)
            return [entry, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'care_journal_entries',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          const updated = payload.new as CareJournalEntry;
          setEntries((prev: CareJournalEntry[]) =>
            prev.map((e: CareJournalEntry) => (e.id === updated.id ? updated : e))
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'care_journal_entries',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          const deleted = payload.old as CareJournalEntry;
          setEntries((prev: CareJournalEntry[]) =>
            prev.filter((e: CareJournalEntry) => e.id !== deleted.id)
          );
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      if (journalChannel) {
        supabase.removeChannel(journalChannel);
      }
    };
  }, [householdId, enabled]);

  return {
    entries,
    isLoading,
    error,
    refetch: () => fetchData(true),
    hasMore,
    loadMore,
  };
}
