/**
 * Word Search — 20 pre-computed 6×6 letter grids.
 * Each grid has 4 words hidden horizontally (left-to-right) or vertically (top-to-bottom).
 * Words are 3–5 letters, UPPERCASE. No diagonals, no backwards.
 */

export interface WordPosition {
  word: string; // the word to find (uppercase)
  start: { row: number; col: number };
  direction: 'horizontal' | 'vertical';
}

export interface WordSearchContent {
  themeKey: string; // i18n key for theme
  grid: string[][]; // 6×6 grid of single uppercase letters
  words: WordPosition[];
}

export const WORD_SEARCH_CONTENT: WordSearchContent[] = [
  // ── 0. Animals ──────────────────────────────────────────────
  {
    themeKey: 'patientApp.stim.wordSearch.themes.animals',
    grid: [
      ['C', 'A', 'T', 'R', 'M', 'P'],
      ['D', 'O', 'G', 'B', 'L', 'K'],
      ['W', 'F', 'J', 'H', 'E', 'N'],
      ['C', 'O', 'W', 'Q', 'T', 'S'],
      ['G', 'X', 'V', 'H', 'E', 'N'],
      ['U', 'R', 'Z', 'P', 'K', 'Y'],
    ],
    words: [
      { word: 'CAT', start: { row: 0, col: 0 }, direction: 'horizontal' },
      { word: 'DOG', start: { row: 1, col: 0 }, direction: 'horizontal' },
      { word: 'COW', start: { row: 3, col: 0 }, direction: 'horizontal' },
      { word: 'HEN', start: { row: 2, col: 3 }, direction: 'horizontal' },
    ],
  },

  // ── 1. Food ─────────────────────────────────────────────────
  {
    themeKey: 'patientApp.stim.wordSearch.themes.food',
    grid: [
      ['R', 'I', 'C', 'E', 'M', 'P'],
      ['K', 'J', 'A', 'B', 'L', 'Q'],
      ['S', 'O', 'U', 'P', 'W', 'N'],
      ['T', 'F', 'K', 'G', 'H', 'D'],
      ['P', 'I', 'E', 'X', 'Z', 'V'],
      ['B', 'Y', 'G', 'N', 'U', 'T'],
    ],
    words: [
      { word: 'RICE', start: { row: 0, col: 0 }, direction: 'horizontal' },
      { word: 'SOUP', start: { row: 2, col: 0 }, direction: 'horizontal' },
      { word: 'PIE', start: { row: 4, col: 0 }, direction: 'horizontal' },
      { word: 'NUT', start: { row: 5, col: 3 }, direction: 'horizontal' },
    ],
  },

  // ── 2. Colours ──────────────────────────────────────────────
  {
    themeKey: 'patientApp.stim.wordSearch.themes.colours',
    grid: [
      ['R', 'E', 'D', 'L', 'K', 'P'],
      ['M', 'F', 'J', 'B', 'L', 'U'],
      ['B', 'L', 'U', 'E', 'W', 'N'],
      ['T', 'G', 'R', 'E', 'E', 'N'],
      ['P', 'I', 'N', 'K', 'Z', 'V'],
      ['B', 'Y', 'Q', 'S', 'U', 'H'],
    ],
    words: [
      { word: 'RED', start: { row: 0, col: 0 }, direction: 'horizontal' },
      { word: 'BLUE', start: { row: 2, col: 0 }, direction: 'horizontal' },
      { word: 'GREEN', start: { row: 3, col: 1 }, direction: 'horizontal' },
      { word: 'PINK', start: { row: 4, col: 0 }, direction: 'horizontal' },
    ],
  },

  // ── 3. Garden ───────────────────────────────────────────────
  {
    themeKey: 'patientApp.stim.wordSearch.themes.garden',
    grid: [
      ['S', 'E', 'E', 'D', 'K', 'P'],
      ['M', 'F', 'J', 'B', 'L', 'U'],
      ['L', 'E', 'A', 'F', 'W', 'N'],
      ['D', 'I', 'G', 'H', 'E', 'R'],
      ['P', 'O', 'T', 'X', 'Z', 'V'],
      ['B', 'Y', 'Q', 'S', 'U', 'D'],
    ],
    words: [
      { word: 'SEED', start: { row: 0, col: 0 }, direction: 'horizontal' },
      { word: 'LEAF', start: { row: 2, col: 0 }, direction: 'horizontal' },
      { word: 'DIG', start: { row: 3, col: 0 }, direction: 'horizontal' },
      { word: 'POT', start: { row: 4, col: 0 }, direction: 'horizontal' },
    ],
  },

  // ── 4. Weather ──────────────────────────────────────────────
  {
    themeKey: 'patientApp.stim.wordSearch.themes.weather',
    grid: [
      ['S', 'U', 'N', 'R', 'K', 'P'],
      ['W', 'I', 'N', 'D', 'L', 'U'],
      ['G', 'F', 'O', 'J', 'W', 'N'],
      ['R', 'A', 'I', 'N', 'E', 'H'],
      ['F', 'O', 'G', 'X', 'Z', 'V'],
      ['B', 'Y', 'Q', 'S', 'U', 'D'],
    ],
    words: [
      { word: 'SUN', start: { row: 0, col: 0 }, direction: 'horizontal' },
      { word: 'WIND', start: { row: 1, col: 0 }, direction: 'horizontal' },
      { word: 'RAIN', start: { row: 3, col: 0 }, direction: 'horizontal' },
      { word: 'FOG', start: { row: 4, col: 0 }, direction: 'horizontal' },
    ],
  },

  // ── 5. Family ───────────────────────────────────────────────
  {
    themeKey: 'patientApp.stim.wordSearch.themes.family',
    grid: [
      ['M', 'U', 'M', 'R', 'K', 'P'],
      ['D', 'A', 'D', 'L', 'N', 'U'],
      ['G', 'U', 'S', 'O', 'N', 'H'],
      ['T', 'N', 'R', 'F', 'E', 'K'],
      ['F', 'T', 'W', 'J', 'Z', 'V'],
      ['B', 'Y', 'Q', 'S', 'U', 'D'],
    ],
    words: [
      { word: 'MUM', start: { row: 0, col: 0 }, direction: 'horizontal' },
      { word: 'DAD', start: { row: 1, col: 0 }, direction: 'horizontal' },
      { word: 'SON', start: { row: 2, col: 2 }, direction: 'horizontal' },
      { word: 'AUNT', start: { row: 1, col: 1 }, direction: 'vertical' },
    ],
  },

  // ── 6. Home ─────────────────────────────────────────────────
  {
    themeKey: 'patientApp.stim.wordSearch.themes.home',
    grid: [
      ['B', 'E', 'D', 'R', 'K', 'P'],
      ['D', 'O', 'O', 'R', 'N', 'U'],
      ['G', 'F', 'J', 'U', 'G', 'H'],
      ['R', 'U', 'G', 'N', 'E', 'K'],
      ['L', 'A', 'M', 'P', 'Z', 'V'],
      ['B', 'Y', 'Q', 'S', 'U', 'D'],
    ],
    words: [
      { word: 'BED', start: { row: 0, col: 0 }, direction: 'horizontal' },
      { word: 'DOOR', start: { row: 1, col: 0 }, direction: 'horizontal' },
      { word: 'RUG', start: { row: 3, col: 0 }, direction: 'horizontal' },
      { word: 'LAMP', start: { row: 4, col: 0 }, direction: 'horizontal' },
    ],
  },

  // ── 7. Clothes ──────────────────────────────────────────────
  {
    themeKey: 'patientApp.stim.wordSearch.themes.clothes',
    grid: [
      ['H', 'A', 'T', 'R', 'K', 'P'],
      ['C', 'O', 'A', 'T', 'N', 'U'],
      ['G', 'F', 'J', 'U', 'G', 'H'],
      ['S', 'O', 'C', 'K', 'E', 'W'],
      ['E', 'A', 'N', 'P', 'Z', 'V'],
      ['W', 'Y', 'Q', 'S', 'V', 'D'],
    ],
    words: [
      { word: 'HAT', start: { row: 0, col: 0 }, direction: 'horizontal' },
      { word: 'COAT', start: { row: 1, col: 0 }, direction: 'horizontal' },
      { word: 'SOCK', start: { row: 3, col: 0 }, direction: 'horizontal' },
      { word: 'SEW', start: { row: 3, col: 0 }, direction: 'vertical' },
    ],
  },

  // ── 8. Body ─────────────────────────────────────────────────
  {
    themeKey: 'patientApp.stim.wordSearch.themes.body',
    grid: [
      ['A', 'R', 'M', 'R', 'K', 'P'],
      ['L', 'E', 'G', 'T', 'N', 'U'],
      ['T', 'O', 'E', 'U', 'G', 'H'],
      ['E', 'A', 'R', 'K', 'D', 'W'],
      ['F', 'A', 'N', 'P', 'Z', 'V'],
      ['B', 'Y', 'Q', 'S', 'V', 'D'],
    ],
    words: [
      { word: 'ARM', start: { row: 0, col: 0 }, direction: 'horizontal' },
      { word: 'LEG', start: { row: 1, col: 0 }, direction: 'horizontal' },
      { word: 'TOE', start: { row: 2, col: 0 }, direction: 'horizontal' },
      { word: 'EAR', start: { row: 3, col: 0 }, direction: 'horizontal' },
    ],
  },

  // ── 9. Nature ───────────────────────────────────────────────
  {
    themeKey: 'patientApp.stim.wordSearch.themes.nature',
    grid: [
      ['S', 'K', 'Y', 'R', 'K', 'P'],
      ['L', 'A', 'K', 'E', 'N', 'U'],
      ['T', 'O', 'M', 'U', 'D', 'H'],
      ['E', 'A', 'R', 'K', 'E', 'W'],
      ['H', 'I', 'L', 'L', 'W', 'V'],
      ['B', 'Y', 'Q', 'S', 'V', 'D'],
    ],
    words: [
      { word: 'SKY', start: { row: 0, col: 0 }, direction: 'horizontal' },
      { word: 'LAKE', start: { row: 1, col: 0 }, direction: 'horizontal' },
      { word: 'MUD', start: { row: 2, col: 2 }, direction: 'horizontal' },
      { word: 'HILL', start: { row: 4, col: 0 }, direction: 'horizontal' },
    ],
  },

  // ── 10. Kitchen ─────────────────────────────────────────────
  {
    themeKey: 'patientApp.stim.wordSearch.themes.kitchen',
    grid: [
      ['C', 'U', 'P', 'R', 'K', 'P'],
      ['P', 'A', 'N', 'E', 'N', 'U'],
      ['T', 'O', 'M', 'J', 'D', 'H'],
      ['B', 'O', 'W', 'L', 'E', 'W'],
      ['F', 'O', 'R', 'K', 'W', 'V'],
      ['B', 'Y', 'Q', 'S', 'V', 'D'],
    ],
    words: [
      { word: 'CUP', start: { row: 0, col: 0 }, direction: 'horizontal' },
      { word: 'PAN', start: { row: 1, col: 0 }, direction: 'horizontal' },
      { word: 'BOWL', start: { row: 3, col: 0 }, direction: 'horizontal' },
      { word: 'FORK', start: { row: 4, col: 0 }, direction: 'horizontal' },
    ],
  },

  // ── 11. Fruit ───────────────────────────────────────────────
  {
    themeKey: 'patientApp.stim.wordSearch.themes.fruit',
    grid: [
      ['F', 'I', 'G', 'R', 'K', 'P'],
      ['P', 'L', 'U', 'M', 'N', 'U'],
      ['P', 'E', 'A', 'R', 'D', 'H'],
      ['B', 'A', 'W', 'L', 'E', 'W'],
      ['L', 'I', 'M', 'E', 'W', 'V'],
      ['B', 'Y', 'Q', 'S', 'V', 'D'],
    ],
    words: [
      { word: 'FIG', start: { row: 0, col: 0 }, direction: 'horizontal' },
      { word: 'PLUM', start: { row: 1, col: 0 }, direction: 'horizontal' },
      { word: 'PEAR', start: { row: 2, col: 0 }, direction: 'horizontal' },
      { word: 'LIME', start: { row: 4, col: 0 }, direction: 'horizontal' },
    ],
  },

  // ── 12. Pets ────────────────────────────────────────────────
  {
    themeKey: 'patientApp.stim.wordSearch.themes.pets',
    grid: [
      ['F', 'I', 'S', 'H', 'K', 'P'],
      ['C', 'A', 'T', 'W', 'N', 'U'],
      ['B', 'I', 'R', 'D', 'L', 'H'],
      ['B', 'A', 'W', 'F', 'E', 'W'],
      ['P', 'O', 'N', 'Y', 'W', 'V'],
      ['B', 'Y', 'Q', 'S', 'V', 'D'],
    ],
    words: [
      { word: 'FISH', start: { row: 0, col: 0 }, direction: 'horizontal' },
      { word: 'CAT', start: { row: 1, col: 0 }, direction: 'horizontal' },
      { word: 'BIRD', start: { row: 2, col: 0 }, direction: 'horizontal' },
      { word: 'PONY', start: { row: 4, col: 0 }, direction: 'horizontal' },
    ],
  },

  // ── 13. Seaside ─────────────────────────────────────────────
  {
    themeKey: 'patientApp.stim.wordSearch.themes.seaside',
    grid: [
      ['S', 'E', 'A', 'H', 'K', 'P'],
      ['S', 'A', 'N', 'D', 'N', 'U'],
      ['W', 'A', 'V', 'E', 'L', 'H'],
      ['B', 'Q', 'W', 'L', 'E', 'W'],
      ['T', 'I', 'D', 'E', 'W', 'V'],
      ['B', 'Y', 'Q', 'S', 'V', 'D'],
    ],
    words: [
      { word: 'SEA', start: { row: 0, col: 0 }, direction: 'horizontal' },
      { word: 'SAND', start: { row: 1, col: 0 }, direction: 'horizontal' },
      { word: 'WAVE', start: { row: 2, col: 0 }, direction: 'horizontal' },
      { word: 'TIDE', start: { row: 4, col: 0 }, direction: 'horizontal' },
    ],
  },

  // ── 14. Sport ───────────────────────────────────────────────
  {
    themeKey: 'patientApp.stim.wordSearch.themes.sport',
    grid: [
      ['R', 'U', 'N', 'H', 'K', 'P'],
      ['K', 'I', 'C', 'K', 'N', 'U'],
      ['B', 'A', 'L', 'L', 'J', 'H'],
      ['G', 'O', 'A', 'L', 'E', 'W'],
      ['T', 'Q', 'D', 'E', 'W', 'V'],
      ['B', 'Y', 'Q', 'S', 'V', 'D'],
    ],
    words: [
      { word: 'RUN', start: { row: 0, col: 0 }, direction: 'horizontal' },
      { word: 'KICK', start: { row: 1, col: 0 }, direction: 'horizontal' },
      { word: 'BALL', start: { row: 2, col: 0 }, direction: 'horizontal' },
      { word: 'GOAL', start: { row: 3, col: 0 }, direction: 'horizontal' },
    ],
  },

  // ── 15. Music ───────────────────────────────────────────────
  {
    themeKey: 'patientApp.stim.wordSearch.themes.music',
    grid: [
      ['S', 'O', 'N', 'G', 'K', 'P'],
      ['D', 'R', 'U', 'M', 'N', 'U'],
      ['B', 'E', 'A', 'T', 'J', 'H'],
      ['G', 'A', 'T', 'U', 'N', 'E'],
      ['T', 'Q', 'D', 'E', 'W', 'V'],
      ['B', 'Y', 'Q', 'S', 'V', 'D'],
    ],
    words: [
      { word: 'SONG', start: { row: 0, col: 0 }, direction: 'horizontal' },
      { word: 'DRUM', start: { row: 1, col: 0 }, direction: 'horizontal' },
      { word: 'BEAT', start: { row: 2, col: 0 }, direction: 'horizontal' },
      { word: 'TUNE', start: { row: 3, col: 2 }, direction: 'horizontal' },
    ],
  },

  // ── 16. Transport ───────────────────────────────────────────
  {
    themeKey: 'patientApp.stim.wordSearch.themes.transport',
    grid: [
      ['B', 'U', 'S', 'G', 'K', 'P'],
      ['C', 'A', 'R', 'M', 'N', 'U'],
      ['V', 'A', 'N', 'T', 'J', 'H'],
      ['T', 'A', 'X', 'I', 'N', 'E'],
      ['T', 'Q', 'D', 'E', 'W', 'V'],
      ['B', 'Y', 'Q', 'S', 'V', 'D'],
    ],
    words: [
      { word: 'BUS', start: { row: 0, col: 0 }, direction: 'horizontal' },
      { word: 'CAR', start: { row: 1, col: 0 }, direction: 'horizontal' },
      { word: 'VAN', start: { row: 2, col: 0 }, direction: 'horizontal' },
      { word: 'TAXI', start: { row: 3, col: 0 }, direction: 'horizontal' },
    ],
  },

  // ── 17. Birds ───────────────────────────────────────────────
  {
    themeKey: 'patientApp.stim.wordSearch.themes.birds',
    grid: [
      ['W', 'R', 'E', 'N', 'K', 'P'],
      ['D', 'O', 'V', 'E', 'N', 'U'],
      ['O', 'W', 'L', 'T', 'J', 'H'],
      ['R', 'O', 'B', 'I', 'N', 'E'],
      ['T', 'Q', 'D', 'E', 'W', 'V'],
      ['B', 'Y', 'Q', 'S', 'V', 'D'],
    ],
    words: [
      { word: 'WREN', start: { row: 0, col: 0 }, direction: 'horizontal' },
      { word: 'DOVE', start: { row: 1, col: 0 }, direction: 'horizontal' },
      { word: 'OWL', start: { row: 2, col: 0 }, direction: 'horizontal' },
      { word: 'ROBIN', start: { row: 3, col: 0 }, direction: 'horizontal' },
    ],
  },

  // ── 18. Trees ───────────────────────────────────────────────
  {
    themeKey: 'patientApp.stim.wordSearch.themes.trees',
    grid: [
      ['O', 'A', 'K', 'N', 'K', 'P'],
      ['E', 'L', 'M', 'E', 'N', 'U'],
      ['A', 'S', 'H', 'T', 'J', 'Y'],
      ['P', 'I', 'N', 'E', 'F', 'E'],
      ['T', 'Q', 'D', 'E', 'W', 'V'],
      ['B', 'Y', 'Q', 'S', 'V', 'D'],
    ],
    words: [
      { word: 'OAK', start: { row: 0, col: 0 }, direction: 'horizontal' },
      { word: 'ELM', start: { row: 1, col: 0 }, direction: 'horizontal' },
      { word: 'ASH', start: { row: 2, col: 0 }, direction: 'horizontal' },
      { word: 'PINE', start: { row: 3, col: 0 }, direction: 'horizontal' },
    ],
  },

  // ── 19. Flowers ─────────────────────────────────────────────
  {
    themeKey: 'patientApp.stim.wordSearch.themes.flowers',
    grid: [
      ['R', 'O', 'S', 'E', 'K', 'P'],
      ['L', 'I', 'L', 'Y', 'N', 'U'],
      ['I', 'R', 'I', 'S', 'J', 'Y'],
      ['P', 'O', 'P', 'P', 'Y', 'E'],
      ['T', 'Q', 'D', 'E', 'W', 'V'],
      ['B', 'Y', 'Q', 'S', 'V', 'D'],
    ],
    words: [
      { word: 'ROSE', start: { row: 0, col: 0 }, direction: 'horizontal' },
      { word: 'LILY', start: { row: 1, col: 0 }, direction: 'horizontal' },
      { word: 'IRIS', start: { row: 2, col: 0 }, direction: 'horizontal' },
      { word: 'POPPY', start: { row: 3, col: 0 }, direction: 'horizontal' },
    ],
  },
];
