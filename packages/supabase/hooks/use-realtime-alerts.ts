import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../client';
import type { LocationAlert, LocationAlertType } from '@ourturn/shared';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeAlertsOptions {
  householdId: string | null | undefined;
  hours?: number; // Number of hours to fetch, defaults to 24
  enabled?: boolean;
}

interface UseRealtimeAlertsReturn {
  alerts: LocationAlert[];
  unacknowledgedCount: number;
  isLoading: boolean;
  error: Error | null;
  acknowledgeAlert: (alertId: string, caregiverId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook for subscribing to real-time location alerts
 * Used in caregiver apps to receive safety notifications
 */
export function useRealtimeAlerts({
  householdId,
  hours = 24,
  enabled = true,
}: UseRealtimeAlertsOptions): UseRealtimeAlertsReturn {
  const [alerts, setAlerts] = useState<LocationAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Calculate time threshold
  const sinceDate = new Date();
  sinceDate.setHours(sinceDate.getHours() - hours);
  const since = sinceDate.toISOString();

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
        .from('location_alerts')
        .select('*')
        .eq('household_id', householdId)
        .gte('triggered_at', since)
        .order('triggered_at', { ascending: false });

      if (fetchError) throw fetchError;

      setAlerts(data || []);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch alerts'));
    } finally {
      setIsLoading(false);
    }
  }, [householdId, since, enabled]);

  // Acknowledge alert
  const acknowledgeAlert = useCallback(
    async (alertId: string, caregiverId: string) => {
      try {
        const { error: updateError } = await supabase
          .from('location_alerts')
          .update({
            acknowledged: true,
            acknowledged_by: caregiverId,
          })
          .eq('id', alertId);

        if (updateError) throw updateError;

        // Optimistically update local state
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alertId
              ? { ...a, acknowledged: true, acknowledged_by: caregiverId }
              : a
          )
        );
      } catch (err) {
        console.error('Failed to acknowledge alert:', err);
        throw err;
      }
    },
    []
  );

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!householdId || !enabled) return;

    let channel: RealtimeChannel | null = null;

    channel = supabase
      .channel(`alerts:${householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'location_alerts',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newAlert = payload.new as LocationAlert;
            // Add to the beginning of the list (most recent first)
            setAlerts((prev: LocationAlert[]) => {
              // Avoid duplicates
              if (prev.find((a: LocationAlert) => a.id === newAlert.id)) return prev;
              return [newAlert, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as LocationAlert;
            setAlerts((prev: LocationAlert[]) =>
              prev.map((a: LocationAlert) => (a.id === updated.id ? updated : a))
            );
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as LocationAlert;
            setAlerts((prev: LocationAlert[]) => prev.filter((a: LocationAlert) => a.id !== deleted.id));
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

  // Calculate unacknowledged count
  const unacknowledgedCount = alerts.filter((a: LocationAlert) => !a.acknowledged).length;

  return {
    alerts,
    unacknowledgedCount,
    isLoading,
    error,
    acknowledgeAlert,
    refetch: fetchData,
  };
}

interface UseRealtimeAlertsByTypeOptions {
  householdId: string | null | undefined;
  type: LocationAlertType;
  days?: number; // Number of days to fetch, defaults to 7
  enabled?: boolean;
}

interface UseRealtimeAlertsByTypeReturn {
  alerts: LocationAlert[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching alerts of a specific type
 * Useful for "Take Me Home" tapped history
 */
export function useRealtimeAlertsByType({
  householdId,
  type,
  days = 7,
  enabled = true,
}: UseRealtimeAlertsByTypeOptions): UseRealtimeAlertsByTypeReturn {
  const [alerts, setAlerts] = useState<LocationAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);
  const since = sinceDate.toISOString();

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
        .from('location_alerts')
        .select('*')
        .eq('household_id', householdId)
        .eq('type', type)
        .gte('triggered_at', since)
        .order('triggered_at', { ascending: false });

      if (fetchError) throw fetchError;

      setAlerts(data || []);
    } catch (err) {
      console.error('Failed to fetch alerts by type:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch alerts'));
    } finally {
      setIsLoading(false);
    }
  }, [householdId, type, since, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!householdId || !enabled) return;

    let channel: RealtimeChannel | null = null;

    channel = supabase
      .channel(`alerts-${type}:${householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'location_alerts',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          const alert = (payload.new || payload.old) as LocationAlert;

          // Only process alerts of the specified type
          if (alert.type !== type) return;

          if (payload.eventType === 'INSERT') {
            setAlerts((prev: LocationAlert[]) => {
              if (prev.find((a: LocationAlert) => a.id === alert.id)) return prev;
              return [alert, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as LocationAlert;
            setAlerts((prev: LocationAlert[]) =>
              prev.map((a: LocationAlert) => (a.id === updated.id ? updated : a))
            );
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as LocationAlert;
            setAlerts((prev: LocationAlert[]) => prev.filter((a: LocationAlert) => a.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [householdId, type, enabled]);

  return {
    alerts,
    isLoading,
    error,
    refetch: fetchData,
  };
}
