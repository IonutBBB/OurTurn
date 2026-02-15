export interface MyFavouritesPrompt {
  emoji: string;
  questionKey: string;
  followUpKey: string;
}

export interface MyFavouritesContent {
  prompts: MyFavouritesPrompt[];
}

export const MY_FAVOURITES_CONTENT: MyFavouritesContent[] = [
  // Set 1 — Food & Drink
  {
    prompts: [
      { emoji: '\uD83C\uDF72', questionKey: 'patientApp.stim.myFavourites.questions.meal', followUpKey: 'patientApp.stim.myFavourites.followUps.meal' },
      { emoji: '\uD83C\uDF70', questionKey: 'patientApp.stim.myFavourites.questions.pudding', followUpKey: 'patientApp.stim.myFavourites.followUps.pudding' },
      { emoji: '\u2615', questionKey: 'patientApp.stim.myFavourites.questions.hotDrink', followUpKey: 'patientApp.stim.myFavourites.followUps.hotDrink' },
    ],
  },
  // Set 2 — Music & Entertainment
  {
    prompts: [
      { emoji: '\uD83C\uDFB5', questionKey: 'patientApp.stim.myFavourites.questions.song', followUpKey: 'patientApp.stim.myFavourites.followUps.song' },
      { emoji: '\uD83C\uDFAC', questionKey: 'patientApp.stim.myFavourites.questions.film', followUpKey: 'patientApp.stim.myFavourites.followUps.film' },
      { emoji: '\uD83D\uDCFA', questionKey: 'patientApp.stim.myFavourites.questions.tvShow', followUpKey: 'patientApp.stim.myFavourites.followUps.tvShow' },
    ],
  },
  // Set 3 — Nature & Seasons
  {
    prompts: [
      { emoji: '\uD83C\uDF3A', questionKey: 'patientApp.stim.myFavourites.questions.flower', followUpKey: 'patientApp.stim.myFavourites.followUps.flower' },
      { emoji: '\uD83C\uDF43', questionKey: 'patientApp.stim.myFavourites.questions.season', followUpKey: 'patientApp.stim.myFavourites.followUps.season' },
      { emoji: '\uD83D\uDC26', questionKey: 'patientApp.stim.myFavourites.questions.animal', followUpKey: 'patientApp.stim.myFavourites.followUps.animal' },
    ],
  },
  // Set 4 — Places
  {
    prompts: [
      { emoji: '\uD83C\uDFD6\uFE0F', questionKey: 'patientApp.stim.myFavourites.questions.holiday', followUpKey: 'patientApp.stim.myFavourites.followUps.holiday' },
      { emoji: '\uD83C\uDFE1', questionKey: 'patientApp.stim.myFavourites.questions.room', followUpKey: 'patientApp.stim.myFavourites.followUps.room' },
      { emoji: '\uD83C\uDF33', questionKey: 'patientApp.stim.myFavourites.questions.place', followUpKey: 'patientApp.stim.myFavourites.followUps.place' },
    ],
  },
  // Set 5 — Childhood
  {
    prompts: [
      { emoji: '\uD83C\uDFAE', questionKey: 'patientApp.stim.myFavourites.questions.game', followUpKey: 'patientApp.stim.myFavourites.followUps.game' },
      { emoji: '\uD83C\uDF81', questionKey: 'patientApp.stim.myFavourites.questions.present', followUpKey: 'patientApp.stim.myFavourites.followUps.present' },
      { emoji: '\uD83D\uDCDA', questionKey: 'patientApp.stim.myFavourites.questions.book', followUpKey: 'patientApp.stim.myFavourites.followUps.book' },
    ],
  },
  // Set 6 — People & Occasions
  {
    prompts: [
      { emoji: '\uD83C\uDF89', questionKey: 'patientApp.stim.myFavourites.questions.celebration', followUpKey: 'patientApp.stim.myFavourites.followUps.celebration' },
      { emoji: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67', questionKey: 'patientApp.stim.myFavourites.questions.familyMemory', followUpKey: 'patientApp.stim.myFavourites.followUps.familyMemory' },
      { emoji: '\u2764\uFE0F', questionKey: 'patientApp.stim.myFavourites.questions.kindness', followUpKey: 'patientApp.stim.myFavourites.followUps.kindness' },
    ],
  },
  // Set 7 — Daily Pleasures
  {
    prompts: [
      { emoji: '\uD83C\uDF1E', questionKey: 'patientApp.stim.myFavourites.questions.timeOfDay', followUpKey: 'patientApp.stim.myFavourites.followUps.timeOfDay' },
      { emoji: '\uD83D\uDECB\uFE0F', questionKey: 'patientApp.stim.myFavourites.questions.relaxing', followUpKey: 'patientApp.stim.myFavourites.followUps.relaxing' },
      { emoji: '\uD83D\uDEB6', questionKey: 'patientApp.stim.myFavourites.questions.outing', followUpKey: 'patientApp.stim.myFavourites.followUps.outing' },
    ],
  },
  // Set 8 — Colours & Style
  {
    prompts: [
      { emoji: '\uD83C\uDF08', questionKey: 'patientApp.stim.myFavourites.questions.colour', followUpKey: 'patientApp.stim.myFavourites.followUps.colour' },
      { emoji: '\uD83D\uDC57', questionKey: 'patientApp.stim.myFavourites.questions.outfit', followUpKey: 'patientApp.stim.myFavourites.followUps.outfit' },
      { emoji: '\uD83E\uDDFB', questionKey: 'patientApp.stim.myFavourites.questions.scent', followUpKey: 'patientApp.stim.myFavourites.followUps.scent' },
    ],
  },
  // Set 9 — Sport & Hobbies
  {
    prompts: [
      { emoji: '\u26BD', questionKey: 'patientApp.stim.myFavourites.questions.sport', followUpKey: 'patientApp.stim.myFavourites.followUps.sport' },
      { emoji: '\uD83C\uDFA8', questionKey: 'patientApp.stim.myFavourites.questions.hobby', followUpKey: 'patientApp.stim.myFavourites.followUps.hobby' },
      { emoji: '\uD83C\uDFB2', questionKey: 'patientApp.stim.myFavourites.questions.boardGame', followUpKey: 'patientApp.stim.myFavourites.followUps.boardGame' },
    ],
  },
  // Set 10 — Weekend
  {
    prompts: [
      { emoji: '\uD83D\uDED2', questionKey: 'patientApp.stim.myFavourites.questions.shop', followUpKey: 'patientApp.stim.myFavourites.followUps.shop' },
      { emoji: '\uD83C\uDF3F', questionKey: 'patientApp.stim.myFavourites.questions.weekend', followUpKey: 'patientApp.stim.myFavourites.followUps.weekend' },
      { emoji: '\uD83D\uDE04', questionKey: 'patientApp.stim.myFavourites.questions.laugh', followUpKey: 'patientApp.stim.myFavourites.followUps.laugh' },
    ],
  },
  // Set 11 — Comfort
  {
    prompts: [
      { emoji: '\uD83E\uDE94', questionKey: 'patientApp.stim.myFavourites.questions.comfortFood', followUpKey: 'patientApp.stim.myFavourites.followUps.comfortFood' },
      { emoji: '\uD83D\uDECF\uFE0F', questionKey: 'patientApp.stim.myFavourites.questions.cosySpot', followUpKey: 'patientApp.stim.myFavourites.followUps.cosySpot' },
      { emoji: '\uD83E\uDDC3', questionKey: 'patientApp.stim.myFavourites.questions.warmDrink', followUpKey: 'patientApp.stim.myFavourites.followUps.warmDrink' },
    ],
  },
  // Set 12 — Treats
  {
    prompts: [
      { emoji: '\uD83C\uDF66', questionKey: 'patientApp.stim.myFavourites.questions.iceCream', followUpKey: 'patientApp.stim.myFavourites.followUps.iceCream' },
      { emoji: '\uD83C\uDF53', questionKey: 'patientApp.stim.myFavourites.questions.fruit', followUpKey: 'patientApp.stim.myFavourites.followUps.fruit' },
      { emoji: '\uD83C\uDF6A', questionKey: 'patientApp.stim.myFavourites.questions.sweetTreat', followUpKey: 'patientApp.stim.myFavourites.followUps.sweetTreat' },
    ],
  },
  // Set 13 — Music Deeper
  {
    prompts: [
      { emoji: '\uD83C\uDFB9', questionKey: 'patientApp.stim.myFavourites.questions.instrument', followUpKey: 'patientApp.stim.myFavourites.followUps.instrument' },
      { emoji: '\uD83C\uDFA4', questionKey: 'patientApp.stim.myFavourites.questions.singer', followUpKey: 'patientApp.stim.myFavourites.followUps.singer' },
      { emoji: '\uD83D\uDC83', questionKey: 'patientApp.stim.myFavourites.questions.dance', followUpKey: 'patientApp.stim.myFavourites.followUps.dance' },
    ],
  },
  // Set 14 — Weather & Outdoors
  {
    prompts: [
      { emoji: '\u2600\uFE0F', questionKey: 'patientApp.stim.myFavourites.questions.weather', followUpKey: 'patientApp.stim.myFavourites.followUps.weather' },
      { emoji: '\uD83C\uDF32', questionKey: 'patientApp.stim.myFavourites.questions.tree', followUpKey: 'patientApp.stim.myFavourites.followUps.tree' },
      { emoji: '\uD83E\uDD86', questionKey: 'patientApp.stim.myFavourites.questions.bird', followUpKey: 'patientApp.stim.myFavourites.followUps.bird' },
    ],
  },
  // Set 15 — Traditions
  {
    prompts: [
      { emoji: '\uD83C\uDF84', questionKey: 'patientApp.stim.myFavourites.questions.christmas', followUpKey: 'patientApp.stim.myFavourites.followUps.christmas' },
      { emoji: '\uD83C\uDF82', questionKey: 'patientApp.stim.myFavourites.questions.birthday', followUpKey: 'patientApp.stim.myFavourites.followUps.birthday' },
      { emoji: '\uD83C\uDF1F', questionKey: 'patientApp.stim.myFavourites.questions.tradition', followUpKey: 'patientApp.stim.myFavourites.followUps.tradition' },
    ],
  },
  // Set 16 — Transport & Adventure
  {
    prompts: [
      { emoji: '\uD83D\uDE82', questionKey: 'patientApp.stim.myFavourites.questions.transport', followUpKey: 'patientApp.stim.myFavourites.followUps.transport' },
      { emoji: '\uD83C\uDF0D', questionKey: 'patientApp.stim.myFavourites.questions.country', followUpKey: 'patientApp.stim.myFavourites.followUps.country' },
      { emoji: '\uD83D\uDDFA\uFE0F', questionKey: 'patientApp.stim.myFavourites.questions.adventure', followUpKey: 'patientApp.stim.myFavourites.followUps.adventure' },
    ],
  },
  // Set 17 — Home Life
  {
    prompts: [
      { emoji: '\uD83C\uDF3C', questionKey: 'patientApp.stim.myFavourites.questions.gardenFlower', followUpKey: 'patientApp.stim.myFavourites.followUps.gardenFlower' },
      { emoji: '\uD83D\uDEBD', questionKey: 'patientApp.stim.myFavourites.questions.homeRoutine', followUpKey: 'patientApp.stim.myFavourites.followUps.homeRoutine' },
      { emoji: '\uD83D\uDCFB', questionKey: 'patientApp.stim.myFavourites.questions.radio', followUpKey: 'patientApp.stim.myFavourites.followUps.radio' },
    ],
  },
  // Set 18 — Childhood Part 2
  {
    prompts: [
      { emoji: '\uD83C\uDFEB', questionKey: 'patientApp.stim.myFavourites.questions.school', followUpKey: 'patientApp.stim.myFavourites.followUps.school' },
      { emoji: '\uD83D\uDE8C', questionKey: 'patientApp.stim.myFavourites.questions.schoolTrip', followUpKey: 'patientApp.stim.myFavourites.followUps.schoolTrip' },
      { emoji: '\uD83E\uDD47', questionKey: 'patientApp.stim.myFavourites.questions.achievement', followUpKey: 'patientApp.stim.myFavourites.followUps.achievement' },
    ],
  },
  // Set 19 — Simple Joys
  {
    prompts: [
      { emoji: '\uD83C\uDF1C', questionKey: 'patientApp.stim.myFavourites.questions.bedtime', followUpKey: 'patientApp.stim.myFavourites.followUps.bedtime' },
      { emoji: '\u2615', questionKey: 'patientApp.stim.myFavourites.questions.morningRitual', followUpKey: 'patientApp.stim.myFavourites.followUps.morningRitual' },
      { emoji: '\uD83E\uDD17', questionKey: 'patientApp.stim.myFavourites.questions.happiness', followUpKey: 'patientApp.stim.myFavourites.followUps.happiness' },
    ],
  },
  // Set 20 — Senses
  {
    prompts: [
      { emoji: '\uD83C\uDF39', questionKey: 'patientApp.stim.myFavourites.questions.smell', followUpKey: 'patientApp.stim.myFavourites.followUps.smell' },
      { emoji: '\uD83C\uDFB6', questionKey: 'patientApp.stim.myFavourites.questions.sound', followUpKey: 'patientApp.stim.myFavourites.followUps.sound' },
      { emoji: '\uD83D\uDC40', questionKey: 'patientApp.stim.myFavourites.questions.sight', followUpKey: 'patientApp.stim.myFavourites.followUps.sight' },
    ],
  },
];
