import type { StimActivityType } from '@ourturn/shared';

// Kept games
export { WORD_ASSOCIATION_CONTENT, type WordAssociationContent } from './word-association';
export { PROVERBS_CONTENT, type ProverbContent } from './proverbs';
export { GENTLE_QUIZ_CONTENT, type GentleQuizContent } from './gentle-quiz';
export { PHOTO_PAIRS_CONTENT, type PhotoPairsContent } from './photo-pairs';

// New games
export { WORD_SEARCH_CONTENT, type WordSearchContent } from './word-search';
export { WORD_SCRAMBLE_CONTENT, type WordScrambleContent } from './word-scramble';
export { ODD_ONE_OUT_CONTENT, type OddOneOutContent } from './odd-one-out';
export { NUMBER_PUZZLES_CONTENT, type NumberPuzzlesContent } from './number-puzzles';
export { PATTERN_SEQUENCE_CONTENT, type PatternSequenceContent } from './pattern-sequence';
export { CATEGORY_SORT_CONTENT, type CategorySortContent } from './category-sort';
export { SPOT_DIFFERENCE_CONTENT, type SpotDifferenceContent } from './spot-the-difference';
export { COLOR_SEQUENCE_CONTENT, type ColorSequenceContent } from './color-sequence';

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
};
