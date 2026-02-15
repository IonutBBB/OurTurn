export interface DescribeTheSceneContent {
  titleKey: string;
  scene: string;
  questions: string[];
}

export const DESCRIBE_THE_SCENE_CONTENT: DescribeTheSceneContent[] = [
  // 1 — Park
  {
    titleKey: 'patientApp.stim.describeTheScene.scenes.park',
    scene: '\uD83C\uDF33\uD83D\uDC15\uD83D\uDEB6\u200D\u2642\uFE0F\uD83E\uDD86\u26F2\uD83C\uDF38',
    questions: [
      'patientApp.stim.describeTheScene.questions.whatSee',
      'patientApp.stim.describeTheScene.questions.whatWeather',
      'patientApp.stim.describeTheScene.questions.remindYou',
    ],
  },
  // 2 — Kitchen
  {
    titleKey: 'patientApp.stim.describeTheScene.scenes.kitchen',
    scene: '\uD83C\uDF73\u2615\uD83C\uDF5E\uD83E\uDD58\uD83E\uDDC1\uD83C\uDF72',
    questions: [
      'patientApp.stim.describeTheScene.questions.whatCooking',
      'patientApp.stim.describeTheScene.questions.whatSmell',
      'patientApp.stim.describeTheScene.questions.whoKitchen',
    ],
  },
  // 3 — Seaside
  {
    titleKey: 'patientApp.stim.describeTheScene.scenes.seaside',
    scene: '\uD83C\uDFD6\uFE0F\uD83C\uDF0A\u2600\uFE0F\uD83E\uDDE4\uD83C\uDF66\uD83D\uDC1A',
    questions: [
      'patientApp.stim.describeTheScene.questions.whatSee',
      'patientApp.stim.describeTheScene.questions.whatHear',
      'patientApp.stim.describeTheScene.questions.seasideMemory',
    ],
  },
  // 4 — Market
  {
    titleKey: 'patientApp.stim.describeTheScene.scenes.market',
    scene: '\uD83C\uDF4E\uD83C\uDF3D\uD83C\uDF53\uD83E\uDDC0\uD83C\uDF3B\uD83C\uDF5E',
    questions: [
      'patientApp.stim.describeTheScene.questions.whatBuy',
      'patientApp.stim.describeTheScene.questions.whatSmell',
      'patientApp.stim.describeTheScene.questions.marketMemory',
    ],
  },
  // 5 — Garden
  {
    titleKey: 'patientApp.stim.describeTheScene.scenes.garden',
    scene: '\uD83C\uDF3A\uD83C\uDF3B\uD83E\uDD8B\uD83D\uDC1D\uD83C\uDF3F\uD83C\uDF39',
    questions: [
      'patientApp.stim.describeTheScene.questions.whatGrowing',
      'patientApp.stim.describeTheScene.questions.whatSeason',
      'patientApp.stim.describeTheScene.questions.gardenMemory',
    ],
  },
  // 6 — Classroom
  {
    titleKey: 'patientApp.stim.describeTheScene.scenes.classroom',
    scene: '\uD83C\uDFEB\u270F\uFE0F\uD83D\uDCD6\uD83D\uDCDA\uD83D\uDD14\uD83C\uDF4E',
    questions: [
      'patientApp.stim.describeTheScene.questions.whatSubject',
      'patientApp.stim.describeTheScene.questions.remindYou',
      'patientApp.stim.describeTheScene.questions.schoolMemory',
    ],
  },
  // 7 — Christmas
  {
    titleKey: 'patientApp.stim.describeTheScene.scenes.christmas',
    scene: '\uD83C\uDF84\uD83C\uDF81\u2B50\uD83E\uDDDE\uD83C\uDF6A\uD83D\uDD6F\uFE0F',
    questions: [
      'patientApp.stim.describeTheScene.questions.whatSee',
      'patientApp.stim.describeTheScene.questions.whatSmell',
      'patientApp.stim.describeTheScene.questions.christmasMemory',
    ],
  },
  // 8 — Wedding
  {
    titleKey: 'patientApp.stim.describeTheScene.scenes.wedding',
    scene: '\uD83D\uDC70\uD83E\uDD35\uD83D\uDC90\uD83C\uDF82\uD83D\uDC92\uD83C\uDFB6',
    questions: [
      'patientApp.stim.describeTheScene.questions.whatHappening',
      'patientApp.stim.describeTheScene.questions.whatWearing',
      'patientApp.stim.describeTheScene.questions.weddingMemory',
    ],
  },
  // 9 — Sunday Dinner
  {
    titleKey: 'patientApp.stim.describeTheScene.scenes.sundayDinner',
    scene: '\uD83C\uDF56\uD83E\uDD54\uD83E\uDD57\uD83C\uDF4E\uD83E\uDDC1\u2615',
    questions: [
      'patientApp.stim.describeTheScene.questions.whatEating',
      'patientApp.stim.describeTheScene.questions.whoTable',
      'patientApp.stim.describeTheScene.questions.dinnerMemory',
    ],
  },
  // 10 — Rainy Day
  {
    titleKey: 'patientApp.stim.describeTheScene.scenes.rainyDay',
    scene: '\uD83C\uDF27\uFE0F\u2614\uD83C\uDFE0\uD83D\uDD6F\uFE0F\uD83D\uDCD6\u2615',
    questions: [
      'patientApp.stim.describeTheScene.questions.whatDoing',
      'patientApp.stim.describeTheScene.questions.whatHear',
      'patientApp.stim.describeTheScene.questions.cosyMemory',
    ],
  },
  // 11 — Farm
  {
    titleKey: 'patientApp.stim.describeTheScene.scenes.farm',
    scene: '\uD83D\uDC04\uD83D\uDC14\uD83D\uDC0E\uD83C\uDF3E\uD83D\uDE9C\uD83C\uDFE1',
    questions: [
      'patientApp.stim.describeTheScene.questions.whatAnimals',
      'patientApp.stim.describeTheScene.questions.whatSmell',
      'patientApp.stim.describeTheScene.questions.farmMemory',
    ],
  },
  // 12 — Birthday Party
  {
    titleKey: 'patientApp.stim.describeTheScene.scenes.birthday',
    scene: '\uD83C\uDF88\uD83C\uDF82\uD83C\uDF81\uD83C\uDF89\uD83C\uDF6C\uD83C\uDFB5',
    questions: [
      'patientApp.stim.describeTheScene.questions.whoseBirthday',
      'patientApp.stim.describeTheScene.questions.whatEating',
      'patientApp.stim.describeTheScene.questions.partyMemory',
    ],
  },
  // 13 — Train Station
  {
    titleKey: 'patientApp.stim.describeTheScene.scenes.trainStation',
    scene: '\uD83D\uDE82\uD83D\uDCBC\uD83D\uDDDE\uFE0F\u2615\uD83D\uDD51\uD83D\uDEB6',
    questions: [
      'patientApp.stim.describeTheScene.questions.whereGoing',
      'patientApp.stim.describeTheScene.questions.whatFeeling',
      'patientApp.stim.describeTheScene.questions.journeyMemory',
    ],
  },
  // 14 — Spring Morning
  {
    titleKey: 'patientApp.stim.describeTheScene.scenes.springMorning',
    scene: '\uD83C\uDF38\uD83D\uDC23\uD83C\uDF1E\uD83D\uDC1D\uD83C\uDF3F\uD83D\uDC26',
    questions: [
      'patientApp.stim.describeTheScene.questions.whatSeason',
      'patientApp.stim.describeTheScene.questions.whatHear',
      'patientApp.stim.describeTheScene.questions.springMemory',
    ],
  },
  // 15 — Bakery
  {
    titleKey: 'patientApp.stim.describeTheScene.scenes.bakery',
    scene: '\uD83C\uDF5E\uD83E\uDD50\uD83C\uDF70\uD83C\uDF6A\uD83E\uDDC1\uD83C\uDF69',
    questions: [
      'patientApp.stim.describeTheScene.questions.whatSmell',
      'patientApp.stim.describeTheScene.questions.whatBuy',
      'patientApp.stim.describeTheScene.questions.bakeryMemory',
    ],
  },
  // 16 — Snowy Day
  {
    titleKey: 'patientApp.stim.describeTheScene.scenes.snowyDay',
    scene: '\u2744\uFE0F\u26C4\uD83E\uDDE3\uD83C\uDF1F\uD83E\uDEBB\u2615',
    questions: [
      'patientApp.stim.describeTheScene.questions.whatSee',
      'patientApp.stim.describeTheScene.questions.whatWearing',
      'patientApp.stim.describeTheScene.questions.snowMemory',
    ],
  },
  // 17 — Music Hall
  {
    titleKey: 'patientApp.stim.describeTheScene.scenes.musicHall',
    scene: '\uD83C\uDFB9\uD83C\uDFB7\uD83C\uDFBA\uD83C\uDFB6\uD83D\uDC83\uD83D\uDD7A',
    questions: [
      'patientApp.stim.describeTheScene.questions.whatMusic',
      'patientApp.stim.describeTheScene.questions.whatDoing',
      'patientApp.stim.describeTheScene.questions.musicMemory',
    ],
  },
  // 18 — Picnic
  {
    titleKey: 'patientApp.stim.describeTheScene.scenes.picnic',
    scene: '\uD83E\uDDFA\uD83C\uDF53\uD83E\uDDC3\uD83C\uDF3B\u2600\uFE0F\uD83D\uDC1C',
    questions: [
      'patientApp.stim.describeTheScene.questions.whatEating',
      'patientApp.stim.describeTheScene.questions.whoWith',
      'patientApp.stim.describeTheScene.questions.picnicMemory',
    ],
  },
  // 19 — High Street
  {
    titleKey: 'patientApp.stim.describeTheScene.scenes.highStreet',
    scene: '\uD83C\uDFEA\uD83D\uDE8C\uD83D\uDEB6\uD83C\uDF66\uD83D\uDC5C\uD83D\uDCEE',
    questions: [
      'patientApp.stim.describeTheScene.questions.whatShops',
      'patientApp.stim.describeTheScene.questions.whatBuy',
      'patientApp.stim.describeTheScene.questions.shoppingMemory',
    ],
  },
  // 20 — Autumn Walk
  {
    titleKey: 'patientApp.stim.describeTheScene.scenes.autumnWalk',
    scene: '\uD83C\uDF42\uD83C\uDF41\uD83D\uDC3F\uFE0F\uD83C\uDF30\uD83D\uDEB6\uD83C\uDF2C\uFE0F',
    questions: [
      'patientApp.stim.describeTheScene.questions.whatSee',
      'patientApp.stim.describeTheScene.questions.whatFeeling',
      'patientApp.stim.describeTheScene.questions.autumnMemory',
    ],
  },
];
