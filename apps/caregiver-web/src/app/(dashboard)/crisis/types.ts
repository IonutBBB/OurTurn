import type { BehaviourType } from '@ourturn/shared';

export type CrisisScenarioId =
  | 'agitated'
  | 'wandering'
  | 'refusing'
  | 'hallucinations'
  | 'sundowning'
  | 'fall'
  | 'repetitive_questions'
  | 'sleep_disruption'
  | 'aggression'
  | 'shadowing';

export type StepType = 'breathe' | 'assess' | 'do' | 'escalate';

export interface ScenarioStep {
  type: StepType;
  title: string;
  instruction: string;
  tips?: string[];
  checklist?: string[];
  action?: 'breathing' | 'call_emergency';
  actionLabel?: string;
}

export type CrisisUrgency = 'critical' | 'high' | 'moderate';

export interface CrisisScenario {
  id: CrisisScenarioId;
  behaviourType: BehaviourType;
  emoji: string;
  label: string;
  urgency: CrisisUrgency;
  stepCountDescription: string;
  steps: ScenarioStep[];
}

export type CrisisView = 'entry' | 'scenarios' | 'remote' | 'guide';
