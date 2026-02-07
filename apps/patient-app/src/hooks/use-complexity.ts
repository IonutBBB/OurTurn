import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { supabase } from '@ourturn/supabase';
import type { AppComplexity } from '@ourturn/shared';

/**
 * Hook that reads the patient's app_complexity setting and subscribes to
 * realtime updates so the UI adapts immediately when a caregiver changes it.
 */
export function useComplexity(): AppComplexity {
  const { patient } = useAuthStore();
  const [complexity, setComplexity] = useState<AppComplexity>(
    patient?.app_complexity || 'full'
  );

  useEffect(() => {
    if (!patient?.id) return;

    setComplexity(patient.app_complexity || 'full');

    const channel = supabase
      .channel(`patient-complexity-${patient.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'patients',
          filter: `id=eq.${patient.id}`,
        },
        (payload) => {
          const newComplexity = payload.new?.app_complexity;
          if (newComplexity) {
            setComplexity(newComplexity as AppComplexity);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patient?.id, patient?.app_complexity]);

  return complexity;
}
