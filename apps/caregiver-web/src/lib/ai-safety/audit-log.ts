/**
 * AUDIT LOG
 * Every AI interaction is logged for regulatory compliance.
 *
 * GDPR NOTE: Log the safety classification and trigger,
 * NOT the full user message content.
 */

import { createLogger } from '@/lib/logger';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SafetyLevel } from './classifier';

const log = createLogger('ai-safety/audit');

export interface SafetyAuditEntry {
  session_id: string;
  user_id: string;
  user_role: 'patient' | 'caregiver';
  safety_level: SafetyLevel;
  trigger_category: string | null;
  ai_model_called: boolean;
  response_approved: boolean;
  post_process_violations: string[];
  disclaimer_included: boolean;
  professional_referral_included: boolean;
  escalated_to_crisis: boolean;
  response_time_ms: number;
}

/**
 * Log a safety event to the Supabase ai_safety_audit_log table.
 * Falls back to local logger if DB write fails.
 */
export async function logSafetyEvent(
  supabase: SupabaseClient | null,
  entry: SafetyAuditEntry,
): Promise<void> {
  // Always log locally for immediate observability
  log.info('Safety event', {
    safetyLevel: entry.safety_level,
    triggerCategory: entry.trigger_category,
    aiModelCalled: String(entry.ai_model_called),
    responseApproved: String(entry.response_approved),
    escalatedToCrisis: String(entry.escalated_to_crisis),
    responseTimeMs: String(entry.response_time_ms),
  });

  // Attempt DB write
  if (supabase) {
    try {
      const { error } = await supabase
        .from('ai_safety_audit_log')
        .insert({
          session_id: entry.session_id,
          user_id: entry.user_id,
          user_role: entry.user_role,
          safety_level: entry.safety_level,
          trigger_category: entry.trigger_category,
          ai_model_called: entry.ai_model_called,
          response_approved: entry.response_approved,
          post_process_violations: entry.post_process_violations,
          disclaimer_included: entry.disclaimer_included,
          professional_referral_included: entry.professional_referral_included,
          escalated_to_crisis: entry.escalated_to_crisis,
          response_time_ms: entry.response_time_ms,
        })
        .select();

      if (error) {
        log.warn('Failed to write audit log to DB, logged locally', {
          error: String(error),
        });
      }
    } catch (err) {
      log.warn('Audit log DB write threw, logged locally', {
        error: err instanceof Error ? err.message : 'Unknown',
      });
    }
  }
}
