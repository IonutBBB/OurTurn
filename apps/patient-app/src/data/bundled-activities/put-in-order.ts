/**
 * Put in Order — everyday tasks with steps to sequence.
 */

import type { DifficultyLevel } from '@ourturn/shared';

export interface PutInOrderContent {
  titleKey: string;
  emoji: string;
  steps: { labelKey: string; correctPosition: number }[];
}

const gentle: PutInOrderContent[] = [
  {
    titleKey: 'patientApp.stim.putInOrder.tasks.makeTea',
    emoji: '☕',
    steps: [
      { labelKey: 'patientApp.stim.putInOrder.steps.boilKettle', correctPosition: 1 },
      { labelKey: 'patientApp.stim.putInOrder.steps.putTeaBag', correctPosition: 2 },
      { labelKey: 'patientApp.stim.putInOrder.steps.pourWater', correctPosition: 3 },
      { labelKey: 'patientApp.stim.putInOrder.steps.addMilk', correctPosition: 4 },
    ],
  },
  {
    titleKey: 'patientApp.stim.putInOrder.tasks.getReady',
    emoji: '🌅',
    steps: [
      { labelKey: 'patientApp.stim.putInOrder.steps.wakeUp', correctPosition: 1 },
      { labelKey: 'patientApp.stim.putInOrder.steps.shower', correctPosition: 2 },
      { labelKey: 'patientApp.stim.putInOrder.steps.getDressed', correctPosition: 3 },
      { labelKey: 'patientApp.stim.putInOrder.steps.eatBreakfast', correctPosition: 4 },
    ],
  },
  {
    titleKey: 'patientApp.stim.putInOrder.tasks.washHands',
    emoji: '🧼',
    steps: [
      { labelKey: 'patientApp.stim.putInOrder.steps.turnOnTap', correctPosition: 1 },
      { labelKey: 'patientApp.stim.putInOrder.steps.addSoap', correctPosition: 2 },
      { labelKey: 'patientApp.stim.putInOrder.steps.rubHands', correctPosition: 3 },
      { labelKey: 'patientApp.stim.putInOrder.steps.rinseHands', correctPosition: 4 },
    ],
  },
  {
    titleKey: 'patientApp.stim.putInOrder.tasks.makeToast',
    emoji: '🍞',
    steps: [
      { labelKey: 'patientApp.stim.putInOrder.steps.getBread', correctPosition: 1 },
      { labelKey: 'patientApp.stim.putInOrder.steps.putInToaster', correctPosition: 2 },
      { labelKey: 'patientApp.stim.putInOrder.steps.waitForToast', correctPosition: 3 },
      { labelKey: 'patientApp.stim.putInOrder.steps.spreadButter', correctPosition: 4 },
    ],
  },
  {
    titleKey: 'patientApp.stim.putInOrder.tasks.sendLetter',
    emoji: '✉️',
    steps: [
      { labelKey: 'patientApp.stim.putInOrder.steps.writeLetter', correctPosition: 1 },
      { labelKey: 'patientApp.stim.putInOrder.steps.putInEnvelope', correctPosition: 2 },
      { labelKey: 'patientApp.stim.putInOrder.steps.addStamp', correctPosition: 3 },
      { labelKey: 'patientApp.stim.putInOrder.steps.postLetter', correctPosition: 4 },
    ],
  },
  {
    titleKey: 'patientApp.stim.putInOrder.tasks.plantFlower',
    emoji: '🌸',
    steps: [
      { labelKey: 'patientApp.stim.putInOrder.steps.digHole', correctPosition: 1 },
      { labelKey: 'patientApp.stim.putInOrder.steps.placeSeed', correctPosition: 2 },
      { labelKey: 'patientApp.stim.putInOrder.steps.coverSoil', correctPosition: 3 },
      { labelKey: 'patientApp.stim.putInOrder.steps.waterPlant', correctPosition: 4 },
    ],
  },
  {
    titleKey: 'patientApp.stim.putInOrder.tasks.goShopping',
    emoji: '🛒',
    steps: [
      { labelKey: 'patientApp.stim.putInOrder.steps.makeList', correctPosition: 1 },
      { labelKey: 'patientApp.stim.putInOrder.steps.goToShop', correctPosition: 2 },
      { labelKey: 'patientApp.stim.putInOrder.steps.pickItems', correctPosition: 3 },
      { labelKey: 'patientApp.stim.putInOrder.steps.payAtTill', correctPosition: 4 },
    ],
  },
  {
    titleKey: 'patientApp.stim.putInOrder.tasks.makePhoneCall',
    emoji: '📞',
    steps: [
      { labelKey: 'patientApp.stim.putInOrder.steps.pickUpPhone', correctPosition: 1 },
      { labelKey: 'patientApp.stim.putInOrder.steps.dialNumber', correctPosition: 2 },
      { labelKey: 'patientApp.stim.putInOrder.steps.waitForAnswer', correctPosition: 3 },
      { labelKey: 'patientApp.stim.putInOrder.steps.sayHello', correctPosition: 4 },
    ],
  },
  {
    titleKey: 'patientApp.stim.putInOrder.tasks.brushTeeth',
    emoji: '🦷',
    steps: [
      { labelKey: 'patientApp.stim.putInOrder.steps.getToothbrush', correctPosition: 1 },
      { labelKey: 'patientApp.stim.putInOrder.steps.addToothpaste', correctPosition: 2 },
      { labelKey: 'patientApp.stim.putInOrder.steps.brushTeeth', correctPosition: 3 },
      { labelKey: 'patientApp.stim.putInOrder.steps.rinseAndSpit', correctPosition: 4 },
    ],
  },
  {
    titleKey: 'patientApp.stim.putInOrder.tasks.feedPet',
    emoji: '🐕',
    steps: [
      { labelKey: 'patientApp.stim.putInOrder.steps.getPetBowl', correctPosition: 1 },
      { labelKey: 'patientApp.stim.putInOrder.steps.openFood', correctPosition: 2 },
      { labelKey: 'patientApp.stim.putInOrder.steps.pourFood', correctPosition: 3 },
      { labelKey: 'patientApp.stim.putInOrder.steps.putBowlDown', correctPosition: 4 },
    ],
  },
];

