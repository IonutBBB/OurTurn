export interface RememberWhenContent {
  eraKey: string;
  items: string[];
  questions: string[];
}

export const REMEMBER_WHEN_CONTENT: RememberWhenContent[] = [
  // 1 — 1940s Home Life
  {
    eraKey: 'patientApp.stim.rememberWhen.eras.1940sHome',
    items: ['\uD83D\uDCFB', '\uD83E\uDDFA', '\uD83D\uDD6F\uFE0F', '\uD83E\uDDF9'],
    questions: [
      'patientApp.stim.rememberWhen.questions.radioListening',
      'patientApp.stim.rememberWhen.questions.washDay',
      'patientApp.stim.rememberWhen.questions.powerCuts',
    ],
  },
  // 2 — 1950s Kitchen
  {
    eraKey: 'patientApp.stim.rememberWhen.eras.1950sKitchen',
    items: ['\uD83C\uDF76\uFE0F', '\uD83E\uDD5B', '\uD83C\uDF5E', '\uD83E\uDED6'],
    questions: [
      'patientApp.stim.rememberWhen.questions.milkBottles',
      'patientApp.stim.rememberWhen.questions.bakingDay',
      'patientApp.stim.rememberWhen.questions.kitchenSmells',
    ],
  },
  // 3 — 1950s Entertainment
  {
    eraKey: 'patientApp.stim.rememberWhen.eras.1950sEntertainment',
    items: ['\uD83D\uDCFA', '\uD83C\uDFAD', '\uD83C\uDF9E\uFE0F', '\uD83C\uDFB6'],
    questions: [
      'patientApp.stim.rememberWhen.questions.firstTV',
      'patientApp.stim.rememberWhen.questions.cinema',
      'patientApp.stim.rememberWhen.questions.variety',
    ],
  },
  // 4 — 1960s Music
  {
    eraKey: 'patientApp.stim.rememberWhen.eras.1960sMusic',
    items: ['\uD83C\uDFB8', '\uD83C\uDFB5', '\uD83C\uDFA4', '\uD83D\uDCBF'],
    questions: [
      'patientApp.stim.rememberWhen.questions.vinylRecords',
      'patientApp.stim.rememberWhen.questions.firstRecord',
      'patientApp.stim.rememberWhen.questions.danceHall',
    ],
  },
  // 5 — 1960s Fashion
  {
    eraKey: 'patientApp.stim.rememberWhen.eras.1960sFashion',
    items: ['\uD83D\uDC57', '\uD83D\uDC60', '\uD83E\uDDE3', '\uD83D\uDC52'],
    questions: [
      'patientApp.stim.rememberWhen.questions.miniskirt',
      'patientApp.stim.rememberWhen.questions.bestOutfit',
      'patientApp.stim.rememberWhen.questions.fashionIcon',
    ],
  },
  // 6 — 1960s School
  {
    eraKey: 'patientApp.stim.rememberWhen.eras.1960sSchool',
    items: ['\uD83C\uDFEB', '\u270F\uFE0F', '\uD83D\uDCD6', '\uD83D\uDD14'],
    questions: [
      'patientApp.stim.rememberWhen.questions.schoolDays',
      'patientApp.stim.rememberWhen.questions.favouriteSubject',
      'patientApp.stim.rememberWhen.questions.schoolDinner',
    ],
  },
  // 7 — 1970s Home
  {
    eraKey: 'patientApp.stim.rememberWhen.eras.1970sHome',
    items: ['\uD83D\uDCDE', '\uD83D\uDCFB', '\uD83D\uDCFA', '\uD83E\uDDF6'],
    questions: [
      'patientApp.stim.rememberWhen.questions.rotaryPhone',
      'patientApp.stim.rememberWhen.questions.tvChannels',
      'patientApp.stim.rememberWhen.questions.wallpaper',
    ],
  },
  // 8 — 1970s Shopping
  {
    eraKey: 'patientApp.stim.rememberWhen.eras.1970sShopping',
    items: ['\uD83D\uDED2', '\uD83C\uDFEA', '\uD83D\uDCB7', '\uD83C\uDF6C'],
    questions: [
      'patientApp.stim.rememberWhen.questions.cornerShop',
      'patientApp.stim.rememberWhen.questions.sweetShop',
      'patientApp.stim.rememberWhen.questions.marketDay',
    ],
  },
  // 9 — 1970s Holidays
  {
    eraKey: 'patientApp.stim.rememberWhen.eras.1970sHolidays',
    items: ['\uD83C\uDFD6\uFE0F', '\u26F2', '\uD83D\uDE8C', '\uD83C\uDF66'],
    questions: [
      'patientApp.stim.rememberWhen.questions.seasideTrip',
      'patientApp.stim.rememberWhen.questions.familyHoliday',
      'patientApp.stim.rememberWhen.questions.iceCreamVan',
    ],
  },
  // 10 — 1980s Technology
  {
    eraKey: 'patientApp.stim.rememberWhen.eras.1980sTech',
    items: ['\uD83D\uDCFC', '\uD83D\uDCBB', '\uD83C\uDFAE', '\uD83D\uDCF7'],
    questions: [
      'patientApp.stim.rememberWhen.questions.vhsTapes',
      'patientApp.stim.rememberWhen.questions.firstComputer',
      'patientApp.stim.rememberWhen.questions.arcadeGames',
    ],
  },
  // 11 — 1980s Music
  {
    eraKey: 'patientApp.stim.rememberWhen.eras.1980sMusic',
    items: ['\uD83D\uDCFC', '\uD83C\uDFA4', '\uD83D\uDC68\u200D\uD83C\uDFA4', '\uD83D\uDD7A'],
    questions: [
      'patientApp.stim.rememberWhen.questions.walkman',
      'patientApp.stim.rememberWhen.questions.topOfPops',
      'patientApp.stim.rememberWhen.questions.concertMemory',
    ],
  },
  // 12 — 1950s Childhood Games
  {
    eraKey: 'patientApp.stim.rememberWhen.eras.1950sGames',
    items: ['\uD83E\uDE80', '\uD83C\uDFB2', '\uD83E\uDD4F', '\uD83E\uDE81'],
    questions: [
      'patientApp.stim.rememberWhen.questions.streetGames',
      'patientApp.stim.rememberWhen.questions.conkers',
      'patientApp.stim.rememberWhen.questions.makeBelieve',
    ],
  },
  // 13 — Wartime Memories
  {
    eraKey: 'patientApp.stim.rememberWhen.eras.wartime',
    items: ['\uD83E\uDDF3', '\uD83D\uDE82', '\uD83C\uDF3E', '\u2709\uFE0F'],
    questions: [
      'patientApp.stim.rememberWhen.questions.evacuees',
      'patientApp.stim.rememberWhen.questions.rationing',
      'patientApp.stim.rememberWhen.questions.victoryDay',
    ],
  },
  // 14 — 1960s Transport
  {
    eraKey: 'patientApp.stim.rememberWhen.eras.1960sTransport',
    items: ['\uD83D\uDE8C', '\uD83D\uDE82', '\uD83D\uDEB2', '\uD83D\uDE97'],
    questions: [
      'patientApp.stim.rememberWhen.questions.doubleDeckerBus',
      'patientApp.stim.rememberWhen.questions.firstCar',
      'patientApp.stim.rememberWhen.questions.trainJourney',
    ],
  },
  // 15 — Christmas Past
  {
    eraKey: 'patientApp.stim.rememberWhen.eras.christmasPast',
    items: ['\uD83C\uDF84', '\uD83C\uDF85', '\uD83C\uDF81', '\uD83C\uDF6C'],
    questions: [
      'patientApp.stim.rememberWhen.questions.christmasMorning',
      'patientApp.stim.rememberWhen.questions.christmasDinner',
      'patientApp.stim.rememberWhen.questions.bestPresent',
    ],
  },
  // 16 — 1970s Food
  {
    eraKey: 'patientApp.stim.rememberWhen.eras.1970sFood',
    items: ['\uD83C\uDF5E', '\uD83E\uDDC8', '\uD83C\uDF72', '\uD83E\uDD64'],
    questions: [
      'patientApp.stim.rememberWhen.questions.sundayRoast',
      'patientApp.stim.rememberWhen.questions.schoolMilk',
      'patientApp.stim.rememberWhen.questions.favouriteSweet',
    ],
  },
  // 17 — 1980s Home
  {
    eraKey: 'patientApp.stim.rememberWhen.eras.1980sHome',
    items: ['\uD83D\uDCDE', '\uD83D\uDCFA', '\uD83C\uDFA7', '\uD83D\uDCF0'],
    questions: [
      'patientApp.stim.rememberWhen.questions.phoneBox',
      'patientApp.stim.rememberWhen.questions.saturdayTV',
      'patientApp.stim.rememberWhen.questions.newspaper',
    ],
  },
  // 18 — Wedding Memories
  {
    eraKey: 'patientApp.stim.rememberWhen.eras.weddings',
    items: ['\uD83D\uDC70', '\uD83D\uDC92', '\uD83C\uDF82', '\uD83D\uDC90'],
    questions: [
      'patientApp.stim.rememberWhen.questions.weddingDay',
      'patientApp.stim.rememberWhen.questions.weddingDress',
      'patientApp.stim.rememberWhen.questions.weddingDance',
    ],
  },
  // 19 — 1990s Changes
  {
    eraKey: 'patientApp.stim.rememberWhen.eras.1990sChanges',
    items: ['\uD83D\uDCF1', '\uD83D\uDCBB', '\uD83D\uDCE7', '\uD83C\uDF0D'],
    questions: [
      'patientApp.stim.rememberWhen.questions.firstMobile',
      'patientApp.stim.rememberWhen.questions.internet',
      'patientApp.stim.rememberWhen.questions.bigChange',
    ],
  },
  // 20 — Work Memories
  {
    eraKey: 'patientApp.stim.rememberWhen.eras.workLife',
    items: ['\uD83D\uDCBC', '\u270D\uFE0F', '\uD83C\uDFED', '\uD83D\uDC68\u200D\uD83D\uDD27'],
    questions: [
      'patientApp.stim.rememberWhen.questions.firstJob',
      'patientApp.stim.rememberWhen.questions.workFriends',
      'patientApp.stim.rememberWhen.questions.proudMoment',
    ],
  },
];
