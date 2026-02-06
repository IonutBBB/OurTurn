import { supabase } from '../client';
import type {
  DailyCheckin,
  DailyCheckinInsert,
  DailyCheckinUpdate,
} from '@ourturn/shared';

/**
 * Submit a daily check-in
 */
export async function submitCheckin(
  householdId: string,
  data: Omit<DailyCheckinInsert, 'household_id'>
): Promise<DailyCheckin> {
  const { data: checkin, error } = await supabase
    .from('daily_checkins')
    .upsert(
      {
        household_id: householdId,
        date: data.date,
        mood: data.mood,
        sleep_quality: data.sleep_quality,
        voice_note_url: data.voice_note_url,
        voice_note_transcript: data.voice_note_transcript,
        submitted_at: data.submitted_at || new Date().toISOString(),
      },
      { onConflict: 'household_id,date' }
    )
    .select()
    .single();

  if (error) throw error;

  return checkin;
}

/**
 * Get today's check-in for a household
 */
export async function getCheckin(
  householdId: string,
  date: string
): Promise<DailyCheckin | null> {
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('household_id', householdId)
    .eq('date', date)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Get check-in history for a household
 */
export async function getCheckinHistory(
  householdId: string,
  days: number = 30
): Promise<DailyCheckin[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('household_id', householdId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) throw error;

  return data;
}

/**
 * Update a check-in (e.g., add voice note transcript)
 */
export async function updateCheckin(
  checkinId: string,
  updates: DailyCheckinUpdate
): Promise<DailyCheckin> {
  const { data, error } = await supabase
    .from('daily_checkins')
    .update(updates)
    .eq('id', checkinId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Get check-ins for a date range (for reports)
 */
export async function getCheckinRange(
  householdId: string,
  startDate: string,
  endDate: string
): Promise<DailyCheckin[]> {
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('household_id', householdId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) throw error;

  return data;
}

/**
 * Get mood statistics for a date range
 */
export async function getMoodStats(
  householdId: string,
  days: number = 30
): Promise<{
  averageMood: number;
  moodCounts: Record<number, number>;
  averageSleep: number;
  sleepCounts: Record<number, number>;
}> {
  const checkins = await getCheckinHistory(householdId, days);

  const moodCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const sleepCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  let moodSum = 0;
  let moodCount = 0;
  let sleepSum = 0;
  let sleepCount = 0;

  for (const checkin of checkins) {
    if (checkin.mood) {
      moodCounts[checkin.mood] = (moodCounts[checkin.mood] || 0) + 1;
      moodSum += checkin.mood;
      moodCount++;
    }
    if (checkin.sleep_quality) {
      sleepCounts[checkin.sleep_quality] = (sleepCounts[checkin.sleep_quality] || 0) + 1;
      sleepSum += checkin.sleep_quality;
      sleepCount++;
    }
  }

  return {
    averageMood: moodCount > 0 ? moodSum / moodCount : 0,
    moodCounts,
    averageSleep: sleepCount > 0 ? sleepSum / sleepCount : 0,
    sleepCounts,
  };
}
