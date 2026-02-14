-- Enable realtime for activity_sessions so caregiver dashboards
-- receive live updates when a patient completes a mind game.
ALTER PUBLICATION supabase_realtime ADD TABLE activity_sessions;
