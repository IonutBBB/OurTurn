-- OurTurn Seed Data for Testing
-- Run this after creating a test user via Supabase Auth

-- =============================================================================
-- MOCK DATA FOR TESTING
-- =============================================================================

-- First, let's create a test household
INSERT INTO households (id, care_code, timezone, language, country, subscription_status)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '123456',
  'Europe/Bucharest',
  'en',
  'RO',
  'plus'
) ON CONFLICT (id) DO NOTHING;

-- Create a test patient
INSERT INTO patients (
  id,
  household_id,
  name,
  date_of_birth,
  dementia_type,
  stage,
  home_address_formatted,
  home_latitude,
  home_longitude,
  wake_time,
  sleep_time,
  emergency_number
) VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Maria Johnson',
  '1945-03-15',
  'Alzheimer''s',
  'early',
  '123 Memory Lane, Bucharest, Romania',
  44.4268,
  26.1025,
  '07:30',
  '21:00',
  '+40721234567'
) ON CONFLICT (id) DO NOTHING;

-- Note: Caregiver will be created during signup/onboarding
-- For testing, we'll create a placeholder that can be updated

-- =============================================================================
-- CARE PLAN TASKS
-- =============================================================================

-- Morning medication
INSERT INTO care_plan_tasks (id, household_id, category, title, hint_text, time, recurrence)
VALUES (
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'medication',
  'Morning Medication',
  'Take with breakfast and a full glass of water',
  '08:00',
  'daily'
) ON CONFLICT (id) DO NOTHING;

-- Breakfast
INSERT INTO care_plan_tasks (id, household_id, category, title, hint_text, time, recurrence)
VALUES (
  'd4e5f6a7-b8c9-0123-def0-234567890123',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'nutrition',
  'Breakfast',
  'Oatmeal with berries and honey - your favorite!',
  '08:30',
  'daily'
) ON CONFLICT (id) DO NOTHING;

-- Morning walk
INSERT INTO care_plan_tasks (id, household_id, category, title, hint_text, time, recurrence)
VALUES (
  'e5f6a7b8-c9d0-1234-ef01-345678901234',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'physical',
  'Morning Walk',
  'Walk around the garden - look for the roses!',
  '10:00',
  'daily'
) ON CONFLICT (id) DO NOTHING;

-- Brain activity
INSERT INTO care_plan_tasks (id, household_id, category, title, hint_text, time, recurrence)
VALUES (
  'f6a7b8c9-d0e1-2345-f012-456789012345',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'cognitive',
  'Photo Album Time',
  'Look through the family album with grandchildren photos',
  '11:00',
  'daily'
) ON CONFLICT (id) DO NOTHING;

-- Lunch
INSERT INTO care_plan_tasks (id, household_id, category, title, hint_text, time, recurrence)
VALUES (
  'a7b8c9d0-e1f2-3456-0123-567890123456',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'nutrition',
  'Lunch',
  'Soup and sandwich in the kitchen',
  '12:30',
  'daily'
) ON CONFLICT (id) DO NOTHING;

-- Afternoon medication
INSERT INTO care_plan_tasks (id, household_id, category, title, hint_text, time, recurrence)
VALUES (
  'b8c9d0e1-f2a3-4567-1234-678901234567',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'medication',
  'Afternoon Medication',
  'Blue pill with water - after lunch',
  '13:00',
  'daily'
) ON CONFLICT (id) DO NOTHING;

-- Video call with family
INSERT INTO care_plan_tasks (id, household_id, category, title, hint_text, time, recurrence)
VALUES (
  'c9d0e1f2-a3b4-5678-2345-789012345678',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'social',
  'Video Call with Ana',
  'Your daughter Ana will call on the tablet',
  '15:00',
  'specific_days'
) ON CONFLICT (id) DO NOTHING;

-- Dinner
INSERT INTO care_plan_tasks (id, household_id, category, title, hint_text, time, recurrence)
VALUES (
  'd0e1f2a3-b4c5-6789-3456-890123456789',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'nutrition',
  'Dinner',
  'Light dinner - soup and bread',
  '18:30',
  'daily'
) ON CONFLICT (id) DO NOTHING;

