import type { ComponentType } from 'react';
import type { StimActivityType } from '@ourturn/shared';
import type { ActivityRendererProps } from './types';

import WordAssociationRenderer from './word-association-renderer';
import OddWordOutRenderer from './odd-word-out-renderer';
import PriceGuessingRenderer from './price-guessing-renderer';
import SortingRenderer from './sorting-renderer';
import PutInOrderRenderer from './put-in-order-renderer';
import PairMatchingRenderer from './pair-matching-renderer';
import SoundIdRenderer from './sound-id-renderer';
import HistoryRenderer from './history-renderer';
import ArtDiscussionRenderer from './art-discussion-renderer';
import TrueOrFalseRenderer from './true-or-false-renderer';

export type { ActivityRendererProps } from './types';

export const RENDERER_MAP: Record<StimActivityType, ComponentType<ActivityRendererProps>> = {
  word_association: WordAssociationRenderer,
  odd_word_out: OddWordOutRenderer,
  price_guessing: PriceGuessingRenderer,
  sorting_categorizing: SortingRenderer,
  put_in_order: PutInOrderRenderer,
  pair_matching: PairMatchingRenderer,
  sound_identification: SoundIdRenderer,
  this_day_in_history: HistoryRenderer,
  art_discussion: ArtDiscussionRenderer,
  true_or_false: TrueOrFalseRenderer,
};
