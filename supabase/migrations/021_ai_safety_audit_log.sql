-- AI Safety Audit Log
-- Stores metadata about every AI interaction for regulatory compliance.
-- GDPR: No user message content is stored — only classification metadata.

CREATE TABLE IF NOT EXISTS ai_safety_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_role TEXT NOT NULL CHECK (user_role IN ('patient', 'caregiver')),
  safety_level TEXT NOT NULL CHECK (safety_level IN ('green', 'yellow', 'orange', 'red')),
  trigger_category TEXT,
  ai_model_called BOOLEAN NOT NULL DEFAULT true,
  response_approved BOOLEAN NOT NULL DEFAULT true,
  post_process_violations JSONB NOT NULL DEFAULT '[]'::jsonb,
  disclaimer_included BOOLEAN NOT NULL DEFAULT false,
  professional_referral_included BOOLEAN NOT NULL DEFAULT false,
  escalated_to_crisis BOOLEAN NOT NULL DEFAULT false,
  response_time_ms INTEGER NOT NULL DEFAULT 0
);

-- Index for querying by user and time range
CREATE INDEX idx_ai_safety_audit_user_time
  ON ai_safety_audit_log (user_id, created_at DESC);

-- Index for filtering by safety level (for admin review of RED/ORANGE events)
CREATE INDEX idx_ai_safety_audit_level
  ON ai_safety_audit_log (safety_level, created_at DESC);

-- RLS: Users can only see their own audit log entries
ALTER TABLE ai_safety_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON ai_safety_audit_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audit logs"
  ON ai_safety_audit_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);
