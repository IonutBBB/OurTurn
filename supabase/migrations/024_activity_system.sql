-- Migration 024: Brain stimulation activity tracking system
--
-- Adds 3 tables for the clinically-validated brain stimulation activities:
-- 1. activity_sessions — tracks each individual activity attempt
-- 2. activity_difficulty — per-domain difficulty tracking per household
-- 3. activity_content_cache — AI-generated content stored for offline use

-- ============================================================
-- activity_sessions: tracks each activity attempt
-- ============================================================
CREATE TABLE activity_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  cognitive_domain TEXT NOT NULL CHECK (cognitive_domain IN (
    'language', 'numbers', 'executive', 'visual',
    'sound', 'physical', 'creative', 'current_affairs'
  )),
  difficulty_level TEXT NOT NULL DEFAULT 'gentle' CHECK (difficulty_level IN ('gentle', 'moderate', 'challenging')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  score_data JSONB DEFAULT '{}'::jsonb,
  response_data JSONB DEFAULT '{}'::jsonb,
  skipped BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_sessions_household_date ON activity_sessions(household_id, date);
CREATE INDEX idx_activity_sessions_domain ON activity_sessions(household_id, cognitive_domain);

ALTER TABLE activity_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- activity_difficulty: per-domain difficulty per household
-- ============================================================
CREATE TABLE activity_difficulty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  cognitive_domain TEXT NOT NULL CHECK (cognitive_domain IN (
    'language', 'numbers', 'executive', 'visual',
    'sound', 'physical', 'creative', 'current_affairs'
  )),
  current_level TEXT NOT NULL DEFAULT 'gentle' CHECK (current_level IN ('gentle', 'moderate', 'challenging')),
  total_attempts INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  avg_duration_seconds REAL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, cognitive_domain)
);

ALTER TABLE activity_difficulty ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- activity_content_cache: AI-generated content for offline use
-- ============================================================
CREATE TABLE activity_content_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  difficulty_level TEXT NOT NULL DEFAULT 'gentle' CHECK (difficulty_level IN ('gentle', 'moderate', 'challenging')),
  content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, activity_type, date)
);

CREATE INDEX idx_activity_content_cache_lookup ON activity_content_cache(household_id, date);

ALTER TABLE activity_content_cache ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies: anon access for patient app
-- ============================================================

-- activity_sessions: patient can read, insert, update
CREATE POLICY "anon_patient_read_activity_sessions"
  ON activity_sessions FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon_patient_insert_activity_sessions"
  ON activity_sessions FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_patient_update_activity_sessions"
  ON activity_sessions FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

-- activity_difficulty: patient can read, insert, update
CREATE POLICY "anon_patient_read_activity_difficulty"
  ON activity_difficulty FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon_patient_insert_activity_difficulty"
  ON activity_difficulty FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_patient_update_activity_difficulty"
  ON activity_difficulty FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

-- activity_content_cache: patient can read
CREATE POLICY "anon_patient_read_activity_content_cache"
  ON activity_content_cache FOR SELECT TO anon
  USING (true);

-- Caregiver RLS (authenticated role) — read via household membership
CREATE POLICY "caregiver_read_activity_sessions"
  ON activity_sessions FOR SELECT TO authenticated
  USING (
    household_id IN (
      SELECT household_id FROM caregivers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "caregiver_read_activity_difficulty"
  ON activity_difficulty FOR SELECT TO authenticated
  USING (
    household_id IN (
      SELECT household_id FROM caregivers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "caregiver_read_activity_content_cache"
  ON activity_content_cache FOR SELECT TO authenticated
  USING (
    household_id IN (
      SELECT household_id FROM caregivers WHERE user_id = auth.uid()
    )
  );
