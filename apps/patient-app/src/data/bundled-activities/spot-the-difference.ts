export interface DifferencePosition {
  row: number; // 0-2
  col: number; // 0-3
  original: string; // emoji in original grid
  modified: string; // different emoji in modified grid
}

export interface SpotDifferenceContent {
  theme: string; // scene theme name
  original: string[][]; // 3 rows x 4 cols of emojis
  modified: string[][]; // 3 rows x 4 cols (3 differences)
  differences: DifferencePosition[];
}

export const SPOT_DIFFERENCE_CONTENT: SpotDifferenceContent[] = [
  // 1 — Garden
  {
    theme: 'garden',
    original: [
      ['🌹', '🌻', '🌷', '🌸'],
      ['🐝', '🦋', '🌿', '🌺'],
      ['🌱', '🍀', '🐞', '🌼'],
    ],
    modified: [
      ['🌹', '🌻', '🌷', '🌸'],
      ['🐝', '🐛', '🌿', '🌺'],
      ['🌱', '🍀', '🐜', '🌻'],
    ],
    differences: [
      { row: 1, col: 1, original: '🦋', modified: '🐛' },
      { row: 2, col: 2, original: '🐞', modified: '🐜' },
      { row: 2, col: 3, original: '🌼', modified: '🌻' },
    ],
  },
  // 2 — Kitchen
  {
    theme: 'kitchen',
    original: [
      ['🍳', '🥘', '🍲', '🥄'],
      ['🔪', '🧂', '🫕', '🍽️'],
      ['🥗', '🍞', '🧈', '🫖'],
    ],
    modified: [
      ['🍳', '🥘', '🥣', '🥄'],
      ['🔪', '🧂', '🫕', '🥢'],
      ['🥗', '🍰', '🧈', '🫖'],
    ],
    differences: [
      { row: 0, col: 2, original: '🍲', modified: '🥣' },
      { row: 1, col: 3, original: '🍽️', modified: '🥢' },
      { row: 2, col: 1, original: '🍞', modified: '🍰' },
    ],
  },
  // 3 — Farm
  {
    theme: 'farm',
    original: [
      ['🐄', '🐖', '🐔', '🐑'],
      ['🌾', '🚜', '🐴', '🌽'],
      ['🐓', '🥕', '🐐', '🌻'],
    ],
    modified: [
      ['🐄', '🐖', '🐔', '🐏'],
      ['🌾', '🚜', '🐎', '🌽'],
      ['🐓', '🥕', '🐇', '🌻'],
    ],
    differences: [
      { row: 0, col: 3, original: '🐑', modified: '🐏' },
      { row: 1, col: 2, original: '🐴', modified: '🐎' },
      { row: 2, col: 2, original: '🐐', modified: '🐇' },
    ],
  },
  // 4 — Ocean
  {
    theme: 'ocean',
    original: [
      ['🐟', '🐠', '🐡', '🦈'],
      ['🐚', '🦀', '🐙', '🪸'],
      ['🦞', '🐳', '🦑', '🐬'],
    ],
    modified: [
      ['🐟', '🐠', '🐡', '🐋'],
      ['🐚', '🦐', '🐙', '🪸'],
      ['🦞', '🐳', '🦑', '🦭'],
    ],
    differences: [
      { row: 0, col: 3, original: '🦈', modified: '🐋' },
      { row: 1, col: 1, original: '🦀', modified: '🦐' },
      { row: 2, col: 3, original: '🐬', modified: '🦭' },
    ],
  },
  // 5 — Park
  {
    theme: 'park',
    original: [
      ['🌳', '🪑', '🐦', '🌲'],
      ['🐿️', '⛲', '🦆', '🌺'],
      ['🚲', '🐕', '🦢', '🌸'],
    ],
    modified: [
      ['🌳', '🪑', '🐤', '🌲'],
      ['🐿️', '⛲', '🦆', '🌹'],
      ['🚲', '🐕', '🦩', '🌸'],
    ],
    differences: [
      { row: 0, col: 2, original: '🐦', modified: '🐤' },
      { row: 1, col: 3, original: '🌺', modified: '🌹' },
      { row: 2, col: 2, original: '🦢', modified: '🦩' },
    ],
  },
  // 6 — Fruit Market
  {
    theme: 'fruit_market',
    original: [
      ['🍎', '🍊', '🍋', '🍇'],
      ['🍌', '🍓', '🫐', '🍑'],
      ['🥝', '🍒', '🍍', '🥭'],
    ],
    modified: [
      ['🍎', '🍊', '🍋', '🍇'],
      ['🍌', '🍉', '🫐', '🍐'],
      ['🥝', '🍒', '🥥', '🥭'],
    ],
    differences: [
      { row: 1, col: 1, original: '🍓', modified: '🍉' },
      { row: 1, col: 3, original: '🍑', modified: '🍐' },
      { row: 2, col: 2, original: '🍍', modified: '🥥' },
    ],
  },
  // 7 — Weather
  {
    theme: 'weather',
    original: [
      ['☀️', '⛅', '🌧️', '❄️'],
      ['🌈', '⚡', '🌪️', '🌤️'],
      ['🌙', '⭐', '☁️', '🌊'],
    ],
    modified: [
      ['☀️', '🌥️', '🌧️', '❄️'],
      ['🌈', '⚡', '🌀', '🌤️'],
      ['🌙', '🌟', '☁️', '🌊'],
    ],
    differences: [
      { row: 0, col: 1, original: '⛅', modified: '🌥️' },
      { row: 1, col: 2, original: '🌪️', modified: '🌀' },
      { row: 2, col: 1, original: '⭐', modified: '🌟' },
    ],
  },
  // 8 — Pets
  {
    theme: 'pets',
    original: [
      ['🐱', '🐕', '🐹', '🐰'],
      ['🐠', '🦜', '🐢', '🐍'],
      ['🦎', '🐈', '🐩', '🦔'],
    ],
    modified: [
      ['🐱', '🐕', '🐭', '🐰'],
      ['🐠', '🦜', '🐢', '🐍'],
      ['🦎', '🐈‍⬛', '🐕‍🦺', '🦔'],
    ],
    differences: [
      { row: 0, col: 2, original: '🐹', modified: '🐭' },
      { row: 2, col: 1, original: '🐈', modified: '🐈‍⬛' },
      { row: 2, col: 2, original: '🐩', modified: '🐕‍🦺' },
    ],
  },
  // 9 — Music
  {
    theme: 'music',
    original: [
      ['🎹', '🎸', '🎺', '🥁'],
      ['🎻', '🎷', '🪕', '🎶'],
      ['🎵', '🎤', '🪗', '🔔'],
    ],
    modified: [
      ['🎹', '🎸', '📯', '🥁'],
      ['🎻', '🪈', '🪕', '🎶'],
      ['🎵', '🎤', '🪘', '🔔'],
    ],
    differences: [
      { row: 0, col: 2, original: '🎺', modified: '📯' },
      { row: 1, col: 1, original: '🎷', modified: '🪈' },
      { row: 2, col: 2, original: '🪗', modified: '🪘' },
    ],
  },
  // 10 — Sports
  {
    theme: 'sports',
    original: [
      ['⚽', '🏀', '🎾', '🏐'],
      ['🏈', '⚾', '🏓', '🏸'],
      ['🎳', '🥊', '⛳', '🏊'],
    ],
    modified: [
      ['⚽', '🏀', '🎾', '🏐'],
      ['🏉', '⚾', '🏓', '🥏'],
      ['🎳', '🤾', '⛳', '🏊'],
    ],
    differences: [
      { row: 1, col: 0, original: '🏈', modified: '🏉' },
      { row: 1, col: 3, original: '🏸', modified: '🥏' },
      { row: 2, col: 1, original: '🥊', modified: '🤾' },
    ],
  },
  // 11 — Bakery
  {
    theme: 'bakery',
    original: [
      ['🍰', '🧁', '🍩', '🥐'],
      ['🍪', '🎂', '🥮', '🍫'],
      ['🍮', '🧇', '🥨', '🍦'],
    ],
    modified: [
      ['🍰', '🧁', '🍩', '🥐'],
      ['🍪', '🎂', '🥧', '🍭'],
      ['🍬', '🧇', '🥨', '🍦'],
    ],
    differences: [
      { row: 1, col: 2, original: '🥮', modified: '🥧' },
      { row: 1, col: 3, original: '🍫', modified: '🍭' },
      { row: 2, col: 0, original: '🍮', modified: '🍬' },
    ],
  },
  // 12 — Seaside
  {
    theme: 'seaside',
    original: [
      ['🏖️', '🌊', '🐚', '⛱️'],
      ['🦀', '🏄', '🚢', '🐬'],
      ['🦞', '⚓', '🐙', '🌅'],
    ],
    modified: [
      ['🏖️', '🌊', '🐚', '🏝️'],
      ['🦀', '🚣', '🚢', '🐬'],
      ['🦞', '⚓', '🦑', '🌅'],
    ],
    differences: [
      { row: 0, col: 3, original: '⛱️', modified: '🏝️' },
      { row: 1, col: 1, original: '🏄', modified: '🚣' },
      { row: 2, col: 2, original: '🐙', modified: '🦑' },
    ],
  },
  // 13 — Garden Tools
  {
    theme: 'garden_tools',
    original: [
      ['🌱', '🪴', '🌿', '🍃'],
      ['🧤', '🪣', '🌻', '🦗'],
      ['🐛', '🪺', '🏵️', '🌾'],
    ],
    modified: [
      ['🌱', '🪴', '🍂', '🍃'],
      ['🧤', '🪣', '🌼', '🦗'],
      ['🐛', '🪹', '🏵️', '🌾'],
    ],
    differences: [
      { row: 0, col: 2, original: '🌿', modified: '🍂' },
      { row: 1, col: 2, original: '🌻', modified: '🌼' },
      { row: 2, col: 1, original: '🪺', modified: '🪹' },
    ],
  },
  // 14 — Breakfast
  {
    theme: 'breakfast',
    original: [
      ['🥞', '🍳', '🥓', '🧇'],
      ['🥣', '☕', '🥐', '🍯'],
      ['🫘', '🧀', '🥖', '🫙'],
    ],
    modified: [
      ['🥞', '🍳', '🥓', '🧇'],
      ['🥣', '🍵', '🥯', '🍯'],
      ['🫘', '🧀', '🥖', '🫕'],
    ],
    differences: [
      { row: 1, col: 1, original: '☕', modified: '🍵' },
      { row: 1, col: 2, original: '🥐', modified: '🥯' },
      { row: 2, col: 3, original: '🫙', modified: '🫕' },
    ],
  },
  // 15 — Woodland
  {
    theme: 'woodland',
    original: [
      ['🌳', '🦊', '🍄', '🌲'],
      ['🦌', '🦉', '🐿️', '🍁'],
      ['🐻', '🌰', '🦡', '🪵'],
    ],
    modified: [
      ['🌳', '🐺', '🍄', '🌲'],
      ['🦌', '🦅', '🐿️', '🍁'],
      ['🐻', '🌰', '🦨', '🪵'],
    ],
    differences: [
      { row: 0, col: 1, original: '🦊', modified: '🐺' },
      { row: 1, col: 1, original: '🦉', modified: '🦅' },
      { row: 2, col: 2, original: '🦡', modified: '🦨' },
    ],
  },
  // 16 — Travel
  {
    theme: 'travel',
    original: [
      ['✈️', '🚂', '🚗', '🚢'],
      ['🏨', '🗺️', '📷', '🧳'],
      ['🏝️', '🗼', '🎒', '🌍'],
    ],
    modified: [
      ['✈️', '🚂', '🚌', '🚢'],
      ['🏨', '🧭', '📷', '🧳'],
      ['🏝️', '🗽', '🎒', '🌍'],
    ],
    differences: [
      { row: 0, col: 2, original: '🚗', modified: '🚌' },
      { row: 1, col: 1, original: '🗺️', modified: '🧭' },
      { row: 2, col: 1, original: '🗼', modified: '🗽' },
    ],
  },
  // 17 — Vegetables
  {
    theme: 'vegetables',
    original: [
      ['🥕', '🥦', '🌽', '🍅'],
      ['🥒', '🫑', '🧅', '🥬'],
      ['🍆', '🥔', '🧄', '🌶️'],
    ],
    modified: [
      ['🥕', '🥦', '🌽', '🍅'],
      ['🥒', '🫑', '🧅', '🫛'],
      ['🥑', '🫒', '🧄', '🌶️'],
    ],
    differences: [
      { row: 1, col: 3, original: '🥬', modified: '🫛' },
      { row: 2, col: 0, original: '🍆', modified: '🥑' },
      { row: 2, col: 1, original: '🥔', modified: '🫒' },
    ],
  },
  // 18 — Celebration
  {
    theme: 'celebration',
    original: [
      ['🎉', '🎈', '🎊', '🎁'],
      ['🎂', '🥂', '🎆', '🧨'],
      ['🎀', '🪅', '🎇', '🎯'],
    ],
    modified: [
      ['🎉', '🎈', '🎊', '🎁'],
      ['🎂', '🍾', '🎇', '🧨'],
      ['🎀', '🪅', '🪩', '🎯'],
    ],
    differences: [
      { row: 1, col: 1, original: '🥂', modified: '🍾' },
      { row: 1, col: 2, original: '🎆', modified: '🎇' },
      { row: 2, col: 2, original: '🎇', modified: '🪩' },
    ],
  },
  // 19 — Insects
  {
    theme: 'insects',
    original: [
      ['🐝', '🦋', '🐛', '🐞'],
      ['🦗', '🪲', '🐜', '🦟'],
      ['🪰', '🦠', '🕷️', '🪳'],
    ],
    modified: [
      ['🐝', '🦋', '🐛', '🪲'],
      ['🦗', '🪲', '🐜', '🪱'],
      ['🪰', '🦠', '🦂', '🪳'],
    ],
    differences: [
      { row: 0, col: 3, original: '🐞', modified: '🪲' },
      { row: 1, col: 3, original: '🦟', modified: '🪱' },
      { row: 2, col: 2, original: '🕷️', modified: '🦂' },
    ],
  },
  // 20 — Flowers
  {
    theme: 'flowers',
    original: [
      ['🌹', '🌻', '🌺', '💐'],
      ['🌷', '🌸', '🏵️', '💮'],
      ['🪷', '🌼', '🌿', '🍀'],
    ],
    modified: [
      ['🌹', '🌻', '🌺', '🌷'],
      ['🌷', '🪻', '🏵️', '💮'],
      ['🪷', '🌼', '🍃', '🍀'],
    ],
    differences: [
      { row: 0, col: 3, original: '💐', modified: '🌷' },
      { row: 1, col: 1, original: '🌸', modified: '🪻' },
      { row: 2, col: 2, original: '🌿', modified: '🍃' },
    ],
  },
];
