export interface ChoiceOption {
  emoji: string;
  labelKey: string;
}

export interface WhatWouldYouChooseContent {
  optionA: ChoiceOption;
  optionB: ChoiceOption;
  followUpKey: string;
}

export const WHAT_WOULD_YOU_CHOOSE_CONTENT: WhatWouldYouChooseContent[] = [
  // 1
  {
    optionA: { emoji: '\u2615', labelKey: 'patientApp.stim.whatWouldYouChoose.items.tea' },
    optionB: { emoji: '\u2615', labelKey: 'patientApp.stim.whatWouldYouChoose.items.coffee' },
    followUpKey: 'patientApp.stim.whatWouldYouChoose.followUps.hotDrink',
  },
  // 2
  {
    optionA: { emoji: '\uD83C\uDFD6\uFE0F', labelKey: 'patientApp.stim.whatWouldYouChoose.items.beach' },
    optionB: { emoji: '\u26F0\uFE0F', labelKey: 'patientApp.stim.whatWouldYouChoose.items.mountains' },
    followUpKey: 'patientApp.stim.whatWouldYouChoose.followUps.holiday',
  },
  // 3
  {
    optionA: { emoji: '\uD83D\uDC31', labelKey: 'patientApp.stim.whatWouldYouChoose.items.cat' },
    optionB: { emoji: '\uD83D\uDC36', labelKey: 'patientApp.stim.whatWouldYouChoose.items.dog' },
    followUpKey: 'patientApp.stim.whatWouldYouChoose.followUps.pet',
  },
  // 4
  {
    optionA: { emoji: '\u2600\uFE0F', labelKey: 'patientApp.stim.whatWouldYouChoose.items.summer' },
    optionB: { emoji: '\u2744\uFE0F', labelKey: 'patientApp.stim.whatWouldYouChoose.items.winter' },
    followUpKey: 'patientApp.stim.whatWouldYouChoose.followUps.season',
  },
  // 5
  {
    optionA: { emoji: '\uD83C\uDF73', labelKey: 'patientApp.stim.whatWouldYouChoose.items.cooking' },
    optionB: { emoji: '\uD83C\uDF82', labelKey: 'patientApp.stim.whatWouldYouChoose.items.baking' },
    followUpKey: 'patientApp.stim.whatWouldYouChoose.followUps.kitchen',
  },
  // 6
  {
    optionA: { emoji: '\uD83C\uDF05', labelKey: 'patientApp.stim.whatWouldYouChoose.items.morning' },
    optionB: { emoji: '\uD83C\uDF19', labelKey: 'patientApp.stim.whatWouldYouChoose.items.evening' },
    followUpKey: 'patientApp.stim.whatWouldYouChoose.followUps.timeOfDay',
  },
  // 7
  {
    optionA: { emoji: '\uD83D\uDCD6', labelKey: 'patientApp.stim.whatWouldYouChoose.items.book' },
    optionB: { emoji: '\uD83C\uDFAC', labelKey: 'patientApp.stim.whatWouldYouChoose.items.film' },
    followUpKey: 'patientApp.stim.whatWouldYouChoose.followUps.entertainment',
  },
  // 8
  {
    optionA: { emoji: '\uD83C\uDF3A', labelKey: 'patientApp.stim.whatWouldYouChoose.items.garden' },
    optionB: { emoji: '\uD83C\uDFD7\uFE0F', labelKey: 'patientApp.stim.whatWouldYouChoose.items.city' },
    followUpKey: 'patientApp.stim.whatWouldYouChoose.followUps.place',
  },
  // 9
  {
    optionA: { emoji: '\uD83C\uDFB5', labelKey: 'patientApp.stim.whatWouldYouChoose.items.music' },
    optionB: { emoji: '\uD83D\uDD07', labelKey: 'patientApp.stim.whatWouldYouChoose.items.silence' },
    followUpKey: 'patientApp.stim.whatWouldYouChoose.followUps.sound',
  },
  // 10
  {
    optionA: { emoji: '\uD83C\uDF70', labelKey: 'patientApp.stim.whatWouldYouChoose.items.cake' },
    optionB: { emoji: '\uD83C\uDF69', labelKey: 'patientApp.stim.whatWouldYouChoose.items.biscuit' },
    followUpKey: 'patientApp.stim.whatWouldYouChoose.followUps.treat',
  },
  // 11
  {
    optionA: { emoji: '\uD83D\uDEB6', labelKey: 'patientApp.stim.whatWouldYouChoose.items.walk' },
    optionB: { emoji: '\uD83D\uDE97', labelKey: 'patientApp.stim.whatWouldYouChoose.items.drive' },
    followUpKey: 'patientApp.stim.whatWouldYouChoose.followUps.travel',
  },
  // 12
  {
    optionA: { emoji: '\uD83C\uDF08', labelKey: 'patientApp.stim.whatWouldYouChoose.items.rain' },
    optionB: { emoji: '\u2600\uFE0F', labelKey: 'patientApp.stim.whatWouldYouChoose.items.sunshine' },
    followUpKey: 'patientApp.stim.whatWouldYouChoose.followUps.weather',
  },
  // 13
  {
    optionA: { emoji: '\uD83E\uDDC0', labelKey: 'patientApp.stim.whatWouldYouChoose.items.cheese' },
    optionB: { emoji: '\uD83C\uDF6B', labelKey: 'patientApp.stim.whatWouldYouChoose.items.chocolate' },
    followUpKey: 'patientApp.stim.whatWouldYouChoose.followUps.snack',
  },
  // 14
  {
    optionA: { emoji: '\uD83C\uDFB6', labelKey: 'patientApp.stim.whatWouldYouChoose.items.singing' },
    optionB: { emoji: '\uD83D\uDC83', labelKey: 'patientApp.stim.whatWouldYouChoose.items.dancing' },
    followUpKey: 'patientApp.stim.whatWouldYouChoose.followUps.perform',
  },
  // 15
  {
    optionA: { emoji: '\uD83C\uDF3B', labelKey: 'patientApp.stim.whatWouldYouChoose.items.spring' },
    optionB: { emoji: '\uD83C\uDF42', labelKey: 'patientApp.stim.whatWouldYouChoose.items.autumn' },
    followUpKey: 'patientApp.stim.whatWouldYouChoose.followUps.mild',
  },
  // 16
  {
    optionA: { emoji: '\uD83D\uDEF1', labelKey: 'patientApp.stim.whatWouldYouChoose.items.bath' },
    optionB: { emoji: '\uD83D\uDEBF', labelKey: 'patientApp.stim.whatWouldYouChoose.items.shower' },
    followUpKey: 'patientApp.stim.whatWouldYouChoose.followUps.relax',
  },
  // 17
  {
    optionA: { emoji: '\uD83C\uDF53', labelKey: 'patientApp.stim.whatWouldYouChoose.items.strawberry' },
    optionB: { emoji: '\uD83C\uDF4E', labelKey: 'patientApp.stim.whatWouldYouChoose.items.apple' },
    followUpKey: 'patientApp.stim.whatWouldYouChoose.followUps.fruit',
  },
  // 18
  {
    optionA: { emoji: '\uD83C\uDF54', labelKey: 'patientApp.stim.whatWouldYouChoose.items.eatOut' },
    optionB: { emoji: '\uD83C\uDF5D', labelKey: 'patientApp.stim.whatWouldYouChoose.items.eatHome' },
    followUpKey: 'patientApp.stim.whatWouldYouChoose.followUps.dinner',
  },
  // 19
  {
    optionA: { emoji: '\uD83D\uDC59', labelKey: 'patientApp.stim.whatWouldYouChoose.items.dressUp' },
    optionB: { emoji: '\uD83D\uDC55', labelKey: 'patientApp.stim.whatWouldYouChoose.items.casual' },
    followUpKey: 'patientApp.stim.whatWouldYouChoose.followUps.clothes',
  },
  // 20
  {
    optionA: { emoji: '\uD83C\uDF1E', labelKey: 'patientApp.stim.whatWouldYouChoose.items.earlyRise' },
    optionB: { emoji: '\uD83D\uDE34', labelKey: 'patientApp.stim.whatWouldYouChoose.items.lieIn' },
    followUpKey: 'patientApp.stim.whatWouldYouChoose.followUps.morningRoutine',
  },
];
