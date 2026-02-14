/**
 * Selects 4 activities for "Today's Games" section.
 * Deterministic per day — same all day.
 */

import type { ActivityDefinition } from '@ourturn/shared';
import { pickDailyMultiple } from './daily-seed';
import { getAllActivities } from './activity-registry';

interface SelectionOptions {
  completedTypes: Set<string>;
}

export function selectDailyActivities(options: SelectionOptions): ActivityDefinition[] {
  const { completedTypes } = options;
  const candidates = getAllActivities();

  // Pick 4 from different categories (deterministic)
  const picked = pickDailyMultiple(candidates, 4);

  // Sort: incomplete first, completed last
  picked.sort((a, b) => {
    const aCompleted = completedTypes.has(a.type);
    const bCompleted = completedTypes.has(b.type);
    if (aCompleted === bCompleted) return 0;
    return aCompleted ? 1 : -1;
  });

  return picked;
}
