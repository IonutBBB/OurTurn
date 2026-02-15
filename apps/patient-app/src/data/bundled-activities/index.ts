import type { StimActivityType } from '@ourturn/shared';

// Kept games
export { WORD_ASSOCIATION_CONTENT, type WordAssociationContent } from './word-association';
export { PROVERBS_CONTENT, type ProverbContent } from './proverbs';
export { GENTLE_QUIZ_CONTENT, type GentleQuizContent } from './gentle-quiz';
export { PHOTO_PAIRS_CONTENT, type PhotoPairsContent } from './photo-pairs';
export { WORD_SEARCH_CONTENT, type WordSearchContent } from './word-search';
export { WORD_SCRAMBLE_CONTENT, type WordScrambleContent } from './word-scramble';
export { ODD_ONE_OUT_CONTENT, type OddOneOutContent } from './odd-one-out';
export { PATTERN_SEQUENCE_CONTENT, type PatternSequenceContent } from './pattern-sequence';
export { CATEGORY_SORT_CONTENT, type CategorySortContent } from './category-sort';
export { SPOT_DIFFERENCE_CONTENT, type SpotDifferenceContent } from './spot-the-difference';
export { RHYME_TIME_CONTENT, type RhymeTimeContent } from './rhyme-time';
export { WHAT_CHANGED_CONTENT, type WhatChangedContent } from './what-changed';
export { WHICH_GOES_TOGETHER_CONTENT, type WhichGoesTogetherContent } from './which-goes-together';
export { WHAT_COMES_NEXT_CONTENT, type WhatComesNextContent } from './what-comes-next';
export { PICTURE_CLUES_CONTENT, type PictureCluesContent } from './picture-clues';
export { TRUE_OR_FALSE_CONTENT, type TrueOrFalseContent } from './true-or-false';
export { COIN_COUNTING_CONTENT, type CoinCountingContent } from './coin-counting';

// New games (evidence-based redesign)
export { WHAT_WOULD_YOU_CHOOSE_CONTENT, type WhatWouldYouChooseContent } from './what-would-you-choose';
export { MY_FAVOURITES_CONTENT, type MyFavouritesContent } from './my-favourites';
export { REMEMBER_WHEN_CONTENT, type RememberWhenContent } from './remember-when';
export { DESCRIBE_THE_SCENE_CONTENT, type DescribeTheSceneContent } from './describe-the-scene';
export { NAME_THAT_TUNE_CONTENT, type NameThatTuneContent } from './name-that-tune';
export { SORT_IT_OUT_CONTENT, type SortItOutContent } from './sort-it-out';
export { THIS_DAY_IN_HISTORY_CONTENT, type ThisDayInHistoryContent } from './this-day-in-history';

// Import content arrays
import { WORD_ASSOCIATION_CONTENT } from './word-association';
import { PROVERBS_CONTENT } from './proverbs';
import { GENTLE_QUIZ_CONTENT } from './gentle-quiz';
import { PHOTO_PAIRS_CONTENT } from './photo-pairs';
import { WORD_SEARCH_CONTENT } from './word-search';
import { WORD_SCRAMBLE_CONTENT } from './word-scramble';
import { ODD_ONE_OUT_CONTENT } from './odd-one-out';
import { PATTERN_SEQUENCE_CONTENT } from './pattern-sequence';
import { CATEGORY_SORT_CONTENT } from './category-sort';
import { SPOT_DIFFERENCE_CONTENT } from './spot-the-difference';
import { RHYME_TIME_CONTENT } from './rhyme-time';
import { WHAT_CHANGED_CONTENT } from './what-changed';
import { WHICH_GOES_TOGETHER_CONTENT } from './which-goes-together';
import { WHAT_COMES_NEXT_CONTENT } from './what-comes-next';
import { PICTURE_CLUES_CONTENT } from './picture-clues';
import { TRUE_OR_FALSE_CONTENT } from './true-or-false';
import { COIN_COUNTING_CONTENT } from './coin-counting';
import { WHAT_WOULD_YOU_CHOOSE_CONTENT } from './what-would-you-choose';
import { MY_FAVOURITES_CONTENT } from './my-favourites';
import { REMEMBER_WHEN_CONTENT } from './remember-when';
import { DESCRIBE_THE_SCENE_CONTENT } from './describe-the-scene';
import { NAME_THAT_TUNE_CONTENT } from './name-that-tune';
import { SORT_IT_OUT_CONTENT } from './sort-it-out';
import { THIS_DAY_IN_HISTORY_CONTENT } from './this-day-in-history';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BUNDLED_CONTENT: Partial<Record<StimActivityType, any[]>> = {
  word_association: WORD_ASSOCIATION_CONTENT.gentle,
  proverbs: PROVERBS_CONTENT,
  gentle_quiz: GENTLE_QUIZ_CONTENT,
  photo_pairs: PHOTO_PAIRS_CONTENT,
  word_search: WORD_SEARCH_CONTENT,
  word_scramble: WORD_SCRAMBLE_CONTENT,
  odd_one_out: ODD_ONE_OUT_CONTENT,
  pattern_sequence: PATTERN_SEQUENCE_CONTENT,
  category_sort: CATEGORY_SORT_CONTENT,
  spot_the_difference: SPOT_DIFFERENCE_CONTENT,
  rhyme_time: RHYME_TIME_CONTENT,
  what_changed: WHAT_CHANGED_CONTENT,
  which_goes_together: WHICH_GOES_TOGETHER_CONTENT,
  what_comes_next: WHAT_COMES_NEXT_CONTENT,
  picture_clues: PICTURE_CLUES_CONTENT,
  true_or_false: TRUE_OR_FALSE_CONTENT,
  coin_counting: COIN_COUNTING_CONTENT,
  what_would_you_choose: WHAT_WOULD_YOU_CHOOSE_CONTENT,
  my_favourites: MY_FAVOURITES_CONTENT,
  remember_when: REMEMBER_WHEN_CONTENT,
  describe_the_scene: DESCRIBE_THE_SCENE_CONTENT,
  name_that_tune: NAME_THAT_TUNE_CONTENT,
  sort_it_out: SORT_IT_OUT_CONTENT,
  this_day_in_history: THIS_DAY_IN_HISTORY_CONTENT,
};
