import type { StimActivityType } from '@ourturn/shared';

// Kept games
export { WORD_ASSOCIATION_CONTENT, type WordAssociationContent } from './word-association';
export { PROVERBS_CONTENT, type ProverbContent } from './proverbs';
export { GENTLE_QUIZ_CONTENT, type GentleQuizContent } from './gentle-quiz';
export { PHOTO_PAIRS_CONTENT, type PhotoPairsContent } from './photo-pairs';

// New games (batch 1)
export { WORD_SEARCH_CONTENT, type WordSearchContent } from './word-search';
export { WORD_SCRAMBLE_CONTENT, type WordScrambleContent } from './word-scramble';
export { ODD_ONE_OUT_CONTENT, type OddOneOutContent } from './odd-one-out';
export { NUMBER_PUZZLES_CONTENT, type NumberPuzzlesContent } from './number-puzzles';
export { PATTERN_SEQUENCE_CONTENT, type PatternSequenceContent } from './pattern-sequence';
export { CATEGORY_SORT_CONTENT, type CategorySortContent } from './category-sort';
export { SPOT_DIFFERENCE_CONTENT, type SpotDifferenceContent } from './spot-the-difference';
export { COLOR_SEQUENCE_CONTENT, type ColorSequenceContent } from './color-sequence';

// New games (batch 2)
export { RHYME_TIME_CONTENT, type RhymeTimeContent } from './rhyme-time';
export { FINISH_SENTENCE_CONTENT, type FinishSentenceContent } from './finish-the-sentence';
export { WHAT_CHANGED_CONTENT, type WhatChangedContent } from './what-changed';
export { EMOJI_COUNT_CONTENT, type EmojiCountContent } from './emoji-count';
export { WHICH_GOES_TOGETHER_CONTENT, type WhichGoesTogetherContent } from './which-goes-together';
export { WHAT_COMES_NEXT_CONTENT, type WhatComesNextContent } from './what-comes-next';
export { PICTURE_CLUES_CONTENT, type PictureCluesContent } from './picture-clues';
export { TRUE_OR_FALSE_CONTENT, type TrueOrFalseContent } from './true-or-false';
export { CLOCK_READING_CONTENT, type ClockReadingContent } from './clock-reading';
export { COIN_COUNTING_CONTENT, type CoinCountingContent } from './coin-counting';

// Import content arrays
import { WORD_ASSOCIATION_CONTENT } from './word-association';
import { PROVERBS_CONTENT } from './proverbs';
import { GENTLE_QUIZ_CONTENT } from './gentle-quiz';
import { PHOTO_PAIRS_CONTENT } from './photo-pairs';
import { WORD_SEARCH_CONTENT } from './word-search';
import { WORD_SCRAMBLE_CONTENT } from './word-scramble';
import { ODD_ONE_OUT_CONTENT } from './odd-one-out';
import { NUMBER_PUZZLES_CONTENT } from './number-puzzles';
import { PATTERN_SEQUENCE_CONTENT } from './pattern-sequence';
import { CATEGORY_SORT_CONTENT } from './category-sort';
import { SPOT_DIFFERENCE_CONTENT } from './spot-the-difference';
import { COLOR_SEQUENCE_CONTENT } from './color-sequence';
import { RHYME_TIME_CONTENT } from './rhyme-time';
import { FINISH_SENTENCE_CONTENT } from './finish-the-sentence';
import { WHAT_CHANGED_CONTENT } from './what-changed';
import { EMOJI_COUNT_CONTENT } from './emoji-count';
import { WHICH_GOES_TOGETHER_CONTENT } from './which-goes-together';
import { WHAT_COMES_NEXT_CONTENT } from './what-comes-next';
import { PICTURE_CLUES_CONTENT } from './picture-clues';
import { TRUE_OR_FALSE_CONTENT } from './true-or-false';
import { CLOCK_READING_CONTENT } from './clock-reading';
import { COIN_COUNTING_CONTENT } from './coin-counting';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BUNDLED_CONTENT: Partial<Record<StimActivityType, any[]>> = {
  word_association: WORD_ASSOCIATION_CONTENT.gentle,
  proverbs: PROVERBS_CONTENT,
  gentle_quiz: GENTLE_QUIZ_CONTENT,
  photo_pairs: PHOTO_PAIRS_CONTENT,
  word_search: WORD_SEARCH_CONTENT,
  word_scramble: WORD_SCRAMBLE_CONTENT,
  odd_one_out: ODD_ONE_OUT_CONTENT,
  number_puzzles: NUMBER_PUZZLES_CONTENT,
  pattern_sequence: PATTERN_SEQUENCE_CONTENT,
  category_sort: CATEGORY_SORT_CONTENT,
  spot_the_difference: SPOT_DIFFERENCE_CONTENT,
  color_sequence: COLOR_SEQUENCE_CONTENT,
  rhyme_time: RHYME_TIME_CONTENT,
  finish_the_sentence: FINISH_SENTENCE_CONTENT,
  what_changed: WHAT_CHANGED_CONTENT,
  emoji_count: EMOJI_COUNT_CONTENT,
  which_goes_together: WHICH_GOES_TOGETHER_CONTENT,
  what_comes_next: WHAT_COMES_NEXT_CONTENT,
  picture_clues: PICTURE_CLUES_CONTENT,
  true_or_false: TRUE_OR_FALSE_CONTENT,
  clock_reading: CLOCK_READING_CONTENT,
  coin_counting: COIN_COUNTING_CONTENT,
};
