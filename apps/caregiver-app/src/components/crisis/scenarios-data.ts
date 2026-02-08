import type { TFunction } from 'i18next';

export interface CrisisStep {
  type: 'breathe' | 'assess' | 'do' | 'escalate';
  title: string;
  instruction: string;
  tips?: string[];
  checklist?: string[];
  action?: 'breathing' | 'call_emergency';
  actionLabel?: string;
}

export interface CrisisScenario {
  id: string;
  emoji: string;
  label: string;
  urgency: 'moderate' | 'high' | 'critical';
  stepCountDescription: string;
  steps: CrisisStep[];
}

interface ScenarioStepDef {
  type: CrisisStep['type'];
  action?: CrisisStep['action'];
  hasTips?: boolean;
  hasChecklist?: boolean;
  hasActionLabel?: boolean;
}

interface ScenarioDef {
  id: string;
  emoji: string;
  urgency: 'moderate' | 'high' | 'critical';
  steps: ScenarioStepDef[];
}

const SCENARIO_DEFS: ScenarioDef[] = [
  {
    id: 'agitated',
    emoji: '😤',
    urgency: 'high',
    steps: [
      { type: 'breathe', action: 'breathing' },
      { type: 'assess', hasChecklist: true },
      { type: 'do', hasTips: true },
      { type: 'do', hasTips: true },
      { type: 'escalate', action: 'call_emergency', hasActionLabel: true },
    ],
  },
  {
    id: 'wandering',
    emoji: '🚶',
    urgency: 'critical',
    steps: [
      { type: 'do', hasTips: true },
      { type: 'do' },
      { type: 'do' },
      { type: 'escalate', action: 'call_emergency', hasActionLabel: true },
    ],
  },
  {
    id: 'refusing',
    emoji: '🚫',
    urgency: 'moderate',
    steps: [
      { type: 'breathe', action: 'breathing' },
      { type: 'do', hasTips: true },
      { type: 'do', hasTips: true },
      { type: 'assess' },
    ],
  },
  {
    id: 'hallucinations',
    emoji: '👁️',
    urgency: 'moderate',
    steps: [
      { type: 'do', hasTips: true },
      { type: 'assess', hasChecklist: true },
      { type: 'do', hasTips: true },
      { type: 'escalate', action: 'call_emergency' },
    ],
  },
  {
    id: 'sundowning',
    emoji: '🌅',
    urgency: 'moderate',
    steps: [
      { type: 'do' },
      { type: 'do', hasTips: true },
      { type: 'do', hasTips: true },
      { type: 'assess' },
    ],
  },
  {
    id: 'fall',
    emoji: '🆘',
    urgency: 'critical',
    steps: [
      { type: 'do', hasTips: true },
      { type: 'assess', hasChecklist: true },
      { type: 'escalate', action: 'call_emergency' },
      { type: 'do' },
    ],
  },
  {
    id: 'repetitive_questions',
    emoji: '🔄',
    urgency: 'moderate',
    steps: [
      { type: 'breathe', action: 'breathing' },
      { type: 'assess', hasChecklist: true },
      { type: 'do', hasTips: true },
      { type: 'do' },
    ],
  },
  {
    id: 'aggression',
    emoji: '⚠️',
    urgency: 'high',
    steps: [
      { type: 'do', hasTips: true },
      { type: 'breathe', action: 'breathing' },
      { type: 'assess', hasChecklist: true },
      { type: 'do', hasTips: true },
      { type: 'escalate', action: 'call_emergency' },
    ],
  },
  {
    id: 'sleep_disruption',
    emoji: '😴',
    urgency: 'moderate',
    steps: [
      { type: 'do', hasTips: true },
      { type: 'assess', hasChecklist: true },
      { type: 'do', hasTips: true },
      { type: 'do' },
    ],
  },
  {
    id: 'shadowing',
    emoji: '👤',
    urgency: 'moderate',
    steps: [
      { type: 'breathe', action: 'breathing' },
      { type: 'assess', hasChecklist: true },
      { type: 'do', hasTips: true },
      { type: 'do', hasTips: true },
    ],
  },
];

export function getCrisisScenarios(t: TFunction): CrisisScenario[] {
  const prefix = 'caregiverApp.crisis.scenarioData';

  return SCENARIO_DEFS.map((def) => {
    const scenarioKey = `${prefix}.${def.id}`;
    const stepsData = t(`${scenarioKey}.steps`, { returnObjects: true }) as Array<{
      title: string;
      instruction: string;
      tips?: string[];
      checklist?: string[];
      actionLabel?: string;
    }>;

    const steps: CrisisStep[] = def.steps.map((stepDef, idx) => {
      const stepData = stepsData[idx];
      const step: CrisisStep = {
        type: stepDef.type,
        title: stepData.title,
        instruction: stepData.instruction,
      };
      if (stepDef.hasTips && stepData.tips) {
        step.tips = stepData.tips;
      }
      if (stepDef.hasChecklist && stepData.checklist) {
        step.checklist = stepData.checklist;
      }
      if (stepDef.action) {
        step.action = stepDef.action;
      }
      if (stepDef.hasActionLabel && stepData.actionLabel) {
        step.actionLabel = stepData.actionLabel;
      }
      return step;
    });

    return {
      id: def.id,
      emoji: def.emoji,
      label: t(`${scenarioKey}.label`),
      urgency: def.urgency,
      stepCountDescription: t(`${prefix}.stepsCount`, { count: def.steps.length }),
      steps,
    };
  });
}
