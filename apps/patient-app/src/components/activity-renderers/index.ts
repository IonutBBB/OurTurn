import type { ComponentType } from 'react';
import type { StimActivityType } from '@ourturn/shared';
import type { ActivityRendererProps } from './types';

// Kept games
import WordAssociationRenderer from './word-association-renderer';
import ProverbsRenderer from './proverbs-renderer';
import GentleQuizRenderer from './gentle-quiz-renderer';
import PhotoPairsRenderer from './photo-pairs-renderer';
import WordSearchRenderer from './word-search-renderer';
import WordScrambleRenderer from './word-scramble-renderer';
import OddOneOutRenderer from './odd-one-out-renderer';
import PatternSequenceRenderer from './pattern-sequence-renderer';
import CategorySortRenderer from './category-sort-renderer';
import SpotDifferenceRenderer from './spot-difference-renderer';
import RhymeTimeRenderer from './rhyme-time-renderer';
import WhatChangedRenderer from './what-changed-renderer';
import WhichGoesTogetherRenderer from './which-goes-together-renderer';
import WhatComesNextRenderer from './what-comes-next-renderer';
import PictureCluesRenderer from './picture-clues-renderer';
import TrueFalseRenderer from './true-false-renderer';
import CoinCountingRenderer from './coin-counting-renderer';

// New games (evidence-based redesign)
import WhatWouldYouChooseRenderer from './what-would-you-choose-renderer';
import MyFavouritesRenderer from './my-favourites-renderer';
import RememberWhenRenderer from './remember-when-renderer';
import DescribeTheSceneRenderer from './describe-the-scene-renderer';
import NameThatTuneRenderer from './name-that-tune-renderer';
import SortItOutRenderer from './sort-it-out-renderer';
import ThisDayInHistoryRenderer from './this-day-in-history-renderer';

export type { ActivityRendererProps } from './types';

export const RENDERER_MAP: Record<StimActivityType, ComponentType<ActivityRendererProps>> = {
  word_association: WordAssociationRenderer,
  proverbs: ProverbsRenderer,
  word_search: WordSearchRenderer,
  word_scramble: WordScrambleRenderer,
  rhyme_time: RhymeTimeRenderer,
  photo_pairs: PhotoPairsRenderer,
  spot_the_difference: SpotDifferenceRenderer,
  what_changed: WhatChangedRenderer,
  odd_one_out: OddOneOutRenderer,
  pattern_sequence: PatternSequenceRenderer,
  category_sort: CategorySortRenderer,
  which_goes_together: WhichGoesTogetherRenderer,
  what_comes_next: WhatComesNextRenderer,
  gentle_quiz: GentleQuizRenderer,
  picture_clues: PictureCluesRenderer,
  true_or_false: TrueFalseRenderer,
  coin_counting: CoinCountingRenderer,
  what_would_you_choose: WhatWouldYouChooseRenderer,
  my_favourites: MyFavouritesRenderer,
  remember_when: RememberWhenRenderer,
  describe_the_scene: DescribeTheSceneRenderer,
  name_that_tune: NameThatTuneRenderer,
  sort_it_out: SortItOutRenderer,
  this_day_in_history: ThisDayInHistoryRenderer,
};
