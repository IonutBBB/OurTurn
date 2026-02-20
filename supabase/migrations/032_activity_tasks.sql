-- Migration: Add activity_type to care_plan_tasks
-- Allows mind games to be assigned through the care plan

-- 1. Add activity_type column (nullable — existing tasks have NULL)
ALTER TABLE care_plan_tasks
  ADD COLUMN activity_type TEXT DEFAULT NULL;

-- 2. Drop the existing category CHECK constraint and recreate with 'activity'
ALTER TABLE care_plan_tasks
  DROP CONSTRAINT care_plan_tasks_category_check;

ALTER TABLE care_plan_tasks
  ADD CONSTRAINT care_plan_tasks_category_check
  CHECK (category IN ('medication', 'nutrition', 'physical', 'cognitive', 'social', 'health', 'activity'));

-- 3. Validate activity_type values (must be one of 24 valid StimActivityType values)
ALTER TABLE care_plan_tasks
  ADD CONSTRAINT activity_type_valid_check
  CHECK (activity_type IS NULL OR activity_type IN (
    'word_association', 'proverbs', 'word_search', 'word_scramble', 'rhyme_time',
    'photo_pairs', 'spot_the_difference', 'what_changed', 'name_that_tune',
    'odd_one_out', 'pattern_sequence', 'category_sort', 'which_goes_together',
    'what_comes_next', 'sort_it_out', 'coin_counting',
    'gentle_quiz', 'picture_clues', 'true_or_false', 'this_day_in_history',
    'what_would_you_choose', 'my_favourites',
    'remember_when', 'describe_the_scene'
  ));

-- 4. Activity category requires activity_type to be set
ALTER TABLE care_plan_tasks
  ADD CONSTRAINT activity_requires_type_check
  CHECK (category != 'activity' OR activity_type IS NOT NULL);

-- 5. Index for quick lookups of activity tasks
CREATE INDEX idx_care_plan_tasks_activity_type
  ON care_plan_tasks (activity_type)
  WHERE activity_type IS NOT NULL;
