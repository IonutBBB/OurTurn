// Caregiver Wellbeing types

// ── New slider-based types ──────────────────────────────────
export type SliderValue = 1 | 2 | 3 | 4 | 5;

export interface CaregiverToolkitCheckin {
  energy_level: SliderValue;
  stress_level: SliderValue;
  sleep_quality_rating: SliderValue;
  daily_goal?: string;
  goal_completed?: boolean;
  relief_exercises_used?: string[]; // exercise IDs
}

export const ENERGY_LABELS: Record<SliderValue, string> = {
  1: 'Exhausted',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Energized',
};

export const STRESS_LABELS: Record<SliderValue, string> = {
  1: 'Calm',
  2: 'Mild',
  3: 'Moderate',
  4: 'High',
  5: 'Overwhelmed',
};

export const CAREGIVER_SLEEP_LABELS: Record<SliderValue, string> = {
  1: 'Terrible',
  2: 'Poor',
  3: 'Fair',
  4: 'Good',
  5: 'Great',
};

// ── Relief exercise types ───────────────────────────────────
export interface ReliefExerciseStep {
  instruction: string;
  duration_seconds: number;
  type: 'breathe_in' | 'breathe_out' | 'hold' | 'action' | 'observe' | 'rest';
}

export interface ReliefExercise {
  id: string;
  name: string;
  category: 'breathing' | 'grounding' | 'gratitude' | 'relaxation' | 'mindfulness';
  duration_minutes: number;
  icon: string;
  steps: ReliefExerciseStep[];
  recommended_for: {
    high_stress: boolean;
    low_energy: boolean;
    poor_sleep: boolean;
  };
}

// ── Behaviour management types ────────────────────────────────
export type BehaviourType =
  | 'agitation'
  | 'wandering'
  | 'sundowning'
  | 'repetitive_questions'
  | 'refusing_care'
  | 'sleep_disruption'
  | 'aggression'
  | 'shadowing'
  | 'hallucinations'
  | 'fall';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface BehaviourIncident {
  id: string;
  caregiver_id: string;
  household_id: string;
  patient_id: string;
  behaviour_type: BehaviourType;
  severity: 1 | 2 | 3 | 4 | 5;
  time_of_day: TimeOfDay | null;
  duration_minutes: number | null;
  possible_triggers: string[];
  what_happened: string;
  what_helped: string | null;
  location: string | null;
  logged_at: string;
  created_at: string;
}

export interface BehaviourIncidentInsert {
  caregiver_id: string;
  household_id: string;
  patient_id: string;
  behaviour_type: BehaviourType;
  severity: number;
  time_of_day?: TimeOfDay;
  duration_minutes?: number;
  possible_triggers?: string[];
  what_happened: string;
  what_helped?: string;
  location?: string;
}

export interface BehaviourPlaybook {
  id: string;
  behaviour_type: BehaviourType;
  emoji: string;
  title: string;
  description: string;
  right_now: { step: string }[];
  understand_why: string[];
  prevent: string[];
  when_to_call_doctor: string[];
  language: string;
}

export const BEHAVIOUR_TYPES: { type: BehaviourType; label: string; emoji: string }[] = [
  { type: 'agitation', label: 'Agitation', emoji: '😤' },
  { type: 'wandering', label: 'Wandering', emoji: '🚶' },
  { type: 'sundowning', label: 'Sundowning', emoji: '🌅' },
  { type: 'repetitive_questions', label: 'Repetitive Questions', emoji: '🔄' },
  { type: 'refusing_care', label: 'Refusing Care', emoji: '🚫' },
  { type: 'sleep_disruption', label: 'Sleep Disruption', emoji: '😴' },
  { type: 'aggression', label: 'Aggression', emoji: '⚠️' },
  { type: 'shadowing', label: 'Shadowing', emoji: '👤' },
  { type: 'hallucinations', label: 'Hallucinations', emoji: '👁️' },
  { type: 'fall', label: 'Fall or Injury', emoji: '🤕' },
];

export const BEHAVIOUR_TRIGGERS = [
  'pain', 'hunger', 'thirst', 'fatigue', 'overstimulation',
  'unfamiliar_environment', 'unfamiliar_person', 'routine_change',
  'medication', 'noise', 'loneliness', 'boredom', 'bathroom_need',
  'frustration', 'fear', 'unknown',
] as const;

export type BehaviourTrigger = typeof BEHAVIOUR_TRIGGERS[number];

// ── Relief activity log types ─────────────────────────────────
export interface ReliefActivityLog {
  id: string;
  caregiver_id: string;
  activity_type: string;
  duration_seconds: number | null;
  mood_before: SliderValue | null;
  mood_after: SliderValue | null;
  completed_at: string;
}

