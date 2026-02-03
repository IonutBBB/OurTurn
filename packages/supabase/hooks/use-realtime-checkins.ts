import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../client';
import type { DailyCheckin } from '@memoguard/shared';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeCheckinsOptions {
  householdId: string | null | undefined;
  date?: string; // YYYY-MM-DD format, defaults to today
  enabled?: boolean;
}

interface UseRealtimeCheckinsReturn {
  checkin: DailyCheckin | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for subscribing to real-time daily check-in updates
 * Used in caregiver apps to see patient's mood and sleep quality
 */
export function useRealtimeCheckins({
  householdId,
  date,
  enabled = true,
}: UseRealtimeCheckinsOptions): UseRealtimeCheckinsReturn {
  const [checkin, setCheckin] = useState<DailyCheckin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const today = date || new Date().toISOString().split('T')[0];

  // Fetch initial data
  const fetchData = useCallback(async () => {
    if (!householdId || !enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('household_id', householdId)
        .eq('date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is fine
        throw fetchError;
      }

      setCheckin(data || null);
    } catch (err) {
      console.error('Failed to fetch check-in:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch check-in'));
    } finally {
      setIsLoading(false);
    }
  }, [householdId, today, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!householdId || !enabled) return;

    let channel: RealtimeChannel | null = null;

    channel = supabase
      .channel(`checkins:${householdId}:${today}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_checkins',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          const checkinData = (payload.new || payload.old) as DailyCheckin;

          // Only process check-ins for today
          if (checkinData.date !== today) return;

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setCheckin(payload.new as DailyCheckin);
          } else if (payload.eventType === 'DELETE') {
            setCheckin(null);
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [householdId, today, enabled]);

  return {
    checkin,
    isLoading,
    error,
    refetch: fetchData,
  };
}

interface UseRealtimeCheckinHistoryOptions {
  householdId: string | null | undefined;
  days?: number; // Number of days to fetch, defaults to 7
  enabled?: boolean;
}

interface UseRealtimeCheckinHistoryReturn {
  checkins: DailyCheckin[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching check-in history over multiple days
 * Used for trends and caregiver dashboards
 */
export function useRealtimeCheckinHistory({
  householdId,
  days = 7,
  enabled = true,
}: UseRealtimeCheckinHistoryOptions): UseRealtimeCheckinHistoryReturn {
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  // Fetch initial data
  const fetchData = useCallback(async () => {
    if (!householdId || !enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('household_id', householdId)
        .gte('date', startDateStr)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;

      setCheckins(data || []);
    } catch (err) {
      console.error('Failed to fetch check-in history:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch check-in history'));
    } finally {
      setIsLoading(false);
    }
  }, [householdId, startDateStr, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!householdId || !enabled) return;

    let channel: RealtimeChannel | null = null;

    channel = supabase
      .channel(`checkins-history:${householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_checkins',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newCheckin = payload.new as DailyCheckin;
            setCheckins((prev: DailyCheckin[]) => {
              // Avoid duplicates and maintain order
              if (prev.find((c: DailyCheckin) => c.id === newCheckin.id)) return prev;
              return [newCheckin, ...prev].sort(
                (a: DailyCheckin, b: DailyCheckin) => new Date(b.date).getTime() - new Date(a.date).getTime()
              );
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as DailyCheckin;
            setCheckins((prev: DailyCheckin[]) =>
              prev.map((c: DailyCheckin) => (c.id === updated.id ? updated : c))
            );
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as DailyCheckin;
            setCheckins((prev: DailyCheckin[]) => prev.filter((c: DailyCheckin) => c.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [householdId, enabled]);

  return {
    checkins,
    isLoading,
    error,
    refetch: fetchData,
  };
}
