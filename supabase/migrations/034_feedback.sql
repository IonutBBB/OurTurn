-- 034: Feedback table for in-app bug reports, feature suggestions, and general feedback

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('bug_report', 'feature_suggestion', 'general_feedback')),
  message TEXT NOT NULL,
  app_version TEXT,
  platform TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for querying feedback by household
CREATE INDEX idx_feedback_household ON feedback(household_id);

-- RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Caregivers can insert feedback for their own household
CREATE POLICY "Caregivers can insert own feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (
    caregiver_id IN (
      SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
  );

-- Caregivers can read their own submissions
CREATE POLICY "Caregivers can read own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (
    caregiver_id IN (
      SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
  );
