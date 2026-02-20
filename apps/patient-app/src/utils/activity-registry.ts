/**
 * Activity registry — patient-app rendering layer on top of shared definitions.
 * Adds theme colors (backgroundColor, borderColor) and routes for the patient app.
 * The theme-agnostic metadata lives in @ourturn/shared/data/activity-definitions.
 */

import type { ActivityDefinition, AllActivityType, ActivityCategory } from '@ourturn/shared';
import {
  SHARED_ACTIVITY_DEFINITIONS,
  SHARED_ACTIVITY_CATEGORIES,
} from '@ourturn/shared';
import { COLORS } from '../theme';

/** Map activity categories to patient-app theme colors */
const CATEGORY_COLORS: Record<ActivityCategory, { bg: string; border: string }> = {
  words_language: { bg: COLORS.cognitiveBg, border: COLORS.cognitive },
  memory_attention: { bg: COLORS.socialBg, border: COLORS.social },
  logic_reasoning: { bg: COLORS.successBg, border: COLORS.success },
  knowledge: { bg: COLORS.amberBg, border: COLORS.amber },
  opinion_choices: { bg: COLORS.medicationBg, border: COLORS.medication },
  reminiscence: { bg: COLORS.physicalBg, border: COLORS.physical },
};

/** Full activity registry with rendering colors and routes */
export const ACTIVITY_REGISTRY: ActivityDefinition[] = SHARED_ACTIVITY_DEFINITIONS.map((def) => {
  const colors = CATEGORY_COLORS[def.category];
  return {
    ...def,
    backgroundColor: colors.bg,
    borderColor: colors.border,
    route: `/activity-stim/${def.type}`,
  };
});

/** Get an activity definition by type */
export function getActivityByType(type: AllActivityType | string): ActivityDefinition | undefined {
  return ACTIVITY_REGISTRY.find((a) => a.type === type);
}

/** Get all activities for a category */
export function getActivitiesByCategory(category: ActivityCategory): ActivityDefinition[] {
  return ACTIVITY_REGISTRY.filter((a) => a.category === category);
}

/** Get all activities */
export function getAllActivities(): ActivityDefinition[] {
  return ACTIVITY_REGISTRY;
}

/** Activity categories in display order */
export const ACTIVITY_CATEGORIES = SHARED_ACTIVITY_CATEGORIES;
