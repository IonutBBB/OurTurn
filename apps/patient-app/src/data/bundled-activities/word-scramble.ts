/**
 * Word Scramble — bundled word sets grouped by theme.
 * Each set has 5 common 3–5 letter words with emoji hints.
 * 20 sets covering diverse, familiar themes.
 */

export interface WordScrambleWord {
  word: string; // the correct word (e.g. "CAKE")
  scrambled: string; // scrambled letters (e.g. "EKCA")
  emoji: string; // emoji hint for the word
}

export interface WordScrambleContent {
  themeKey: string; // i18n key for theme name
  words: WordScrambleWord[];
}

export const WORD_SCRAMBLE_CONTENT: WordScrambleContent[] = [
  // 1 — Animals
  {
    themeKey: 'patientApp.stim.wordScramble.themes.animals',
    words: [
      { word: 'CAT', scrambled: 'TCA', emoji: '🐱' },
      { word: 'DOG', scrambled: 'GDO', emoji: '🐶' },
      { word: 'BEAR', scrambled: 'RABE', emoji: '🐻' },
      { word: 'FROG', scrambled: 'GORF', emoji: '🐸' },
      { word: 'DEER', scrambled: 'ERED', emoji: '🦌' },
    ],
  },
  // 2 — Food
  {
    themeKey: 'patientApp.stim.wordScramble.themes.food',
    words: [
      { word: 'CAKE', scrambled: 'EKCA', emoji: '🎂' },
      { word: 'SOUP', scrambled: 'PUOS', emoji: '🍲' },
      { word: 'RICE', scrambled: 'CIRE', emoji: '🍚' },
      { word: 'PIE', scrambled: 'EIP', emoji: '🥧' },
      { word: 'BREAD', scrambled: 'DERBA', emoji: '🍞' },
    ],
  },
  // 3 — Home
  {
    themeKey: 'patientApp.stim.wordScramble.themes.home',
    words: [
      { word: 'BED', scrambled: 'DEB', emoji: '🛏️' },
      { word: 'DOOR', scrambled: 'ROOD', emoji: '🚪' },
      { word: 'LAMP', scrambled: 'PALM', emoji: '💡' },
      { word: 'SOFA', scrambled: 'FAOS', emoji: '🛋️' },
      { word: 'CLOCK', scrambled: 'KOLCC', emoji: '🕐' },
    ],
  },
  // 4 — Nature
  {
    themeKey: 'patientApp.stim.wordScramble.themes.nature',
    words: [
      { word: 'LEAF', scrambled: 'FALE', emoji: '🍃' },
      { word: 'SUN', scrambled: 'NUS', emoji: '☀️' },
      { word: 'MOON', scrambled: 'NOOM', emoji: '🌙' },
      { word: 'LAKE', scrambled: 'KALE', emoji: '🏞️' },
      { word: 'HILL', scrambled: 'LLIH', emoji: '⛰️' },
    ],
  },
  // 5 — Colours
  {
    themeKey: 'patientApp.stim.wordScramble.themes.colours',
    words: [
      { word: 'RED', scrambled: 'DRE', emoji: '🔴' },
      { word: 'BLUE', scrambled: 'LEBU', emoji: '🔵' },
      { word: 'GOLD', scrambled: 'DOLG', emoji: '🟡' },
      { word: 'PINK', scrambled: 'KNIP', emoji: '🩷' },
      { word: 'GREEN', scrambled: 'NEERG', emoji: '🟢' },
    ],
  },
  // 6 — Body
  {
    themeKey: 'patientApp.stim.wordScramble.themes.body',
    words: [
      { word: 'HAND', scrambled: 'DHAN', emoji: '✋' },
      { word: 'NOSE', scrambled: 'ESON', emoji: '👃' },
      { word: 'EAR', scrambled: 'RAE', emoji: '👂' },
      { word: 'KNEE', scrambled: 'EENK', emoji: '🦵' },
      { word: 'FACE', scrambled: 'CEFA', emoji: '😊' },
    ],
  },
  // 7 — Clothes
  {
    themeKey: 'patientApp.stim.wordScramble.themes.clothes',
    words: [
      { word: 'HAT', scrambled: 'TAH', emoji: '🎩' },
      { word: 'COAT', scrambled: 'TAOC', emoji: '🧥' },
      { word: 'SHOE', scrambled: 'OESH', emoji: '👟' },
      { word: 'SOCK', scrambled: 'KCOS', emoji: '🧦' },
      { word: 'BELT', scrambled: 'TLEB', emoji: '👔' },
    ],
  },
  // 8 — Kitchen
  {
    themeKey: 'patientApp.stim.wordScramble.themes.kitchen',
    words: [
      { word: 'CUP', scrambled: 'PUC', emoji: '☕' },
      { word: 'BOWL', scrambled: 'LWOB', emoji: '🥣' },
      { word: 'FORK', scrambled: 'KFRO', emoji: '🍴' },
      { word: 'PAN', scrambled: 'NAP', emoji: '🍳' },
      { word: 'PLATE', scrambled: 'TLAPE', emoji: '🍽️' },
    ],
  },
  // 9 — Garden
  {
    themeKey: 'patientApp.stim.wordScramble.themes.garden',
    words: [
      { word: 'SEED', scrambled: 'DEES', emoji: '🌱' },
      { word: 'ROSE', scrambled: 'OSER', emoji: '🌹' },
      { word: 'WORM', scrambled: 'MROW', emoji: '🪱' },
      { word: 'POND', scrambled: 'DNOP', emoji: '🐸' },
      { word: 'FENCE', scrambled: 'CENFE', emoji: '🏡' },
    ],
  },
  // 10 — Weather
  {
    themeKey: 'patientApp.stim.wordScramble.themes.weather',
    words: [
      { word: 'RAIN', scrambled: 'NIAR', emoji: '🌧️' },
      { word: 'SNOW', scrambled: 'WONS', emoji: '❄️' },
      { word: 'WIND', scrambled: 'DNIW', emoji: '💨' },
      { word: 'COLD', scrambled: 'DOLC', emoji: '🥶' },
      { word: 'STORM', scrambled: 'MROTS', emoji: '⛈️' },
    ],
  },
  // 11 — Family
  {
    themeKey: 'patientApp.stim.wordScramble.themes.family',
    words: [
      { word: 'MUM', scrambled: 'UMM', emoji: '👩' },
      { word: 'DAD', scrambled: 'DDA', emoji: '👨' },
      { word: 'BABY', scrambled: 'YBAB', emoji: '👶' },
      { word: 'SON', scrambled: 'NOS', emoji: '👦' },
      { word: 'NAN', scrambled: 'ANN', emoji: '👵' },
    ],
  },
  // 12 — Fruit
  {
    themeKey: 'patientApp.stim.wordScramble.themes.fruit',
    words: [
      { word: 'PEAR', scrambled: 'RAEP', emoji: '🍐' },
      { word: 'PLUM', scrambled: 'MULP', emoji: '🫐' },
      { word: 'LIME', scrambled: 'MILE', emoji: '🍋' },
      { word: 'FIG', scrambled: 'GIF', emoji: '🍇' },
      { word: 'GRAPE', scrambled: 'PEGAR', emoji: '🍇' },
    ],
  },
  // 13 — Pets
  {
    themeKey: 'patientApp.stim.wordScramble.themes.pets',
    words: [
      { word: 'FISH', scrambled: 'HSIF', emoji: '🐟' },
      { word: 'BIRD', scrambled: 'DRIB', emoji: '🐦' },
      { word: 'PONY', scrambled: 'YNOP', emoji: '🐴' },
      { word: 'PUP', scrambled: 'UPP', emoji: '🐶' },
      { word: 'BUNNY', scrambled: 'NUBNY', emoji: '🐰' },
    ],
  },
  // 14 — Transport
  {
    themeKey: 'patientApp.stim.wordScramble.themes.transport',
    words: [
      { word: 'BUS', scrambled: 'SUB', emoji: '🚌' },
      { word: 'CAR', scrambled: 'RCA', emoji: '🚗' },
      { word: 'BOAT', scrambled: 'TAOB', emoji: '⛵' },
      { word: 'BIKE', scrambled: 'KEBI', emoji: '🚲' },
      { word: 'TRAIN', scrambled: 'NIART', emoji: '🚂' },
    ],
  },
  // 15 — Seaside
  {
    themeKey: 'patientApp.stim.wordScramble.themes.seaside',
    words: [
      { word: 'SAND', scrambled: 'DNAS', emoji: '🏖️' },
      { word: 'WAVE', scrambled: 'EVAW', emoji: '🌊' },
      { word: 'CRAB', scrambled: 'BARC', emoji: '🦀' },
      { word: 'SHELL', scrambled: 'LEHLS', emoji: '🐚' },
      { word: 'PIER', scrambled: 'REIP', emoji: '🌅' },
    ],
  },
  // 16 — Music
  {
    themeKey: 'patientApp.stim.wordScramble.themes.music',
    words: [
      { word: 'DRUM', scrambled: 'MRUD', emoji: '🥁' },
      { word: 'SONG', scrambled: 'GNOS', emoji: '🎵' },
      { word: 'HARP', scrambled: 'PRAH', emoji: '🎶' },
      { word: 'BAND', scrambled: 'DNAB', emoji: '🎸' },
      { word: 'TUNE', scrambled: 'ENUT', emoji: '🎼' },
    ],
  },
  // 17 — Sport
  {
    themeKey: 'patientApp.stim.wordScramble.themes.sport',
    words: [
      { word: 'BALL', scrambled: 'LLAB', emoji: '⚽' },
      { word: 'GOAL', scrambled: 'LAOG', emoji: '🥅' },
      { word: 'RUN', scrambled: 'NUR', emoji: '🏃' },
      { word: 'SWIM', scrambled: 'MWIS', emoji: '🏊' },
      { word: 'TEAM', scrambled: 'MATE', emoji: '👥' },
    ],
  },
  // 18 — Birds
  {
    themeKey: 'patientApp.stim.wordScramble.themes.birds',
    words: [
      { word: 'WREN', scrambled: 'NERW', emoji: '🐦' },
      { word: 'OWL', scrambled: 'LWO', emoji: '🦉' },
      { word: 'DOVE', scrambled: 'EVOD', emoji: '🕊️' },
      { word: 'CROW', scrambled: 'WORC', emoji: '🐦‍⬛' },
      { word: 'SWAN', scrambled: 'NAWS', emoji: '🦢' },
    ],
  },
  // 19 — Trees
  {
    themeKey: 'patientApp.stim.wordScramble.themes.trees',
    words: [
      { word: 'OAK', scrambled: 'KAO', emoji: '🌳' },
      { word: 'PINE', scrambled: 'ENIP', emoji: '🌲' },
      { word: 'ELM', scrambled: 'MLE', emoji: '🌿' },
      { word: 'ASH', scrambled: 'HAS', emoji: '🍂' },
      { word: 'BIRCH', scrambled: 'CHRIB', emoji: '🌳' },
    ],
  },
  // 20 — Flowers
  {
    themeKey: 'patientApp.stim.wordScramble.themes.flowers',
    words: [
      { word: 'LILY', scrambled: 'YLLI', emoji: '🌸' },
      { word: 'IRIS', scrambled: 'SIRI', emoji: '💐' },
      { word: 'DAISY', scrambled: 'YDIAS', emoji: '🌼' },
      { word: 'POPPY', scrambled: 'YPPOP', emoji: '🌺' },
      { word: 'TULIP', scrambled: 'PILUT', emoji: '🌷' },
    ],
  },
];
