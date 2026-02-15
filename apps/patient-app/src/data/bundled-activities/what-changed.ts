export interface WhatChangedRound {
  grid: string[]; // 6 emojis in 2x3 layout
  changedIndex: number; // which cell changes
  newEmoji: string; // what it changes to
}

export interface WhatChangedContent {
  rounds: WhatChangedRound[];
}

export const WHAT_CHANGED_CONTENT: WhatChangedContent[] = [
  // Set 1
  {
    rounds: [
      { grid: ['🍎', '🍊', '🍋', '🍇', '🍌', '🍓'], changedIndex: 2, newEmoji: '🍑' },
      { grid: ['🐕', '🐈', '🐇', '🐟', '🐦', '🐸'], changedIndex: 4, newEmoji: '🦉' },
      { grid: ['☀️', '🌙', '⭐', '🌈', '☁️', '❄️'], changedIndex: 0, newEmoji: '🌧️' },
    ],
  },
  // Set 2
  {
    rounds: [
      { grid: ['🚗', '🚌', '🚂', '✈️', '🚲', '⛵'], changedIndex: 3, newEmoji: '🚁' },
      { grid: ['🌷', '🌻', '🌹', '🌸', '🌺', '💐'], changedIndex: 1, newEmoji: '🌼' },
      { grid: ['🎹', '🎸', '🥁', '🎺', '🎻', '🪗'], changedIndex: 5, newEmoji: '🎷' },
    ],
  },
  // Set 3
  {
    rounds: [
      { grid: ['👒', '🧢', '🎩', '👑', '🧣', '🧤'], changedIndex: 3, newEmoji: '🎓' },
      { grid: ['🍕', '🍔', '🌭', '🍟', '🌮', '🍿'], changedIndex: 0, newEmoji: '🥪' },
      { grid: ['⚽', '🏀', '🎾', '🏈', '🏐', '🎳'], changedIndex: 2, newEmoji: '🏓' },
    ],
  },
  // Set 4
  {
    rounds: [
      { grid: ['🏠', '🏢', '🏥', '🏫', '⛪', '🏰'], changedIndex: 5, newEmoji: '🏛️' },
      { grid: ['🐝', '🦋', '🐜', '🐞', '🕷️', '🦗'], changedIndex: 1, newEmoji: '🐛' },
      { grid: ['🍰', '🧁', '🍩', '🍪', '🎂', '🍫'], changedIndex: 4, newEmoji: '🍬' },
    ],
  },
  // Set 5
  {
    rounds: [
      { grid: ['🌲', '🌴', '🌳', '🎄', '🌵', '🎋'], changedIndex: 0, newEmoji: '🎍' },
      { grid: ['🐄', '🐖', '🐑', '🐔', '🐴', '🐐'], changedIndex: 3, newEmoji: '🦆' },
      { grid: ['☕', '🍵', '🧃', '🥛', '🍺', '🥤'], changedIndex: 2, newEmoji: '🍶' },
    ],
  },
  // Set 6
  {
    rounds: [
      { grid: ['✏️', '🖊️', '📏', '✂️', '📎', '🔍'], changedIndex: 4, newEmoji: '📐' },
      { grid: ['🧹', '🧽', '🪣', '🧴', '🪥', '🧺'], changedIndex: 0, newEmoji: '🫧' },
      { grid: ['🎈', '🎁', '🎂', '🎉', '🎊', '🎀'], changedIndex: 3, newEmoji: '🪅' },
    ],
  },
  // Set 7
  {
    rounds: [
      { grid: ['🥕', '🥦', '🌽', '🥒', '🫑', '🧅'], changedIndex: 1, newEmoji: '🥬' },
      { grid: ['🐟', '🦀', '🐙', '🦐', '🐚', '🐬'], changedIndex: 5, newEmoji: '🐳' },
      { grid: ['💍', '📿', '👑', '⌚', '🕶️', '🧢'], changedIndex: 2, newEmoji: '💎' },
    ],
  },
  // Set 8
  {
    rounds: [
      { grid: ['🛋️', '🪑', '🛏️', '🪞', '🖼️', '🕰️'], changedIndex: 4, newEmoji: '📺' },
      { grid: ['🌍', '🌎', '🌏', '🗺️', '🧭', '🌐'], changedIndex: 0, newEmoji: '🗾' },
      { grid: ['🧸', '🎮', '🧩', '🎲', '🪀', '🎯'], changedIndex: 3, newEmoji: '♟️' },
    ],
  },
  // Set 9
  {
    rounds: [
      { grid: ['🍎', '🍐', '🍊', '🍋', '🍇', '🍉'], changedIndex: 5, newEmoji: '🍒' },
      { grid: ['🐕', '🐈', '🐹', '🐰', '🐦', '🐠'], changedIndex: 2, newEmoji: '🐿️' },
      { grid: ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'], changedIndex: 1, newEmoji: '⚫' },
    ],
  },
  // Set 10
  {
    rounds: [
      { grid: ['🎻', '🎹', '🎷', '🎺', '🥁', '🪗'], changedIndex: 0, newEmoji: '🎸' },
      { grid: ['👞', '👟', '👢', '🩴', '👠', '🥿'], changedIndex: 3, newEmoji: '🩰' },
      { grid: ['🏖️', '🏔️', '🏕️', '🎡', '🏟️', '🎢'], changedIndex: 1, newEmoji: '🌋' },
    ],
  },
  // Set 11
  {
    rounds: [
      { grid: ['🚒', '🚑', '🚔', '🚕', '🚌', '🚂'], changedIndex: 4, newEmoji: '🚐' },
      { grid: ['🌷', '🌹', '🌻', '🌺', '💐', '🌼'], changedIndex: 2, newEmoji: '🪻' },
      { grid: ['🧁', '🍩', '🍪', '🎂', '🍰', '🍭'], changedIndex: 0, newEmoji: '🍬' },
    ],
  },
  // Set 12
  {
    rounds: [
      { grid: ['🦁', '🐅', '🐻', '🐺', '🦊', '🐒'], changedIndex: 3, newEmoji: '🦝' },
      { grid: ['☂️', '🌂', '☔', '🧥', '🧤', '🧣'], changedIndex: 5, newEmoji: '🧶' },
      { grid: ['📱', '💻', '🖥️', '⌨️', '🖱️', '🖨️'], changedIndex: 1, newEmoji: '📟' },
    ],
  },
  // Set 13
  {
    rounds: [
      { grid: ['🥞', '🍳', '🥐', '🥯', '🧇', '🥖'], changedIndex: 4, newEmoji: '🥨' },
      { grid: ['🐝', '🐞', '🦋', '🐜', '🐛', '🦗'], changedIndex: 0, newEmoji: '🪲' },
      { grid: ['🎩', '👒', '🧢', '⛑️', '👑', '🎓'], changedIndex: 2, newEmoji: '🪖' },
    ],
  },
  // Set 14
  {
    rounds: [
      { grid: ['🍕', '🍝', '🥘', '🍜', '🍲', '🥗'], changedIndex: 3, newEmoji: '🫕' },
      { grid: ['🏠', '🏡', '🏘️', '🏰', '⛪', '🕌'], changedIndex: 5, newEmoji: '🏯' },
      { grid: ['⚽', '🏀', '🏈', '⚾', '🏐', '🎱'], changedIndex: 0, newEmoji: '🥎' },
    ],
  },
  // Set 15
  {
    rounds: [
      { grid: ['🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐇'], changedIndex: 4, newEmoji: '🐈‍⬛' },
      { grid: ['🍎', '🍌', '🍇', '🍓', '🫐', '🍑'], changedIndex: 1, newEmoji: '🥝' },
      { grid: ['🛋️', '🪑', '🛏️', '🪞', '🖼️', '💡'], changedIndex: 3, newEmoji: '🪟' },
    ],
  },
  // Set 16
  {
    rounds: [
      { grid: ['🎨', '🖌️', '🖍️', '✏️', '📝', '🖊️'], changedIndex: 2, newEmoji: '🪈' },
      { grid: ['🥕', '🧅', '🥔', '🫘', '🌶️', '🧄'], changedIndex: 0, newEmoji: '🥜' },
      { grid: ['🚗', '🏍️', '🚲', '🛴', '🚌', '🚕'], changedIndex: 5, newEmoji: '🚎' },
    ],
  },
  // Set 17
  {
    rounds: [
      { grid: ['🐦', '🦅', '🦉', '🐧', '🦜', '🦢'], changedIndex: 3, newEmoji: '🕊️' },
      { grid: ['☕', '🍵', '🥤', '🧋', '🍹', '🥛'], changedIndex: 4, newEmoji: '🍸' },
      { grid: ['⏰', '⌚', '🕰️', '⏱️', '⏲️', '🕐'], changedIndex: 1, newEmoji: '📱' },
    ],
  },
  // Set 18
  {
    rounds: [
      { grid: ['🧸', '🪀', '🎮', '🪁', '🧩', '🎲'], changedIndex: 0, newEmoji: '🪆' },
      { grid: ['🌸', '🌺', '🌼', '🌻', '🌷', '🌹'], changedIndex: 5, newEmoji: '💮' },
      { grid: ['🔨', '🪛', '🔧', '🪚', '🔩', '🪜'], changedIndex: 2, newEmoji: '⛏️' },
    ],
  },
  // Set 19
  {
    rounds: [
      { grid: ['🍞', '🥖', '🥯', '🥐', '🍰', '🧁'], changedIndex: 4, newEmoji: '🥮' },
      { grid: ['🐍', '🦎', '🐊', '🐢', '🦕', '🦖'], changedIndex: 1, newEmoji: '🐉' },
      { grid: ['💄', '💅', '👠', '👗', '👜', '🕶️'], changedIndex: 3, newEmoji: '👙' },
    ],
  },
  // Set 20
  {
    rounds: [
      { grid: ['🚢', '⛵', '🛶', '🚤', '🛥️', '🚁'], changedIndex: 5, newEmoji: '🛩️' },
      { grid: ['🐄', '🐖', '🐑', '🐐', '🐔', '🦃'], changedIndex: 0, newEmoji: '🦙' },
      { grid: ['🏀', '⚽', '🎾', '🏓', '🏸', '🥊'], changedIndex: 2, newEmoji: '🏒' },
    ],
  },
];
