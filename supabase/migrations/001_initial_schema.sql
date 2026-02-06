-- OurTurn Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Created: 2026-02-03

-- =============================================================================
-- EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Auto-generate unique 6-digit care code
CREATE OR REPLACE FUNCTION generate_care_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM households WHERE care_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  NEW.care_code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABLE 1: HOUSEHOLDS
-- =============================================================================
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_code TEXT UNIQUE NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  country TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'plus', 'cancelled')),
  subscription_platform TEXT CHECK (subscription_platform IN ('web', 'ios', 'android')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_care_code
  BEFORE INSERT ON households
  FOR EACH ROW
  WHEN (NEW.care_code IS NULL)
  EXECUTE FUNCTION generate_care_code();

CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON households
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_households_care_code ON households(care_code);

-- =============================================================================
-- TABLE 2: PATIENTS
-- =============================================================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,
  date_of_birth DATE,
  dementia_type TEXT,
  stage TEXT DEFAULT 'early' CHECK (stage IN ('early', 'moderate', 'advanced')),
  home_address_formatted TEXT,
  home_latitude FLOAT8,
  home_longitude FLOAT8,
  medications JSONB DEFAULT '[]'::jsonb,
  biography JSONB DEFAULT '{}'::jsonb,
  photos TEXT[] DEFAULT '{}',
  wake_time TIME DEFAULT '08:00',
  sleep_time TIME DEFAULT '21:00',
  emergency_number TEXT,
  device_tokens JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_patients_household_id ON patients(household_id);

-- =============================================================================
-- TABLE 3: CAREGIVERS
-- =============================================================================
CREATE TABLE caregivers (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  relationship TEXT,
  role TEXT DEFAULT 'primary' CHECK (role IN ('primary', 'family_member')),
  permissions JSONB DEFAULT '{"can_edit_plan": true, "receives_alerts": true}'::jsonb,
  language_preference TEXT DEFAULT 'en',
  notification_preferences JSONB DEFAULT '{"safety_alerts": true, "daily_summary": true, "email_notifications": true}'::jsonb,
  device_tokens JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_caregivers_updated_at
  BEFORE UPDATE ON caregivers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_caregivers_household_id ON caregivers(household_id);
CREATE INDEX idx_caregivers_email ON caregivers(email);

-- =============================================================================
-- TABLE 4: CARE_PLAN_TASKS
-- =============================================================================
CREATE TABLE care_plan_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('medication', 'nutrition', 'physical', 'cognitive', 'social', 'health')),
  title TEXT NOT NULL,
  hint_text TEXT,
  time TIME NOT NULL,
  recurrence TEXT DEFAULT 'daily' CHECK (recurrence IN ('daily', 'specific_days', 'one_time')),
  recurrence_days TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  one_time_date DATE,
  created_by UUID REFERENCES caregivers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_care_plan_tasks_updated_at
  BEFORE UPDATE ON care_plan_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_care_plan_tasks_household_id ON care_plan_tasks(household_id);
CREATE INDEX idx_care_plan_tasks_active ON care_plan_tasks(active);
CREATE INDEX idx_care_plan_tasks_time ON care_plan_tasks(time);

-- =============================================================================
-- TABLE 5: TASK_COMPLETIONS
-- =============================================================================
CREATE TABLE task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES care_plan_tasks(id) ON DELETE CASCADE NOT NULL,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  skipped BOOLEAN DEFAULT false,
  UNIQUE (task_id, date)
);

CREATE INDEX idx_task_completions_household_id ON task_completions(household_id);
CREATE INDEX idx_task_completions_date ON task_completions(date);
CREATE INDEX idx_task_completions_task_id ON task_completions(task_id);

-- =============================================================================
-- TABLE 6: DAILY_CHECKINS
-- =============================================================================
CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 3),
  voice_note_url TEXT,
  voice_note_transcript TEXT,
  submitted_at TIMESTAMPTZ,
  ai_summary TEXT,
  UNIQUE (household_id, date)
);

