import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../client';
import type { LocationLog, SafeZone } from '@ourturn/shared';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeLocationOptions {
  householdId: string | null | undefined;
  enabled?: boolean;
}

interface UseRealtimeLocationReturn {
  latestLocation: LocationLog | null;
  safeZones: SafeZone[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for subscribing to real-time location updates
 * Used in caregiver apps to track patient location
 */
export function useRealtimeLocation({
  householdId,
  enabled = true,
}: UseRealtimeLocationOptions): UseRealtimeLocationReturn {
  const [latestLocation, setLatestLocation] = useState<LocationLog | null>(null);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
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
      // Fetch latest location
      const { data: location, error: locationError } = await supabase
        .from('location_logs')
        .select('*')
        .eq('household_id', householdId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (locationError && locationError.code !== 'PGRST116') {
        throw locationError;
      }

      setLatestLocation(location || null);

      // Fetch safe zones
      const { data: zones, error: zonesError } = await supabase
        .from('safe_zones')
        .select('*')
        .eq('household_id', householdId)
        .eq('active', true)
        .order('created_at', { ascending: true });

      if (zonesError) throw zonesError;

      setSafeZones(zones || []);
    } catch (err) {
      console.error('Failed to fetch location data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch location data'));
    } finally {
      setIsLoading(false);
    }
  }, [householdId, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe to real-time location updates
  useEffect(() => {
    if (!householdId || !enabled) return;

    let locationChannel: RealtimeChannel | null = null;
    let zonesChannel: RealtimeChannel | null = null;

    // Subscribe to location logs
    locationChannel = supabase
      .channel(`location:${householdId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'location_logs',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          const newLocation = payload.new as LocationLog;
          setLatestLocation((prev: LocationLog | null) => {
            // Only update if this is newer
            if (!prev || new Date(newLocation.timestamp) > new Date(prev.timestamp)) {
              return newLocation;
            }
            return prev;
          });
        }
      )
      .subscribe();

    // Subscribe to safe zone changes
    zonesChannel = supabase
      .channel(`safe-zones:${householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'safe_zones',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newZone = payload.new as SafeZone;
            if (newZone.active) {
              setSafeZones((prev: SafeZone[]) => [...prev, newZone]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as SafeZone;
            setSafeZones((prev: SafeZone[]) => {
              if (updated.active) {
                // Update or add
                const exists = prev.find((z: SafeZone) => z.id === updated.id);
                if (exists) {
                  return prev.map((z: SafeZone) => (z.id === updated.id ? updated : z));
                }
                return [...prev, updated];
              } else {
                // Remove if deactivated
                return prev.filter((z: SafeZone) => z.id !== updated.id);
              }
            });
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as SafeZone;
            setSafeZones((prev: SafeZone[]) => prev.filter((z: SafeZone) => z.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      if (locationChannel) {
        supabase.removeChannel(locationChannel);
      }
      if (zonesChannel) {
        supabase.removeChannel(zonesChannel);
      }
    };
  }, [householdId, enabled]);

  return {
    latestLocation,
    safeZones,
    isLoading,
    error,
    refetch: fetchData,
  };
}

interface UseRealtimeLocationHistoryOptions {
  householdId: string | null | undefined;
  date?: string; // YYYY-MM-DD format, defaults to today
  enabled?: boolean;
}

interface UseRealtimeLocationHistoryReturn {
  history: LocationLog[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching location history for a specific day
 * Used in caregiver apps to see patient's movement throughout the day
 */
export function useRealtimeLocationHistory({
  householdId,
  date,
  enabled = true,
}: UseRealtimeLocationHistoryOptions): UseRealtimeLocationHistoryReturn {
  const [history, setHistory] = useState<LocationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const today = date || new Date().toISOString().split('T')[0];
  const startOfDay = `${today}T00:00:00.000Z`;
  const endOfDay = `${today}T23:59:59.999Z`;

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
        .from('location_logs')
        .select('*')
        .eq('household_id', householdId)
        .gte('timestamp', startOfDay)
        .lte('timestamp', endOfDay)
        .order('timestamp', { ascending: true });

      if (fetchError) throw fetchError;

      setHistory(data || []);
    } catch (err) {
      console.error('Failed to fetch location history:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch location history'));
    } finally {
      setIsLoading(false);
    }
  }, [householdId, startOfDay, endOfDay, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe to real-time updates for today
  useEffect(() => {
    if (!householdId || !enabled) return;

    let channel: RealtimeChannel | null = null;

    channel = supabase
      .channel(`location-history:${householdId}:${today}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'location_logs',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          const newLocation = payload.new as LocationLog;
          const timestamp = new Date(newLocation.timestamp);

          // Only add if it's from today
          if (
            timestamp >= new Date(startOfDay) &&
            timestamp <= new Date(endOfDay)
          ) {
            setHistory((prev) => {
              // Avoid duplicates and maintain order
              if (prev.find((l) => l.id === newLocation.id)) return prev;
              return [...prev, newLocation].sort(
                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              );
            });
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [householdId, today, startOfDay, endOfDay, enabled]);

  return {
    history,
    isLoading,
    error,
    refetch: fetchData,
  };
}
