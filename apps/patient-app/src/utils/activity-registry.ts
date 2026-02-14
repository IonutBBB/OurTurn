/**
 * Activity registry — single source of truth for all 12 evidence-based mind games.
 * Varied cognitive stimulation across 5 categories.
 * No scoring, no difficulty levels, no failure states.
 */

import type { ActivityDefinition, AllActivityType, ActivityCategory } from '@ourturn/shared';
import { COLORS } from '../theme';

export const ACTIVITY_REGISTRY: ActivityDefinition[] = [
  // ── Words & Language ─────────────────────────────────────
  {
    type: 'word_association',
    category: 'words_language',
    cognitiveDomain: 'language',
    emoji: '💬',
    titleKey: 'patientApp.stim.wordAssociation.title',
    descriptionKey: 'patientApp.stim.wordAssociation.description',
    backgroundColor: COLORS.cognitiveBg,
    borderColor: COLORS.cognitive,
    route: '/activity-stim/word_association',
  },
  {
    type: 'proverbs',
    category: 'words_language',
    cognitiveDomain: 'language',
    emoji: '📜',
    titleKey: 'patientApp.stim.proverbs.title',
    descriptionKey: 'patientApp.stim.proverbs.description',
    backgroundColor: COLORS.cognitiveBg,
    borderColor: COLORS.cognitive,
    route: '/activity-stim/proverbs',
  },
  {
    type: 'word_search',
    category: 'words_language',
    cognitiveDomain: 'language',
    emoji: '🔍',
    titleKey: 'patientApp.stim.wordSearch.title',
    descriptionKey: 'patientApp.stim.wordSearch.description',
    backgroundColor: COLORS.cognitiveBg,
    borderColor: COLORS.cognitive,
    route: '/activity-stim/word_search',
  },
  {
    type: 'word_scramble',
    category: 'words_language',
    cognitiveDomain: 'language',
    emoji: '🔤',
    titleKey: 'patientApp.stim.wordScramble.title',
    descriptionKey: 'patientApp.stim.wordScramble.description',
    backgroundColor: COLORS.cognitiveBg,
    borderColor: COLORS.cognitive,
    route: '/activity-stim/word_scramble',
  },

  // ── Memory & Attention ───────────────────────────────────
  {
    type: 'photo_pairs',
    category: 'memory_attention',
    cognitiveDomain: 'visual',
    emoji: '🃏',
    titleKey: 'patientApp.stim.photoPairs.title',
    descriptionKey: 'patientApp.stim.photoPairs.description',
    backgroundColor: COLORS.socialBg,
    borderColor: COLORS.social,
    route: '/activity-stim/photo_pairs',
  },
  {
    type: 'color_sequence',
    category: 'memory_attention',
    cognitiveDomain: 'visual',
    emoji: '🎨',
    titleKey: 'patientApp.stim.colorSequence.title',
    descriptionKey: 'patientApp.stim.colorSequence.description',
    backgroundColor: COLORS.socialBg,
    borderColor: COLORS.social,
    route: '/activity-stim/color_sequence',
  },
  {
    type: 'spot_the_difference',
    category: 'memory_attention',
    cognitiveDomain: 'visual',
    emoji: '👀',
    titleKey: 'patientApp.stim.spotDifference.title',
    descriptionKey: 'patientApp.stim.spotDifference.description',
    backgroundColor: COLORS.socialBg,
    borderColor: COLORS.social,
    route: '/activity-stim/spot_the_difference',
  },

  // ── Logic & Reasoning ────────────────────────────────────
  {
    type: 'odd_one_out',
    category: 'logic_reasoning',
    cognitiveDomain: 'executive',
    emoji: '🤔',
    titleKey: 'patientApp.stim.oddOneOut.title',
    descriptionKey: 'patientApp.stim.oddOneOut.description',
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
    route: '/activity-stim/odd_one_out',
  },
  {
    type: 'pattern_sequence',
    category: 'logic_reasoning',
    cognitiveDomain: 'executive',
    emoji: '🧩',
    titleKey: 'patientApp.stim.patternSequence.title',
    descriptionKey: 'patientApp.stim.patternSequence.description',
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
    route: '/activity-stim/pattern_sequence',
  },
  {
    type: 'category_sort',
    category: 'logic_reasoning',
    cognitiveDomain: 'executive',
    emoji: '📦',
    titleKey: 'patientApp.stim.categorySort.title',
    descriptionKey: 'patientApp.stim.categorySort.description',
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
    route: '/activity-stim/category_sort',
  },

  // ── Knowledge ────────────────────────────────────────────
  {
    type: 'gentle_quiz',
    category: 'knowledge',
    cognitiveDomain: 'current_affairs',
    emoji: '🌟',
    titleKey: 'patientApp.stim.gentleQuiz.title',
    descriptionKey: 'patientApp.stim.gentleQuiz.description',
    backgroundColor: COLORS.amberBg,
    borderColor: COLORS.amber,
    route: '/activity-stim/gentle_quiz',
  },

  // ── Numbers ──────────────────────────────────────────────
  {
    type: 'number_puzzles',
    category: 'numbers',
    cognitiveDomain: 'numbers',
    emoji: '🔢',
    titleKey: 'patientApp.stim.numberPuzzles.title',
    descriptionKey: 'patientApp.stim.numberPuzzles.description',
    backgroundColor: COLORS.infoBg,
    borderColor: COLORS.info,
    route: '/activity-stim/number_puzzles',
  },
];

/** Get an activity definition by type */
export function getActivityByType(type: AllActivityType): ActivityDefinition | undefined {
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
export const ACTIVITY_CATEGORIES: { category: ActivityCategory; emoji: string; titleKey: string }[] = [
  { category: 'words_language', emoji: '💬', titleKey: 'patientApp.categories.wordsLanguage' },
  { category: 'memory_attention', emoji: '🧠', titleKey: 'patientApp.categories.memoryAttention' },
  { category: 'logic_reasoning', emoji: '🧩', titleKey: 'patientApp.categories.logicReasoning' },
  { category: 'knowledge', emoji: '🌟', titleKey: 'patientApp.categories.knowledge' },
  { category: 'numbers', emoji: '🔢', titleKey: 'patientApp.categories.numbers' },
];