-- Evening medication
INSERT INTO care_plan_tasks (id, household_id, category, title, hint_text, time, recurrence)
VALUES (
  'e1f2a3b4-c5d6-7890-4567-901234567890',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'medication',
  'Evening Medication',
  'Sleep aid - take 30 minutes before bed',
  '20:30',
  'daily'
) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- TASK COMPLETIONS FOR TODAY
-- =============================================================================

INSERT INTO task_completions (id, task_id, household_id, date, completed, completed_at)
VALUES
  ('f2a3b4c5-d6e7-8901-5678-012345678901', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', CURRENT_DATE, true, CURRENT_TIMESTAMP - INTERVAL '6 hours'),
  ('a3b4c5d6-e7f8-9012-6789-123456789012', 'd4e5f6a7-b8c9-0123-def0-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', CURRENT_DATE, true, CURRENT_TIMESTAMP - INTERVAL '5 hours'),
  ('b4c5d6e7-f8a9-0123-7890-234567890123', 'e5f6a7b8-c9d0-1234-ef01-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', CURRENT_DATE, true, CURRENT_TIMESTAMP - INTERVAL '4 hours'),
  ('c5d6e7f8-a9b0-1234-8901-345678901234', 'f6a7b8c9-d0e1-2345-f012-456789012345', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', CURRENT_DATE, false, NULL),
  ('d6e7f8a9-b0c1-2345-9012-456789012345', 'a7b8c9d0-e1f2-3456-0123-567890123456', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', CURRENT_DATE, false, NULL),
  ('e7f8a9b0-c1d2-3456-0123-567890123456', 'b8c9d0e1-f2a3-4567-1234-678901234567', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', CURRENT_DATE, false, NULL)
ON CONFLICT (task_id, date) DO NOTHING;

-- =============================================================================
-- DAILY CHECK-IN FOR TODAY
-- =============================================================================

INSERT INTO daily_checkins (id, household_id, date, mood, sleep_quality, submitted_at, ai_summary)
VALUES (
  'f8a9b0c1-d2e3-4567-1234-678901234567',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  CURRENT_DATE,
  4,
  3,
  CURRENT_TIMESTAMP - INTERVAL '6 hours',
  'Maria had a good morning. She reported sleeping well and feeling cheerful. No concerning signs detected.'
) ON CONFLICT (household_id, date) DO NOTHING;

-- =============================================================================
-- SAFE ZONES
-- =============================================================================

INSERT INTO safe_zones (id, household_id, name, latitude, longitude, radius_meters, active)
VALUES
  ('a9b0c1d2-e3f4-5678-2345-789012345678', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Home', 44.4268, 26.1025, 100, true),
  ('b0c1d2e3-f4a5-6789-3456-890123456789', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Garden Area', 44.4270, 26.1028, 50, true),
  ('c1d2e3f4-a5b6-7890-4567-901234567890', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Park Nearby', 44.4290, 26.1050, 200, true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- LOCATION LOGS (simulated recent locations)
-- =============================================================================

INSERT INTO location_logs (id, patient_id, household_id, latitude, longitude, timestamp, location_label, accuracy_meters)
VALUES
  ('d2e3f4a5-b6c7-8901-5678-012345678901', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 44.4268, 26.1025, CURRENT_TIMESTAMP - INTERVAL '5 minutes', 'Home', 10),
  ('e3f4a5b6-c7d8-9012-6789-123456789012', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 44.4269, 26.1026, CURRENT_TIMESTAMP - INTERVAL '30 minutes', 'Home', 12),
  ('f4a5b6c7-d8e9-0123-7890-234567890123', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 44.4270, 26.1028, CURRENT_TIMESTAMP - INTERVAL '2 hours', 'Garden Area', 8)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- BRAIN ACTIVITY FOR TODAY
-- =============================================================================

INSERT INTO brain_activities (id, household_id, date, activity_type, prompt_text, follow_up_text, completed)
VALUES (
  'a5b6c7d8-e9f0-1234-8901-345678901234',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  CURRENT_DATE,
  'reminiscence',
  'Tell me about your favorite family holiday. Where did you go and who was with you?',
  'That sounds wonderful! What was your favorite part of that trip?',
  false
) ON CONFLICT (household_id, date) DO NOTHING;

-- =============================================================================
-- DONE!
-- =============================================================================
-- After running this seed, you can log in with your test account
-- The care code for the patient app is: 123456
