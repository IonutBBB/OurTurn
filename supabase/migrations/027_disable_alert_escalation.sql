-- Migration 027: Disable automatic alert escalation
--
-- Removes the trigger that auto-creates escalation records when SOS or
-- safe zone alerts are inserted. The escalate-alerts Edge Function will
-- have nothing to process, effectively disabling the entire escalation chain.
--
-- The alert_escalations table and function are kept for potential future use.

DROP TRIGGER IF EXISTS trigger_create_alert_escalation ON location_alerts;
