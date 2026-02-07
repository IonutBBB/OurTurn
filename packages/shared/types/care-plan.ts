// Care Plan types

export interface MedicationItem {
  name: string;
  dosage: string;
  photo_url: string | null;
}

export type TaskCategory =
  | 'medication'
  | 'nutrition'
  | 'physical'
  | 'cognitive'
  | 'social'
  | 'health';

export type TaskRecurrence = 'daily' | 'specific_days' | 'one_time';

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface CarePlanTask {
  id: string;
  household_id: string;
  category: TaskCategory;
  title: string;
  hint_text: string | null;
  time: string;
  recurrence: TaskRecurrence;
  recurrence_days: DayOfWeek[];
  active: boolean;
  one_time_date: string | null;
  photo_url: string | null;
  medication_items: MedicationItem[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CarePlanTaskInsert {
  household_id: string;
  category: TaskCategory;
  title: string;
  hint_text?: string;
  time: string;
  recurrence?: TaskRecurrence;
  recurrence_days?: DayOfWeek[];
  active?: boolean;
  one_time_date?: string;
  photo_url?: string | null;
  medication_items?: MedicationItem[] | null;
  created_by?: string;
}

export interface CarePlanTaskUpdate {
  category?: TaskCategory;
  title?: string;
  hint_text?: string;
  time?: string;
  recurrence?: TaskRecurrence;
  recurrence_days?: DayOfWeek[];
  active?: boolean;
  one_time_date?: string;
  photo_url?: string | null;
  medication_items?: MedicationItem[] | null;
}

export interface TaskCompletion {
  id: string;
  task_id: string;
  household_id: string;
  date: string;
  completed: boolean;
  completed_at: string | null;
  skipped: boolean;
}

export interface TaskCompletionInsert {
  task_id: string;
  household_id: string;
  date: string;
  completed?: boolean;
  completed_at?: string;
  skipped?: boolean;
}

// Extended task with completion status for UI
export interface TaskWithCompletion extends CarePlanTask {
  completion?: TaskCompletion;
  status: 'upcoming' | 'now' | 'overdue' | 'completed' | 'skipped';
}
