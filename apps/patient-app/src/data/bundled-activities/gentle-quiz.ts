export interface GentleQuizContent {
  question: string;
  questionKey: string;
  correctAnswer: string;
  correctAnswerKey: string;
  incorrectAnswers: string[];
  incorrectAnswerKeys: string[];
  allAnswerKeys: string[];
}

export const GENTLE_QUIZ_CONTENT: GentleQuizContent[] = [
  {
    question: 'What colour is a ripe banana?', questionKey: 'patientApp.stim.gentleQuiz.q.banana',
    correctAnswer: 'Yellow', correctAnswerKey: 'patientApp.stim.gentleQuiz.a.yellow',
    incorrectAnswers: ['Blue', 'Red', 'Green'],
    incorrectAnswerKeys: ['patientApp.stim.gentleQuiz.a.blue', 'patientApp.stim.gentleQuiz.a.red', 'patientApp.stim.gentleQuiz.a.green'],
    allAnswerKeys: ['patientApp.stim.gentleQuiz.a.yellow', 'patientApp.stim.gentleQuiz.a.blue', 'patientApp.stim.gentleQuiz.a.red', 'patientApp.stim.gentleQuiz.a.green'],
  },
  {
    question: 'Which animal says "moo"?', questionKey: 'patientApp.stim.gentleQuiz.q.moo',
    correctAnswer: 'Cow', correctAnswerKey: 'patientApp.stim.gentleQuiz.a.cow',
    incorrectAnswers: ['Dog', 'Cat', 'Bird'],
    incorrectAnswerKeys: ['patientApp.stim.gentleQuiz.a.dog', 'patientApp.stim.gentleQuiz.a.cat', 'patientApp.stim.gentleQuiz.a.bird'],
    allAnswerKeys: ['patientApp.stim.gentleQuiz.a.cow', 'patientApp.stim.gentleQuiz.a.dog', 'patientApp.stim.gentleQuiz.a.cat', 'patientApp.stim.gentleQuiz.a.bird'],
  },
  {
    question: 'What do bees make?', questionKey: 'patientApp.stim.gentleQuiz.q.bees',
    correctAnswer: 'Honey', correctAnswerKey: 'patientApp.stim.gentleQuiz.a.honey',
    incorrectAnswers: ['Milk', 'Sugar', 'Butter'],
    incorrectAnswerKeys: ['patientApp.stim.gentleQuiz.a.milk', 'patientApp.stim.gentleQuiz.a.sugar', 'patientApp.stim.gentleQuiz.a.butter'],
    allAnswerKeys: ['patientApp.stim.gentleQuiz.a.honey', 'patientApp.stim.gentleQuiz.a.milk', 'patientApp.stim.gentleQuiz.a.sugar', 'patientApp.stim.gentleQuiz.a.butter'],
  },
  {
    question: 'How many legs does a dog have?', questionKey: 'patientApp.stim.gentleQuiz.q.dogLegs',
    correctAnswer: 'Four', correctAnswerKey: 'patientApp.stim.gentleQuiz.a.four',
    incorrectAnswers: ['Two', 'Six', 'Eight'],
    incorrectAnswerKeys: ['patientApp.stim.gentleQuiz.a.two', 'patientApp.stim.gentleQuiz.a.six', 'patientApp.stim.gentleQuiz.a.eight'],
    allAnswerKeys: ['patientApp.stim.gentleQuiz.a.four', 'patientApp.stim.gentleQuiz.a.two', 'patientApp.stim.gentleQuiz.a.six', 'patientApp.stim.gentleQuiz.a.eight'],
  },
  {
    question: 'Which season comes after winter?', questionKey: 'patientApp.stim.gentleQuiz.q.afterWinter',
    correctAnswer: 'Spring', correctAnswerKey: 'patientApp.stim.gentleQuiz.a.spring',
    incorrectAnswers: ['Summer', 'Autumn', 'Winter'],
    incorrectAnswerKeys: ['patientApp.stim.gentleQuiz.a.summer', 'patientApp.stim.gentleQuiz.a.autumn', 'patientApp.stim.gentleQuiz.a.winter'],
    allAnswerKeys: ['patientApp.stim.gentleQuiz.a.spring', 'patientApp.stim.gentleQuiz.a.summer', 'patientApp.stim.gentleQuiz.a.autumn', 'patientApp.stim.gentleQuiz.a.winter'],
  },
  {
    question: 'What is the capital of France?', questionKey: 'patientApp.stim.gentleQuiz.q.capitalFrance',
    correctAnswer: 'Paris', correctAnswerKey: 'patientApp.stim.gentleQuiz.a.paris',
    incorrectAnswers: ['London', 'Rome', 'Berlin'],
    incorrectAnswerKeys: ['patientApp.stim.gentleQuiz.a.london', 'patientApp.stim.gentleQuiz.a.rome', 'patientApp.stim.gentleQuiz.a.berlin'],
    allAnswerKeys: ['patientApp.stim.gentleQuiz.a.paris', 'patientApp.stim.gentleQuiz.a.london', 'patientApp.stim.gentleQuiz.a.rome', 'patientApp.stim.gentleQuiz.a.berlin'],
  },
  {
    question: 'What do you use an umbrella for?', questionKey: 'patientApp.stim.gentleQuiz.q.umbrella',
    correctAnswer: 'Staying dry in the rain', correctAnswerKey: 'patientApp.stim.gentleQuiz.a.stayingDry',
    incorrectAnswers: ['Cooking', 'Writing', 'Driving'],
    incorrectAnswerKeys: ['patientApp.stim.gentleQuiz.a.cooking', 'patientApp.stim.gentleQuiz.a.writing', 'patientApp.stim.gentleQuiz.a.driving'],
    allAnswerKeys: ['patientApp.stim.gentleQuiz.a.stayingDry', 'patientApp.stim.gentleQuiz.a.cooking', 'patientApp.stim.gentleQuiz.a.writing', 'patientApp.stim.gentleQuiz.a.driving'],
  },
  {
    question: 'Which is the largest ocean?', questionKey: 'patientApp.stim.gentleQuiz.q.largestOcean',
    correctAnswer: 'Pacific Ocean', correctAnswerKey: 'patientApp.stim.gentleQuiz.a.pacific',
    incorrectAnswers: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean'],
    incorrectAnswerKeys: ['patientApp.stim.gentleQuiz.a.atlantic', 'patientApp.stim.gentleQuiz.a.indian', 'patientApp.stim.gentleQuiz.a.arctic'],
    allAnswerKeys: ['patientApp.stim.gentleQuiz.a.pacific', 'patientApp.stim.gentleQuiz.a.atlantic', 'patientApp.stim.gentleQuiz.a.indian', 'patientApp.stim.gentleQuiz.a.arctic'],
  },
  {
    question: 'What colour is the sky on a clear day?', questionKey: 'patientApp.stim.gentleQuiz.q.sky',
    correctAnswer: 'Blue', correctAnswerKey: 'patientApp.stim.gentleQuiz.a.blue',
    incorrectAnswers: ['Green', 'Red', 'Yellow'],
    incorrectAnswerKeys: ['patientApp.stim.gentleQuiz.a.green', 'patientApp.stim.gentleQuiz.a.red', 'patientApp.stim.gentleQuiz.a.yellow'],
    allAnswerKeys: ['patientApp.stim.gentleQuiz.a.blue', 'patientApp.stim.gentleQuiz.a.green', 'patientApp.stim.gentleQuiz.a.red', 'patientApp.stim.gentleQuiz.a.yellow'],
  },
  {
    question: 'How many days are in a week?', questionKey: 'patientApp.stim.gentleQuiz.q.daysWeek',
    correctAnswer: 'Seven', correctAnswerKey: 'patientApp.stim.gentleQuiz.a.seven',
    incorrectAnswers: ['Five', 'Six', 'Eight'],
    incorrectAnswerKeys: ['patientApp.stim.gentleQuiz.a.five', 'patientApp.stim.gentleQuiz.a.six', 'patientApp.stim.gentleQuiz.a.eight'],
    allAnswerKeys: ['patientApp.stim.gentleQuiz.a.seven', 'patientApp.stim.gentleQuiz.a.five', 'patientApp.stim.gentleQuiz.a.six', 'patientApp.stim.gentleQuiz.a.eight'],
  },
];
