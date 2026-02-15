export interface RhymeTimeRound {
  word: string;
  options: string[];
  correctIndex: number;
}

export interface RhymeTimeContent {
  rounds: RhymeTimeRound[];
}

export const RHYME_TIME_CONTENT: RhymeTimeContent[] = [
  // Set 1
  {
    rounds: [
      { word: 'Cat', options: ['Dog', 'Hat', 'Cup'], correctIndex: 1 },
      { word: 'Tree', options: ['Bee', 'Sun', 'Car'], correctIndex: 0 },
      { word: 'Moon', options: ['Star', 'Day', 'Spoon'], correctIndex: 2 },
      { word: 'King', options: ['Ring', 'Crown', 'Throne'], correctIndex: 0 },
    ],
  },
  // Set 2
  {
    rounds: [
      { word: 'Boat', options: ['Sea', 'Coat', 'Fish'], correctIndex: 1 },
      { word: 'Light', options: ['Lamp', 'Night', 'Dark'], correctIndex: 1 },
      { word: 'Cake', options: ['Pie', 'Eat', 'Lake'], correctIndex: 2 },
      { word: 'Bear', options: ['Pear', 'Honey', 'Cave'], correctIndex: 0 },
    ],
  },
  // Set 3
  {
    rounds: [
      { word: 'Day', options: ['Night', 'Play', 'Sun'], correctIndex: 1 },
      { word: 'Rose', options: ['Thorn', 'Nose', 'Petal'], correctIndex: 1 },
      { word: 'Star', options: ['Moon', 'Night', 'Car'], correctIndex: 2 },
      { word: 'House', options: ['Door', 'Mouse', 'Wall'], correctIndex: 1 },
    ],
  },
  // Set 4
  {
    rounds: [
      { word: 'Bed', options: ['Sleep', 'Red', 'Night'], correctIndex: 1 },
      { word: 'Rain', options: ['Cloud', 'Train', 'Wet'], correctIndex: 1 },
      { word: 'Cold', options: ['Ice', 'Warm', 'Gold'], correctIndex: 2 },
      { word: 'Fox', options: ['Box', 'Wolf', 'Den'], correctIndex: 0 },
    ],
  },
  // Set 5
  {
    rounds: [
      { word: 'Ball', options: ['Game', 'Tall', 'Kick'], correctIndex: 1 },
      { word: 'Fish', options: ['Dish', 'Sea', 'Swim'], correctIndex: 0 },
      { word: 'Book', options: ['Read', 'Page', 'Cook'], correctIndex: 2 },
      { word: 'Sun', options: ['Hot', 'Fun', 'Sky'], correctIndex: 1 },
    ],
  },
  // Set 6
  {
    rounds: [
      { word: 'Pen', options: ['Hen', 'Write', 'Ink'], correctIndex: 0 },
      { word: 'Top', options: ['High', 'Bottom', 'Shop'], correctIndex: 2 },
      { word: 'Wing', options: ['Fly', 'Sing', 'Bird'], correctIndex: 1 },
      { word: 'Drum', options: ['Beat', 'Music', 'Plum'], correctIndex: 2 },
    ],
  },
  // Set 7
  {
    rounds: [
      { word: 'Well', options: ['Bell', 'Water', 'Deep'], correctIndex: 0 },
      { word: 'Rock', options: ['Stone', 'Clock', 'Hard'], correctIndex: 1 },
      { word: 'Tail', options: ['Dog', 'Mail', 'Wag'], correctIndex: 1 },
      { word: 'Snow', options: ['Cold', 'Grow', 'Ice'], correctIndex: 1 },
    ],
  },
  // Set 8
  {
    rounds: [
      { word: 'Chair', options: ['Sit', 'Hair', 'Table'], correctIndex: 1 },
      { word: 'Log', options: ['Frog', 'Wood', 'Fire'], correctIndex: 0 },
      { word: 'Pie', options: ['Bake', 'Sky', 'Oven'], correctIndex: 1 },
      { word: 'Tent', options: ['Camp', 'Bent', 'Sleep'], correctIndex: 1 },
    ],
  },
  // Set 9
  {
    rounds: [
      { word: 'Wall', options: ['Brick', 'Fall', 'Paint'], correctIndex: 1 },
      { word: 'Seed', options: ['Feed', 'Plant', 'Grow'], correctIndex: 0 },
      { word: 'Nail', options: ['Hammer', 'Tail', 'Wood'], correctIndex: 1 },
      { word: 'Hug', options: ['Love', 'Bug', 'Warm'], correctIndex: 1 },
    ],
  },
  // Set 10
  {
    rounds: [
      { word: 'Sheep', options: ['Wool', 'Sleep', 'Farm'], correctIndex: 1 },
      { word: 'Jar', options: ['Lid', 'Jam', 'Star'], correctIndex: 2 },
      { word: 'Corn', options: ['Field', 'Horn', 'Farm'], correctIndex: 1 },
      { word: 'Nest', options: ['Best', 'Bird', 'Egg'], correctIndex: 0 },
    ],
  },
  // Set 11
  {
    rounds: [
      { word: 'Sand', options: ['Beach', 'Hand', 'Wave'], correctIndex: 1 },
      { word: 'Lake', options: ['Water', 'Bake', 'Swim'], correctIndex: 1 },
      { word: 'Gift', options: ['Lift', 'Wrap', 'Give'], correctIndex: 0 },
      { word: 'Tray', options: ['Dish', 'Plate', 'Hay'], correctIndex: 2 },
    ],
  },
  // Set 12
  {
    rounds: [
      { word: 'Cup', options: ['Drink', 'Pup', 'Tea'], correctIndex: 1 },
      { word: 'Rope', options: ['Tie', 'Hope', 'Pull'], correctIndex: 1 },
      { word: 'Leaf', options: ['Tree', 'Beef', 'Green'], correctIndex: 1 },
      { word: 'Ship', options: ['Tip', 'Sea', 'Sail'], correctIndex: 0 },
    ],
  },
  // Set 13
  {
    rounds: [
      { word: 'Door', options: ['Floor', 'Open', 'Key'], correctIndex: 0 },
      { word: 'Jam', options: ['Bread', 'Ham', 'Sweet'], correctIndex: 1 },
      { word: 'Cave', options: ['Dark', 'Brave', 'Deep'], correctIndex: 1 },
      { word: 'Kite', options: ['Wind', 'Bite', 'Fly'], correctIndex: 1 },
    ],
  },
  // Set 14
  {
    rounds: [
      { word: 'Gate', options: ['Fence', 'Late', 'Open'], correctIndex: 1 },
      { word: 'Nut', options: ['Shell', 'Hut', 'Tree'], correctIndex: 1 },
      { word: 'Jug', options: ['Mug', 'Pour', 'Milk'], correctIndex: 0 },
      { word: 'Lime', options: ['Green', 'Time', 'Sour'], correctIndex: 1 },
    ],
  },
  // Set 15
  {
    rounds: [
      { word: 'Path', options: ['Walk', 'Bath', 'Road'], correctIndex: 1 },
      { word: 'Vine', options: ['Grape', 'Fine', 'Climb'], correctIndex: 1 },
      { word: 'Peak', options: ['Mountain', 'Beak', 'High'], correctIndex: 1 },
      { word: 'Moose', options: ['Goose', 'Deer', 'Elk'], correctIndex: 0 },
    ],
  },
  // Set 16
  {
    rounds: [
      { word: 'Stamp', options: ['Letter', 'Camp', 'Post'], correctIndex: 1 },
      { word: 'Bread', options: ['Butter', 'Shed', 'Loaf'], correctIndex: 1 },
      { word: 'Whale', options: ['Ocean', 'Tale', 'Fish'], correctIndex: 1 },
      { word: 'Corn', options: ['Born', 'Field', 'Cob'], correctIndex: 0 },
    ],
  },
  // Set 17
  {
    rounds: [
      { word: 'Flame', options: ['Game', 'Fire', 'Hot'], correctIndex: 0 },
      { word: 'Beach', options: ['Sand', 'Peach', 'Wave'], correctIndex: 1 },
      { word: 'Sock', options: ['Shoe', 'Rock', 'Foot'], correctIndex: 1 },
      { word: 'Crown', options: ['King', 'Brown', 'Gold'], correctIndex: 1 },
    ],
  },
  // Set 18
  {
    rounds: [
      { word: 'Plum', options: ['Drum', 'Fruit', 'Tree'], correctIndex: 0 },
      { word: 'Dove', options: ['Bird', 'Peace', 'Love'], correctIndex: 2 },
      { word: 'Tank', options: ['Water', 'Bank', 'Big'], correctIndex: 1 },
      { word: 'Lace', options: ['Shoe', 'Face', 'Tie'], correctIndex: 1 },
    ],
  },
  // Set 19
  {
    rounds: [
      { word: 'Foam', options: ['Bubble', 'Home', 'Bath'], correctIndex: 1 },
      { word: 'Plate', options: ['Gate', 'Food', 'Dish'], correctIndex: 0 },
      { word: 'Bark', options: ['Dog', 'Dark', 'Tree'], correctIndex: 1 },
      { word: 'Spring', options: ['Swing', 'Season', 'Water'], correctIndex: 0 },
    ],
  },
  // Set 20
  {
    rounds: [
      { word: 'Hill', options: ['Grill', 'Steep', 'Top'], correctIndex: 0 },
      { word: 'Frog', options: ['Pond', 'Log', 'Green'], correctIndex: 1 },
      { word: 'Rake', options: ['Garden', 'Shake', 'Leaf'], correctIndex: 1 },
      { word: 'Mist', options: ['Fist', 'Fog', 'Rain'], correctIndex: 0 },
    ],
  },
];