// ── Care team types ───────────────────────────────────────────
export interface CareTeamMember {
  id: string;
  household_id: string;
  added_by: string;
  name: string;
  relationship: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  can_help_with: string[];
  availability_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CareTeamMemberInsert {
  household_id: string;
  added_by: string;
  name: string;
  relationship?: string;
  phone?: string;
  email?: string;
  can_help_with?: string[];
  availability_notes?: string;
}

export const CARE_HELP_CATEGORIES = [
  'respite', 'meals', 'transport', 'medication',
  'appointments', 'errands', 'companionship', 'overnight',
] as const;

export type CareHelpCategory = typeof CARE_HELP_CATEGORIES[number];

// ── Help request types ──────────────────────────────────────
export type HelpRequestStatus = 'pending' | 'accepted' | 'completed' | 'expired';

export interface HelpRequest {
  id: string;
  requester_id: string;
  household_id: string;
  message: string;
  template_key: string | null;
  status: HelpRequestStatus;
  responded_by: string | null;
  responded_at: string | null;
  created_at: string;
  expires_at: string;
}

export interface HelpRequestInsert {
  requester_id: string;
  household_id: string;
  message: string;
  template_key?: string;
}

export const HELP_REQUEST_TEMPLATES: { key: string; label: string; message: string }[] = [
  { key: 'need_break', label: 'Need a break', message: 'I could really use a break. Could someone take over for a bit?' },
  { key: 'handle_meds', label: 'Medication help', message: 'Can someone help with medication today?' },
  { key: 'need_visit', label: 'Need a visit', message: 'It would mean a lot if someone could visit today.' },
  { key: 'groceries', label: 'Groceries', message: 'Could someone help pick up groceries?' },
  { key: 'custom', label: 'Custom message', message: '' },
];

// ── AI daily tip types ──────────────────────────────────────
export type TipCategory = 'respite' | 'delegation' | 'exercise' | 'insight' | 'self_care';

export interface AiDailyTip {
  id: string;
  caregiver_id: string;
  date: string;
  tip_text: string;
  tip_category: TipCategory;
  dismissed: boolean;
}

// ── Extended wellbeing log (includes both old and new fields) ──
export interface CaregiverWellbeingLog {
  id: string;
  caregiver_id: string;
  date: string;
  // New slider fields
  energy_level: SliderValue | null;
  stress_level: SliderValue | null;
  sleep_quality_rating: SliderValue | null;
  daily_goal: string | null;
  goal_completed: boolean;
  relief_exercises_used: string[];
  mood_notes: string | null;
  // Deprecated fields (kept for backward compat)
  mood: WellbeingMood | null;
  self_care_checklist: SelfCareChecklist;
  notes: string | null;
}

export interface CaregiverWellbeingLogInsert {
  caregiver_id: string;
  date: string;
  energy_level?: SliderValue;
  stress_level?: SliderValue;
  sleep_quality_rating?: SliderValue;
  daily_goal?: string;
  goal_completed?: boolean;
  relief_exercises_used?: string[];
  // Deprecated
  mood?: WellbeingMood;
  self_care_checklist?: SelfCareChecklist;
  notes?: string;
}

export interface CaregiverWellbeingLogUpdate {
  energy_level?: SliderValue;
  stress_level?: SliderValue;
  sleep_quality_rating?: SliderValue;
  daily_goal?: string;
  goal_completed?: boolean;
  relief_exercises_used?: string[];
  // Deprecated
  mood?: WellbeingMood;
  self_care_checklist?: SelfCareChecklist;
  notes?: string;
}

// ── Deprecated types (kept for backward compat) ─────────────
/** @deprecated Use SliderValue instead */
export type WellbeingMood = 1 | 2 | 3 | 4 | 5;

/** @deprecated Use CaregiverToolkitCheckin instead */
export interface SelfCareChecklist {
  took_break?: boolean;
  ate_well?: boolean;
  talked_to_friend?: boolean;
  did_something_enjoyable?: boolean;
  got_exercise?: boolean;
  got_enough_sleep?: boolean;
}

/** @deprecated Use ENERGY_LABELS / STRESS_LABELS instead */
export const CAREGIVER_MOOD_LABELS: Record<WellbeingMood, { emoji: string; label: string }> = {
  1: { emoji: '😢', label: 'Overwhelmed' },
  2: { emoji: '😰', label: 'Stressed' },
  3: { emoji: '😫', label: 'Tired' },
  4: { emoji: '😐', label: 'Okay' },
  5: { emoji: '😊', label: 'Good' },
};

export interface CaregiverBurnoutAlert {
  id: string;
  caregiver_id: string;
  household_id: string;
  triggered_at: string;
  average_mood: number;
  consecutive_low_days: number;
  message_key: string | null;
  dismissed: boolean;
  dismissed_at: string | null;
}

/** @deprecated Use CaregiverToolkitCheckin instead */
export const SELF_CARE_ITEMS: { key: keyof SelfCareChecklist; label: string }[] = [
  { key: 'took_break', label: 'Took a break today' },
  { key: 'ate_well', label: 'Ate a proper meal' },
  { key: 'talked_to_friend', label: 'Talked to a friend' },
  { key: 'did_something_enjoyable', label: 'Did something enjoyable' },
  { key: 'got_exercise', label: 'Got some exercise' },
  { key: 'got_enough_sleep', label: 'Got enough sleep' },
];
