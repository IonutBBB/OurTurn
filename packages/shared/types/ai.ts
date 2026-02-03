// AI types

export type AIMessageRole = 'user' | 'assistant' | 'system';

export interface AIMessage {
  role: AIMessageRole;
  content: string;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  caregiver_id: string;
  household_id: string;
  messages: AIMessage[];
  created_at: string;
  updated_at: string;
}

export interface AIConversationInsert {
  caregiver_id: string;
  household_id: string;
  messages?: AIMessage[];
}

// Brain Activity types
export type BrainActivityType =
  | 'reminiscence'
  | 'photo'
  | 'word_game'
  | 'music'
  | 'creative'
  | 'orientation';

export interface BrainActivity {
  id: string;
  household_id: string;
  date: string;
  activity_type: BrainActivityType;
  prompt_text: string;
  follow_up_text: string | null;
  patient_response_text: string | null;
  patient_response_audio_url: string | null;
  completed: boolean;
  duration_seconds: number | null;
}

export interface BrainActivityInsert {
  household_id: string;
  date: string;
  activity_type: BrainActivityType;
  prompt_text: string;
  follow_up_text?: string;
}

export interface BrainActivityUpdate {
  patient_response_text?: string;
  patient_response_audio_url?: string;
  completed?: boolean;
  duration_seconds?: number;
}

// Doctor Visit Report types
export interface DoctorVisitReportContent {
  period_summary: string;
  mood_trends: {
    average: number;
    trend: 'improving' | 'stable' | 'declining';
    notable_days: { date: string; mood: number; note?: string }[];
  };
  sleep_patterns: {
    average_quality: number;
    good_nights: number;
    poor_nights: number;
  };
  activity_completion: {
    overall_rate: number;
    by_category: Record<string, number>;
  };
  medication_adherence: {
    rate: number;
    missed_count: number;
  };
  notable_observations: string[];
  caregiver_concerns: string[];
}

export interface DoctorVisitReport {
  id: string;
  household_id: string;
  generated_by: string | null;
  period_start: string;
  period_end: string;
  content_json: DoctorVisitReportContent | null;
  pdf_url: string | null;
  generated_at: string;
}

export interface DoctorVisitReportInsert {
  household_id: string;
  generated_by?: string;
  period_start: string;
  period_end: string;
  content_json?: DoctorVisitReportContent;
  pdf_url?: string;
}

// Weekly Insights types
export type InsightCategory = 'positive' | 'attention' | 'suggestion';

export interface Insight {
  insight: string;
  suggestion: string;
  category: InsightCategory;
}

export interface WeeklyInsights {
  id: string;
  household_id: string;
  week_start: string;
  week_end: string;
  insights: Insight[];
  generated_at: string;
}

export interface WeeklyInsightsInsert {
  household_id: string;
  week_start: string;
  week_end: string;
  insights: Insight[];
}
