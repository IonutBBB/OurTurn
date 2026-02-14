export interface NumberPuzzleQuestion {
  question: string; // The question text
  options: string[]; // 4 answer options
  correctIndex: number; // index of correct answer (0-3)
}

export interface NumberPuzzlesContent {
  questions: NumberPuzzleQuestion[];
}

export const NUMBER_PUZZLES_CONTENT: NumberPuzzlesContent[] = [
  // Set 1
  {
    questions: [
      { question: '2 + 3 = ?', options: ['4', '5', '6', '7'], correctIndex: 1 },
      { question: 'How many legs does a cat have?', options: ['2', '3', '4', '6'], correctIndex: 2 },
      { question: 'What comes next: 1, 2, 3, ?', options: ['3', '4', '5', '6'], correctIndex: 1 },
      { question: '5 - 2 = ?', options: ['1', '2', '3', '4'], correctIndex: 2 },
      { question: 'How many fingers on one hand?', options: ['3', '4', '5', '6'], correctIndex: 2 },
    ],
  },
  // Set 2
  {
    questions: [
      { question: '1 + 1 = ?', options: ['1', '2', '3', '4'], correctIndex: 1 },
      { question: 'How many wheels on a bicycle?', options: ['1', '2', '3', '4'], correctIndex: 1 },
      { question: 'What comes next: 2, 4, 6, ?', options: ['7', '8', '9', '10'], correctIndex: 1 },
      { question: '4 + 1 = ?', options: ['3', '4', '5', '6'], correctIndex: 2 },
      { question: 'How many days in a week?', options: ['5', '6', '7', '8'], correctIndex: 2 },
    ],
  },
  // Set 3
  {
    questions: [
      { question: '3 + 2 = ?', options: ['4', '5', '6', '7'], correctIndex: 1 },
      { question: 'How many eyes do you have?', options: ['1', '2', '3', '4'], correctIndex: 1 },
      { question: 'What comes next: 5, 10, 15, ?', options: ['16', '18', '20', '25'], correctIndex: 2 },
      { question: '6 - 3 = ?', options: ['2', '3', '4', '5'], correctIndex: 1 },
      { question: 'How many months in a year?', options: ['10', '11', '12', '13'], correctIndex: 2 },
    ],
  },
  // Set 4
  {
    questions: [
      { question: '4 + 3 = ?', options: ['5', '6', '7', '8'], correctIndex: 2 },
      { question: 'How many legs does a bird have?', options: ['1', '2', '3', '4'], correctIndex: 1 },
      { question: 'What comes next: 1, 3, 5, ?', options: ['6', '7', '8', '9'], correctIndex: 1 },
      { question: '8 - 4 = ?', options: ['3', '4', '5', '6'], correctIndex: 1 },
      { question: 'How many ears do you have?', options: ['1', '2', '3', '4'], correctIndex: 1 },
    ],
  },
  // Set 5
  {
    questions: [
      { question: '1 + 4 = ?', options: ['3', '4', '5', '6'], correctIndex: 2 },
      { question: 'How many corners on a square?', options: ['2', '3', '4', '5'], correctIndex: 2 },
      { question: 'What comes next: 10, 20, 30, ?', options: ['35', '40', '45', '50'], correctIndex: 1 },
      { question: '7 - 5 = ?', options: ['1', '2', '3', '4'], correctIndex: 1 },
      { question: 'How many colours in a rainbow?', options: ['5', '6', '7', '8'], correctIndex: 2 },
    ],
  },
  // Set 6
  {
    questions: [
      { question: '3 + 3 = ?', options: ['5', '6', '7', '8'], correctIndex: 1 },
      { question: 'How many sides on a triangle?', options: ['2', '3', '4', '5'], correctIndex: 1 },
      { question: 'What comes next: 2, 3, 4, ?', options: ['4', '5', '6', '7'], correctIndex: 1 },
      { question: '9 - 6 = ?', options: ['2', '3', '4', '5'], correctIndex: 1 },
      { question: 'How many toes on one foot?', options: ['3', '4', '5', '6'], correctIndex: 2 },
    ],
  },
  // Set 7
  {
    questions: [
      { question: '2 + 2 = ?', options: ['2', '3', '4', '5'], correctIndex: 2 },
      { question: 'How many wheels on a car?', options: ['2', '3', '4', '5'], correctIndex: 2 },
      { question: 'What comes next: 3, 6, 9, ?', options: ['10', '11', '12', '13'], correctIndex: 2 },
      { question: '5 - 1 = ?', options: ['3', '4', '5', '6'], correctIndex: 1 },
      { question: 'How many legs does a spider have?', options: ['4', '6', '8', '10'], correctIndex: 2 },
    ],
  },
  // Set 8
  {
    questions: [
      { question: '6 + 2 = ?', options: ['6', '7', '8', '9'], correctIndex: 2 },
      { question: 'How many seasons in a year?', options: ['2', '3', '4', '5'], correctIndex: 2 },
      { question: 'What comes next: 1, 2, 3, 4, ?', options: ['4', '5', '6', '7'], correctIndex: 1 },
      { question: '7 - 3 = ?', options: ['3', '4', '5', '6'], correctIndex: 1 },
      { question: 'How many letters in the word CAT?', options: ['2', '3', '4', '5'], correctIndex: 1 },
    ],
  },
  // Set 9
  {
    questions: [
      { question: '5 + 3 = ?', options: ['6', '7', '8', '9'], correctIndex: 2 },
      { question: 'How many wings does a bird have?', options: ['1', '2', '3', '4'], correctIndex: 1 },
      { question: 'What comes next: 4, 8, 12, ?', options: ['14', '15', '16', '18'], correctIndex: 2 },
      { question: '6 - 2 = ?', options: ['3', '4', '5', '6'], correctIndex: 1 },
      { question: 'How many hours on a clock face?', options: ['8', '10', '12', '24'], correctIndex: 2 },
    ],
  },
  // Set 10
  {
    questions: [
      { question: '1 + 3 = ?', options: ['2', '3', '4', '5'], correctIndex: 2 },
      { question: 'How many noses do you have?', options: ['1', '2', '3', '4'], correctIndex: 0 },
      { question: 'What comes next: 5, 4, 3, ?', options: ['1', '2', '3', '4'], correctIndex: 1 },
      { question: '8 - 5 = ?', options: ['2', '3', '4', '5'], correctIndex: 1 },
      { question: 'How many players on a football team?', options: ['9', '10', '11', '12'], correctIndex: 2 },
    ],
  },
  // Set 11
  {
    questions: [
      { question: '4 + 4 = ?', options: ['6', '7', '8', '9'], correctIndex: 2 },
      { question: 'How many thumbs on two hands?', options: ['1', '2', '3', '4'], correctIndex: 1 },
      { question: 'What comes next: 10, 9, 8, ?', options: ['6', '7', '8', '9'], correctIndex: 1 },
      { question: '9 - 5 = ?', options: ['3', '4', '5', '6'], correctIndex: 1 },
      { question: 'How many legs does a table have?', options: ['2', '3', '4', '5'], correctIndex: 2 },
    ],
  },
  // Set 12
  {
    questions: [
      { question: '2 + 5 = ?', options: ['5', '6', '7', '8'], correctIndex: 2 },
      { question: 'How many pennies make 5p?', options: ['3', '4', '5', '6'], correctIndex: 2 },
      { question: 'What comes next: 1, 4, 7, ?', options: ['8', '9', '10', '11'], correctIndex: 2 },
      { question: '6 - 4 = ?', options: ['1', '2', '3', '4'], correctIndex: 1 },
      { question: 'How many hands on a clock?', options: ['1', '2', '3', '4'], correctIndex: 1 },
    ],
  },
  // Set 13
  {
    questions: [
      { question: '3 + 4 = ?', options: ['5', '6', '7', '8'], correctIndex: 2 },
      { question: 'How many legs does an ant have?', options: ['4', '6', '8', '10'], correctIndex: 1 },
      { question: 'What comes next: 2, 2, 2, ?', options: ['1', '2', '3', '4'], correctIndex: 1 },
      { question: '7 - 4 = ?', options: ['2', '3', '4', '5'], correctIndex: 1 },
      { question: 'How many sides on a dice?', options: ['4', '5', '6', '8'], correctIndex: 2 },
    ],
  },
  // Set 14
  {
    questions: [
      { question: '5 + 4 = ?', options: ['7', '8', '9', '10'], correctIndex: 2 },
      { question: 'How many weeks in a month?', options: ['2', '3', '4', '5'], correctIndex: 2 },
      { question: 'What comes next: 6, 5, 4, ?', options: ['2', '3', '4', '5'], correctIndex: 1 },
      { question: '9 - 7 = ?', options: ['1', '2', '3', '4'], correctIndex: 1 },
      { question: 'How many vowels: A, E, I, O, U?', options: ['3', '4', '5', '6'], correctIndex: 2 },
    ],
  },
  // Set 15
  {
    questions: [
      { question: '1 + 6 = ?', options: ['5', '6', '7', '8'], correctIndex: 2 },
      { question: 'How many petals on a simple daisy?', options: ['3', '4', '5', '6'], correctIndex: 2 },
      { question: 'What comes next: 0, 1, 0, 1, ?', options: ['0', '1', '2', '3'], correctIndex: 0 },
      { question: '8 - 6 = ?', options: ['1', '2', '3', '4'], correctIndex: 1 },
      { question: 'How many strings on a guitar?', options: ['4', '5', '6', '8'], correctIndex: 2 },
    ],
  },
  // Set 16
  {
    questions: [
      { question: '7 + 2 = ?', options: ['7', '8', '9', '10'], correctIndex: 2 },
      { question: 'How many continents are there?', options: ['5', '6', '7', '8'], correctIndex: 2 },
      { question: 'What comes next: 1, 1, 2, 2, ?', options: ['2', '3', '4', '5'], correctIndex: 1 },
      { question: '4 - 2 = ?', options: ['1', '2', '3', '4'], correctIndex: 1 },
      { question: 'How many letters in DOG?', options: ['2', '3', '4', '5'], correctIndex: 1 },
    ],
  },
  // Set 17
  {
    questions: [
      { question: '6 + 3 = ?', options: ['7', '8', '9', '10'], correctIndex: 2 },
      { question: 'How many cents in a dollar?', options: ['10', '50', '75', '100'], correctIndex: 3 },
      { question: 'What comes next: 5, 10, 15, 20, ?', options: ['22', '24', '25', '30'], correctIndex: 2 },
      { question: '3 - 1 = ?', options: ['1', '2', '3', '4'], correctIndex: 1 },
      { question: 'How many teeth does a comb have?', options: ['Many', '5', '2', '1'], correctIndex: 0 },
    ],
  },
  // Set 18
  {
    questions: [
      { question: '2 + 6 = ?', options: ['6', '7', '8', '9'], correctIndex: 2 },
      { question: 'How many legs does a chicken have?', options: ['1', '2', '3', '4'], correctIndex: 1 },
      { question: 'What comes next: 9, 8, 7, 6, ?', options: ['4', '5', '6', '7'], correctIndex: 1 },
      { question: '5 - 3 = ?', options: ['1', '2', '3', '4'], correctIndex: 1 },
      { question: 'How many suits in a deck of cards?', options: ['2', '3', '4', '5'], correctIndex: 2 },
    ],
  },
  // Set 19
  {
    questions: [
      { question: '4 + 5 = ?', options: ['7', '8', '9', '10'], correctIndex: 2 },
      { question: 'How many humps on a camel?', options: ['1', '2', '3', '4'], correctIndex: 0 },
      { question: 'What comes next: 3, 3, 3, ?', options: ['1', '2', '3', '4'], correctIndex: 2 },
      { question: '9 - 4 = ?', options: ['4', '5', '6', '7'], correctIndex: 1 },
      { question: 'How many minutes in an hour?', options: ['30', '45', '60', '100'], correctIndex: 2 },
    ],
  },
  // Set 20
  {
    questions: [
      { question: '3 + 5 = ?', options: ['6', '7', '8', '9'], correctIndex: 2 },
      { question: 'How many tails does a dog have?', options: ['0', '1', '2', '3'], correctIndex: 1 },
      { question: 'What comes next: 1, 2, 4, ?', options: ['5', '6', '7', '8'], correctIndex: 3 },
      { question: '7 - 2 = ?', options: ['3', '4', '5', '6'], correctIndex: 2 },
      { question: 'How many seconds in a minute?', options: ['30', '45', '60', '100'], correctIndex: 2 },
    ],
  },
];
