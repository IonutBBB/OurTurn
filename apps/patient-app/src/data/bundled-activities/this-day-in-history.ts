/**
 * This Day in History — one fact per day of the year.
 * Keyed by "MM-DD" for date lookup.
 */

import type { DifficultyLevel } from '@ourturn/shared';

export interface HistoryFactContent {
  dateKey: string; // MM-DD
  year: number;
  factKey: string;
  followUpKey: string;
}

// Sample facts for each month — deterministically selected by daily seed
const facts: HistoryFactContent[] = [
  { dateKey: '01-01', year: 1804, factKey: 'patientApp.stim.history.facts.haitiIndependence', followUpKey: 'patientApp.stim.history.followUp.whatDoYouThink' },
  { dateKey: '01-15', year: 1929, factKey: 'patientApp.stim.history.facts.mlkBorn', followUpKey: 'patientApp.stim.history.followUp.whatDoYouThink' },
  { dateKey: '02-01', year: 2003, factKey: 'patientApp.stim.history.facts.columbiaShuttle', followUpKey: 'patientApp.stim.history.followUp.whereWereYou' },
  { dateKey: '02-14', year: 1876, factKey: 'patientApp.stim.history.facts.bellTelephone', followUpKey: 'patientApp.stim.history.followUp.firstMemory' },
  { dateKey: '03-08', year: 1911, factKey: 'patientApp.stim.history.facts.womensDay', followUpKey: 'patientApp.stim.history.followUp.whatDoYouThink' },
  { dateKey: '03-17', year: 461, factKey: 'patientApp.stim.history.facts.stPatrick', followUpKey: 'patientApp.stim.history.followUp.howDoYouCelebrate' },
  { dateKey: '04-01', year: 1976, factKey: 'patientApp.stim.history.facts.appleFounded', followUpKey: 'patientApp.stim.history.followUp.firstComputer' },
  { dateKey: '04-15', year: 1912, factKey: 'patientApp.stim.history.facts.titanicSank', followUpKey: 'patientApp.stim.history.followUp.whatDoYouThink' },
  { dateKey: '05-01', year: 1851, factKey: 'patientApp.stim.history.facts.greatExhibition', followUpKey: 'patientApp.stim.history.followUp.favouriteExhibition' },
  { dateKey: '05-08', year: 1945, factKey: 'patientApp.stim.history.facts.veDay', followUpKey: 'patientApp.stim.history.followUp.whatDoYouKnow' },
  { dateKey: '06-02', year: 1953, factKey: 'patientApp.stim.history.facts.queenCoronation', followUpKey: 'patientApp.stim.history.followUp.whatDoYouRemember' },
  { dateKey: '06-06', year: 1944, factKey: 'patientApp.stim.history.facts.dDay', followUpKey: 'patientApp.stim.history.followUp.whatDoYouKnow' },
  { dateKey: '07-04', year: 1776, factKey: 'patientApp.stim.history.facts.usIndependence', followUpKey: 'patientApp.stim.history.followUp.whatDoYouThink' },
  { dateKey: '07-20', year: 1969, factKey: 'patientApp.stim.history.facts.moonLanding', followUpKey: 'patientApp.stim.history.followUp.whereWereYou' },
  { dateKey: '08-06', year: 1991, factKey: 'patientApp.stim.history.facts.worldWideWeb', followUpKey: 'patientApp.stim.history.followUp.firstInternet' },
  { dateKey: '08-15', year: 1969, factKey: 'patientApp.stim.history.facts.woodstock', followUpKey: 'patientApp.stim.history.followUp.favouriteMusic' },
  { dateKey: '09-01', year: 1939, factKey: 'patientApp.stim.history.facts.wwiiStart', followUpKey: 'patientApp.stim.history.followUp.whatDoYouKnow' },
  { dateKey: '09-15', year: 1830, factKey: 'patientApp.stim.history.facts.firstRailway', followUpKey: 'patientApp.stim.history.followUp.trainMemory' },
  { dateKey: '10-01', year: 1971, factKey: 'patientApp.stim.history.facts.disneyWorld', followUpKey: 'patientApp.stim.history.followUp.favouritePlace' },
  { dateKey: '10-31', year: 1517, factKey: 'patientApp.stim.history.facts.reformation', followUpKey: 'patientApp.stim.history.followUp.whatDoYouThink' },
  { dateKey: '11-09', year: 1989, factKey: 'patientApp.stim.history.facts.berlinWall', followUpKey: 'patientApp.stim.history.followUp.whereWereYou' },
  { dateKey: '11-11', year: 1918, factKey: 'patientApp.stim.history.facts.armistice', followUpKey: 'patientApp.stim.history.followUp.whatDoYouKnow' },
  { dateKey: '12-01', year: 1955, factKey: 'patientApp.stim.history.facts.rosaParks', followUpKey: 'patientApp.stim.history.followUp.whatDoYouThink' },
  { dateKey: '12-25', year: 1066, factKey: 'patientApp.stim.history.facts.williamCrowned', followUpKey: 'patientApp.stim.history.followUp.christmasMemory' },
  // Fill rest of year with rotating facts
  { dateKey: '01-05', year: 1914, factKey: 'patientApp.stim.history.facts.fordWages', followUpKey: 'patientApp.stim.history.followUp.firstJob' },
  { dateKey: '02-06', year: 1952, factKey: 'patientApp.stim.history.facts.elizabethII', followUpKey: 'patientApp.stim.history.followUp.whatDoYouRemember' },
  { dateKey: '03-12', year: 1930, factKey: 'patientApp.stim.history.facts.gandhiSaltMarch', followUpKey: 'patientApp.stim.history.followUp.whatDoYouThink' },
  { dateKey: '04-22', year: 1970, factKey: 'patientApp.stim.history.facts.firstEarthDay', followUpKey: 'patientApp.stim.history.followUp.natureMemory' },
  { dateKey: '05-29', year: 1953, factKey: 'patientApp.stim.history.facts.everestClimbed', followUpKey: 'patientApp.stim.history.followUp.adventure' },
  { dateKey: '06-20', year: 1837, factKey: 'patientApp.stim.history.facts.victoriaQueen', followUpKey: 'patientApp.stim.history.followUp.whatDoYouKnow' },
  { dateKey: '07-14', year: 1789, factKey: 'patientApp.stim.history.facts.bastilleDay', followUpKey: 'patientApp.stim.history.followUp.beenToFrance' },
  { dateKey: '08-25', year: 1609, factKey: 'patientApp.stim.history.facts.galileoTelescope', followUpKey: 'patientApp.stim.history.followUp.starMemory' },
  { dateKey: '09-22', year: 1791, factKey: 'patientApp.stim.history.facts.faradayBorn', followUpKey: 'patientApp.stim.history.followUp.scienceMemory' },
  { dateKey: '10-14', year: 1947, factKey: 'patientApp.stim.history.facts.soundBarrier', followUpKey: 'patientApp.stim.history.followUp.flyingMemory' },
  { dateKey: '11-22', year: 1963, factKey: 'patientApp.stim.history.facts.jfkAssassination', followUpKey: 'patientApp.stim.history.followUp.whereWereYou' },
  { dateKey: '12-17', year: 1903, factKey: 'patientApp.stim.history.facts.wrightBrothers', followUpKey: 'patientApp.stim.history.followUp.flyingMemory' },
];

// For this activity, difficulty doesn't change the content — it changes the follow-up depth
export const HISTORY_CONTENT: Record<DifficultyLevel, HistoryFactContent[]> = {
  gentle: facts,
  moderate: facts,
  challenging: facts,
};

/**
 * Get today's history fact. Falls back to a deterministic pick if no exact date match.
 */
export function getHistoryFactForDate(date: Date, difficulty: DifficultyLevel): HistoryFactContent {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateKey = `${mm}-${dd}`;

  const pool = HISTORY_CONTENT[difficulty];
  const exact = pool.find((f) => f.dateKey === dateKey);
  if (exact) return exact;

  // Fallback: deterministic pick based on day-of-year
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return pool[dayOfYear % pool.length];
}
