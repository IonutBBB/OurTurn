/**
 * Price Guessing — items with actual prices.
 * Patient guesses the price, then sees the answer.
 */

import type { DifficultyLevel } from '@ourturn/shared';

export interface PriceGuessingContent {
  itemKey: string;
  emoji: string;
  actualPrice: number;
  currency: string;
}

const gentle: PriceGuessingContent[] = [
  { itemKey: 'patientApp.stim.priceGuessing.items.loafOfBread', emoji: '🍞', actualPrice: 1.5, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.litreOfMilk', emoji: '🥛', actualPrice: 1.2, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.dozenEggs', emoji: '🥚', actualPrice: 3.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.newspaper', emoji: '📰', actualPrice: 2.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.cupOfCoffee', emoji: '☕', actualPrice: 3.5, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.barOfChocolate', emoji: '🍫', actualPrice: 2.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.bottleOfWater', emoji: '💧', actualPrice: 1.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.bagOfApples', emoji: '🍎', actualPrice: 3.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.tinOfSoup', emoji: '🥫', actualPrice: 2.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.kiloBananas', emoji: '🍌', actualPrice: 1.5, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.butter', emoji: '🧈', actualPrice: 2.5, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.bagOfSugar', emoji: '🧂', actualPrice: 1.5, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.boxOfTeaBags', emoji: '🫖', actualPrice: 3.5, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.postageStamp', emoji: '📮', actualPrice: 1.35, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.iceCreamCone', emoji: '🍦', actualPrice: 3.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.sliceOfPizza', emoji: '🍕', actualPrice: 3.5, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.bagOfCrisps', emoji: '🥔', actualPrice: 2.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.tinOfBeans', emoji: '🫘', actualPrice: 1.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.blockOfCheese', emoji: '🧀', actualPrice: 4.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.jarOfJam', emoji: '🫙', actualPrice: 3.0, currency: '€' },
];

const moderate: PriceGuessingContent[] = [
  { itemKey: 'patientApp.stim.priceGuessing.items.cinemaTicket', emoji: '🎬', actualPrice: 12.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.haircutMens', emoji: '💈', actualPrice: 20.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.bouquetFlowers', emoji: '💐', actualPrice: 15.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.pairOfJeans', emoji: '👖', actualPrice: 50.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.trainTicket', emoji: '🚂', actualPrice: 25.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.restaurantMeal', emoji: '🍽️', actualPrice: 20.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.bottleOfWine', emoji: '🍷', actualPrice: 10.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.weeklyGroceries', emoji: '🛒', actualPrice: 80.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.tankOfPetrol', emoji: '⛽', actualPrice: 70.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.monthlyElectric', emoji: '💡', actualPrice: 60.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.pairShoes', emoji: '👟', actualPrice: 60.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.bookNovel', emoji: '📖', actualPrice: 15.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.umbrellaGood', emoji: '☂️', actualPrice: 25.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.taxiRide5km', emoji: '🚕', actualPrice: 12.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.museumEntry', emoji: '🏛️', actualPrice: 15.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.swimPoolEntry', emoji: '🏊', actualPrice: 8.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.birthdayCake', emoji: '🎂', actualPrice: 30.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.boxChocolates', emoji: '🍬', actualPrice: 12.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.concertTicket', emoji: '🎵', actualPrice: 45.0, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.winterCoat', emoji: '🧥', actualPrice: 80.0, currency: '€' },
];

const challenging: PriceGuessingContent[] = [
  { itemKey: 'patientApp.stim.priceGuessing.items.smallCar', emoji: '🚗', actualPrice: 20000, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.flightToSpain', emoji: '✈️', actualPrice: 150, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.smartphoneNew', emoji: '📱', actualPrice: 800, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.hotelNight', emoji: '🏨', actualPrice: 120, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.washingMachine', emoji: '🧺', actualPrice: 500, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.tvScreen', emoji: '📺', actualPrice: 600, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.vacuumCleaner', emoji: '🧹', actualPrice: 250, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.bicycleNew', emoji: '🚲', actualPrice: 400, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.fridgeFreezer', emoji: '🧊', actualPrice: 700, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.kitchenTable', emoji: '🪑', actualPrice: 300, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.sofa', emoji: '🛋️', actualPrice: 800, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.laptopComputer', emoji: '💻', actualPrice: 900, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.microwave', emoji: '🔲', actualPrice: 100, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.gardenShed', emoji: '🏚️', actualPrice: 1500, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.weekHoliday', emoji: '🏖️', actualPrice: 1000, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.doubleBed', emoji: '🛏️', actualPrice: 500, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.lawnmower', emoji: '🌿', actualPrice: 350, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.dishwasher', emoji: '🍽️', actualPrice: 450, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.coffeeEspresso', emoji: '☕', actualPrice: 200, currency: '€' },
  { itemKey: 'patientApp.stim.priceGuessing.items.electricKettle', emoji: '🫖', actualPrice: 40, currency: '€' },
];

export const PRICE_GUESSING_CONTENT: Record<DifficultyLevel, PriceGuessingContent[]> = {
  gentle,
  moderate,
  challenging,
};
