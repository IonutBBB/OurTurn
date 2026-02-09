/**
 * Odd Word Out — sets of words where one doesn't belong.
 * Patient taps the odd one out.
 */

import type { DifficultyLevel } from '@ourturn/shared';

export interface OddWordOutContent {
  words: string[];
  wordKeys: string[];
  oddIndex: number;
  explanationKey: string;
}

const gentle: OddWordOutContent[] = [
  { words: ['Apple', 'Banana', 'Chair'], wordKeys: ['patientApp.stim.oddWordOut.items.apple', 'patientApp.stim.oddWordOut.items.banana', 'patientApp.stim.oddWordOut.items.chair'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.fruitNotFurniture' },
  { words: ['Cat', 'Dog', 'Table'], wordKeys: ['patientApp.stim.oddWordOut.items.cat', 'patientApp.stim.oddWordOut.items.dog', 'patientApp.stim.oddWordOut.items.table'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.animalsNotFurniture' },
  { words: ['Red', 'Blue', 'Hammer'], wordKeys: ['patientApp.stim.oddWordOut.items.red', 'patientApp.stim.oddWordOut.items.blue', 'patientApp.stim.oddWordOut.items.hammer'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.colorsNotTool' },
  { words: ['Rose', 'Daisy', 'Shoe'], wordKeys: ['patientApp.stim.oddWordOut.items.rose', 'patientApp.stim.oddWordOut.items.daisy', 'patientApp.stim.oddWordOut.items.shoe'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.flowersNotClothing' },
  { words: ['Milk', 'Juice', 'Pencil'], wordKeys: ['patientApp.stim.oddWordOut.items.milk', 'patientApp.stim.oddWordOut.items.juice', 'patientApp.stim.oddWordOut.items.pencil'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.drinksNotStationery' },
  { words: ['Car', 'Bus', 'Spoon'], wordKeys: ['patientApp.stim.oddWordOut.items.car', 'patientApp.stim.oddWordOut.items.bus', 'patientApp.stim.oddWordOut.items.spoon'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.vehiclesNotCutlery' },
  { words: ['Hat', 'Glove', 'Fish'], wordKeys: ['patientApp.stim.oddWordOut.items.hat', 'patientApp.stim.oddWordOut.items.glove', 'patientApp.stim.oddWordOut.items.fish'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.clothingNotAnimal' },
  { words: ['Bread', 'Cake', 'Clock'], wordKeys: ['patientApp.stim.oddWordOut.items.bread', 'patientApp.stim.oddWordOut.items.cake', 'patientApp.stim.oddWordOut.items.clock'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.bakedNotObject' },
  { words: ['Piano', 'Guitar', 'Pillow'], wordKeys: ['patientApp.stim.oddWordOut.items.piano', 'patientApp.stim.oddWordOut.items.guitar', 'patientApp.stim.oddWordOut.items.pillow'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.instrumentsNotBedding' },
  { words: ['Sun', 'Moon', 'Kettle'], wordKeys: ['patientApp.stim.oddWordOut.items.sun', 'patientApp.stim.oddWordOut.items.moon', 'patientApp.stim.oddWordOut.items.kettle'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.skyNotKitchen' },
  { words: ['Shirt', 'Trousers', 'Lamp'], wordKeys: ['patientApp.stim.oddWordOut.items.shirt', 'patientApp.stim.oddWordOut.items.trousers', 'patientApp.stim.oddWordOut.items.lamp'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.clothingNotLight' },
  { words: ['Egg', 'Cheese', 'Bicycle'], wordKeys: ['patientApp.stim.oddWordOut.items.egg', 'patientApp.stim.oddWordOut.items.cheese', 'patientApp.stim.oddWordOut.items.bicycle'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.foodNotVehicle' },
  { words: ['Fork', 'Knife', 'Rabbit'], wordKeys: ['patientApp.stim.oddWordOut.items.fork', 'patientApp.stim.oddWordOut.items.knife', 'patientApp.stim.oddWordOut.items.rabbit'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.cutleryNotAnimal' },
  { words: ['Hand', 'Foot', 'Window'], wordKeys: ['patientApp.stim.oddWordOut.items.hand', 'patientApp.stim.oddWordOut.items.foot', 'patientApp.stim.oddWordOut.items.window'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.bodyNotHouse' },
  { words: ['Spring', 'Autumn', 'Cup'], wordKeys: ['patientApp.stim.oddWordOut.items.spring', 'patientApp.stim.oddWordOut.items.autumn', 'patientApp.stim.oddWordOut.items.cup'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.seasonsNotObject' },
  { words: ['Horse', 'Cow', 'Umbrella'], wordKeys: ['patientApp.stim.oddWordOut.items.horse', 'patientApp.stim.oddWordOut.items.cow', 'patientApp.stim.oddWordOut.items.umbrella'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.animalsNotObject' },
  { words: ['Doctor', 'Teacher', 'Carrot'], wordKeys: ['patientApp.stim.oddWordOut.items.doctor', 'patientApp.stim.oddWordOut.items.teacher', 'patientApp.stim.oddWordOut.items.carrot'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.jobsNotFood' },
  { words: ['River', 'Lake', 'Sofa'], wordKeys: ['patientApp.stim.oddWordOut.items.river', 'patientApp.stim.oddWordOut.items.lake', 'patientApp.stim.oddWordOut.items.sofa'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.waterNotFurniture' },
  { words: ['King', 'Queen', 'Potato'], wordKeys: ['patientApp.stim.oddWordOut.items.king', 'patientApp.stim.oddWordOut.items.queen', 'patientApp.stim.oddWordOut.items.potato'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.royaltyNotFood' },
  { words: ['Football', 'Tennis', 'Ladder'], wordKeys: ['patientApp.stim.oddWordOut.items.football', 'patientApp.stim.oddWordOut.items.tennis', 'patientApp.stim.oddWordOut.items.ladder'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.sportsNotTool' },
];

const moderate: OddWordOutContent[] = [
  { words: ['Apple', 'Banana', 'Carrot', 'Orange'], wordKeys: ['patientApp.stim.oddWordOut.items.apple', 'patientApp.stim.oddWordOut.items.banana', 'patientApp.stim.oddWordOut.items.carrot', 'patientApp.stim.oddWordOut.items.orange'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.fruitNotVeg' },
  { words: ['Eagle', 'Robin', 'Salmon', 'Sparrow'], wordKeys: ['patientApp.stim.oddWordOut.items.eagle', 'patientApp.stim.oddWordOut.items.robin', 'patientApp.stim.oddWordOut.items.salmon', 'patientApp.stim.oddWordOut.items.sparrow'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.birdsNotFish' },
  { words: ['Violin', 'Trumpet', 'Painting', 'Drum'], wordKeys: ['patientApp.stim.oddWordOut.items.violin', 'patientApp.stim.oddWordOut.items.trumpet', 'patientApp.stim.oddWordOut.items.painting', 'patientApp.stim.oddWordOut.items.drum'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.instrumentsNotArt' },
  { words: ['London', 'Paris', 'Tuesday', 'Rome'], wordKeys: ['patientApp.stim.oddWordOut.items.london', 'patientApp.stim.oddWordOut.items.paris', 'patientApp.stim.oddWordOut.items.tuesday', 'patientApp.stim.oddWordOut.items.rome'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.citiesNotDay' },
  { words: ['Oak', 'Pine', 'Desk', 'Birch'], wordKeys: ['patientApp.stim.oddWordOut.items.oak', 'patientApp.stim.oddWordOut.items.pine', 'patientApp.stim.oddWordOut.items.desk', 'patientApp.stim.oddWordOut.items.birch'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.treesNotFurniture' },
  { words: ['Cotton', 'Wool', 'Silk', 'Paper'], wordKeys: ['patientApp.stim.oddWordOut.items.cotton', 'patientApp.stim.oddWordOut.items.wool', 'patientApp.stim.oddWordOut.items.silk', 'patientApp.stim.oddWordOut.items.paper'], oddIndex: 3, explanationKey: 'patientApp.stim.oddWordOut.explain.fabricsNotPaper' },
  { words: ['Circle', 'Square', 'Happy', 'Triangle'], wordKeys: ['patientApp.stim.oddWordOut.items.circle', 'patientApp.stim.oddWordOut.items.square', 'patientApp.stim.oddWordOut.items.happy', 'patientApp.stim.oddWordOut.items.triangle'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.shapesNotFeeling' },
  { words: ['Breakfast', 'Lunch', 'Sleep', 'Dinner'], wordKeys: ['patientApp.stim.oddWordOut.items.breakfast', 'patientApp.stim.oddWordOut.items.lunch', 'patientApp.stim.oddWordOut.items.sleep', 'patientApp.stim.oddWordOut.items.dinner'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.mealsNotActivity' },
  { words: ['January', 'March', 'Friday', 'June'], wordKeys: ['patientApp.stim.oddWordOut.items.january', 'patientApp.stim.oddWordOut.items.march', 'patientApp.stim.oddWordOut.items.friday', 'patientApp.stim.oddWordOut.items.june'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.monthsNotDay' },
  { words: ['Swimming', 'Running', 'Reading', 'Cycling'], wordKeys: ['patientApp.stim.oddWordOut.items.swimming', 'patientApp.stim.oddWordOut.items.running', 'patientApp.stim.oddWordOut.items.reading', 'patientApp.stim.oddWordOut.items.cycling'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.exerciseNotReading' },
  { words: ['Gold', 'Silver', 'Bronze', 'Wood'], wordKeys: ['patientApp.stim.oddWordOut.items.gold', 'patientApp.stim.oddWordOut.items.silver', 'patientApp.stim.oddWordOut.items.bronze', 'patientApp.stim.oddWordOut.items.wood'], oddIndex: 3, explanationKey: 'patientApp.stim.oddWordOut.explain.metalsNotWood' },
  { words: ['Hammer', 'Saw', 'Flower', 'Drill'], wordKeys: ['patientApp.stim.oddWordOut.items.hammer', 'patientApp.stim.oddWordOut.items.saw', 'patientApp.stim.oddWordOut.items.flower', 'patientApp.stim.oddWordOut.items.drill'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.toolsNotPlant' },
  { words: ['Thumb', 'Elbow', 'Pencil', 'Knee'], wordKeys: ['patientApp.stim.oddWordOut.items.thumb', 'patientApp.stim.oddWordOut.items.elbow', 'patientApp.stim.oddWordOut.items.pencil', 'patientApp.stim.oddWordOut.items.knee'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.bodyNotObject' },
  { words: ['Rain', 'Snow', 'Bread', 'Wind'], wordKeys: ['patientApp.stim.oddWordOut.items.rain', 'patientApp.stim.oddWordOut.items.snow', 'patientApp.stim.oddWordOut.items.bread', 'patientApp.stim.oddWordOut.items.wind'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.weatherNotFood' },
  { words: ['Dollar', 'Pound', 'Euro', 'Metre'], wordKeys: ['patientApp.stim.oddWordOut.items.dollar', 'patientApp.stim.oddWordOut.items.pound', 'patientApp.stim.oddWordOut.items.euro', 'patientApp.stim.oddWordOut.items.metre'], oddIndex: 3, explanationKey: 'patientApp.stim.oddWordOut.explain.currencyNotMeasure' },
  { words: ['Mars', 'Venus', 'Monday', 'Jupiter'], wordKeys: ['patientApp.stim.oddWordOut.items.mars', 'patientApp.stim.oddWordOut.items.venus', 'patientApp.stim.oddWordOut.items.monday', 'patientApp.stim.oddWordOut.items.jupiter'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.planetsNotDay' },
  { words: ['Nurse', 'Pilot', 'Teacher', 'Pencil'], wordKeys: ['patientApp.stim.oddWordOut.items.nurse', 'patientApp.stim.oddWordOut.items.pilot', 'patientApp.stim.oddWordOut.items.teacher', 'patientApp.stim.oddWordOut.items.pencil'], oddIndex: 3, explanationKey: 'patientApp.stim.oddWordOut.explain.jobsNotObject' },
  { words: ['Soup', 'Salad', 'Chair', 'Sandwich'], wordKeys: ['patientApp.stim.oddWordOut.items.soup', 'patientApp.stim.oddWordOut.items.salad', 'patientApp.stim.oddWordOut.items.chair', 'patientApp.stim.oddWordOut.items.sandwich'], oddIndex: 2, explanationKey: 'patientApp.stim.oddWordOut.explain.foodNotFurniture' },
  { words: ['Eye', 'Ear', 'Nose', 'Boot'], wordKeys: ['patientApp.stim.oddWordOut.items.eye', 'patientApp.stim.oddWordOut.items.ear', 'patientApp.stim.oddWordOut.items.nose', 'patientApp.stim.oddWordOut.items.boot'], oddIndex: 3, explanationKey: 'patientApp.stim.oddWordOut.explain.faceNotShoe' },
  { words: ['Tiger', 'Lion', 'Bear', 'Tulip'], wordKeys: ['patientApp.stim.oddWordOut.items.tiger', 'patientApp.stim.oddWordOut.items.lion', 'patientApp.stim.oddWordOut.items.bear', 'patientApp.stim.oddWordOut.items.tulip'], oddIndex: 3, explanationKey: 'patientApp.stim.oddWordOut.explain.animalsNotFlower' },
];

const challenging = moderate; // Reuse moderate with 4 words

export const ODD_WORD_OUT_CONTENT: Record<DifficultyLevel, OddWordOutContent[]> = {
  gentle,
  moderate,
  challenging,
};
