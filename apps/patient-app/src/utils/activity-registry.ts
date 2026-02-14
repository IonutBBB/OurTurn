/**
 * Activity registry — single source of truth for all 15 engagement activities + 5 legacy.
 * Evidence-based activities focused on enjoyment, calm, and gentle engagement.
 * No scoring, no difficulty levels, no failure states.
 */

import type { ActivityDefinition, AllActivityType, ActivityCategory } from '@ourturn/shared';
import { COLORS } from '../theme';

export const ACTIVITY_REGISTRY: ActivityDefinition[] = [
  // ── Art & Beauty ───────────────────────────────────────────
  {
    type: 'art_gallery',
    category: 'art_beauty',
    emoji: '🖼️',
    titleKey: 'patientApp.stim.artGallery.title',
    descriptionKey: 'patientApp.stim.artGallery.description',
    backgroundColor: COLORS.nutritionBg,
    borderColor: COLORS.nutrition,
    route: '/activity-stim/art_gallery',
  },

  // ── Music & Sound ──────────────────────────────────────────
  {
    type: 'music_moments',
    category: 'music_sound',
    emoji: '🎵',
    titleKey: 'patientApp.stim.musicMoments.title',
    descriptionKey: 'patientApp.stim.musicMoments.description',
    backgroundColor: COLORS.infoBg,
    borderColor: COLORS.info,
    route: '/activity-stim/music_moments',
  },
  {
    type: 'sing_along',
    category: 'music_sound',
    emoji: '🎤',
    titleKey: 'patientApp.stim.singAlong.title',
    descriptionKey: 'patientApp.stim.singAlong.description',
    backgroundColor: COLORS.infoBg,
    borderColor: COLORS.info,
    route: '/activity-stim/sing_along',
  },

  // ── Calm & Wellness ────────────────────────────────────────
  {
    type: 'nature_sounds',
    category: 'calm_wellness',
    emoji: '🌿',
    titleKey: 'patientApp.stim.natureSounds.title',
    descriptionKey: 'patientApp.stim.natureSounds.description',
    backgroundColor: COLORS.physicalBg,
    borderColor: COLORS.physical,
    route: '/activity-stim/nature_sounds',
  },
  {
    type: 'guided_breathing',
    category: 'calm_wellness',
    emoji: '🫧',
    titleKey: 'patientApp.stim.guidedBreathing.title',
    descriptionKey: 'patientApp.stim.guidedBreathing.description',
    backgroundColor: COLORS.physicalBg,
    borderColor: COLORS.physical,
    route: '/activity-stim/guided_breathing',
  },

  // ── Memories & Reflection ──────────────────────────────────
  {
    type: 'this_day_in_history',
    category: 'memories_reflection',
    emoji: '📅',
    titleKey: 'patientApp.stim.history.title',
    descriptionKey: 'patientApp.stim.history.description',
    backgroundColor: COLORS.socialBg,
    borderColor: COLORS.social,
    route: '/activity-stim/this_day_in_history',
  },
  {
    type: 'memory_lane',
    category: 'memories_reflection',
    emoji: '📷',
    titleKey: 'patientApp.stim.memoryLane.title',
    descriptionKey: 'patientApp.stim.memoryLane.description',
    backgroundColor: COLORS.socialBg,
    borderColor: COLORS.social,
    route: '/activity-stim/memory_lane',
  },
  {
    type: 'daily_reflection',
    category: 'memories_reflection',
    emoji: '💭',
    titleKey: 'patientApp.stim.dailyReflection.title',
    descriptionKey: 'patientApp.stim.dailyReflection.description',
    backgroundColor: COLORS.socialBg,
    borderColor: COLORS.social,
    route: '/activity-stim/daily_reflection',
  },

  // ── Words & Language ───────────────────────────────────────
  {
    type: 'word_association',
    category: 'words_language',
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
    emoji: '📜',
    titleKey: 'patientApp.stim.proverbs.title',
    descriptionKey: 'patientApp.stim.proverbs.description',
    backgroundColor: COLORS.cognitiveBg,
    borderColor: COLORS.cognitive,
    route: '/activity-stim/proverbs',
  },

  // ── Stories & Facts ────────────────────────────────────────
  {
    type: 'fun_facts',
    category: 'stories_facts',
    emoji: '🌍',
    titleKey: 'patientApp.stim.funFacts.title',
    descriptionKey: 'patientApp.stim.funFacts.description',
    backgroundColor: COLORS.amberBg,
    borderColor: COLORS.amber,
    route: '/activity-stim/fun_facts',
  },
  {
    type: 'gentle_quiz',
    category: 'stories_facts',
    emoji: '🌟',
    titleKey: 'patientApp.stim.gentleQuiz.title',
    descriptionKey: 'patientApp.stim.gentleQuiz.description',
    backgroundColor: COLORS.amberBg,
    borderColor: COLORS.amber,
    route: '/activity-stim/gentle_quiz',
  },
  {
    type: 'animal_friends',
    category: 'stories_facts',
    emoji: '🐾',
    titleKey: 'patientApp.stim.animalFriends.title',
    descriptionKey: 'patientApp.stim.animalFriends.description',
    backgroundColor: COLORS.amberBg,
    borderColor: COLORS.amber,
    route: '/activity-stim/animal_friends',
  },
  {
    type: 'story_time',
    category: 'stories_facts',
    emoji: '📖',
    titleKey: 'patientApp.stim.storyTime.title',
    descriptionKey: 'patientApp.stim.storyTime.description',
    backgroundColor: COLORS.amberBg,
    borderColor: COLORS.amber,
    route: '/activity-stim/story_time',
  },

  // ── Games ──────────────────────────────────────────────────
  {
    type: 'photo_pairs',
    category: 'games',
    emoji: '🃏',
    titleKey: 'patientApp.stim.photoPairs.title',
    descriptionKey: 'patientApp.stim.photoPairs.description',
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
    route: '/activity-stim/photo_pairs',
  },

  // ── Legacy activities (5) — preserved with category mapping ─
  {
    type: 'brain_activity',
    category: 'stories_facts',
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
    category: 'memories_reflection',
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
    category: 'music_sound',
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
    category: 'calm_wellness',
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
    category: 'art_beauty',
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

/** Get all activities for a category */
export function getActivitiesByCategory(category: ActivityCategory): ActivityDefinition[] {
  return ACTIVITY_REGISTRY.filter((a) => a.category === category);
}

/** Get only the 15 new engagement activities */
export function getNewActivities(): ActivityDefinition[] {
  return ACTIVITY_REGISTRY.filter((a) => !a.legacy);
}

/** Get only legacy activities */
export function getLegacyActivities(): ActivityDefinition[] {
  return ACTIVITY_REGISTRY.filter((a) => a.legacy);
}

/** Activity categories in display order */
export const ACTIVITY_CATEGORIES: { category: ActivityCategory; emoji: string; titleKey: string }[] = [
  { category: 'art_beauty', emoji: '🎨', titleKey: 'patientApp.categories.artBeauty' },
  { category: 'music_sound', emoji: '🎵', titleKey: 'patientApp.categories.musicSound' },
  { category: 'calm_wellness', emoji: '🌿', titleKey: 'patientApp.categories.calmWellness' },
  { category: 'memories_reflection', emoji: '💭', titleKey: 'patientApp.categories.memoriesReflection' },
  { category: 'words_language', emoji: '💬', titleKey: 'patientApp.categories.wordsLanguage' },
  { category: 'stories_facts', emoji: '📖', titleKey: 'patientApp.categories.storiesFacts' },
  { category: 'games', emoji: '🃏', titleKey: 'patientApp.categories.games' },
];
