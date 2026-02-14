// Mind games activity system types

export type ActivityCategory =
  | 'words_language'
  | 'memory_attention'
  | 'logic_reasoning'
  | 'knowledge'
  | 'numbers';

/** DB cognitive_domain CHECK constraint values */
export type CognitiveDomain = 'language' | 'visual' | 'executive' | 'current_affairs' | 'numbers';

export type StimActivityType =
  | 'word_association'
  | 'proverbs'
  | 'word_search'
  | 'word_scramble'
  | 'photo_pairs'
  | 'color_sequence'
  | 'spot_the_difference'
  | 'odd_one_out'
  | 'pattern_sequence'
  | 'category_sort'
  | 'gentle_quiz'
  | 'number_puzzles';

export type AllActivityType = StimActivityType;

export type DifficultyLevel = 'gentle' | 'moderate' | 'challenging';

export interface ActivitySession {
  id: string;
  household_id: string;
  activity_type: string;
  cognitive_domain: string;
  difficulty_level: DifficultyLevel | null;
  date: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  score_data: Record<string, unknown> | null;
  response_data: Record<string, unknown> | null;
  skipped: boolean;
  created_at: string;
}

export interface ActivitySessionInsert {
  household_id: string;
  activity_type: string;
  cognitive_domain: string;
  difficulty_level?: DifficultyLevel;
  date?: string;
}

export interface ActivityDifficulty {
  id: string;
  household_id: string;
  cognitive_domain: string;
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
  category: ActivityCategory;
  /** Maps to DB cognitive_domain CHECK constraint */
  cognitiveDomain: CognitiveDomain;
  emoji: string;
  titleKey: string;
  descriptionKey: string;
  backgroundColor: string;
  borderColor: string;
  route: string;
}
