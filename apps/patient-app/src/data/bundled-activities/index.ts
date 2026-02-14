import type { StimActivityType } from '@ourturn/shared';

// Keep word association (unchanged)
export { WORD_ASSOCIATION_CONTENT, type WordAssociationContent } from './word-association';

// New activities
export { DAILY_REFLECTION_CONTENT, type DailyReflectionContent } from './daily-reflection';
export { PROVERBS_CONTENT, type ProverbContent } from './proverbs';
export { FUN_FACTS_CONTENT, type FunFactContent } from './fun-facts';
export { STORY_TIME_CONTENT, type StoryContent } from './story-time';
export { GUIDED_BREATHING_CONTENT, type GuidedBreathingContent } from './guided-breathing';
export { ART_GALLERY_CONTENT, type ArtGalleryContent } from './art-gallery';
export { GENTLE_QUIZ_CONTENT, type GentleQuizContent } from './gentle-quiz';
export { THIS_DAY_CONTENT, getThisDayFallback, type ThisDayContent, type ThisDayEvent } from './this-day-in-history-v2';
export { ANIMAL_FRIENDS_CONTENT, type AnimalFriendsContent } from './animal-friends';
export { MUSIC_MOMENTS_CONTENT, type MusicMomentsContent } from './music-moments';
export { SING_ALONG_CONTENT, type SingAlongContent } from './sing-along';
export { NATURE_SOUNDS_CONTENT, type NatureSoundsContent } from './nature-sounds';
export { PHOTO_PAIRS_CONTENT, type PhotoPairsContent } from './photo-pairs';
export { MEMORY_LANE_CONTENT, type MemoryLaneContent } from './memory-lane';

// Import content arrays
import { WORD_ASSOCIATION_CONTENT } from './word-association';
import { DAILY_REFLECTION_CONTENT } from './daily-reflection';
import { PROVERBS_CONTENT } from './proverbs';
import { FUN_FACTS_CONTENT } from './fun-facts';
import { STORY_TIME_CONTENT } from './story-time';
import { GUIDED_BREATHING_CONTENT } from './guided-breathing';
import { ART_GALLERY_CONTENT } from './art-gallery';
import { GENTLE_QUIZ_CONTENT } from './gentle-quiz';
import { THIS_DAY_CONTENT, getThisDayFallback } from './this-day-in-history-v2';
import { ANIMAL_FRIENDS_CONTENT } from './animal-friends';
import { MUSIC_MOMENTS_CONTENT } from './music-moments';
import { SING_ALONG_CONTENT } from './sing-along';
import { NATURE_SOUNDS_CONTENT } from './nature-sounds';
import { PHOTO_PAIRS_CONTENT } from './photo-pairs';
import { MEMORY_LANE_CONTENT } from './memory-lane';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BUNDLED_CONTENT: Partial<Record<StimActivityType, any[]>> = {
  word_association: WORD_ASSOCIATION_CONTENT.gentle, // flat list, no difficulty
  art_gallery: ART_GALLERY_CONTENT,
  music_moments: MUSIC_MOMENTS_CONTENT,
  sing_along: SING_ALONG_CONTENT,
  nature_sounds: NATURE_SOUNDS_CONTENT,
  guided_breathing: GUIDED_BREATHING_CONTENT,
  this_day_in_history: THIS_DAY_CONTENT,
  memory_lane: MEMORY_LANE_CONTENT,
  daily_reflection: DAILY_REFLECTION_CONTENT,
  proverbs: PROVERBS_CONTENT,
  fun_facts: FUN_FACTS_CONTENT,
  gentle_quiz: GENTLE_QUIZ_CONTENT,
  animal_friends: ANIMAL_FRIENDS_CONTENT,
  story_time: STORY_TIME_CONTENT,
  photo_pairs: PHOTO_PAIRS_CONTENT,
};
