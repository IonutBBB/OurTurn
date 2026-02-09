/**
 * Activity registry — single source of truth for all 15 activities
 * (10 new brain stimulation + 5 legacy).
 */

import type { ActivityDefinition, AllActivityType, CognitiveDomain } from '@ourturn/shared';
import { COLORS } from '../theme';

export const ACTIVITY_REGISTRY: ActivityDefinition[] = [
  // ── New brain stimulation activities (10) ────────────────────
  {
    type: 'word_association',
    domain: 'language',
    emoji: '💬',
    titleKey: 'patientApp.stim.wordAssociation.title',
    descriptionKey: 'patientApp.stim.wordAssociation.description',
    backgroundColor: COLORS.cognitiveBg,
    borderColor: COLORS.cognitive,
    route: '/activity-stim/word_association',
  },
  {
    type: 'odd_word_out',
    domain: 'language',
    emoji: '🔍',
    titleKey: 'patientApp.stim.oddWordOut.title',
    descriptionKey: 'patientApp.stim.oddWordOut.description',
    backgroundColor: COLORS.cognitiveBg,
    borderColor: COLORS.cognitive,
    route: '/activity-stim/odd_word_out',
  },
  {
    type: 'price_guessing',
    domain: 'numbers',
    emoji: '💰',
    titleKey: 'patientApp.stim.priceGuessing.title',
    descriptionKey: 'patientApp.stim.priceGuessing.description',
    backgroundColor: COLORS.amberBg,
    borderColor: COLORS.amber,
    route: '/activity-stim/price_guessing',
  },
  {
    type: 'sorting_categorizing',
    domain: 'executive',
    emoji: '📦',
    titleKey: 'patientApp.stim.sorting.title',
    descriptionKey: 'patientApp.stim.sorting.description',
    backgroundColor: COLORS.medicationBg,
    borderColor: COLORS.medication,
    route: '/activity-stim/sorting_categorizing',
  },
  {
    type: 'put_in_order',
    domain: 'executive',
    emoji: '📋',
    titleKey: 'patientApp.stim.putInOrder.title',
    descriptionKey: 'patientApp.stim.putInOrder.description',
    backgroundColor: COLORS.medicationBg,
    borderColor: COLORS.medication,
    route: '/activity-stim/put_in_order',
  },
  {
    type: 'pair_matching',
    domain: 'visual',
    emoji: '🃏',
    titleKey: 'patientApp.stim.pairMatching.title',
    descriptionKey: 'patientApp.stim.pairMatching.description',
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
    route: '/activity-stim/pair_matching',
  },
  {
    type: 'sound_identification',
    domain: 'sound',
    emoji: '🔊',
    titleKey: 'patientApp.stim.soundId.title',
    descriptionKey: 'patientApp.stim.soundId.description',
    backgroundColor: COLORS.infoBg,
    borderColor: COLORS.info,
    route: '/activity-stim/sound_identification',
  },
  {
    type: 'this_day_in_history',
    domain: 'current_affairs',
    emoji: '📅',
    titleKey: 'patientApp.stim.history.title',
    descriptionKey: 'patientApp.stim.history.description',
    backgroundColor: COLORS.socialBg,
    borderColor: COLORS.social,
    route: '/activity-stim/this_day_in_history',
  },
  {
    type: 'art_discussion',
    domain: 'creative',
    emoji: '🖼️',
    titleKey: 'patientApp.stim.art.title',
    descriptionKey: 'patientApp.stim.art.description',
    backgroundColor: COLORS.nutritionBg,
    borderColor: COLORS.nutrition,
    route: '/activity-stim/art_discussion',
  },
  {
    type: 'true_or_false',
    domain: 'current_affairs',
    emoji: '✅',
    titleKey: 'patientApp.stim.trueOrFalse.title',
    descriptionKey: 'patientApp.stim.trueOrFalse.description',
    backgroundColor: COLORS.socialBg,
    borderColor: COLORS.social,
    route: '/activity-stim/true_or_false',
  },

  // ── Legacy activities (5) — preserved with domain mapping ───
  {
    type: 'brain_activity',
    domain: 'creative',
    emoji: '🧩',
    titleKey: 'patientApp.activities.todaysActivity',
    descriptionKey: 'patientApp.activities.todaysActivityDesc',
    backgroundColor: COLORS.cognitiveBg,
    borderColor: COLORS.cognitive,
    route: '/activity',
    legacy: true,
  },
  {
    type: 'remember',
    domain: 'creative',
    emoji: '💭',
    titleKey: 'patientApp.activities.remember.title',
    descriptionKey: 'patientApp.activities.remember.description',
    backgroundColor: COLORS.socialBg,
    borderColor: COLORS.social,
    route: '/activity-remember',
    legacy: true,
    requiresBiography: true,
  },
  {
    type: 'listen',
    domain: 'creative',
    emoji: '🎵',
    titleKey: 'patientApp.activities.listen.title',
    descriptionKey: 'patientApp.activities.listen.description',
    backgroundColor: COLORS.infoBg,
    borderColor: COLORS.info,
    route: '/activity-listen',
    legacy: true,
    requiresBiography: true,
  },
  {
    type: 'move',
    domain: 'physical',
    emoji: '🚶',
    titleKey: 'patientApp.activities.move.title',
    descriptionKey: 'patientApp.activities.move.description',
    backgroundColor: COLORS.physicalBg,
    borderColor: COLORS.physical,
    route: '/activity-move',
    legacy: true,
  },
  {
    type: 'create',
    domain: 'creative',
    emoji: '🎨',
    titleKey: 'patientApp.activities.create.title',
    descriptionKey: 'patientApp.activities.create.description',
    backgroundColor: COLORS.nutritionBg,
    borderColor: COLORS.nutrition,
    route: '/activity-create',
    legacy: true,
  },
];

/** Get an activity definition by type */
export function getActivityByType(type: AllActivityType): ActivityDefinition | undefined {
  return ACTIVITY_REGISTRY.find((a) => a.type === type);
}

/** Get all activities for a domain */
export function getActivitiesByDomain(domain: CognitiveDomain): ActivityDefinition[] {
  return ACTIVITY_REGISTRY.filter((a) => a.domain === domain);
}

/** Get only the 10 new stim activities */
export function getNewActivities(): ActivityDefinition[] {
  return ACTIVITY_REGISTRY.filter((a) => !a.legacy);
}

/** Get only legacy activities */
export function getLegacyActivities(): ActivityDefinition[] {
  return ACTIVITY_REGISTRY.filter((a) => a.legacy);
}

/** All 8 cognitive domains in display order */
export const COGNITIVE_DOMAINS: { domain: CognitiveDomain; emoji: string; titleKey: string }[] = [
  { domain: 'language', emoji: '💬', titleKey: 'patientApp.domains.language' },
  { domain: 'numbers', emoji: '🔢', titleKey: 'patientApp.domains.numbers' },
  { domain: 'executive', emoji: '🧠', titleKey: 'patientApp.domains.executive' },
  { domain: 'visual', emoji: '👁️', titleKey: 'patientApp.domains.visual' },
  { domain: 'sound', emoji: '🔊', titleKey: 'patientApp.domains.sound' },
  { domain: 'physical', emoji: '🏃', titleKey: 'patientApp.domains.physical' },
  { domain: 'creative', emoji: '🎨', titleKey: 'patientApp.domains.creative' },
  { domain: 'current_affairs', emoji: '📰', titleKey: 'patientApp.domains.currentAffairs' },
];
