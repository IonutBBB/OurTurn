-- Enable realtime for care_plan_tasks and task_completions
-- These tables were missing from the publication, causing all realtime
-- subscriptions for tasks to silently receive no events.
ALTER PUBLICATION supabase_realtime ADD TABLE care_plan_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE task_completions;
