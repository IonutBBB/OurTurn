import type { ComponentType } from 'react';
import type { StimActivityType } from '@ourturn/shared';
import type { ActivityRendererProps } from './types';

// Keep word association
import WordAssociationRenderer from './word-association-renderer';

// New renderers
import ArtGalleryRenderer from './art-gallery-renderer';
import MusicMomentsRenderer from './music-moments-renderer';
import SingAlongRenderer from './sing-along-renderer';
import NatureSoundsRenderer from './nature-sounds-renderer';
import GuidedBreathingRenderer from './guided-breathing-renderer';
import ThisDayRenderer from './this-day-renderer';
import MemoryLaneRenderer from './memory-lane-renderer';
import DailyReflectionRenderer from './daily-reflection-renderer';
import ProverbsRenderer from './proverbs-renderer';
import FunFactsRenderer from './fun-facts-renderer';
import GentleQuizRenderer from './gentle-quiz-renderer';
import AnimalFriendsRenderer from './animal-friends-renderer';
import StoryTimeRenderer from './story-time-renderer';
import PhotoPairsRenderer from './photo-pairs-renderer';

export type { ActivityRendererProps } from './types';

export const RENDERER_MAP: Record<StimActivityType, ComponentType<ActivityRendererProps>> = {
  word_association: WordAssociationRenderer,
  art_gallery: ArtGalleryRenderer,
  music_moments: MusicMomentsRenderer,
  sing_along: SingAlongRenderer,
  nature_sounds: NatureSoundsRenderer,
  guided_breathing: GuidedBreathingRenderer,
  this_day_in_history: ThisDayRenderer,
  memory_lane: MemoryLaneRenderer,
  daily_reflection: DailyReflectionRenderer,
  proverbs: ProverbsRenderer,
  fun_facts: FunFactsRenderer,
  gentle_quiz: GentleQuizRenderer,
  animal_friends: AnimalFriendsRenderer,
  story_time: StoryTimeRenderer,
  photo_pairs: PhotoPairsRenderer,
};
