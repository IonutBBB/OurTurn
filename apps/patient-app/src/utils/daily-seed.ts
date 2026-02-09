/**
 * Deterministic daily random selection.
 * Uses a date-based hash to pick the same item all day,
 * avoiding confusion for dementia patients.
 */

function hashDateString(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Pick one item from an array deterministically based on today's date.
 * Returns the same item all day so the patient sees consistency.
 */
export function pickDaily<T>(items: T[], date: Date = new Date()): T | null {
  if (!items || items.length === 0) return null;
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const hash = hashDateString(dateStr);
  return items[hash % items.length];
}

/**
 * Pick N items from an array deterministically based on today's date.
 * Shuffles using the date hash as seed, then takes the first N.
 */
export function pickDailyMultiple<T>(items: T[], count: number, date: Date = new Date()): T[] {
  if (!items || items.length === 0) return [];
  const dateStr = date.toISOString().split('T')[0];
  const hash = hashDateString(dateStr);

  // Fisher-Yates shuffle with deterministic seed
  const shuffled = [...items];
  let seed = hash;
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = ((seed * 1103515245) + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}
