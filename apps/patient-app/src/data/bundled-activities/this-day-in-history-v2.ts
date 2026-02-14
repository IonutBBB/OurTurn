export interface ThisDayContent {
  events: ThisDayEvent[];
}

export interface ThisDayEvent {
  year: number;
  text: string;
  textKey: string;
  reflectionKey: string;
}

/**
 * Bundled fallback — same facts as the original, restructured for swipeable display.
 * Grouped by month/day for today-matching.
 */
const ALL_EVENTS: Record<string, ThisDayEvent[]> = {
  '01-01': [{ year: 1804, textKey: 'patientApp.stim.history.facts.haitiIndependence', text: '', reflectionKey: 'patientApp.stim.history.reflections.think' }],
  '01-15': [{ year: 1929, textKey: 'patientApp.stim.history.facts.mlkBorn', text: '', reflectionKey: 'patientApp.stim.history.reflections.remember' }],
  '02-01': [{ year: 2003, textKey: 'patientApp.stim.history.facts.columbiaShuttle', text: '', reflectionKey: 'patientApp.stim.history.reflections.think' }],
  '03-07': [{ year: 1876, textKey: 'patientApp.stim.history.facts.bellTelephone', text: '', reflectionKey: 'patientApp.stim.history.reflections.remember' }],
  '03-08': [{ year: 1911, textKey: 'patientApp.stim.history.facts.womensDay', text: '', reflectionKey: 'patientApp.stim.history.reflections.think' }],
  '04-01': [{ year: 1976, textKey: 'patientApp.stim.history.facts.appleFounded', text: '', reflectionKey: 'patientApp.stim.history.reflections.doingIn' }],
  '04-15': [{ year: 1912, textKey: 'patientApp.stim.history.facts.titanicSank', text: '', reflectionKey: 'patientApp.stim.history.reflections.heard' }],
  '04-22': [{ year: 1970, textKey: 'patientApp.stim.history.facts.firstEarthDay', text: '', reflectionKey: 'patientApp.stim.history.reflections.think' }],
  '05-01': [{ year: 1851, textKey: 'patientApp.stim.history.facts.greatExhibition', text: '', reflectionKey: 'patientApp.stim.history.reflections.remember' }],
  '05-08': [{ year: 1945, textKey: 'patientApp.stim.history.facts.veDay', text: '', reflectionKey: 'patientApp.stim.history.reflections.remember' }],
  '05-29': [{ year: 1953, textKey: 'patientApp.stim.history.facts.everestClimbed', text: '', reflectionKey: 'patientApp.stim.history.reflections.think' }],
  '06-02': [{ year: 1953, textKey: 'patientApp.stim.history.facts.queenCoronation', text: '', reflectionKey: 'patientApp.stim.history.reflections.remember' }],
  '06-06': [{ year: 1944, textKey: 'patientApp.stim.history.facts.dDay', text: '', reflectionKey: 'patientApp.stim.history.reflections.heard' }],
  '07-04': [{ year: 1776, textKey: 'patientApp.stim.history.facts.usIndependence', text: '', reflectionKey: 'patientApp.stim.history.reflections.think' }],
  '07-14': [{ year: 1789, textKey: 'patientApp.stim.history.facts.bastilleDay', text: '', reflectionKey: 'patientApp.stim.history.reflections.heard' }],
  '07-20': [{ year: 1969, textKey: 'patientApp.stim.history.facts.moonLanding', text: '', reflectionKey: 'patientApp.stim.history.reflections.doingIn' }],
  '08-06': [{ year: 1991, textKey: 'patientApp.stim.history.facts.worldWideWeb', text: '', reflectionKey: 'patientApp.stim.history.reflections.remember' }],
  '08-15': [{ year: 1969, textKey: 'patientApp.stim.history.facts.woodstock', text: '', reflectionKey: 'patientApp.stim.history.reflections.doingIn' }],
  '09-01': [{ year: 1939, textKey: 'patientApp.stim.history.facts.wwiiStart', text: '', reflectionKey: 'patientApp.stim.history.reflections.heard' }],
  '09-27': [{ year: 1825, textKey: 'patientApp.stim.history.facts.firstRailway', text: '', reflectionKey: 'patientApp.stim.history.reflections.remember' }],
  '10-01': [{ year: 1971, textKey: 'patientApp.stim.history.facts.disneyWorld', text: '', reflectionKey: 'patientApp.stim.history.reflections.doingIn' }],
  '10-14': [{ year: 1947, textKey: 'patientApp.stim.history.facts.soundBarrier', text: '', reflectionKey: 'patientApp.stim.history.reflections.think' }],
  '10-31': [{ year: 1517, textKey: 'patientApp.stim.history.facts.reformation', text: '', reflectionKey: 'patientApp.stim.history.reflections.heard' }],
  '11-09': [{ year: 1989, textKey: 'patientApp.stim.history.facts.berlinWall', text: '', reflectionKey: 'patientApp.stim.history.reflections.remember' }],
  '11-11': [{ year: 1918, textKey: 'patientApp.stim.history.facts.armistice', text: '', reflectionKey: 'patientApp.stim.history.reflections.remember' }],
  '11-22': [{ year: 1963, textKey: 'patientApp.stim.history.facts.jfkAssassination', text: '', reflectionKey: 'patientApp.stim.history.reflections.doingIn' }],
  '12-01': [{ year: 1955, textKey: 'patientApp.stim.history.facts.rosaParks', text: '', reflectionKey: 'patientApp.stim.history.reflections.think' }],
  '12-17': [{ year: 1903, textKey: 'patientApp.stim.history.facts.wrightBrothers', text: '', reflectionKey: 'patientApp.stim.history.reflections.remember' }],
  '12-25': [{ year: 1066, textKey: 'patientApp.stim.history.facts.williamCrowned', text: '', reflectionKey: 'patientApp.stim.history.reflections.heard' }],
};

// Flat list for random selection when no date match
const ALL_EVENTS_FLAT = Object.values(ALL_EVENTS).flat();

export function getThisDayFallback(): ThisDayContent {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const key = `${month}-${day}`;

  const todayEvents = ALL_EVENTS[key];
  if (todayEvents?.length) {
    return { events: todayEvents };
  }

  // No exact match — pick 2 random events
  const shuffled = [...ALL_EVENTS_FLAT].sort(() => Math.random() - 0.5);
  return { events: shuffled.slice(0, 2) };
}

export const THIS_DAY_CONTENT: ThisDayContent[] = ALL_EVENTS_FLAT.map((e) => ({
  events: [e],
}));