CREATE INDEX idx_daily_checkins_household_id ON daily_checkins(household_id);
CREATE INDEX idx_daily_checkins_date ON daily_checkins(date);

-- =============================================================================
-- TABLE 7: CARE_JOURNAL_ENTRIES
-- =============================================================================
CREATE TABLE care_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES caregivers(id) ON DELETE SET NULL NOT NULL,
  content TEXT NOT NULL,
  entry_type TEXT DEFAULT 'note' CHECK (entry_type IN ('observation', 'note', 'milestone')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_care_journal_entries_household_id ON care_journal_entries(household_id);
CREATE INDEX idx_care_journal_entries_created_at ON care_journal_entries(created_at DESC);

-- =============================================================================
-- TABLE 8: LOCATION_LOGS
-- =============================================================================
CREATE TABLE location_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  location_label TEXT DEFAULT 'unknown',
  accuracy_meters FLOAT8
);

CREATE INDEX idx_location_logs_household_id ON location_logs(household_id);
CREATE INDEX idx_location_logs_patient_id ON location_logs(patient_id);
CREATE INDEX idx_location_logs_timestamp ON location_logs(timestamp DESC);

-- =============================================================================
-- TABLE 9: SAFE_ZONES
-- =============================================================================
CREATE TABLE safe_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 200,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_safe_zones_household_id ON safe_zones(household_id);
CREATE INDEX idx_safe_zones_active ON safe_zones(active);

-- =============================================================================
-- TABLE 10: LOCATION_ALERTS
-- =============================================================================
CREATE TABLE location_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('left_safe_zone', 'inactive', 'night_movement', 'take_me_home_tapped')),
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  latitude FLOAT8,
  longitude FLOAT8,
  location_label TEXT,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES caregivers(id) ON DELETE SET NULL
);

CREATE INDEX idx_location_alerts_household_id ON location_alerts(household_id);
CREATE INDEX idx_location_alerts_triggered_at ON location_alerts(triggered_at DESC);
CREATE INDEX idx_location_alerts_acknowledged ON location_alerts(acknowledged);

-- =============================================================================
-- TABLE 11: AI_CONVERSATIONS
-- =============================================================================
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID REFERENCES caregivers(id) ON DELETE CASCADE NOT NULL,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_ai_conversations_caregiver_id ON ai_conversations(caregiver_id);
CREATE INDEX idx_ai_conversations_household_id ON ai_conversations(household_id);

-- =============================================================================
-- TABLE 12: CAREGIVER_WELLBEING_LOGS
-- =============================================================================
CREATE TABLE caregiver_wellbeing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID REFERENCES caregivers(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  self_care_checklist JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  UNIQUE (caregiver_id, date)
);

CREATE INDEX idx_caregiver_wellbeing_logs_caregiver_id ON caregiver_wellbeing_logs(caregiver_id);
CREATE INDEX idx_caregiver_wellbeing_logs_date ON caregiver_wellbeing_logs(date DESC);

-- =============================================================================
-- TABLE 13: BRAIN_ACTIVITIES
-- =============================================================================
CREATE TABLE brain_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('reminiscence', 'photo', 'word_game', 'music', 'creative', 'orientation')),
  prompt_text TEXT NOT NULL,
  follow_up_text TEXT,
  patient_response_text TEXT,
  patient_response_audio_url TEXT,
  completed BOOLEAN DEFAULT false,
  duration_seconds INTEGER,
  UNIQUE (household_id, date)
);

CREATE INDEX idx_brain_activities_household_id ON brain_activities(household_id);
CREATE INDEX idx_brain_activities_date ON brain_activities(date DESC);

-- =============================================================================
-- TABLE 14: DOCTOR_VISIT_REPORTS
-- =============================================================================
CREATE TABLE doctor_visit_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  generated_by UUID REFERENCES caregivers(id) ON DELETE SET NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  content_json JSONB,
  pdf_url TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_doctor_visit_reports_household_id ON doctor_visit_reports(household_id);
