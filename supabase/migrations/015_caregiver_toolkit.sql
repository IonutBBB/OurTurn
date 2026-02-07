-- Caregiver Toolkit: enhanced wellbeing tracking, help requests, AI daily tips
-- Replaces passive mood diary with actionable support hub

-- ============================================================
-- 1. Alter caregiver_wellbeing_logs — add slider columns + goal tracking
-- ============================================================
ALTER TABLE caregiver_wellbeing_logs
  ADD COLUMN IF NOT EXISTS energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS sleep_quality_rating INTEGER CHECK (sleep_quality_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS daily_goal TEXT,
  ADD COLUMN IF NOT EXISTS goal_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS relief_exercises_used JSONB DEFAULT '[]';

-- Mark old columns as deprecated (kept for backward compat)
COMMENT ON COLUMN caregiver_wellbeing_logs.mood IS 'DEPRECATED — replaced by energy_level + stress_level sliders';
COMMENT ON COLUMN caregiver_wellbeing_logs.self_care_checklist IS 'DEPRECATED — replaced by relief_exercises_used + daily_goal';

-- ============================================================
-- 2. New table: caregiver_help_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS caregiver_help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  template_key TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'expired')),
  responded_by UUID REFERENCES caregivers(id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

CREATE INDEX idx_help_requests_household ON caregiver_help_requests(household_id);
CREATE INDEX idx_help_requests_requester ON caregiver_help_requests(requester_id);
CREATE INDEX idx_help_requests_status ON caregiver_help_requests(status) WHERE status = 'pending';

-- RLS for caregiver_help_requests
ALTER TABLE caregiver_help_requests ENABLE ROW LEVEL SECURITY;

-- All caregivers in same household can read
CREATE POLICY "Caregivers can read household help requests"
  ON caregiver_help_requests FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM caregivers WHERE id = auth.uid()
    )
  );

-- Only requester can insert
CREATE POLICY "Caregivers can create help requests"
  ON caregiver_help_requests FOR INSERT
  WITH CHECK (requester_id = auth.uid());

-- Any household caregiver can respond (update)
CREATE POLICY "Caregivers can respond to household help requests"
  ON caregiver_help_requests FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM caregivers WHERE id = auth.uid()
    )
  );

-- ============================================================
-- 3. New table: ai_daily_tips
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_daily_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tip_text TEXT NOT NULL,
  tip_category TEXT NOT NULL CHECK (tip_category IN ('respite', 'delegation', 'exercise', 'insight', 'self_care')),
  dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(caregiver_id, date)
);

CREATE INDEX idx_daily_tips_caregiver_date ON ai_daily_tips(caregiver_id, date);

-- RLS for ai_daily_tips
ALTER TABLE ai_daily_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can read own tips"
  ON ai_daily_tips FOR SELECT
  USING (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can update own tips"
  ON ai_daily_tips FOR UPDATE
  USING (caregiver_id = auth.uid());

-- Service role inserts tips (from API route), so no INSERT policy for users
-- Allow upsert from authenticated users too (API route runs as user)
CREATE POLICY "Caregivers can insert own tips"
  ON ai_daily_tips FOR INSERT
  WITH CHECK (caregiver_id = auth.uid());

-- ============================================================
-- 4. Update GDPR deletion functions to include new tables
-- ============================================================
CREATE OR REPLACE FUNCTION delete_household_data(p_household_id UUID, p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete in order to respect foreign key constraints
  DELETE FROM ai_daily_tips WHERE caregiver_id IN (
    SELECT id FROM caregivers WHERE household_id = p_household_id
  );
  DELETE FROM caregiver_help_requests WHERE household_id = p_household_id;
  DELETE FROM ai_conversations WHERE household_id = p_household_id;
  DELETE FROM caregiver_wellbeing_logs WHERE caregiver_id = p_user_id;
  DELETE FROM weekly_insights WHERE household_id = p_household_id;
  DELETE FROM doctor_visit_reports WHERE household_id = p_household_id;
  DELETE FROM brain_activities WHERE household_id = p_household_id;
  DELETE FROM location_alerts WHERE household_id = p_household_id;
  DELETE FROM safe_zones WHERE household_id = p_household_id;
  DELETE FROM location_logs WHERE household_id = p_household_id;
  DELETE FROM care_journal_entries WHERE household_id = p_household_id;
  DELETE FROM daily_checkins WHERE household_id = p_household_id;
  DELETE FROM task_completions WHERE household_id = p_household_id;
  DELETE FROM care_plan_tasks WHERE household_id = p_household_id;
  DELETE FROM caregivers WHERE id = p_user_id;
  DELETE FROM patients WHERE household_id = p_household_id;
  DELETE FROM households WHERE id = p_household_id;
  -- Note: auth.users deletion handled separately via admin API
END;
$$;

CREATE OR REPLACE FUNCTION delete_caregiver_data(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM ai_daily_tips WHERE caregiver_id = p_user_id;
  DELETE FROM caregiver_help_requests WHERE requester_id = p_user_id;
  DELETE FROM ai_conversations WHERE caregiver_id = p_user_id;
  DELETE FROM caregiver_wellbeing_logs WHERE caregiver_id = p_user_id;
  DELETE FROM caregivers WHERE id = p_user_id;
  -- Note: auth.users deletion handled separately via admin API
END;
$$;
