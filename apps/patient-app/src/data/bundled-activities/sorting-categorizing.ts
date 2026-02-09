/**
 * Sorting & Categorizing — items to sort into two categories.
 */

import type { DifficultyLevel } from '@ourturn/shared';

export interface SortingItem {
  labelKey: string;
  emoji: string;
  category: 0 | 1; // index into categories array
}

export interface SortingContent {
  category1Key: string;
  category1Emoji: string;
  category2Key: string;
  category2Emoji: string;
  items: SortingItem[];
}

const gentle: SortingContent[] = [
  {
    category1Key: 'patientApp.stim.sorting.categories.fruits',
    category1Emoji: '🍎',
    category2Key: 'patientApp.stim.sorting.categories.vegetables',
    category2Emoji: '🥕',
    items: [
      { labelKey: 'patientApp.stim.sorting.items.apple', emoji: '🍎', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.carrot', emoji: '🥕', category: 1 },
      { labelKey: 'patientApp.stim.sorting.items.banana', emoji: '🍌', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.potato', emoji: '🥔', category: 1 },
      { labelKey: 'patientApp.stim.sorting.items.grape', emoji: '🍇', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.onion', emoji: '🧅', category: 1 },
    ],
  },
  {
    category1Key: 'patientApp.stim.sorting.categories.hot',
    category1Emoji: '🔥',
    category2Key: 'patientApp.stim.sorting.categories.cold',
    category2Emoji: '❄️',
    items: [
      { labelKey: 'patientApp.stim.sorting.items.tea', emoji: '☕', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.iceCream', emoji: '🍦', category: 1 },
      { labelKey: 'patientApp.stim.sorting.items.soup', emoji: '🥣', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.lemonade', emoji: '🍋', category: 1 },
      { labelKey: 'patientApp.stim.sorting.items.toast', emoji: '🍞', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.iceLolly', emoji: '🧊', category: 1 },
    ],
  },
  {
    category1Key: 'patientApp.stim.sorting.categories.indoors',
    category1Emoji: '🏠',
    category2Key: 'patientApp.stim.sorting.categories.outdoors',
    category2Emoji: '🌳',
    items: [
      { labelKey: 'patientApp.stim.sorting.items.cooking', emoji: '🍳', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.gardening', emoji: '🌻', category: 1 },
      { labelKey: 'patientApp.stim.sorting.items.readingBook', emoji: '📖', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.walking', emoji: '🚶', category: 1 },
      { labelKey: 'patientApp.stim.sorting.items.watchingTV', emoji: '📺', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.cycling', emoji: '🚲', category: 1 },
    ],
  },
  {
    category1Key: 'patientApp.stim.sorting.categories.animals',
    category1Emoji: '🐾',
    category2Key: 'patientApp.stim.sorting.categories.plants',
    category2Emoji: '🌿',
    items: [
      { labelKey: 'patientApp.stim.sorting.items.dog', emoji: '🐕', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.rose', emoji: '🌹', category: 1 },
      { labelKey: 'patientApp.stim.sorting.items.cat', emoji: '🐈', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.oak', emoji: '🌳', category: 1 },
      { labelKey: 'patientApp.stim.sorting.items.horse', emoji: '🐴', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.tulip', emoji: '🌷', category: 1 },
    ],
  },
  {
    category1Key: 'patientApp.stim.sorting.categories.clothing',
    category1Emoji: '👔',
    category2Key: 'patientApp.stim.sorting.categories.food',
    category2Emoji: '🍽️',
    items: [
      { labelKey: 'patientApp.stim.sorting.items.shirt', emoji: '👕', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.bread', emoji: '🍞', category: 1 },
      { labelKey: 'patientApp.stim.sorting.items.hat', emoji: '🎩', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.cheese', emoji: '🧀', category: 1 },
      { labelKey: 'patientApp.stim.sorting.items.shoes', emoji: '👞', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.cake', emoji: '🍰', category: 1 },
    ],
  },
  {
    category1Key: 'patientApp.stim.sorting.categories.day',
    category1Emoji: '☀️',
    category2Key: 'patientApp.stim.sorting.categories.night',
    category2Emoji: '🌙',
    items: [
      { labelKey: 'patientApp.stim.sorting.items.sunrise', emoji: '🌅', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.stars', emoji: '⭐', category: 1 },
      { labelKey: 'patientApp.stim.sorting.items.lunch', emoji: '🥪', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.pajamas', emoji: '🛏️', category: 1 },
      { labelKey: 'patientApp.stim.sorting.items.workMorning', emoji: '💼', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.moon', emoji: '🌙', category: 1 },
    ],
  },
  {
    category1Key: 'patientApp.stim.sorting.categories.sweet',
    category1Emoji: '🍬',
    category2Key: 'patientApp.stim.sorting.categories.savoury',
    category2Emoji: '🧂',
    items: [
      { labelKey: 'patientApp.stim.sorting.items.chocolate', emoji: '🍫', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.crisps', emoji: '🥔', category: 1 },
      { labelKey: 'patientApp.stim.sorting.items.honey', emoji: '🍯', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.olives', emoji: '🫒', category: 1 },
      { labelKey: 'patientApp.stim.sorting.items.jam', emoji: '🫙', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.pizza', emoji: '🍕', category: 1 },
    ],
  },
  {
    category1Key: 'patientApp.stim.sorting.categories.kitchen',
    category1Emoji: '🍳',
    category2Key: 'patientApp.stim.sorting.categories.bathroom',
    category2Emoji: '🛁',
    items: [
      { labelKey: 'patientApp.stim.sorting.items.fryingPan', emoji: '🍳', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.towel', emoji: '🧴', category: 1 },
      { labelKey: 'patientApp.stim.sorting.items.kettle', emoji: '🫖', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.soap', emoji: '🧼', category: 1 },
      { labelKey: 'patientApp.stim.sorting.items.plate', emoji: '🍽️', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.toothbrush', emoji: '🪥', category: 1 },
    ],
  },
  {
    category1Key: 'patientApp.stim.sorting.categories.land',
    category1Emoji: '🏔️',
    category2Key: 'patientApp.stim.sorting.categories.water',
    category2Emoji: '🌊',
    items: [
      { labelKey: 'patientApp.stim.sorting.items.mountain', emoji: '⛰️', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.ocean', emoji: '🌊', category: 1 },
      { labelKey: 'patientApp.stim.sorting.items.forest', emoji: '🌲', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.river', emoji: '🏞️', category: 1 },
      { labelKey: 'patientApp.stim.sorting.items.desert', emoji: '🏜️', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.lake', emoji: '💧', category: 1 },
    ],
  },
  {
    category1Key: 'patientApp.stim.sorting.categories.round',
    category1Emoji: '⚽',
    category2Key: 'patientApp.stim.sorting.categories.square',
    category2Emoji: '📦',
    items: [
      { labelKey: 'patientApp.stim.sorting.items.ball', emoji: '⚽', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.box', emoji: '📦', category: 1 },
      { labelKey: 'patientApp.stim.sorting.items.coin', emoji: '🪙', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.window', emoji: '🪟', category: 1 },
      { labelKey: 'patientApp.stim.sorting.items.orange', emoji: '🍊', category: 0 },
      { labelKey: 'patientApp.stim.sorting.items.bookItem', emoji: '📕', category: 1 },
    ],
  },
];

const moderate = gentle; // Same structure, selection varies by daily seed
const challenging = gentle;

export const SORTING_CONTENT: Record<DifficultyLevel, SortingContent[]> = {
  gentle,
  moderate,
  challenging,
};
