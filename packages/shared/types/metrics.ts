// Engagement Metrics types

export interface EngagementMetrics {
  id: string;
  household_id: string;
  date: string;
  tasks_total: number;
  tasks_completed: number;
  tasks_skipped: number;
  checkin_completed: boolean;
  checkin_mood: number | null;
  checkin_sleep: number | null;
  brain_activity_completed: boolean;
  brain_activity_duration_seconds: number;
  location_alerts_count: number;
  sos_triggered: boolean;
  patient_active_minutes: number;
}
