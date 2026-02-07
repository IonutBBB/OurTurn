import { supabase } from '../client';
import type {
  CaregiverWellbeingLog,
  CaregiverWellbeingLogInsert,
  CaregiverWellbeingLogUpdate,
  CaregiverBurnoutAlert,
  SliderValue,
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
 * Log toolkit check-in with slider values (upsert for today)
 */
export async function logToolkitCheckin(
  caregiverId: string,
  data: {
    date: string;
    energy_level?: SliderValue;
    stress_level?: SliderValue;
    sleep_quality_rating?: SliderValue;
    daily_goal?: string;
    goal_completed?: boolean;
    relief_exercises_used?: string[];
  }
): Promise<CaregiverWellbeingLog> {
  const { data: log, error } = await supabase
    .from('caregiver_wellbeing_logs')
    .upsert(
      {
        caregiver_id: caregiverId,
        date: data.date,
        energy_level: data.energy_level,
        stress_level: data.stress_level,
        sleep_quality_rating: data.sleep_quality_rating,
        daily_goal: data.daily_goal,
        goal_completed: data.goal_completed,
        relief_exercises_used: data.relief_exercises_used || [],
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
 * Get toolkit weekly stats (new slider-based)
 */
export async function getToolkitWeeklyStats(
  caregiverId: string,
  days: number = 28
): Promise<{
  avgEnergy: number;
  avgStress: number;
  avgSleep: number;
  goalsCompleted: number;
  goalsTotal: number;
  exercisesUsed: string[];
  trend: { date: string; energy: number | null; stress: number | null; sleep: number | null }[];
}> {
  const logs = await getWellbeingHistory(caregiverId, days);

  const withEnergy = logs.filter((l) => l.energy_level !== null);
  const withStress = logs.filter((l) => l.stress_level !== null);
  const withSleep = logs.filter((l) => l.sleep_quality_rating !== null);

  const avgEnergy = withEnergy.length > 0
    ? withEnergy.reduce((s, l) => s + (l.energy_level || 0), 0) / withEnergy.length
    : 0;
  const avgStress = withStress.length > 0
    ? withStress.reduce((s, l) => s + (l.stress_level || 0), 0) / withStress.length
    : 0;
  const avgSleep = withSleep.length > 0
    ? withSleep.reduce((s, l) => s + (l.sleep_quality_rating || 0), 0) / withSleep.length
    : 0;

  const goalsTotal = logs.filter((l) => l.daily_goal).length;
  const goalsCompleted = logs.filter((l) => l.goal_completed).length;

  const allExercises = logs.flatMap((l) => l.relief_exercises_used || []);
  const exercisesUsed = [...new Set(allExercises)];

  const trend = logs
    .map((l) => ({
      date: l.date,
      energy: l.energy_level,
      stress: l.stress_level,
      sleep: l.sleep_quality_rating,
    }))
    .reverse(); // chronological order

  return { avgEnergy, avgStress, avgSleep, goalsCompleted, goalsTotal, exercisesUsed, trend };
}

/**
 * Check for toolkit burnout warning (stress >= 4 for 3+ days OR energy <= 2 for 3+ days)
 */
export async function checkToolkitBurnoutWarning(
  caregiverId: string
): Promise<boolean> {
  const recentLogs = await getWellbeingHistory(caregiverId, 7);
  const sorted = [...recentLogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let consecutiveHighStress = 0;
  let consecutiveLowEnergy = 0;

  for (const log of sorted) {
    if (log.stress_level !== null && log.stress_level >= 4) {
      consecutiveHighStress++;
    } else {
      consecutiveHighStress = 0;
    }

    if (log.energy_level !== null && log.energy_level <= 2) {
      consecutiveLowEnergy++;
    } else {
      consecutiveLowEnergy = 0;
    }

    if (consecutiveHighStress >= 3 || consecutiveLowEnergy >= 3) {
      return true;
    }
  }

  return false;
}

/**
 * Get burnout alerts for a caregiver
 */
export async function getBurnoutAlerts(
  caregiverId: string,
  onlyActive: boolean = true
): Promise<CaregiverBurnoutAlert[]> {
  let query = supabase
    .from('caregiver_burnout_alerts')
    .select('*')
    .eq('caregiver_id', caregiverId)
    .order('triggered_at', { ascending: false });

  if (onlyActive) {
    query = query.eq('dismissed', false);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data;
}

/**
 * Dismiss a burnout alert
 */
export async function dismissBurnoutAlert(alertId: string): Promise<void> {
  const { error } = await supabase
    .from('caregiver_burnout_alerts')
    .update({
      dismissed: true,
      dismissed_at: new Date().toISOString(),
    })
    .eq('id', alertId);

  if (error) throw error;
}

/**
 * Check for burnout warning (3+ consecutive low mood days) — legacy
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
