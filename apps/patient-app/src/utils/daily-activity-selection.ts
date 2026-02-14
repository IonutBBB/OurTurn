/**
 * Selects 3-4 activities for "Today's Activities" section.
 * Deterministic per day — same all day.
 */

import type { ActivityDefinition, BrainActivity } from '@ourturn/shared';
import { pickDailyMultiple } from './daily-seed';
import { getNewActivities, getActivityByType } from './activity-registry';

interface SelectionOptions {
  brainActivity: BrainActivity | null;
  hasBiography: boolean;
  completedTypes: Set<string>;
}

export function selectDailyActivities(options: SelectionOptions): ActivityDefinition[] {
  const { brainActivity, hasBiography, completedTypes } = options;
  const result: ActivityDefinition[] = [];

  // 1. Always include brain activity card if available
  if (brainActivity) {
    const brainDef = getActivityByType('brain_activity');
    if (brainDef) result.push(brainDef);
  }

  // 2. Pick from new engagement activities — filter out biography-dependent if no bio
  const candidates = getNewActivities().filter(
    (a) => !a.requiresBiography || hasBiography
  );

  // Pick 3-4 from different categories (deterministic)
  const remaining = 4 - result.length;
  const picked = pickDailyMultiple(candidates, remaining);

  result.push(...picked);

  // Sort: incomplete first, completed last
  result.sort((a, b) => {
    const aCompleted = completedTypes.has(a.type);
    const bCompleted = completedTypes.has(b.type);
    if (aCompleted === bCompleted) return 0;
    return aCompleted ? 1 : -1;
  });

  return result;
}
