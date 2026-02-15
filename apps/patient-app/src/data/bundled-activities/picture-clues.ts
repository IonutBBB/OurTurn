export interface PictureCluesRound {
  clues: string[]; // 3 emoji clues
  options: string[];
  correctIndex: number;
}

export interface PictureCluesContent {
  rounds: PictureCluesRound[];
}

export const PICTURE_CLUES_CONTENT: PictureCluesContent[] = [
  // Set 1
  {
    rounds: [
      { clues: ['🗼', '🥐', '🇫🇷'], options: ['France', 'Germany', 'Spain'], correctIndex: 0 },
      { clues: ['🍎', '👩‍🏫', '📚'], options: ['Hospital', 'School', 'Cinema'], correctIndex: 1 },
      { clues: ['🌊', '🐚', '☀️'], options: ['Mountain', 'Beach', 'Forest'], correctIndex: 1 },
      { clues: ['🎂', '🎁', '🎈'], options: ['Wedding', 'Funeral', 'Birthday'], correctIndex: 2 },
    ],
  },
  // Set 2
  {
    rounds: [
      { clues: ['☕', '🍰', '🪑'], options: ['Library', 'Café', 'Hospital'], correctIndex: 1 },
      { clues: ['🎄', '🎅', '🎁'], options: ['Easter', 'Christmas', 'Halloween'], correctIndex: 1 },
      { clues: ['✈️', '🧳', '🌴'], options: ['Holiday', 'Work', 'School'], correctIndex: 0 },
      { clues: ['🐄', '🌾', '🚜'], options: ['City', 'Beach', 'Farm'], correctIndex: 2 },
    ],
  },
  // Set 3
  {
    rounds: [
      { clues: ['👰', '💍', '💐'], options: ['Funeral', 'Wedding', 'Birthday'], correctIndex: 1 },
      { clues: ['🏥', '👨‍⚕️', '💊'], options: ['Hospital', 'School', 'Cinema'], correctIndex: 0 },
      { clues: ['🎬', '🍿', '🎞️'], options: ['Library', 'Theatre', 'Cinema'], correctIndex: 2 },
      { clues: ['🐧', '❄️', '🧊'], options: ['Desert', 'Jungle', 'Antarctica'], correctIndex: 2 },
    ],
  },
  // Set 4
  {
    rounds: [
      { clues: ['🍕', '🍝', '🏛️'], options: ['France', 'Italy', 'Spain'], correctIndex: 1 },
      { clues: ['📖', '📚', '🤫'], options: ['Library', 'Cinema', 'Restaurant'], correctIndex: 0 },
      { clues: ['🦁', '🐘', '🦒'], options: ['Farm', 'Zoo', 'Aquarium'], correctIndex: 1 },
      { clues: ['🌙', '⭐', '🦉'], options: ['Morning', 'Afternoon', 'Night'], correctIndex: 2 },
    ],
  },
  // Set 5
  {
    rounds: [
      { clues: ['🎸', '🥁', '🎤'], options: ['Concert', 'Library', 'Hospital'], correctIndex: 0 },
      { clues: ['🐟', '🦈', '🐙'], options: ['Forest', 'Desert', 'Ocean'], correctIndex: 2 },
      { clues: ['👑', '🏰', '🗡️'], options: ['King', 'Teacher', 'Doctor'], correctIndex: 0 },
      { clues: ['🥚', '🐣', '🐔'], options: ['Dog', 'Chicken', 'Fish'], correctIndex: 1 },
    ],
  },
  // Set 6
  {
    rounds: [
      { clues: ['🌺', '🐝', '🌿'], options: ['Garden', 'Kitchen', 'Bedroom'], correctIndex: 0 },
      { clues: ['🎭', '🪑', '🎬'], options: ['Stadium', 'Theatre', 'Library'], correctIndex: 1 },
      { clues: ['🏔️', '🎿', '❄️'], options: ['Beach', 'Ski Resort', 'Desert'], correctIndex: 1 },
      { clues: ['☕', '📰', '🌅'], options: ['Lunchtime', 'Bedtime', 'Breakfast'], correctIndex: 2 },
    ],
  },
  // Set 7
  {
    rounds: [
      { clues: ['🚂', '🎫', '🛤️'], options: ['Airport', 'Train Station', 'Bus Stop'], correctIndex: 1 },
      { clues: ['🌋', '🏝️', '🌺'], options: ['Iceland', 'Hawaii', 'Antarctica'], correctIndex: 1 },
      { clues: ['🎓', '📜', '🎉'], options: ['Wedding', 'Funeral', 'Graduation'], correctIndex: 2 },
      { clues: ['🐠', '🪸', '🤿'], options: ['Mountain', 'Coral Reef', 'Forest'], correctIndex: 1 },
    ],
  },
  // Set 8
  {
    rounds: [
      { clues: ['🍳', '🥞', '🧃'], options: ['Dinner', 'Lunch', 'Breakfast'], correctIndex: 2 },
      { clues: ['🎪', '🤡', '🐘'], options: ['School', 'Circus', 'Hospital'], correctIndex: 1 },
      { clues: ['🚀', '🌙', '⭐'], options: ['Space', 'Ocean', 'Mountain'], correctIndex: 0 },
      { clues: ['🧑‍🍳', '🍳', '📋'], options: ['Classroom', 'Kitchen', 'Garden'], correctIndex: 1 },
    ],
  },
  // Set 9
  {
    rounds: [
      { clues: ['🎃', '🦇', '👻'], options: ['Christmas', 'Easter', 'Halloween'], correctIndex: 2 },
      { clues: ['🏊', '🤽', '💧'], options: ['Desert', 'Pool', 'Forest'], correctIndex: 1 },
      { clues: ['🦘', '🏏', '🪃'], options: ['Australia', 'France', 'Japan'], correctIndex: 0 },
      { clues: ['📬', '📦', '✉️'], options: ['Postman', 'Teacher', 'Doctor'], correctIndex: 0 },
    ],
  },
  // Set 10
  {
    rounds: [
      { clues: ['🗽', '🏙️', '🚕'], options: ['London', 'Paris', 'New York'], correctIndex: 2 },
      { clues: ['🌸', '🐝', '🌱'], options: ['Winter', 'Autumn', 'Spring'], correctIndex: 2 },
      { clues: ['👨‍🚒', '🚒', '🧯'], options: ['Police Station', 'Fire Station', 'Hospital'], correctIndex: 1 },
      { clues: ['🎻', '🎹', '🎶'], options: ['Orchestra', 'Kitchen', 'Garage'], correctIndex: 0 },
    ],
  },
  // Set 11
  {
    rounds: [
      { clues: ['🍫', '🏭', '🍬'], options: ['Bakery', 'Chocolate Factory', 'Butcher'], correctIndex: 1 },
      { clues: ['🦷', '🪥', '😁'], options: ['Dentist', 'Doctor', 'Hairdresser'], correctIndex: 0 },
      { clues: ['🐕', '🦴', '🏞️'], options: ['Cat Café', 'Park Walk', 'Library'], correctIndex: 1 },
      { clues: ['🌍', '🧭', '🗺️'], options: ['Cooking', 'Geography', 'Painting'], correctIndex: 1 },
    ],
  },
  // Set 12
  {
    rounds: [
      { clues: ['🎣', '🐟', '🏞️'], options: ['Fishing', 'Shopping', 'Cooking'], correctIndex: 0 },
      { clues: ['🧑‍🌾', '🌻', '🚜'], options: ['Doctor', 'Teacher', 'Farmer'], correctIndex: 2 },
      { clues: ['🌧️', '🌈', '☀️'], options: ['After the Rain', 'At Night', 'In Winter'], correctIndex: 0 },
      { clues: ['👶', '🍼', '🧸'], options: ['Teenager', 'Adult', 'Baby'], correctIndex: 2 },
    ],
  },
  // Set 13
  {
    rounds: [
      { clues: ['⚽', '🏟️', '🏆'], options: ['Concert', 'Football Match', 'Play'], correctIndex: 1 },
      { clues: ['🐑', '🧶', '🧣'], options: ['Milk', 'Eggs', 'Wool'], correctIndex: 2 },
      { clues: ['🍂', '🎃', '🍁'], options: ['Spring', 'Autumn', 'Summer'], correctIndex: 1 },
      { clues: ['🏠', '🔑', '🛋️'], options: ['Hospital', 'School', 'Home'], correctIndex: 2 },
    ],
  },
  // Set 14
  {
    rounds: [
      { clues: ['🐶', '🐱', '🐹'], options: ['Wild Animals', 'Farm Animals', 'Pets'], correctIndex: 2 },
      { clues: ['📫', '✉️', '📮'], options: ['Post Office', 'Bank', 'Library'], correctIndex: 0 },
      { clues: ['🛥️', '⚓', '🌊'], options: ['Airport', 'Harbour', 'Train Station'], correctIndex: 1 },
      { clues: ['🎨', '🖌️', '🖼️'], options: ['Painting', 'Cooking', 'Gardening'], correctIndex: 0 },
    ],
  },
  // Set 15
  {
    rounds: [
      { clues: ['🏰', '🐉', '🧙'], options: ['Fairy Tale', 'Cookbook', 'Newspaper'], correctIndex: 0 },
      { clues: ['🛫', '🧳', '🌴'], options: ['School Trip', 'Holiday Abroad', 'Day at Work'], correctIndex: 1 },
      { clues: ['🌡️', '🤒', '💊'], options: ['Feeling Ill', 'Birthday', 'Holiday'], correctIndex: 0 },
      { clues: ['🧑‍✈️', '✈️', '☁️'], options: ['Doctor', 'Pilot', 'Chef'], correctIndex: 1 },
    ],
  },
  // Set 16
  {
    rounds: [
      { clues: ['🏖️', '🏄', '🌞'], options: ['Winter Holiday', 'Beach Day', 'School Day'], correctIndex: 1 },
      { clues: ['📻', '🎵', '💃'], options: ['Dancing', 'Sleeping', 'Reading'], correctIndex: 0 },
      { clues: ['🏥', '👩‍⚕️', '🩺'], options: ['Shop', 'Hospital', 'School'], correctIndex: 1 },
      { clues: ['🌙', '😴', '🛏️'], options: ['Bedtime', 'Lunchtime', 'Playtime'], correctIndex: 0 },
    ],
  },
  // Set 17
  {
    rounds: [
      { clues: ['🍰', '🫖', '👒'], options: ['Football Match', 'Afternoon Tea', 'Gym Class'], correctIndex: 1 },
      { clues: ['🏫', '📝', '📏'], options: ['School', 'Hospital', 'Cinema'], correctIndex: 0 },
      { clues: ['🐎', '🤠', '🌵'], options: ['City', 'Mountain', 'Wild West'], correctIndex: 2 },
      { clues: ['🧊', '⛸️', '❄️'], options: ['Ice Rink', 'Beach', 'Garden'], correctIndex: 0 },
    ],
  },
  // Set 18
  {
    rounds: [
      { clues: ['🎻', '🩰', '🎭'], options: ['Sports Day', 'Ballet', 'Swimming'], correctIndex: 1 },
      { clues: ['🧱', '🪵', '🏠'], options: ['Building a House', 'Making Dinner', 'Writing a Book'], correctIndex: 0 },
      { clues: ['🚌', '🛑', '🎒'], options: ['Going to School', 'Going to Bed', 'Going Shopping'], correctIndex: 0 },
      { clues: ['🍎', '🥕', '🛒'], options: ['Library', 'Cinema', 'Supermarket'], correctIndex: 2 },
    ],
  },
  // Set 19
  {
    rounds: [
      { clues: ['🧑‍🚀', '🚀', '🌙'], options: ['Astronaut', 'Teacher', 'Chef'], correctIndex: 0 },
      { clues: ['🐝', '🍯', '🌸'], options: ['Making Honey', 'Making Bread', 'Making Tea'], correctIndex: 0 },
      { clues: ['🛶', '🏕️', '🔥'], options: ['Shopping', 'Camping', 'Cooking'], correctIndex: 1 },
      { clues: ['📺', '🛋️', '🍿'], options: ['Movie Night', 'Sports Day', 'School'], correctIndex: 0 },
    ],
  },
  // Set 20
  {
    rounds: [
      { clues: ['🐴', '🏇', '🥕'], options: ['Cat', 'Horse', 'Fish'], correctIndex: 1 },
      { clues: ['🎹', '🎵', '🎶'], options: ['Playing Piano', 'Painting', 'Cooking'], correctIndex: 0 },
      { clues: ['🧑‍🍳', '🍕', '🔥'], options: ['Pizzeria', 'Library', 'Hospital'], correctIndex: 0 },
      { clues: ['🌿', '🌸', '🦋'], options: ['Winter', 'Night', 'Garden in Summer'], correctIndex: 2 },
    ],
  },
];
