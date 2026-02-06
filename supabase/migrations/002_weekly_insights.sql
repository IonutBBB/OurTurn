-- OurTurn Weekly Insights Table
-- Migration: 002_weekly_insights.sql
-- Created: 2026-02-03

-- =============================================================================
-- TABLE 15: WEEKLY_INSIGHTS
-- =============================================================================
-- Stores AI-generated weekly insights for each household

CREATE TABLE weekly_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  insights JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Each insight has: { insight: string, suggestion: string, category: 'positive' | 'attention' | 'suggestion' }
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (household_id, week_start)
);

CREATE INDEX idx_weekly_insights_household_id ON weekly_insights(household_id);
CREATE INDEX idx_weekly_insights_week_start ON weekly_insights(week_start DESC);

-- Enable RLS
ALTER TABLE weekly_insights ENABLE ROW LEVEL SECURITY;

-- Caregivers can read their household's insights
CREATE POLICY "caregivers_read_own_insights" ON weekly_insights
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );

-- Service role can insert/update (for cron job)
-- This is handled by using service_role key in Edge Function
