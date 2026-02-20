/**
 * Shared activity definitions — theme-agnostic metadata for all 24 mind games.
 * Used by caregiver apps (web + mobile) for the activity template picker.
 * Patient app's activity-registry.ts imports from here and adds rendering colors.
 */

import type { StimActivityType, ActivityCategory, CognitiveDomain } from '../types/activities';

export interface SharedActivityDefinition {
  type: StimActivityType;
  category: ActivityCategory;
  cognitiveDomain: CognitiveDomain;
  emoji: string;
  titleKey: string;
  descriptionKey: string;
  /** true if game content is English-only (word lists, proverbs, etc.) */
  languageDependent?: boolean;
}

export interface SharedActivityCategory {
  category: ActivityCategory;
  emoji: string;
  titleKey: string;
}

export const SHARED_ACTIVITY_DEFINITIONS: SharedActivityDefinition[] = [
  // ── Words & Language (5) ───────────────────────────────
  {
    type: 'word_association',
    category: 'words_language',
    cognitiveDomain: 'language',
    emoji: '💬',
    titleKey: 'patientApp.stim.wordAssociation.title',
    descriptionKey: 'patientApp.stim.wordAssociation.description',
    languageDependent: true,
  },
  {
    type: 'proverbs',
    category: 'words_language',
    cognitiveDomain: 'language',
    emoji: '📜',
    titleKey: 'patientApp.stim.proverbs.title',
    descriptionKey: 'patientApp.stim.proverbs.description',
    languageDependent: true,
  },
  {
    type: 'word_search',
    category: 'words_language',
    cognitiveDomain: 'language',
    emoji: '🔍',
    titleKey: 'patientApp.stim.wordSearch.title',
    descriptionKey: 'patientApp.stim.wordSearch.description',
    languageDependent: true,
  },
  {
    type: 'word_scramble',
    category: 'words_language',
    cognitiveDomain: 'language',
    emoji: '🔤',
    titleKey: 'patientApp.stim.wordScramble.title',
    descriptionKey: 'patientApp.stim.wordScramble.description',
    languageDependent: true,
  },
  {
    type: 'rhyme_time',
    category: 'words_language',
    cognitiveDomain: 'language',
    emoji: '🎶',
    titleKey: 'patientApp.stim.rhymeTime.title',
    descriptionKey: 'patientApp.stim.rhymeTime.description',
    languageDependent: true,
  },

  // ── Memory & Attention (4) ─────────────────────────────
  {
    type: 'photo_pairs',
    category: 'memory_attention',
    cognitiveDomain: 'visual',
    emoji: '🃏',
    titleKey: 'patientApp.stim.photoPairs.title',
    descriptionKey: 'patientApp.stim.photoPairs.description',
  },
  {
    type: 'spot_the_difference',
    category: 'memory_attention',
    cognitiveDomain: 'visual',
    emoji: '👀',
    titleKey: 'patientApp.stim.spotDifference.title',
    descriptionKey: 'patientApp.stim.spotDifference.description',
  },
  {
    type: 'what_changed',
    category: 'memory_attention',
    cognitiveDomain: 'visual',
    emoji: '🔄',
    titleKey: 'patientApp.stim.whatChanged.title',
    descriptionKey: 'patientApp.stim.whatChanged.description',
  },
  {
    type: 'name_that_tune',
    category: 'memory_attention',
    cognitiveDomain: 'sound',
    emoji: '🎵',
    titleKey: 'patientApp.stim.nameThatTune.title',
    descriptionKey: 'patientApp.stim.nameThatTune.description',
    languageDependent: true,
  },

  // ── Logic & Reasoning (7) ──────────────────────────────
  {
    type: 'odd_one_out',
    category: 'logic_reasoning',
    cognitiveDomain: 'executive',
    emoji: '🤔',
    titleKey: 'patientApp.stim.oddOneOut.title',
    descriptionKey: 'patientApp.stim.oddOneOut.description',
  },
  {
    type: 'pattern_sequence',
    category: 'logic_reasoning',
    cognitiveDomain: 'executive',
    emoji: '🧩',
    titleKey: 'patientApp.stim.patternSequence.title',
    descriptionKey: 'patientApp.stim.patternSequence.description',
  },
  {
    type: 'category_sort',
    category: 'logic_reasoning',
    cognitiveDomain: 'executive',
    emoji: '📦',
    titleKey: 'patientApp.stim.categorySort.title',
    descriptionKey: 'patientApp.stim.categorySort.description',
  },
  {
    type: 'which_goes_together',
    category: 'logic_reasoning',
    cognitiveDomain: 'executive',
    emoji: '🤝',
    titleKey: 'patientApp.stim.whichGoesTogether.title',
    descriptionKey: 'patientApp.stim.whichGoesTogether.description',
    languageDependent: true,
  },
  {
    type: 'what_comes_next',
    category: 'logic_reasoning',
    cognitiveDomain: 'executive',
    emoji: '➡️',
    titleKey: 'patientApp.stim.whatComesNext.title',
    descriptionKey: 'patientApp.stim.whatComesNext.description',
  },
  {
    type: 'sort_it_out',
    category: 'logic_reasoning',
    cognitiveDomain: 'executive',
    emoji: '🛒',
    titleKey: 'patientApp.stim.sortItOut.title',
    descriptionKey: 'patientApp.stim.sortItOut.description',
    languageDependent: true,
  },
  {
    type: 'coin_counting',
    category: 'logic_reasoning',
    cognitiveDomain: 'numbers',
    emoji: '💰',
    titleKey: 'patientApp.stim.coinCounting.title',
    descriptionKey: 'patientApp.stim.coinCounting.description',
    languageDependent: true,
  },

  // ── Knowledge (4) ──────────────────────────────────────
  {
    type: 'gentle_quiz',
    category: 'knowledge',
    cognitiveDomain: 'current_affairs',
    emoji: '🌟',
    titleKey: 'patientApp.stim.gentleQuiz.title',
    descriptionKey: 'patientApp.stim.gentleQuiz.description',
    languageDependent: true,
  },
  {
    type: 'picture_clues',
    category: 'knowledge',
    cognitiveDomain: 'current_affairs',
    emoji: '🖼️',
    titleKey: 'patientApp.stim.pictureClues.title',
    descriptionKey: 'patientApp.stim.pictureClues.description',
    languageDependent: true,
  },
  {
    type: 'true_or_false',
    category: 'knowledge',
    cognitiveDomain: 'current_affairs',
    emoji: '✅',
    titleKey: 'patientApp.stim.trueOrFalse.title',
    descriptionKey: 'patientApp.stim.trueOrFalse.description',
    languageDependent: true,
  },
  {
    type: 'this_day_in_history',
    category: 'knowledge',
    cognitiveDomain: 'current_affairs',
    emoji: '📅',
    titleKey: 'patientApp.stim.thisDayInHistory.title',
    descriptionKey: 'patientApp.stim.thisDayInHistory.description',
    languageDependent: true,
  },

  // ── Opinion & Choices (2) ──────────────────────────────
  {
    type: 'what_would_you_choose',
    category: 'opinion_choices',
    cognitiveDomain: 'executive',
    emoji: '🤷',
    titleKey: 'patientApp.stim.whatWouldYouChoose.title',
    descriptionKey: 'patientApp.stim.whatWouldYouChoose.description',
  },
  {
    type: 'my_favourites',
    category: 'opinion_choices',
    cognitiveDomain: 'executive',
    emoji: '⭐',
    titleKey: 'patientApp.stim.myFavourites.title',
    descriptionKey: 'patientApp.stim.myFavourites.description',
  },

  // ── Reminiscence (2) ───────────────────────────────────
  {
    type: 'remember_when',
    category: 'reminiscence',
    cognitiveDomain: 'visual',
    emoji: '📷',
    titleKey: 'patientApp.stim.rememberWhen.title',
    descriptionKey: 'patientApp.stim.rememberWhen.description',
  },
  {
    type: 'describe_the_scene',
    category: 'reminiscence',
    cognitiveDomain: 'visual',
    emoji: '🎨',
    titleKey: 'patientApp.stim.describeTheScene.title',
    descriptionKey: 'patientApp.stim.describeTheScene.description',
  },
];

