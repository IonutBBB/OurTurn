import type { DifficultyLevel } from '@ourturn/shared';

export interface ActivityRendererProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  difficulty: DifficultyLevel;
  onComplete: (scoreData: Record<string, unknown>, responseData: Record<string, unknown>) => void;
  onSkip: () => void;
  patientName: string;
}