CREATE INDEX idx_doctor_visit_reports_generated_at ON doctor_visit_reports(generated_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_plan_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE safe_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregiver_wellbeing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE brain_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_visit_reports ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- CAREGIVER ACCESS POLICIES (via Supabase Auth)
-- Caregivers can access their own household's data
-- -----------------------------------------------------------------------------

-- Households: caregivers can read/update their own household
CREATE POLICY "caregivers_read_own_household" ON households
  FOR SELECT USING (
    id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );

CREATE POLICY "caregivers_update_own_household" ON households
  FOR UPDATE USING (
    id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );

-- Patients: caregivers can CRUD their household's patient
CREATE POLICY "caregivers_all_own_patient" ON patients
  FOR ALL USING (
    household_id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );

-- Caregivers: can read all caregivers in their household, update themselves
CREATE POLICY "caregivers_read_household_caregivers" ON caregivers
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );

CREATE POLICY "caregivers_update_self" ON caregivers
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "caregivers_insert_self" ON caregivers
  FOR INSERT WITH CHECK (id = auth.uid());

-- Care plan tasks: caregivers can CRUD their household's tasks
CREATE POLICY "caregivers_all_own_tasks" ON care_plan_tasks
  FOR ALL USING (
    household_id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );

-- Task completions: caregivers can read their household's completions
CREATE POLICY "caregivers_read_own_completions" ON task_completions
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );

-- Daily checkins: caregivers can read their household's checkins
CREATE POLICY "caregivers_read_own_checkins" ON daily_checkins
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );

-- Care journal entries: caregivers can CRUD their household's entries
CREATE POLICY "caregivers_all_own_journal" ON care_journal_entries
  FOR ALL USING (
    household_id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );

-- Location logs: caregivers can read their household's location logs
CREATE POLICY "caregivers_read_own_location_logs" ON location_logs
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );

-- Safe zones: caregivers can CRUD their household's safe zones
CREATE POLICY "caregivers_all_own_safe_zones" ON safe_zones
  FOR ALL USING (
    household_id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );

-- Location alerts: caregivers can read/update their household's alerts
CREATE POLICY "caregivers_read_own_alerts" ON location_alerts
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );

CREATE POLICY "caregivers_update_own_alerts" ON location_alerts
  FOR UPDATE USING (
    household_id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );

-- AI conversations: caregivers can CRUD their own conversations
CREATE POLICY "caregivers_all_own_conversations" ON ai_conversations
  FOR ALL USING (caregiver_id = auth.uid());

-- Caregiver wellbeing logs: caregivers can CRUD their own logs
CREATE POLICY "caregivers_all_own_wellbeing" ON caregiver_wellbeing_logs
  FOR ALL USING (caregiver_id = auth.uid());

-- Brain activities: caregivers can read their household's activities
CREATE POLICY "caregivers_read_own_activities" ON brain_activities
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );

-- Doctor visit reports: caregivers can CRUD their household's reports
CREATE POLICY "caregivers_all_own_reports" ON doctor_visit_reports
  FOR ALL USING (
    household_id IN (SELECT household_id FROM caregivers WHERE id = auth.uid())
  );

-- -----------------------------------------------------------------------------
-- PATIENT DEVICE ACCESS POLICIES (via Care Code JWT with household_id claim)
-- Patient devices access data via household_id in JWT claims
-- -----------------------------------------------------------------------------

-- Helper function to get household_id from JWT claims
CREATE OR REPLACE FUNCTION get_patient_household_id()
RETURNS UUID AS $$
BEGIN
  RETURN (current_setting('request.jwt.claims', true)::json->>'household_id')::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Patients: patient device can read their profile
CREATE POLICY "patient_device_read_patient" ON patients
  FOR SELECT USING (household_id = get_patient_household_id());

