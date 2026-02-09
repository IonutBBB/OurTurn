import { supabase } from '../client';
import type {
  ActivitySession,
  ActivitySessionInsert,
  ActivityDifficulty,
  ActivityContentCache,
  CognitiveDomain,
  DifficultyLevel,
} from '@ourturn/shared';

/**
 * Create a new activity session (when patient starts an activity)
 */
export async function createActivitySession(
  session: ActivitySessionInsert
): Promise<ActivitySession> {
  const { data, error } = await supabase
    .from('activity_sessions')
    .insert(session)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Complete an activity session
 */
export async function completeActivitySession(
  sessionId: string,
  scoreData?: Record<string, unknown>,
  responseData?: Record<string, unknown>,
  durationSeconds?: number
): Promise<ActivitySession> {
  const updates: Partial<ActivitySession> = {
    completed_at: new Date().toISOString(),
    duration_seconds: durationSeconds,
  };
  if (scoreData) updates.score_data = scoreData;
  if (responseData) updates.response_data = responseData;

  const { data, error } = await supabase
    .from('activity_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark a session as skipped
 */
export async function skipActivitySession(
  sessionId: string
): Promise<ActivitySession> {
  const { data, error } = await supabase
    .from('activity_sessions')
    .update({ skipped: true, completed_at: new Date().toISOString() })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all sessions for a specific date
 */
export async function getSessionsForDate(
  householdId: string,
  date: string
): Promise<ActivitySession[]> {
  const { data, error } = await supabase
    .from('activity_sessions')
    .select('*')
    .eq('household_id', householdId)
    .eq('date', date)
    .order('started_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get recent sessions (for difficulty adjustment)
 */
export async function getRecentSessions(
  householdId: string,
  domain: CognitiveDomain,
  limit: number = 7
): Promise<ActivitySession[]> {
  const { data, error } = await supabase
    .from('activity_sessions')
    .select('*')
    .eq('household_id', householdId)
    .eq('cognitive_domain', domain)
    .eq('skipped', false)
    .not('completed_at', 'is', null)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Get domain difficulty for a household
 */
export async function getDomainDifficulty(
  householdId: string,
  domain: CognitiveDomain
): Promise<ActivityDifficulty | null> {
  const { data, error } = await supabase
    .from('activity_difficulty')
    .select('*')
    .eq('household_id', householdId)
    .eq('cognitive_domain', domain)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/**
 * Upsert domain difficulty
 */
export async function upsertDomainDifficulty(
  householdId: string,
  domain: CognitiveDomain,
  level: DifficultyLevel,
  totalAttempts: number,
  totalCompletions: number,
  avgDuration: number
): Promise<ActivityDifficulty> {
  const { data, error } = await supabase
    .from('activity_difficulty')
    .upsert(
      {
        household_id: householdId,
        cognitive_domain: domain,
        current_level: level,
        total_attempts: totalAttempts,
        total_completions: totalCompletions,
        avg_duration_seconds: avgDuration,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'household_id,cognitive_domain' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get cached AI content for an activity
 */
export async function getCachedContent(
  householdId: string,
  activityType: string,
  date: string
): Promise<ActivityContentCache | null> {
  const { data, error } = await supabase
    .from('activity_content_cache')
    .select('*')
    .eq('household_id', householdId)
    .eq('activity_type', activityType)
    .eq('date', date)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}
