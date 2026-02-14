export interface GuidedBreathingContent {
  durationMinutes: number;
  inhaleSeconds: number;
  holdSeconds: number;
  exhaleSeconds: number;
}

export const GUIDED_BREATHING_CONTENT: GuidedBreathingContent[] = [
  { durationMinutes: 2, inhaleSeconds: 4, holdSeconds: 2, exhaleSeconds: 4 },
  { durationMinutes: 3, inhaleSeconds: 4, holdSeconds: 3, exhaleSeconds: 5 },
  { durationMinutes: 5, inhaleSeconds: 4, holdSeconds: 4, exhaleSeconds: 6 },
];
