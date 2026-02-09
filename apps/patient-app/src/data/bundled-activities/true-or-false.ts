/**
 * True or False — statements that are either true or false.
 */

import type { DifficultyLevel } from '@ourturn/shared';

export interface TrueOrFalseContent {
  statementKey: string;
  isTrue: boolean;
  explanationKey: string;
}

const gentle: TrueOrFalseContent[] = [
  { statementKey: 'patientApp.stim.trueOrFalse.statements.earthRound', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.earthRound' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.sunSetsWest', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.sunSetsWest' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.fishCanFly', isTrue: false, explanationKey: 'patientApp.stim.trueOrFalse.explanations.fishCanFly' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.waterWet', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.waterWet' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.bananaBlue', isTrue: false, explanationKey: 'patientApp.stim.trueOrFalse.explanations.bananaBlue' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.penguinBird', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.penguinBird' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.snowHot', isTrue: false, explanationKey: 'patientApp.stim.trueOrFalse.explanations.snowHot' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.dogsCanSwim', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.dogsCanSwim' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.moonMadeCheese', isTrue: false, explanationKey: 'patientApp.stim.trueOrFalse.explanations.moonMadeCheese' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.roseIsFlower', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.roseIsFlower' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.catsHaveWings', isTrue: false, explanationKey: 'patientApp.stim.trueOrFalse.explanations.catsHaveWings' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.parisInFrance', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.parisInFrance' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.fireIsCold', isTrue: false, explanationKey: 'patientApp.stim.trueOrFalse.explanations.fireIsCold' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.horsesHaveLegs', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.horsesHaveLegs' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.treesAreGreen', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.treesAreGreen' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.carsCanFly', isTrue: false, explanationKey: 'patientApp.stim.trueOrFalse.explanations.carsCanFly' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.birdsLayEggs', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.birdsLayEggs' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.iceIsFrozenWater', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.iceIsFrozenWater' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.elephantsSmall', isTrue: false, explanationKey: 'patientApp.stim.trueOrFalse.explanations.elephantsSmall' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.milkFromCows', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.milkFromCows' },
];

const moderate: TrueOrFalseContent[] = [
  { statementKey: 'patientApp.stim.trueOrFalse.statements.greatWallChina', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.greatWallChina' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.lightningSoundFirst', isTrue: false, explanationKey: 'patientApp.stim.trueOrFalse.explanations.lightningSoundFirst' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.olympicsEvery4Years', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.olympicsEvery4Years' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.saharaLargestDesert', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.saharaLargestDesert' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.spidersAreInsects', isTrue: false, explanationKey: 'patientApp.stim.trueOrFalse.explanations.spidersAreInsects' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.diamondHardest', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.diamondHardest' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.tomatoVegetable', isTrue: false, explanationKey: 'patientApp.stim.trueOrFalse.explanations.tomatoVegetable' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.nileAfrica', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.nileAfrica' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.australiaContinent', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.australiaContinent' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.veniceBuiltWater', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.veniceBuiltWater' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.honeyNeverExpires', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.honeyNeverExpires' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.goldfishMemory3s', isTrue: false, explanationKey: 'patientApp.stim.trueOrFalse.explanations.goldfishMemory3s' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.octopus3Hearts', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.octopus3Hearts' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.shakespeareBorn1664', isTrue: false, explanationKey: 'patientApp.stim.trueOrFalse.explanations.shakespeareBorn1664' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.sunIsStar', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.sunIsStar' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.bambooFastGrowing', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.bambooFastGrowing' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.coinTossWeighted', isTrue: false, explanationKey: 'patientApp.stim.trueOrFalse.explanations.coinTossWeighted' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.bearsSleepWinter', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.bearsSleepWinter' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.eiffelTowerLondon', isTrue: false, explanationKey: 'patientApp.stim.trueOrFalse.explanations.eiffelTowerLondon' },
  { statementKey: 'patientApp.stim.trueOrFalse.statements.chocolateFromBeans', isTrue: true, explanationKey: 'patientApp.stim.trueOrFalse.explanations.chocolateFromBeans' },
];

const challenging = moderate;

export const TRUE_OR_FALSE_CONTENT: Record<DifficultyLevel, TrueOrFalseContent[]> = {
  gentle,
  moderate,
  challenging,
};