/** Activity categories in display order */
export const SHARED_ACTIVITY_CATEGORIES: SharedActivityCategory[] = [
  { category: 'words_language', emoji: '💬', titleKey: 'patientApp.categories.wordsLanguage' },
  { category: 'memory_attention', emoji: '🧠', titleKey: 'patientApp.categories.memoryAttention' },
  { category: 'logic_reasoning', emoji: '🧩', titleKey: 'patientApp.categories.logicReasoning' },
  { category: 'knowledge', emoji: '🌟', titleKey: 'patientApp.categories.knowledge' },
  { category: 'opinion_choices', emoji: '💜', titleKey: 'patientApp.categories.opinionChoices' },
  { category: 'reminiscence', emoji: '📷', titleKey: 'patientApp.categories.reminiscence' },
];

/** Get an activity definition by type */
export function getActivityDefinition(type: string): SharedActivityDefinition | undefined {
  return SHARED_ACTIVITY_DEFINITIONS.find((a) => a.type === type);
}

/** Get all activities for a given activity category */
export function getActivitiesByCategory(category: ActivityCategory): SharedActivityDefinition[] {
  return SHARED_ACTIVITY_DEFINITIONS.filter((a) => a.category === category);
}

/** All valid activity type strings */
export const VALID_ACTIVITY_TYPES: string[] = SHARED_ACTIVITY_DEFINITIONS.map((a) => a.type);

/** Get activities filtered for a given locale — hides English-only games for non-English users */
export function getActivitiesForLocale(locale: string): SharedActivityDefinition[] {
  if (locale === 'en') return SHARED_ACTIVITY_DEFINITIONS;
  return SHARED_ACTIVITY_DEFINITIONS.filter((a) => !a.languageDependent);
}

/** Get activity categories that have at least one game available for the given locale */
export function getCategoriesForLocale(locale: string): SharedActivityCategory[] {
  const available = getActivitiesForLocale(locale);
  const activeCategories = new Set(available.map((a) => a.category));
  return SHARED_ACTIVITY_CATEGORIES.filter((c) => activeCategories.has(c.category));
}