const moderate: PutInOrderContent[] = [
  {
    titleKey: 'patientApp.stim.putInOrder.tasks.bakeCake',
    emoji: '🎂',
    steps: [
      { labelKey: 'patientApp.stim.putInOrder.steps.preheatOven', correctPosition: 1 },
      { labelKey: 'patientApp.stim.putInOrder.steps.mixIngredients', correctPosition: 2 },
      { labelKey: 'patientApp.stim.putInOrder.steps.pourInTin', correctPosition: 3 },
      { labelKey: 'patientApp.stim.putInOrder.steps.bakeInOven', correctPosition: 4 },
      { labelKey: 'patientApp.stim.putInOrder.steps.letCool', correctPosition: 5 },
    ],
  },
  {
    titleKey: 'patientApp.stim.putInOrder.tasks.washClothes',
    emoji: '👕',
    steps: [
      { labelKey: 'patientApp.stim.putInOrder.steps.sortClothes', correctPosition: 1 },
      { labelKey: 'patientApp.stim.putInOrder.steps.loadMachine', correctPosition: 2 },
      { labelKey: 'patientApp.stim.putInOrder.steps.addDetergent', correctPosition: 3 },
      { labelKey: 'patientApp.stim.putInOrder.steps.startWash', correctPosition: 4 },
      { labelKey: 'patientApp.stim.putInOrder.steps.hangToDry', correctPosition: 5 },
    ],
  },
  {
    titleKey: 'patientApp.stim.putInOrder.tasks.setTable',
    emoji: '🍽️',
    steps: [
      { labelKey: 'patientApp.stim.putInOrder.steps.layTablecloth', correctPosition: 1 },
      { labelKey: 'patientApp.stim.putInOrder.steps.putOutPlates', correctPosition: 2 },
      { labelKey: 'patientApp.stim.putInOrder.steps.addCutlery', correctPosition: 3 },
      { labelKey: 'patientApp.stim.putInOrder.steps.putOutGlasses', correctPosition: 4 },
      { labelKey: 'patientApp.stim.putInOrder.steps.addNapkins', correctPosition: 5 },
    ],
  },
  {
    titleKey: 'patientApp.stim.putInOrder.tasks.paintRoom',
    emoji: '🎨',
    steps: [
      { labelKey: 'patientApp.stim.putInOrder.steps.moveFurniture', correctPosition: 1 },
      { labelKey: 'patientApp.stim.putInOrder.steps.layDustSheets', correctPosition: 2 },
      { labelKey: 'patientApp.stim.putInOrder.steps.maskTape', correctPosition: 3 },
      { labelKey: 'patientApp.stim.putInOrder.steps.paintWalls', correctPosition: 4 },
      { labelKey: 'patientApp.stim.putInOrder.steps.letDry', correctPosition: 5 },
    ],
  },
  {
    titleKey: 'patientApp.stim.putInOrder.tasks.planPicnic',
    emoji: '🧺',
    steps: [
      { labelKey: 'patientApp.stim.putInOrder.steps.checkWeather', correctPosition: 1 },
      { labelKey: 'patientApp.stim.putInOrder.steps.prepareFood', correctPosition: 2 },
      { labelKey: 'patientApp.stim.putInOrder.steps.packBasket', correctPosition: 3 },
      { labelKey: 'patientApp.stim.putInOrder.steps.driveToSpot', correctPosition: 4 },
      { labelKey: 'patientApp.stim.putInOrder.steps.layBlanket', correctPosition: 5 },
    ],
  },
  {
    titleKey: 'patientApp.stim.putInOrder.tasks.changeLight',
    emoji: '💡',
    steps: [
      { labelKey: 'patientApp.stim.putInOrder.steps.turnOffSwitch', correctPosition: 1 },
      { labelKey: 'patientApp.stim.putInOrder.steps.getStepladder', correctPosition: 2 },
      { labelKey: 'patientApp.stim.putInOrder.steps.removeOldBulb', correctPosition: 3 },
      { labelKey: 'patientApp.stim.putInOrder.steps.screwNewBulb', correctPosition: 4 },
      { labelKey: 'patientApp.stim.putInOrder.steps.turnOnSwitch', correctPosition: 5 },
    ],
  },
  {
    titleKey: 'patientApp.stim.putInOrder.tasks.makeOmelette',
    emoji: '🍳',
    steps: [
      { labelKey: 'patientApp.stim.putInOrder.steps.crackEggs', correctPosition: 1 },
      { labelKey: 'patientApp.stim.putInOrder.steps.whiskEggs', correctPosition: 2 },
      { labelKey: 'patientApp.stim.putInOrder.steps.heatPan', correctPosition: 3 },
      { labelKey: 'patientApp.stim.putInOrder.steps.pourEggsIn', correctPosition: 4 },
      { labelKey: 'patientApp.stim.putInOrder.steps.foldAndServe', correctPosition: 5 },
    ],
  },
  {
    titleKey: 'patientApp.stim.putInOrder.tasks.makeABed',
    emoji: '🛏️',
    steps: [
      { labelKey: 'patientApp.stim.putInOrder.steps.removeBedding', correctPosition: 1 },
      { labelKey: 'patientApp.stim.putInOrder.steps.putOnSheet', correctPosition: 2 },
      { labelKey: 'patientApp.stim.putInOrder.steps.addDuvet', correctPosition: 3 },
      { labelKey: 'patientApp.stim.putInOrder.steps.fluffPillows', correctPosition: 4 },
      { labelKey: 'patientApp.stim.putInOrder.steps.smoothOut', correctPosition: 5 },
    ],
  },
  {
    titleKey: 'patientApp.stim.putInOrder.tasks.washCar',
    emoji: '🚗',
    steps: [
      { labelKey: 'patientApp.stim.putInOrder.steps.fillBucket', correctPosition: 1 },
      { labelKey: 'patientApp.stim.putInOrder.steps.wetCarDown', correctPosition: 2 },
      { labelKey: 'patientApp.stim.putInOrder.steps.scrubSponge', correctPosition: 3 },
      { labelKey: 'patientApp.stim.putInOrder.steps.rinseOff', correctPosition: 4 },
      { labelKey: 'patientApp.stim.putInOrder.steps.dryWithCloth', correctPosition: 5 },
    ],
  },
  {
    titleKey: 'patientApp.stim.putInOrder.tasks.wrappingGift',
    emoji: '🎁',
    steps: [
      { labelKey: 'patientApp.stim.putInOrder.steps.chooseGift', correctPosition: 1 },
      { labelKey: 'patientApp.stim.putInOrder.steps.cutPaper', correctPosition: 2 },
      { labelKey: 'patientApp.stim.putInOrder.steps.wrapGift', correctPosition: 3 },
      { labelKey: 'patientApp.stim.putInOrder.steps.tapeEdges', correctPosition: 4 },
      { labelKey: 'patientApp.stim.putInOrder.steps.addRibbon', correctPosition: 5 },
    ],
  },
];

const challenging = moderate;

export const PUT_IN_ORDER_CONTENT: Record<DifficultyLevel, PutInOrderContent[]> = {
  gentle,
  moderate,
  challenging,
};
