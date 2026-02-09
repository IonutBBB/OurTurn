/**
 * Word Association — bundled starter words by difficulty.
 * Patient says the first word that comes to mind.
 */

import type { DifficultyLevel } from '@ourturn/shared';

export interface WordAssociationContent {
  starterWord: string;
  starterWordKey: string;
  category: string;
}

const gentle: WordAssociationContent[] = [
  { starterWord: 'Sun', starterWordKey: 'patientApp.stim.wordAssociation.words.sun', category: 'nature' },
  { starterWord: 'Home', starterWordKey: 'patientApp.stim.wordAssociation.words.home', category: 'places' },
  { starterWord: 'Dog', starterWordKey: 'patientApp.stim.wordAssociation.words.dog', category: 'animals' },
  { starterWord: 'Cake', starterWordKey: 'patientApp.stim.wordAssociation.words.cake', category: 'food' },
  { starterWord: 'Rain', starterWordKey: 'patientApp.stim.wordAssociation.words.rain', category: 'nature' },
  { starterWord: 'Baby', starterWordKey: 'patientApp.stim.wordAssociation.words.baby', category: 'people' },
  { starterWord: 'Garden', starterWordKey: 'patientApp.stim.wordAssociation.words.garden', category: 'places' },
  { starterWord: 'Tea', starterWordKey: 'patientApp.stim.wordAssociation.words.tea', category: 'food' },
  { starterWord: 'Cat', starterWordKey: 'patientApp.stim.wordAssociation.words.cat', category: 'animals' },
  { starterWord: 'Song', starterWordKey: 'patientApp.stim.wordAssociation.words.song', category: 'music' },
  { starterWord: 'Tree', starterWordKey: 'patientApp.stim.wordAssociation.words.tree', category: 'nature' },
  { starterWord: 'Bread', starterWordKey: 'patientApp.stim.wordAssociation.words.bread', category: 'food' },
  { starterWord: 'Flower', starterWordKey: 'patientApp.stim.wordAssociation.words.flower', category: 'nature' },
  { starterWord: 'Friend', starterWordKey: 'patientApp.stim.wordAssociation.words.friend', category: 'people' },
  { starterWord: 'Star', starterWordKey: 'patientApp.stim.wordAssociation.words.star', category: 'nature' },
  { starterWord: 'Book', starterWordKey: 'patientApp.stim.wordAssociation.words.book', category: 'objects' },
  { starterWord: 'Bird', starterWordKey: 'patientApp.stim.wordAssociation.words.bird', category: 'animals' },
  { starterWord: 'Beach', starterWordKey: 'patientApp.stim.wordAssociation.words.beach', category: 'places' },
  { starterWord: 'Apple', starterWordKey: 'patientApp.stim.wordAssociation.words.apple', category: 'food' },
  { starterWord: 'Heart', starterWordKey: 'patientApp.stim.wordAssociation.words.heart', category: 'body' },
];

const moderate: WordAssociationContent[] = [
  { starterWord: 'Journey', starterWordKey: 'patientApp.stim.wordAssociation.words.journey', category: 'abstract' },
  { starterWord: 'Kitchen', starterWordKey: 'patientApp.stim.wordAssociation.words.kitchen', category: 'places' },
  { starterWord: 'Winter', starterWordKey: 'patientApp.stim.wordAssociation.words.winter', category: 'seasons' },
  { starterWord: 'Market', starterWordKey: 'patientApp.stim.wordAssociation.words.market', category: 'places' },
  { starterWord: 'Blanket', starterWordKey: 'patientApp.stim.wordAssociation.words.blanket', category: 'objects' },
  { starterWord: 'Holiday', starterWordKey: 'patientApp.stim.wordAssociation.words.holiday', category: 'events' },
  { starterWord: 'Candle', starterWordKey: 'patientApp.stim.wordAssociation.words.candle', category: 'objects' },
  { starterWord: 'Bridge', starterWordKey: 'patientApp.stim.wordAssociation.words.bridge', category: 'structures' },
  { starterWord: 'Harvest', starterWordKey: 'patientApp.stim.wordAssociation.words.harvest', category: 'nature' },
  { starterWord: 'Parade', starterWordKey: 'patientApp.stim.wordAssociation.words.parade', category: 'events' },
  { starterWord: 'Sunrise', starterWordKey: 'patientApp.stim.wordAssociation.words.sunrise', category: 'nature' },
  { starterWord: 'Carpet', starterWordKey: 'patientApp.stim.wordAssociation.words.carpet', category: 'objects' },
  { starterWord: 'Lemon', starterWordKey: 'patientApp.stim.wordAssociation.words.lemon', category: 'food' },
  { starterWord: 'Wedding', starterWordKey: 'patientApp.stim.wordAssociation.words.wedding', category: 'events' },
  { starterWord: 'Lighthouse', starterWordKey: 'patientApp.stim.wordAssociation.words.lighthouse', category: 'structures' },
  { starterWord: 'Chocolate', starterWordKey: 'patientApp.stim.wordAssociation.words.chocolate', category: 'food' },
  { starterWord: 'Mountain', starterWordKey: 'patientApp.stim.wordAssociation.words.mountain', category: 'nature' },
  { starterWord: 'Violin', starterWordKey: 'patientApp.stim.wordAssociation.words.violin', category: 'music' },
  { starterWord: 'Summer', starterWordKey: 'patientApp.stim.wordAssociation.words.summer', category: 'seasons' },
  { starterWord: 'Compass', starterWordKey: 'patientApp.stim.wordAssociation.words.compass', category: 'objects' },
];

