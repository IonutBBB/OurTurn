/**
 * Wikipedia Feed API — "On this day" events.
 * Free, no auth required.
 */

interface ThisDayEvent {
  year: number;
  text: string;
  reflectionKey: string;
}

interface ThisDayContent {
  events: ThisDayEvent[];
}

const REFLECTION_KEYS = [
  'patientApp.stim.history.reflections.remember',
  'patientApp.stim.history.reflections.doingIn',
  'patientApp.stim.history.reflections.think',
  'patientApp.stim.history.reflections.heard',
];

export async function fetchThisDayContent(): Promise<ThisDayContent | null> {
  try {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const res = await fetch(
      `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/selected/${month}/${day}`,
      {
        headers: { 'User-Agent': 'OurTurnCareApp/1.0' },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.selected?.length) return null;

    // Pick 2-3 events that are interesting and have reasonable years
    const candidates = data.selected
      .filter((e: { year: number }) => e.year >= 1800)
      .slice(0, 10);

    const picked = candidates.slice(0, 3).map((e: { year: number; text: string }, i: number) => ({
      year: e.year,
      text: e.text,
      reflectionKey: REFLECTION_KEYS[i % REFLECTION_KEYS.length],
    }));

    return { events: picked };
  } catch {
    return null;
  }
}
