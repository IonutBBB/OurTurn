import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@ourturn/supabase';
import { useAuthStore } from '../stores/auth-store';
import type { JourneyProgress, JourneyStepStatus } from '@ourturn/shared';
import { JOURNEY_STEPS } from '@ourturn/shared';

interface UseJourneyProgressResult {
  progressMap: Record<string, JourneyProgress>;
  completedCount: number;
  totalCount: number;
  isLoading: boolean;
  updateStepStatus: (slug: string, status: JourneyStepStatus) => Promise<void>;
  toggleChecklistItem: (slug: string, index: number) => Promise<void>;
}

function buildOptimisticProgress(
  existing: JourneyProgress | undefined,
  caregiverId: string,
  householdId: string,
  slug: string,
  status: JourneyStepStatus,
  checklistState: boolean[],
): JourneyProgress {
  return {
    id: existing?.id ?? slug,
    caregiver_id: caregiverId,
    household_id: householdId,
    step_slug: slug,
    status,
    checklist_state: checklistState,
    notes: existing?.notes ?? null,
    completed_at: status === 'completed' ? new Date().toISOString() : null,
    created_at: existing?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function useJourneyProgress(): UseJourneyProgressResult {
  const { caregiver, household } = useAuthStore();
  const [progressMap, setProgressMap] = useState<Record<string, JourneyProgress>>({});
  const [isLoading, setIsLoading] = useState(true);

  const totalCount = JOURNEY_STEPS.length;

  useEffect(() => {
    if (!caregiver?.id || !household?.id) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      const { data } = await supabase
        .from('resource_journey_progress')
        .select('*')
        .eq('caregiver_id', caregiver.id);

      if (data) {
        const map: Record<string, JourneyProgress> = {};
        for (const row of data) {
          map[row.step_slug] = row as JourneyProgress;
        }
        setProgressMap(map);
      }
      setIsLoading(false);
    };

    load();
  }, [caregiver?.id, household?.id]);

  const completedCount = Object.values(progressMap).filter(
    (p) => p.status === 'completed'
  ).length;

  const updateStepStatus = useCallback(
    async (slug: string, status: JourneyStepStatus) => {
      if (!caregiver?.id || !household?.id) return;

      const existing = progressMap[slug];
      const checklistState = existing?.checklist_state ?? [];

      // Optimistic update
      setProgressMap((prev) => ({
        ...prev,
        [slug]: buildOptimisticProgress(existing, caregiver.id, household.id, slug, status, checklistState),
      }));

      // Persist to DB
      supabase
        .from('resource_journey_progress')
        .upsert(
          {
            caregiver_id: caregiver.id,
            household_id: household.id,
            step_slug: slug,
            status,
            checklist_state: checklistState,
            completed_at: status === 'completed' ? new Date().toISOString() : null,
          },
          { onConflict: 'caregiver_id,step_slug' }
        )
        .select()
        .single()
        .then(({ data }) => {
          if (data) {
            setProgressMap((prev) => ({ ...prev, [slug]: data as JourneyProgress }));
          }
        });
    },
    [caregiver?.id, household?.id, progressMap]
  );

  const toggleChecklistItem = useCallback(
    async (slug: string, index: number) => {
      if (!caregiver?.id || !household?.id) return;

      const step = JOURNEY_STEPS.find((s) => s.slug === slug);
      if (!step) return;

      const existing = progressMap[slug];
      const currentState: boolean[] = existing?.checklist_state ??
        new Array(step.checklistKeys.length).fill(false);

      const newState = [...currentState];
      newState[index] = !newState[index];

      // Auto-set status based on checklist
      const allChecked = newState.every(Boolean);
      const anyChecked = newState.some(Boolean);
      let status: JourneyStepStatus = existing?.status ?? 'not_started';
      if (allChecked) {
        status = 'completed';
      } else if (anyChecked && status === 'not_started') {
        status = 'in_progress';
      }

      // Optimistic update
      setProgressMap((prev) => ({
        ...prev,
        [slug]: buildOptimisticProgress(existing, caregiver.id, household.id, slug, status, newState),
      }));

      // Persist to DB
      supabase
        .from('resource_journey_progress')
        .upsert(
          {
            caregiver_id: caregiver.id,
            household_id: household.id,
            step_slug: slug,
            status,
            checklist_state: newState,
            completed_at: allChecked ? new Date().toISOString() : null,
          },
          { onConflict: 'caregiver_id,step_slug' }
        )
        .select()
        .single()
        .then(({ data }) => {
          if (data) {
            setProgressMap((prev) => ({ ...prev, [slug]: data as JourneyProgress }));
          }
        });
    },
    [caregiver?.id, household?.id, progressMap]
  );

  return {
    progressMap,
    completedCount,
    totalCount,
    isLoading,
    updateStepStatus,
    toggleChecklistItem,
  };
}
