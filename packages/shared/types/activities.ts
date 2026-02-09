// Brain stimulation activity system types

export type CognitiveDomain =
  | 'language'
  | 'numbers'
  | 'executive'
  | 'visual'
  | 'sound'
  | 'physical'
  | 'creative'
  | 'current_affairs';

export type StimActivityType =
  | 'word_association'
  | 'odd_word_out'
  | 'price_guessing'
  | 'sorting_categorizing'
  | 'put_in_order'
  | 'pair_matching'
  | 'sound_identification'
  | 'this_day_in_history'
  | 'art_discussion'
  | 'true_or_false';

export type LegacyActivityType =
  | 'brain_activity'
  | 'remember'
  | 'listen'
  | 'move'
  | 'create';

export type AllActivityType = StimActivityType | LegacyActivityType;

export type DifficultyLevel = 'gentle' | 'moderate' | 'challenging';

export interface ActivitySession {
  id: string;
  household_id: string;
  activity_type: string;
  cognitive_domain: CognitiveDomain;
  difficulty_level: DifficultyLevel;
  date: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  score_data: Record<string, unknown>;
  response_data: Record<string, unknown>;
  skipped: boolean;
  created_at: string;
}

export interface ActivitySessionInsert {
  household_id: string;
  activity_type: string;
  cognitive_domain: CognitiveDomain;
  difficulty_level?: DifficultyLevel;
  date?: string;
}

export interface ActivityDifficulty {
  id: string;
  household_id: string;
  cognitive_domain: CognitiveDomain;
  current_level: DifficultyLevel;
  total_attempts: number;
  total_completions: number;
  avg_duration_seconds: number;
  updated_at: string;
}

export interface ActivityContentCache {
  id: string;
  household_id: string;
  activity_type: string;
  date: string;
  difficulty_level: DifficultyLevel;
  content_json: Record<string, unknown>;
  created_at: string;
}

export interface ActivityDefinition {
  type: AllActivityType;
  domain: CognitiveDomain;
  emoji: string;
  titleKey: string;
  descriptionKey: string;
  backgroundColor: string;
  borderColor: string;
  route: string;
  legacy?: boolean;
  requiresBiography?: boolean;
}
