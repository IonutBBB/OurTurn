-- GDPR account deletion functions wrapped in transactions
-- Ensures all-or-nothing deletion to prevent orphaned data

-- Delete entire household (primary caregiver, no other members)
CREATE OR REPLACE FUNCTION delete_household_data(p_household_id UUID, p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete in order to respect foreign key constraints
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

-- Delete non-primary caregiver's personal data only
CREATE OR REPLACE FUNCTION delete_caregiver_data(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM ai_conversations WHERE caregiver_id = p_user_id;
  DELETE FROM caregiver_wellbeing_logs WHERE caregiver_id = p_user_id;
  DELETE FROM caregivers WHERE id = p_user_id;
  -- Note: auth.users deletion handled separately via admin API
END;
$$;
