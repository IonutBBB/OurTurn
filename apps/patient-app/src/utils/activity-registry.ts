/**
 * Activity registry — single source of truth for all 24 evidence-based mind games.
 * Varied cognitive stimulation across 7 categories including opinion-based
 * and reminiscence activities (CST principles).
 * No scoring, no difficulty levels, no failure states.
 */

import type { ActivityDefinition, AllActivityType, ActivityCategory } from '@ourturn/shared';
import { COLORS } from '../theme';

export const ACTIVITY_REGISTRY: ActivityDefinition[] = [
  // ── Words & Language (5) ───────────────────────────────
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
  {
    type: 'rhyme_time',
    category: 'words_language',
    cognitiveDomain: 'language',
    emoji: '🎶',
    titleKey: 'patientApp.stim.rhymeTime.title',
    descriptionKey: 'patientApp.stim.rhymeTime.description',
    backgroundColor: COLORS.cognitiveBg,
    borderColor: COLORS.cognitive,
    route: '/activity-stim/rhyme_time',
  },

  // ── Memory & Attention (4) ─────────────────────────────
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
  {
    type: 'what_changed',
    category: 'memory_attention',
    cognitiveDomain: 'visual',
    emoji: '🔄',
    titleKey: 'patientApp.stim.whatChanged.title',
    descriptionKey: 'patientApp.stim.whatChanged.description',
    backgroundColor: COLORS.socialBg,
    borderColor: COLORS.social,
    route: '/activity-stim/what_changed',
  },
  {
    type: 'name_that_tune',
    category: 'memory_attention',
    cognitiveDomain: 'sound',
    emoji: '🎵',
    titleKey: 'patientApp.stim.nameThatTune.title',
    descriptionKey: 'patientApp.stim.nameThatTune.description',
    backgroundColor: COLORS.socialBg,
    borderColor: COLORS.social,
    route: '/activity-stim/name_that_tune',
  },

  // ── Logic & Reasoning (7) ──────────────────────────────
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
  {
    type: 'which_goes_together',
    category: 'logic_reasoning',
    cognitiveDomain: 'executive',
    emoji: '🤝',
    titleKey: 'patientApp.stim.whichGoesTogether.title',
    descriptionKey: 'patientApp.stim.whichGoesTogether.description',
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
    route: '/activity-stim/which_goes_together',
  },
  {
    type: 'what_comes_next',
    category: 'logic_reasoning',
    cognitiveDomain: 'executive',
    emoji: '➡️',
    titleKey: 'patientApp.stim.whatComesNext.title',
    descriptionKey: 'patientApp.stim.whatComesNext.description',
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
    route: '/activity-stim/what_comes_next',
  },
  {
    type: 'sort_it_out',
    category: 'logic_reasoning',
    cognitiveDomain: 'executive',
    emoji: '🛒',
    titleKey: 'patientApp.stim.sortItOut.title',
    descriptionKey: 'patientApp.stim.sortItOut.description',
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
    route: '/activity-stim/sort_it_out',
  },
  {
    type: 'coin_counting',
    category: 'logic_reasoning',
    cognitiveDomain: 'numbers',
    emoji: '💰',
    titleKey: 'patientApp.stim.coinCounting.title',
    descriptionKey: 'patientApp.stim.coinCounting.description',
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
    route: '/activity-stim/coin_counting',
  },

  // ── Knowledge (4) ──────────────────────────────────────
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
  {
    type: 'picture_clues',
    category: 'knowledge',
    cognitiveDomain: 'current_affairs',
    emoji: '🖼️',
    titleKey: 'patientApp.stim.pictureClues.title',
    descriptionKey: 'patientApp.stim.pictureClues.description',
    backgroundColor: COLORS.amberBg,
    borderColor: COLORS.amber,
    route: '/activity-stim/picture_clues',
  },
  {
    type: 'true_or_false',
    category: 'knowledge',
    cognitiveDomain: 'current_affairs',
    emoji: '✅',
    titleKey: 'patientApp.stim.trueOrFalse.title',
    descriptionKey: 'patientApp.stim.trueOrFalse.description',
    backgroundColor: COLORS.amberBg,
    borderColor: COLORS.amber,
    route: '/activity-stim/true_or_false',
  },
  {
    type: 'this_day_in_history',
    category: 'knowledge',
    cognitiveDomain: 'current_affairs',
    emoji: '📅',
    titleKey: 'patientApp.stim.thisDayInHistory.title',
    descriptionKey: 'patientApp.stim.thisDayInHistory.description',
    backgroundColor: COLORS.amberBg,
    borderColor: COLORS.amber,
    route: '/activity-stim/this_day_in_history',
  },

  // ── Opinion & Choices (2) ──────────────────────────────
  {
    type: 'what_would_you_choose',
    category: 'opinion_choices',
    cognitiveDomain: 'executive',
    emoji: '🤷',
    titleKey: 'patientApp.stim.whatWouldYouChoose.title',
    descriptionKey: 'patientApp.stim.whatWouldYouChoose.description',
    backgroundColor: COLORS.medicationBg,
    borderColor: COLORS.medication,
    route: '/activity-stim/what_would_you_choose',
  },
  {
    type: 'my_favourites',
    category: 'opinion_choices',
    cognitiveDomain: 'executive',
    emoji: '⭐',
    titleKey: 'patientApp.stim.myFavourites.title',
    descriptionKey: 'patientApp.stim.myFavourites.description',
    backgroundColor: COLORS.medicationBg,
    borderColor: COLORS.medication,
    route: '/activity-stim/my_favourites',
  },

  // ── Reminiscence (2) ───────────────────────────────────
  {
    type: 'remember_when',
    category: 'reminiscence',
    cognitiveDomain: 'visual',
    emoji: '📷',
    titleKey: 'patientApp.stim.rememberWhen.title',
    descriptionKey: 'patientApp.stim.rememberWhen.description',
    backgroundColor: COLORS.physicalBg,
    borderColor: COLORS.physical,
    route: '/activity-stim/remember_when',
  },
  {
    type: 'describe_the_scene',
    category: 'reminiscence',
    cognitiveDomain: 'visual',
    emoji: '🎨',
    titleKey: 'patientApp.stim.describeTheScene.title',
    descriptionKey: 'patientApp.stim.describeTheScene.description',
    backgroundColor: COLORS.physicalBg,
    borderColor: COLORS.physical,
    route: '/activity-stim/describe_the_scene',
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
  { category: 'opinion_choices', emoji: '💜', titleKey: 'patientApp.categories.opinionChoices' },
  { category: 'reminiscence', emoji: '📷', titleKey: 'patientApp.categories.reminiscence' },
];