-- Care plan tasks: patient device can read active tasks
CREATE POLICY "patient_device_read_tasks" ON care_plan_tasks
  FOR SELECT USING (
    household_id = get_patient_household_id() AND active = true
  );

-- Task completions: patient device can insert and read completions
CREATE POLICY "patient_device_insert_completions" ON task_completions
  FOR INSERT WITH CHECK (
    household_id = get_patient_household_id()
  );

CREATE POLICY "patient_device_read_completions" ON task_completions
  FOR SELECT USING (
    household_id = get_patient_household_id()
  );

-- Daily checkins: patient device can insert and read checkins
CREATE POLICY "patient_device_insert_checkins" ON daily_checkins
  FOR INSERT WITH CHECK (
    household_id = get_patient_household_id()
  );

CREATE POLICY "patient_device_read_checkins" ON daily_checkins
  FOR SELECT USING (
    household_id = get_patient_household_id()
  );

CREATE POLICY "patient_device_update_checkins" ON daily_checkins
  FOR UPDATE USING (
    household_id = get_patient_household_id()
  );

-- Location logs: patient device can insert location logs
CREATE POLICY "patient_device_insert_location_logs" ON location_logs
  FOR INSERT WITH CHECK (
    household_id = get_patient_household_id()
  );

-- Location alerts: patient device can insert alerts (e.g., Take Me Home)
CREATE POLICY "patient_device_insert_alerts" ON location_alerts
  FOR INSERT WITH CHECK (
    household_id = get_patient_household_id()
  );

-- Safe zones: patient device can read safe zones
CREATE POLICY "patient_device_read_safe_zones" ON safe_zones
  FOR SELECT USING (
    household_id = get_patient_household_id() AND active = true
  );

-- Brain activities: patient device can read and update activities
CREATE POLICY "patient_device_read_activities" ON brain_activities
  FOR SELECT USING (
    household_id = get_patient_household_id()
  );

CREATE POLICY "patient_device_update_activities" ON brain_activities
  FOR UPDATE USING (
    household_id = get_patient_household_id()
  );

-- =============================================================================
-- STORAGE BUCKETS
-- Run these in Supabase Dashboard > Storage or via SQL
-- =============================================================================

-- Note: Storage bucket creation via SQL requires special permissions
-- These should be created in the Supabase Dashboard:
--
-- 1. Bucket: photos (public)
--    - Public access for viewing family photos
--    - Authenticated upload only
--
-- 2. Bucket: voice-notes (authenticated)
--    - Authenticated access only
--    - Patient check-in voice recordings
--
-- 3. Bucket: reports (authenticated)
--    - Authenticated access only
--    - Doctor visit report PDFs

-- Storage policies (to be applied after buckets are created):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('voice-notes', 'voice-notes', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false);

-- =============================================================================
-- DOWN MIGRATION (for reference - run manually if needed to rollback)
-- =============================================================================
-- DROP TABLE IF EXISTS doctor_visit_reports CASCADE;
-- DROP TABLE IF EXISTS brain_activities CASCADE;
-- DROP TABLE IF EXISTS caregiver_wellbeing_logs CASCADE;
-- DROP TABLE IF EXISTS ai_conversations CASCADE;
-- DROP TABLE IF EXISTS location_alerts CASCADE;
-- DROP TABLE IF EXISTS safe_zones CASCADE;
-- DROP TABLE IF EXISTS location_logs CASCADE;
-- DROP TABLE IF EXISTS care_journal_entries CASCADE;
-- DROP TABLE IF EXISTS daily_checkins CASCADE;
-- DROP TABLE IF EXISTS task_completions CASCADE;
-- DROP TABLE IF EXISTS care_plan_tasks CASCADE;
-- DROP TABLE IF EXISTS caregivers CASCADE;
-- DROP TABLE IF EXISTS patients CASCADE;
-- DROP TABLE IF EXISTS households CASCADE;
-- DROP FUNCTION IF EXISTS generate_care_code();
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- DROP FUNCTION IF EXISTS get_patient_household_id();
