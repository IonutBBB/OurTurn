import type { ComponentType } from 'react';
import type { StimActivityType } from '@ourturn/shared';
import type { ActivityRendererProps } from './types';

// Kept games
import WordAssociationRenderer from './word-association-renderer';
import ProverbsRenderer from './proverbs-renderer';
import GentleQuizRenderer from './gentle-quiz-renderer';
import PhotoPairsRenderer from './photo-pairs-renderer';

// New games
import WordSearchRenderer from './word-search-renderer';
import WordScrambleRenderer from './word-scramble-renderer';
import OddOneOutRenderer from './odd-one-out-renderer';
import NumberPuzzlesRenderer from './number-puzzles-renderer';
import PatternSequenceRenderer from './pattern-sequence-renderer';
import CategorySortRenderer from './category-sort-renderer';
import SpotDifferenceRenderer from './spot-difference-renderer';
import ColorSequenceRenderer from './color-sequence-renderer';

export type { ActivityRendererProps } from './types';

export const RENDERER_MAP: Record<StimActivityType, ComponentType<ActivityRendererProps>> = {
  word_association: WordAssociationRenderer,
  proverbs: ProverbsRenderer,
  word_search: WordSearchRenderer,
  word_scramble: WordScrambleRenderer,
  photo_pairs: PhotoPairsRenderer,
  color_sequence: ColorSequenceRenderer,
  spot_the_difference: SpotDifferenceRenderer,
  odd_one_out: OddOneOutRenderer,
  pattern_sequence: PatternSequenceRenderer,
  category_sort: CategorySortRenderer,
  gentle_quiz: GentleQuizRenderer,
  number_puzzles: NumberPuzzlesRenderer,
};
