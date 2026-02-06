import { supabase } from '../client';
import type {
  CaregiverWellbeingLog,
  CaregiverWellbeingLogInsert,
  CaregiverWellbeingLogUpdate,
} from '@ourturn/shared';

/**
 * Log caregiver wellbeing (insert or update for today)
 */
export async function logWellbeing(
  caregiverId: string,
  data: Omit<CaregiverWellbeingLogInsert, 'caregiver_id'>
): Promise<CaregiverWellbeingLog> {
  const { data: log, error } = await supabase
    .from('caregiver_wellbeing_logs')
    .upsert(
      {
        caregiver_id: caregiverId,
        date: data.date,
        mood: data.mood,
        self_care_checklist: data.self_care_checklist || {},
        notes: data.notes,
      },
      { onConflict: 'caregiver_id,date' }
    )
    .select()
    .single();

  if (error) throw error;

  return log;
}

/**
 * Get wellbeing history for a caregiver
 */
export async function getWellbeingHistory(
  caregiverId: string,
  days: number = 30
): Promise<CaregiverWellbeingLog[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('caregiver_wellbeing_logs')
    .select('*')
    .eq('caregiver_id', caregiverId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) throw error;

  return data;
}

/**
 * Get today's wellbeing log
 */
export async function getTodaysWellbeing(
  caregiverId: string,
  date: string
): Promise<CaregiverWellbeingLog | null> {
  const { data, error } = await supabase
    .from('caregiver_wellbeing_logs')
    .select('*')
    .eq('caregiver_id', caregiverId)
    .eq('date', date)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Update wellbeing log
 */
export async function updateWellbeing(
  logId: string,
  updates: CaregiverWellbeingLogUpdate
): Promise<CaregiverWellbeingLog> {
  const { data, error } = await supabase
    .from('caregiver_wellbeing_logs')
    .update(updates)
    .eq('id', logId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Get wellbeing statistics
 */
export async function getWellbeingStats(
  caregiverId: string,
  days: number = 30
): Promise<{
  averageMood: number;
  moodTrend: 'improving' | 'stable' | 'declining';
  selfCareCompletion: Record<string, number>;
  lowMoodDays: number;
}> {
  const logs = await getWellbeingHistory(caregiverId, days);

  if (logs.length === 0) {
    return {
      averageMood: 0,
      moodTrend: 'stable',
      selfCareCompletion: {},
      lowMoodDays: 0,
    };
  }

  // Calculate average mood
  const moodsWithValues = logs.filter((l) => l.mood !== null);
  const averageMood =
    moodsWithValues.length > 0
      ? moodsWithValues.reduce((sum, l) => sum + (l.mood || 0), 0) /
        moodsWithValues.length
      : 0;

  // Calculate mood trend (compare first half vs second half)
  const midpoint = Math.floor(moodsWithValues.length / 2);
  const recentHalf = moodsWithValues.slice(0, midpoint);
  const olderHalf = moodsWithValues.slice(midpoint);

  const recentAvg =
    recentHalf.length > 0
      ? recentHalf.reduce((sum, l) => sum + (l.mood || 0), 0) / recentHalf.length
      : 0;
  const olderAvg =
    olderHalf.length > 0
      ? olderHalf.reduce((sum, l) => sum + (l.mood || 0), 0) / olderHalf.length
      : 0;

  let moodTrend: 'improving' | 'stable' | 'declining' = 'stable';
  if (recentAvg - olderAvg > 0.5) {
    moodTrend = 'improving';
  } else if (olderAvg - recentAvg > 0.5) {
    moodTrend = 'declining';
  }

  // Calculate self-care completion rates
  const selfCareKeys = [
    'took_break',
    'ate_well',
    'talked_to_friend',
    'did_something_enjoyable',
    'got_exercise',
    'got_enough_sleep',
  ];

  const selfCareCompletion: Record<string, number> = {};
  for (const key of selfCareKeys) {
    const completed = logs.filter(
      (l) => l.self_care_checklist && (l.self_care_checklist as Record<string, boolean>)[key]
    ).length;
    selfCareCompletion[key] = logs.length > 0 ? (completed / logs.length) * 100 : 0;
  }

  // Count low mood days (mood <= 2)
  const lowMoodDays = logs.filter((l) => l.mood !== null && l.mood <= 2).length;

  return {
    averageMood,
    moodTrend,
    selfCareCompletion,
    lowMoodDays,
  };
}

/**
 * Check for burnout warning (3+ consecutive low mood days)
 */
export async function checkBurnoutWarning(
  caregiverId: string
): Promise<boolean> {
  const recentLogs = await getWellbeingHistory(caregiverId, 7);

  // Check for 3+ consecutive days with mood <= 2
  let consecutiveLowDays = 0;

  for (const log of recentLogs) {
    if (log.mood !== null && log.mood <= 2) {
      consecutiveLowDays++;
      if (consecutiveLowDays >= 3) {
        return true;
      }
    } else {
      consecutiveLowDays = 0;
    }
  }

  return false;
}
