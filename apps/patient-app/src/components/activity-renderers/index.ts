import type { ComponentType } from 'react';
import type { StimActivityType } from '@ourturn/shared';
import type { ActivityRendererProps } from './types';

// Kept games
import WordAssociationRenderer from './word-association-renderer';
import ProverbsRenderer from './proverbs-renderer';
import GentleQuizRenderer from './gentle-quiz-renderer';
import PhotoPairsRenderer from './photo-pairs-renderer';

// New games (batch 1)
import WordSearchRenderer from './word-search-renderer';
import WordScrambleRenderer from './word-scramble-renderer';
import OddOneOutRenderer from './odd-one-out-renderer';
import NumberPuzzlesRenderer from './number-puzzles-renderer';
import PatternSequenceRenderer from './pattern-sequence-renderer';
import CategorySortRenderer from './category-sort-renderer';
import SpotDifferenceRenderer from './spot-difference-renderer';
import ColorSequenceRenderer from './color-sequence-renderer';

// New games (batch 2)
import RhymeTimeRenderer from './rhyme-time-renderer';
import FinishSentenceRenderer from './finish-sentence-renderer';
import WhatChangedRenderer from './what-changed-renderer';
import EmojiCountRenderer from './emoji-count-renderer';
import WhichGoesTogetherRenderer from './which-goes-together-renderer';
import WhatComesNextRenderer from './what-comes-next-renderer';
import PictureCluesRenderer from './picture-clues-renderer';
import TrueFalseRenderer from './true-false-renderer';
import ClockReadingRenderer from './clock-reading-renderer';
import CoinCountingRenderer from './coin-counting-renderer';

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
  rhyme_time: RhymeTimeRenderer,
  finish_the_sentence: FinishSentenceRenderer,
  what_changed: WhatChangedRenderer,
  emoji_count: EmojiCountRenderer,
  which_goes_together: WhichGoesTogetherRenderer,
  what_comes_next: WhatComesNextRenderer,
  picture_clues: PictureCluesRenderer,
  true_or_false: TrueFalseRenderer,
  clock_reading: ClockReadingRenderer,
  coin_counting: CoinCountingRenderer,
};