const challenging: WordAssociationContent[] = [
  { starterWord: 'Freedom', starterWordKey: 'patientApp.stim.wordAssociation.words.freedom', category: 'abstract' },
  { starterWord: 'Tradition', starterWordKey: 'patientApp.stim.wordAssociation.words.tradition', category: 'abstract' },
  { starterWord: 'Discovery', starterWordKey: 'patientApp.stim.wordAssociation.words.discovery', category: 'abstract' },
  { starterWord: 'Orchestra', starterWordKey: 'patientApp.stim.wordAssociation.words.orchestra', category: 'music' },
  { starterWord: 'Celebration', starterWordKey: 'patientApp.stim.wordAssociation.words.celebration', category: 'events' },
  { starterWord: 'Treasure', starterWordKey: 'patientApp.stim.wordAssociation.words.treasure', category: 'abstract' },
  { starterWord: 'Cathedral', starterWordKey: 'patientApp.stim.wordAssociation.words.cathedral', category: 'structures' },
  { starterWord: 'Carnival', starterWordKey: 'patientApp.stim.wordAssociation.words.carnival', category: 'events' },
  { starterWord: 'Telescope', starterWordKey: 'patientApp.stim.wordAssociation.words.telescope', category: 'objects' },
  { starterWord: 'Nostalgia', starterWordKey: 'patientApp.stim.wordAssociation.words.nostalgia', category: 'abstract' },
  { starterWord: 'Wisdom', starterWordKey: 'patientApp.stim.wordAssociation.words.wisdom', category: 'abstract' },
  { starterWord: 'Expedition', starterWordKey: 'patientApp.stim.wordAssociation.words.expedition', category: 'events' },
  { starterWord: 'Tapestry', starterWordKey: 'patientApp.stim.wordAssociation.words.tapestry', category: 'objects' },
  { starterWord: 'Constellation', starterWordKey: 'patientApp.stim.wordAssociation.words.constellation', category: 'nature' },
  { starterWord: 'Heritage', starterWordKey: 'patientApp.stim.wordAssociation.words.heritage', category: 'abstract' },
  { starterWord: 'Harmony', starterWordKey: 'patientApp.stim.wordAssociation.words.harmony', category: 'abstract' },
  { starterWord: 'Labyrinth', starterWordKey: 'patientApp.stim.wordAssociation.words.labyrinth', category: 'structures' },
  { starterWord: 'Renaissance', starterWordKey: 'patientApp.stim.wordAssociation.words.renaissance', category: 'abstract' },
  { starterWord: 'Serenity', starterWordKey: 'patientApp.stim.wordAssociation.words.serenity', category: 'abstract' },
  { starterWord: 'Wanderlust', starterWordKey: 'patientApp.stim.wordAssociation.words.wanderlust', category: 'abstract' },
];

export const WORD_ASSOCIATION_CONTENT: Record<DifficultyLevel, WordAssociationContent[]> = {
  gentle,
  moderate,
  challenging,
};
