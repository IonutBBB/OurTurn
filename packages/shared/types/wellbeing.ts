// Caregiver Wellbeing types

export type WellbeingMood = 1 | 2 | 3 | 4 | 5;

export interface SelfCareChecklist {
  took_break?: boolean;
  ate_well?: boolean;
  talked_to_friend?: boolean;
  did_something_enjoyable?: boolean;
  got_exercise?: boolean;
  got_enough_sleep?: boolean;
}

export interface CaregiverWellbeingLog {
  id: string;
  caregiver_id: string;
  date: string;
  mood: WellbeingMood | null;
  self_care_checklist: SelfCareChecklist;
  notes: string | null;
}

export interface CaregiverWellbeingLogInsert {
  caregiver_id: string;
  date: string;
  mood?: WellbeingMood;
  self_care_checklist?: SelfCareChecklist;
  notes?: string;
}

export interface CaregiverWellbeingLogUpdate {
  mood?: WellbeingMood;
  self_care_checklist?: SelfCareChecklist;
  notes?: string;
}

// Mood display mapping for caregivers
export const CAREGIVER_MOOD_LABELS: Record<WellbeingMood, { emoji: string; label: string }> = {
  1: { emoji: '😢', label: 'Overwhelmed' },
  2: { emoji: '😰', label: 'Stressed' },
  3: { emoji: '😫', label: 'Tired' },
  4: { emoji: '😐', label: 'Okay' },
  5: { emoji: '😊', label: 'Good' },
};

// Self-care item labels
export const SELF_CARE_ITEMS: { key: keyof SelfCareChecklist; label: string }[] = [
  { key: 'took_break', label: 'Took a break today' },
  { key: 'ate_well', label: 'Ate a proper meal' },
  { key: 'talked_to_friend', label: 'Talked to a friend' },
  { key: 'did_something_enjoyable', label: 'Did something enjoyable' },
  { key: 'got_exercise', label: 'Got some exercise' },
  { key: 'got_enough_sleep', label: 'Got enough sleep' },
];
