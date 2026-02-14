export interface PhotoPairsContent {
  theme: string;
  themeKey: string;
  pairs: { emoji: string; labelKey: string }[];
}

export const PHOTO_PAIRS_CONTENT: PhotoPairsContent[] = [
  {
    theme: 'flowers', themeKey: 'patientApp.stim.photoPairs.themes.flowers',
    pairs: [
      { emoji: '🌹', labelKey: 'patientApp.stim.photoPairs.items.rose' },
      { emoji: '🌻', labelKey: 'patientApp.stim.photoPairs.items.sunflower' },
      { emoji: '🌷', labelKey: 'patientApp.stim.photoPairs.items.tulip' },
      { emoji: '🌸', labelKey: 'patientApp.stim.photoPairs.items.blossom' },
    ],
  },
  {
    theme: 'animals', themeKey: 'patientApp.stim.photoPairs.themes.animals',
    pairs: [
      { emoji: '🐱', labelKey: 'patientApp.stim.photoPairs.items.cat' },
      { emoji: '🐕', labelKey: 'patientApp.stim.photoPairs.items.dog' },
      { emoji: '🐰', labelKey: 'patientApp.stim.photoPairs.items.rabbit' },
      { emoji: '🐦', labelKey: 'patientApp.stim.photoPairs.items.bird' },
    ],
  },
  {
    theme: 'food', themeKey: 'patientApp.stim.photoPairs.themes.food',
    pairs: [
      { emoji: '🍎', labelKey: 'patientApp.stim.photoPairs.items.apple' },
      { emoji: '🍰', labelKey: 'patientApp.stim.photoPairs.items.cake' },
      { emoji: '🍞', labelKey: 'patientApp.stim.photoPairs.items.bread' },
      { emoji: '🧁', labelKey: 'patientApp.stim.photoPairs.items.cupcake' },
    ],
  },
  {
    theme: 'nature', themeKey: 'patientApp.stim.photoPairs.themes.nature',
    pairs: [
      { emoji: '🌳', labelKey: 'patientApp.stim.photoPairs.items.tree' },
      { emoji: '🌈', labelKey: 'patientApp.stim.photoPairs.items.rainbow' },
      { emoji: '⭐', labelKey: 'patientApp.stim.photoPairs.items.star' },
      { emoji: '☀️', labelKey: 'patientApp.stim.photoPairs.items.sun' },
    ],
  },
  {
    theme: 'seasons', themeKey: 'patientApp.stim.photoPairs.themes.seasons',
    pairs: [
      { emoji: '🌸', labelKey: 'patientApp.stim.photoPairs.items.spring' },
      { emoji: '☀️', labelKey: 'patientApp.stim.photoPairs.items.summer' },
      { emoji: '🍂', labelKey: 'patientApp.stim.photoPairs.items.autumn' },
      { emoji: '❄️', labelKey: 'patientApp.stim.photoPairs.items.winter' },
    ],
  },
];
