/**
 * Hook for reading/writing activity difficulty levels.
 * Adjusts difficulty based on a rolling 7-completion window.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getDomainDifficulty,
  upsertDomainDifficulty,
  getRecentSessions,
} from '@ourturn/supabase';
import type { CognitiveDomain, DifficultyLevel } from '@ourturn/shared';

const DIFFICULTY_ORDER: DifficultyLevel[] = ['gentle', 'moderate', 'challenging'];

function nextLevel(current: DifficultyLevel): DifficultyLevel {
  const idx = DIFFICULTY_ORDER.indexOf(current);
  return DIFFICULTY_ORDER[Math.min(idx + 1, DIFFICULTY_ORDER.length - 1)];
}

function prevLevel(current: DifficultyLevel): DifficultyLevel {
  const idx = DIFFICULTY_ORDER.indexOf(current);
  return DIFFICULTY_ORDER[Math.max(idx - 1, 0)];
}

export function useDifficulty(
  householdId: string | null | undefined,
  domain: CognitiveDomain
) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('gentle');
  const [isLoading, setIsLoading] = useState(true);

  // Load current difficulty
  useEffect(() => {
    if (!householdId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const data = await getDomainDifficulty(householdId!, domain);
        if (!cancelled && data) {
          setDifficulty(data.current_level);
        }
      } catch {
        // Keep default
      }
      if (!cancelled) setIsLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [householdId, domain]);

  // Record a completion and adjust difficulty
  const recordCompletion = useCallback(
    async (durationSeconds: number) => {
      if (!householdId) return;

      try {
        // Get recent sessions to calculate success rate
        const recent = await getRecentSessions(householdId, domain, 7);
        const totalAttempts = recent.length + 1;
        const totalCompletions = recent.filter((s) => s.completed_at && !s.skipped).length + 1;

        // Calculate average duration
        const durations = recent
          .filter((s) => s.duration_seconds)
          .map((s) => s.duration_seconds!);
        durations.push(durationSeconds);
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

        // Determine new difficulty based on completion rate
        const rate = totalCompletions / totalAttempts;
        let newLevel = difficulty;
        if (totalAttempts >= 5) {
          if (rate > 0.8) {
            newLevel = nextLevel(difficulty);
          } else if (rate < 0.4) {
            newLevel = prevLevel(difficulty);
          }
        }

        await upsertDomainDifficulty(
          householdId,
          domain,
          newLevel,
          totalAttempts,
          totalCompletions,
          avgDuration
        );

        setDifficulty(newLevel);
      } catch {
        // Silently fail — difficulty will stay the same
      }
    },
    [householdId, domain, difficulty]
  );

  return { difficulty, isLoading, recordCompletion };
}
