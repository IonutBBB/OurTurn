export interface PatternRound {
  sequence: string[]; // emojis shown e.g. ["🔴","🔵","🔴","🔵","?"]
  options: string[]; // 3 choices
  correctIndex: number; // index of correct answer (0-2)
}

export interface PatternSequenceContent {
  rounds: PatternRound[];
}

export const PATTERN_SEQUENCE_CONTENT: PatternSequenceContent[] = [
  // Set 1 — Coloured circles (ABAB)
  {
    rounds: [
      { sequence: ['🔴', '🔵', '🔴', '🔵', '?'], options: ['🔴', '🟢', '🔵'], correctIndex: 0 },
      { sequence: ['🟢', '🟡', '🟢', '🟡', '?'], options: ['🟡', '🔴', '🟢'], correctIndex: 2 },
      { sequence: ['🟣', '🟠', '🟣', '🟠', '?'], options: ['🟠', '🟣', '🔵'], correctIndex: 1 },
      { sequence: ['🔵', '🔴', '🔵', '🔴', '?'], options: ['🟡', '🔵', '🔴'], correctIndex: 1 },
    ],
  },
  // Set 2 — Fruits (ABAB)
  {
    rounds: [
      { sequence: ['🍎', '🍊', '🍎', '🍊', '?'], options: ['🍋', '🍎', '🍊'], correctIndex: 1 },
      { sequence: ['🍇', '🍋', '🍇', '🍋', '?'], options: ['🍇', '🍎', '🍋'], correctIndex: 0 },
      { sequence: ['🍊', '🍇', '🍊', '🍇', '?'], options: ['🍇', '🍊', '🍋'], correctIndex: 1 },
      { sequence: ['🍋', '🍎', '🍋', '🍎', '?'], options: ['🍊', '🍋', '🍎'], correctIndex: 1 },
    ],
  },
  // Set 3 — Animals (AABB)
  {
    rounds: [
      { sequence: ['🐱', '🐱', '🐶', '🐶', '?'], options: ['🐶', '🐱', '🐰'], correctIndex: 1 },
      { sequence: ['🐰', '🐰', '🐸', '🐸', '?'], options: ['🐸', '🐰', '🐱'], correctIndex: 1 },
      { sequence: ['🐶', '🐶', '🐱', '🐱', '?'], options: ['🐰', '🐶', '🐱'], correctIndex: 1 },
      { sequence: ['🐸', '🐸', '🐰', '🐰', '?'], options: ['🐱', '🐸', '🐰'], correctIndex: 1 },
    ],
  },
  // Set 4 — Shapes (ABC)
  {
    rounds: [
      { sequence: ['⭐', '🔷', '🔶', '⭐', '🔷', '?'], options: ['⭐', '🔶', '🔷'], correctIndex: 1 },
      { sequence: ['🔶', '⭐', '🔷', '🔶', '⭐', '?'], options: ['🔶', '🔷', '⭐'], correctIndex: 1 },
      { sequence: ['🔷', '🔶', '⭐', '🔷', '🔶', '?'], options: ['⭐', '🔷', '🔶'], correctIndex: 0 },
      { sequence: ['⭐', '🔶', '🔷', '⭐', '🔶', '?'], options: ['🔶', '🔷', '⭐'], correctIndex: 1 },
    ],
  },
  // Set 5 — Hearts & circles (ABAB)
  {
    rounds: [
      { sequence: ['❤️', '🔵', '❤️', '🔵', '?'], options: ['🔵', '❤️', '🟢'], correctIndex: 1 },
      { sequence: ['💛', '🟣', '💛', '🟣', '?'], options: ['🟣', '💛', '🔴'], correctIndex: 1 },
      { sequence: ['💚', '🟠', '💚', '🟠', '?'], options: ['🟠', '💚', '💛'], correctIndex: 1 },
      { sequence: ['💜', '🟡', '💜', '🟡', '?'], options: ['💜', '🟠', '🟡'], correctIndex: 0 },
    ],
  },
  // Set 6 — Weather (AABB)
  {
    rounds: [
      { sequence: ['☀️', '☀️', '🌧️', '🌧️', '?'], options: ['🌧️', '☀️', '⛈️'], correctIndex: 1 },
      { sequence: ['🌈', '🌈', '❄️', '❄️', '?'], options: ['☀️', '🌈', '❄️'], correctIndex: 1 },
      { sequence: ['⛅', '⛅', '🌙', '🌙', '?'], options: ['🌙', '⛅', '☀️'], correctIndex: 1 },
      { sequence: ['❄️', '❄️', '☀️', '☀️', '?'], options: ['☀️', '❄️', '🌈'], correctIndex: 1 },
    ],
  },
  // Set 7 — Flowers (ABC)
  {
    rounds: [
      { sequence: ['🌹', '🌻', '🌷', '🌹', '🌻', '?'], options: ['🌹', '🌷', '🌻'], correctIndex: 1 },
      { sequence: ['🌻', '🌷', '🌹', '🌻', '🌷', '?'], options: ['🌹', '🌻', '🌷'], correctIndex: 0 },
      { sequence: ['🌷', '🌹', '🌻', '🌷', '🌹', '?'], options: ['🌷', '🌻', '🌹'], correctIndex: 1 },
      { sequence: ['🌹', '🌷', '🌻', '🌹', '🌷', '?'], options: ['🌻', '🌹', '🌷'], correctIndex: 0 },
    ],
  },
  // Set 8 — Food (ABAB)
  {
    rounds: [
      { sequence: ['🍕', '🍔', '🍕', '🍔', '?'], options: ['🍔', '🍕', '🌮'], correctIndex: 1 },
      { sequence: ['🌮', '🍩', '🌮', '🍩', '?'], options: ['🍩', '🌮', '🍕'], correctIndex: 1 },
      { sequence: ['🍰', '🧁', '🍰', '🧁', '?'], options: ['🧁', '🍰', '🍩'], correctIndex: 1 },
      { sequence: ['🍩', '🍪', '🍩', '🍪', '?'], options: ['🍪', '🍩', '🍰'], correctIndex: 1 },
    ],
  },
  // Set 9 — Transport (AABB)
  {
    rounds: [
      { sequence: ['🚗', '🚗', '🚌', '🚌', '?'], options: ['🚌', '🚗', '🚂'], correctIndex: 1 },
      { sequence: ['✈️', '✈️', '🚂', '🚂', '?'], options: ['🚂', '✈️', '🚗'], correctIndex: 1 },
      { sequence: ['🚌', '🚌', '✈️', '✈️', '?'], options: ['🚗', '🚌', '✈️'], correctIndex: 1 },
      { sequence: ['🚂', '🚂', '🚗', '🚗', '?'], options: ['✈️', '🚂', '🚗'], correctIndex: 1 },
    ],
  },
  // Set 10 — Music (ABC)
  {
    rounds: [
      { sequence: ['🎵', '🎸', '🥁', '🎵', '🎸', '?'], options: ['🎵', '🥁', '🎸'], correctIndex: 1 },
      { sequence: ['🎸', '🥁', '🎵', '🎸', '🥁', '?'], options: ['🎵', '🎸', '🥁'], correctIndex: 0 },
      { sequence: ['🥁', '🎵', '🎸', '🥁', '🎵', '?'], options: ['🎸', '🥁', '🎵'], correctIndex: 0 },
      { sequence: ['🎵', '🥁', '🎸', '🎵', '🥁', '?'], options: ['🎵', '🎸', '🥁'], correctIndex: 1 },
    ],
  },
  // Set 11 — Gems & shapes (ABAB)
  {
    rounds: [
      { sequence: ['💎', '🔶', '💎', '🔶', '?'], options: ['🔷', '💎', '🔶'], correctIndex: 1 },
      { sequence: ['🔷', '💎', '🔷', '💎', '?'], options: ['💎', '🔷', '🔶'], correctIndex: 1 },
      { sequence: ['🔶', '🔷', '🔶', '🔷', '?'], options: ['🔷', '🔶', '💎'], correctIndex: 1 },
      { sequence: ['💎', '🔷', '💎', '🔷', '?'], options: ['🔶', '💎', '🔷'], correctIndex: 1 },
    ],
  },
  // Set 12 — Sports (AABB)
  {
    rounds: [
      { sequence: ['⚽', '⚽', '🏀', '🏀', '?'], options: ['🏀', '⚽', '🎾'], correctIndex: 1 },
      { sequence: ['🎾', '🎾', '⚽', '⚽', '?'], options: ['⚽', '🎾', '🏀'], correctIndex: 1 },
      { sequence: ['🏀', '🏀', '🎾', '🎾', '?'], options: ['🎾', '🏀', '⚽'], correctIndex: 1 },
      { sequence: ['⚽', '⚽', '🎾', '🎾', '?'], options: ['🏀', '⚽', '🎾'], correctIndex: 1 },
    ],
  },
  // Set 13 — Sea creatures (ABC)
  {
    rounds: [
      { sequence: ['🐙', '🐠', '🐚', '🐙', '🐠', '?'], options: ['🐙', '🐚', '🐠'], correctIndex: 1 },
      { sequence: ['🐠', '🐚', '🐙', '🐠', '🐚', '?'], options: ['🐙', '🐠', '🐚'], correctIndex: 0 },
      { sequence: ['🐚', '🐙', '🐠', '🐚', '🐙', '?'], options: ['🐠', '🐚', '🐙'], correctIndex: 0 },
      { sequence: ['🐙', '🐚', '🐠', '🐙', '🐚', '?'], options: ['🐙', '🐠', '🐚'], correctIndex: 1 },
    ],
  },
  // Set 14 — Insects (ABAB)
  {
    rounds: [
      { sequence: ['🦋', '🐝', '🦋', '🐝', '?'], options: ['🐝', '🦋', '🐛'], correctIndex: 1 },
      { sequence: ['🐞', '🦋', '🐞', '🦋', '?'], options: ['🦋', '🐞', '🐝'], correctIndex: 1 },
      { sequence: ['🐝', '🐞', '🐝', '🐞', '?'], options: ['🐞', '🐝', '🦋'], correctIndex: 1 },
      { sequence: ['🦋', '🐞', '🦋', '🐞', '?'], options: ['🐝', '🦋', '🐞'], correctIndex: 1 },
    ],
  },
  // Set 15 — Hands & gestures (AABB)
  {
    rounds: [
      { sequence: ['👋', '👋', '👏', '👏', '?'], options: ['👏', '👋', '✌️'], correctIndex: 1 },
      { sequence: ['✌️', '✌️', '👍', '👍', '?'], options: ['👍', '✌️', '👋'], correctIndex: 1 },
      { sequence: ['👍', '👍', '👋', '👋', '?'], options: ['👋', '👍', '✌️'], correctIndex: 1 },
      { sequence: ['👏', '👏', '✌️', '✌️', '?'], options: ['✌️', '👏', '👍'], correctIndex: 1 },
    ],
  },
  // Set 16 — Trees & nature (ABCABC)
  {
    rounds: [
      { sequence: ['🌲', '🌴', '🌳', '🌲', '🌴', '?'], options: ['🌲', '🌳', '🌴'], correctIndex: 1 },
      { sequence: ['🌴', '🌳', '🌲', '🌴', '🌳', '?'], options: ['🌲', '🌴', '🌳'], correctIndex: 0 },
      { sequence: ['🌳', '🌲', '🌴', '🌳', '🌲', '?'], options: ['🌴', '🌳', '🌲'], correctIndex: 0 },
      { sequence: ['🌲', '🌳', '🌴', '🌲', '🌳', '?'], options: ['🌲', '🌴', '🌳'], correctIndex: 1 },
    ],
  },
  // Set 17 — Faces (ABAB)
  {
    rounds: [
      { sequence: ['😊', '😄', '😊', '😄', '?'], options: ['😄', '😊', '😃'], correctIndex: 1 },
      { sequence: ['🥰', '😎', '🥰', '😎', '?'], options: ['😎', '🥰', '😊'], correctIndex: 1 },
      { sequence: ['😃', '🥰', '😃', '🥰', '?'], options: ['🥰', '😃', '😄'], correctIndex: 1 },
      { sequence: ['😎', '😊', '😎', '😊', '?'], options: ['😃', '😎', '😊'], correctIndex: 1 },
    ],
  },
  // Set 18 — Planets & space (AABB)
  {
    rounds: [
      { sequence: ['🌍', '🌍', '🌙', '🌙', '?'], options: ['🌙', '🌍', '⭐'], correctIndex: 1 },
      { sequence: ['⭐', '⭐', '🌍', '🌍', '?'], options: ['🌍', '⭐', '🌙'], correctIndex: 1 },
      { sequence: ['🌙', '🌙', '⭐', '⭐', '?'], options: ['⭐', '🌙', '🌍'], correctIndex: 1 },
      { sequence: ['🌍', '🌍', '⭐', '⭐', '?'], options: ['🌙', '🌍', '⭐'], correctIndex: 1 },
    ],
  },
  // Set 19 — Fruit mix (ABCABC)
  {
    rounds: [
      { sequence: ['🍓', '🍌', '🫐', '🍓', '🍌', '?'], options: ['🍓', '🫐', '🍌'], correctIndex: 1 },
      { sequence: ['🍌', '🫐', '🍓', '🍌', '🫐', '?'], options: ['🍓', '🍌', '🫐'], correctIndex: 0 },
      { sequence: ['🫐', '🍓', '🍌', '🫐', '🍓', '?'], options: ['🍌', '🫐', '🍓'], correctIndex: 0 },
      { sequence: ['🍓', '🫐', '🍌', '🍓', '🫐', '?'], options: ['🍓', '🍌', '🫐'], correctIndex: 1 },
    ],
  },
  // Set 20 — Mixed colourful (ABC)
  {
    rounds: [
      { sequence: ['🔴', '🟡', '🔵', '🔴', '🟡', '?'], options: ['🔴', '🔵', '🟡'], correctIndex: 1 },
      { sequence: ['🟢', '🟣', '🟠', '🟢', '🟣', '?'], options: ['🟠', '🟢', '🟣'], correctIndex: 0 },
      { sequence: ['🟡', '🔴', '🟢', '🟡', '🔴', '?'], options: ['🟡', '🟢', '🔴'], correctIndex: 1 },
      { sequence: ['🟣', '🟠', '🔵', '🟣', '🟠', '?'], options: ['🟣', '🔵', '🟠'], correctIndex: 1 },
    ],
  },
];
