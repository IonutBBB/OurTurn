import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../client';
import type { TaskCompletion } from '@memoguard/shared';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeCompletionsOptions {
  householdId: string | null | undefined;
  date?: string; // YYYY-MM-DD format, optional - if not provided, subscribes to all completions
  enabled?: boolean;
}

interface UseRealtimeCompletionsReturn {
  completions: TaskCompletion[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for subscribing to real-time task completion updates
 * Used in dashboard to show task completion status
 *
 * This hook specifically watches the task_completions table for INSERT events
 * and updates when patients mark tasks as done.
 */
export function useRealtimeCompletions({
  householdId,
  date,
  enabled = true,
}: UseRealtimeCompletionsOptions): UseRealtimeCompletionsReturn {
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    if (!householdId || !enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('task_completions')
        .select('*')
        .eq('household_id', householdId)
        .order('completed_at', { ascending: false });

      // Filter by date if provided
      if (date) {
        query = query.eq('date', date);
      } else {
        // Default to last 7 days if no date specified
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('date', weekAgo.toISOString().split('T')[0]);
      }

      const { data: fetchedCompletions, error: completionsError } = await query;

      if (completionsError) throw completionsError;
      setCompletions(fetchedCompletions || []);
    } catch (err) {
      console.error('Failed to fetch completions:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch completions'));
    } finally {
      setIsLoading(false);
    }
  }, [householdId, date, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!householdId || !enabled) return;

    let completionsChannel: RealtimeChannel | null = null;

    // Subscribe to completion changes (INSERT when patient completes task)
    const channelName = date
      ? `completions:${householdId}:${date}`
      : `completions:${householdId}:all`;

    completionsChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_completions',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          const completion = payload.new as TaskCompletion;

          // If we're filtering by date, only add if it matches
          if (date && completion.date !== date) return;

          setCompletions((prev: TaskCompletion[]) => {
            // Avoid duplicates
            if (prev.find((c: TaskCompletion) => c.id === completion.id)) return prev;
            return [completion, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'task_completions',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          const updated = payload.new as TaskCompletion;

          // If we're filtering by date, only update if it matches
          if (date && updated.date !== date) return;

          setCompletions((prev: TaskCompletion[]) =>
            prev.map((c: TaskCompletion) => (c.id === updated.id ? updated : c))
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'task_completions',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          const deleted = payload.old as TaskCompletion;
          setCompletions((prev: TaskCompletion[]) =>
            prev.filter((c: TaskCompletion) => c.id !== deleted.id)
          );
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      if (completionsChannel) {
        supabase.removeChannel(completionsChannel);
      }
    };
  }, [householdId, date, enabled]);

  return {
    completions,
    isLoading,
    error,
    refetch: fetchData,
  };
}
