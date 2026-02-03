import { supabase } from '../client';
import type {
  BrainActivity,
  BrainActivityInsert,
  BrainActivityUpdate,
  BrainActivityType,
} from '@memoguard/shared';

/**
 * Get today's brain activity for a household
 */
export async function getTodaysActivity(
  householdId: string,
  date: string
): Promise<BrainActivity | null> {
  const { data, error } = await supabase
    .from('brain_activities')
    .select('*')
    .eq('household_id', householdId)
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
 * Save a patient's response to an activity
 */
export async function saveActivityResponse(
  activityId: string,
  responseText?: string,
  audioUrl?: string,
  durationSeconds?: number
): Promise<BrainActivity> {
  const updates: BrainActivityUpdate = {
    completed: true,
  };

  if (responseText) {
    updates.patient_response_text = responseText;
  }
  if (audioUrl) {
    updates.patient_response_audio_url = audioUrl;
  }
  if (durationSeconds) {
    updates.duration_seconds = durationSeconds;
  }

  const { data, error } = await supabase
    .from('brain_activities')
    .update(updates)
    .eq('id', activityId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Get recent activities (to avoid repeats when generating new ones)
 */
export async function getRecentActivities(
  householdId: string,
  days: number = 14
): Promise<BrainActivity[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('brain_activities')
    .select('*')
    .eq('household_id', householdId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) throw error;

  return data;
}

/**
 * Create a new brain activity
 */
export async function createActivity(
  householdId: string,
  activity: Omit<BrainActivityInsert, 'household_id'>
): Promise<BrainActivity> {
  const { data, error } = await supabase
    .from('brain_activities')
    .insert({
      household_id: householdId,
      date: activity.date,
      activity_type: activity.activity_type,
      prompt_text: activity.prompt_text,
      follow_up_text: activity.follow_up_text,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Get activity completion rate
 */
export async function getActivityCompletionRate(
  householdId: string,
  days: number = 30
): Promise<{ completed: number; total: number; rate: number }> {
  const activities = await getRecentActivities(householdId, days);

  const completed = activities.filter((a) => a.completed).length;
  const total = activities.length;
  const rate = total > 0 ? (completed / total) * 100 : 0;

  return { completed, total, rate };
}

/**
 * Get activities by type
 */
export async function getActivitiesByType(
  householdId: string,
  type: BrainActivityType,
  limit: number = 10
): Promise<BrainActivity[]> {
  const { data, error } = await supabase
    .from('brain_activities')
    .select('*')
    .eq('household_id', householdId)
    .eq('activity_type', type)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data;
}

/**
 * Skip today's activity
 */
export async function skipActivity(activityId: string): Promise<BrainActivity> {
  const { data, error } = await supabase
    .from('brain_activities')
    .update({ completed: false })
    .eq('id', activityId)
    .select()
    .single();

  if (error) throw error;

  return data;
}
