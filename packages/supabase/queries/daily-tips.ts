import { supabase } from '../client';
import type { AiDailyTip, TipCategory } from '@ourturn/shared';

/**
 * Get today's AI daily tip for a caregiver
 */
export async function getTodaysTip(
  caregiverId: string,
  date: string
): Promise<AiDailyTip | null> {
  const { data, error } = await supabase
    .from('ai_daily_tips')
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
 * Save (upsert) a daily tip
 */
export async function saveDailyTip(data: {
  caregiver_id: string;
  date: string;
  tip_text: string;
  tip_category: TipCategory;
}): Promise<AiDailyTip> {
  const { data: tip, error } = await supabase
    .from('ai_daily_tips')
    .upsert(
      {
        caregiver_id: data.caregiver_id,
        date: data.date,
        tip_text: data.tip_text,
        tip_category: data.tip_category,
      },
      { onConflict: 'caregiver_id,date' }
    )
    .select()
    .single();

  if (error) throw error;

  return tip;
}

/**
 * Dismiss today's tip
 */
export async function dismissTip(tipId: string): Promise<void> {
  const { error } = await supabase
    .from('ai_daily_tips')
    .update({ dismissed: true })
    .eq('id', tipId);

  if (error) throw error;
}
