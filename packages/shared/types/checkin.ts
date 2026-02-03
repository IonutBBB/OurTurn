// Daily Check-in types

export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type SleepQuality = 1 | 2 | 3;

export interface DailyCheckin {
  id: string;
  household_id: string;
  date: string;
  mood: MoodLevel | null;
  sleep_quality: SleepQuality | null;
  voice_note_url: string | null;
  voice_note_transcript: string | null;
  submitted_at: string | null;
  ai_summary: string | null;
}

export interface DailyCheckinInsert {
  household_id: string;
  date: string;
  mood?: MoodLevel;
  sleep_quality?: SleepQuality;
  voice_note_url?: string;
  voice_note_transcript?: string;
  submitted_at?: string;
}

export interface DailyCheckinUpdate {
  mood?: MoodLevel;
  sleep_quality?: SleepQuality;
  voice_note_url?: string;
  voice_note_transcript?: string;
  submitted_at?: string;
  ai_summary?: string;
}

// Mood display mapping
export const MOOD_LABELS: Record<MoodLevel, { emoji: string; label: string }> = {
  1: { emoji: '😢', label: 'Very bad' },
  2: { emoji: '😟', label: 'Not great' },
  3: { emoji: '😐', label: 'Okay' },
  4: { emoji: '🙂', label: 'Good' },
  5: { emoji: '😊', label: 'Great' },
};

// Sleep display mapping
export const SLEEP_LABELS: Record<SleepQuality, { emoji: string; label: string }> = {
  1: { emoji: '😩', label: 'Not really' },
  2: { emoji: '🙂', label: 'So-so' },
  3: { emoji: '😴', label: 'Yes' },
};
