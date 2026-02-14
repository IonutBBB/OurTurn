// Brain stimulation activity system types

export type ActivityCategory =
  | 'art_beauty'
  | 'music_sound'
  | 'calm_wellness'
  | 'memories_reflection'
  | 'words_language'
  | 'stories_facts'
  | 'games';

/** @deprecated Use ActivityCategory for UI grouping. Kept for DB backward compatibility. */
export type CognitiveDomain = string;

export type StimActivityType =
  | 'word_association'
  | 'art_gallery'
  | 'music_moments'
  | 'sing_along'
  | 'nature_sounds'
  | 'guided_breathing'
  | 'this_day_in_history'
  | 'memory_lane'
  | 'daily_reflection'
  | 'proverbs'
  | 'fun_facts'
  | 'gentle_quiz'
  | 'animal_friends'
  | 'story_time'
  | 'photo_pairs';

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
  emoji: string;
  titleKey: string;
  descriptionKey: string;
  backgroundColor: string;
  borderColor: string;
  route: string;
  legacy?: boolean;
  requiresBiography?: boolean;
}
