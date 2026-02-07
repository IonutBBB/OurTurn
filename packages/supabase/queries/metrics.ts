import { supabase } from '../client';
import type { EngagementMetrics } from '@ourturn/shared';

/**
 * Get daily metrics for a specific date
 */
export async function getDailyMetrics(
  householdId: string,
  date: string
): Promise<EngagementMetrics | null> {
  const { data, error } = await supabase
    .from('engagement_metrics')
    .select('*')
    .eq('household_id', householdId)
    .eq('date', date)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

/**
 * Get metrics for a date range
 */
export async function getMetricsRange(
  householdId: string,
  startDate: string,
  endDate: string
): Promise<EngagementMetrics[]> {
  const { data, error } = await supabase
    .from('engagement_metrics')
    .select('*')
    .eq('household_id', householdId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) throw error;

  return data || [];
}

/**
 * Get weekly average metrics
 */
export async function getWeeklyAverage(
  householdId: string,
  days: number = 7
): Promise<{
  avgTaskCompletion: number;
  avgMood: number;
  checkinRate: number;
  totalAlerts: number;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const metrics = await getMetricsRange(
    householdId,
    startDate.toISOString().split('T')[0],
    new Date().toISOString().split('T')[0]
  );

  if (metrics.length === 0) {
    return { avgTaskCompletion: 0, avgMood: 0, checkinRate: 0, totalAlerts: 0 };
  }

  const avgTaskCompletion =
    metrics.reduce((sum, m) => {
      const rate = m.tasks_total > 0 ? m.tasks_completed / m.tasks_total : 0;
      return sum + rate;
    }, 0) / metrics.length;

  const moodEntries = metrics.filter((m) => m.checkin_mood !== null);
  const avgMood =
    moodEntries.length > 0
      ? moodEntries.reduce((sum, m) => sum + (m.checkin_mood || 0), 0) / moodEntries.length
      : 0;

  const checkinRate =
    metrics.filter((m) => m.checkin_completed).length / metrics.length;

  const totalAlerts = metrics.reduce((sum, m) => sum + m.location_alerts_count, 0);

  return { avgTaskCompletion, avgMood, checkinRate, totalAlerts };
}
