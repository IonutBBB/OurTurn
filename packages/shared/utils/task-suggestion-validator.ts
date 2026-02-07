// Validation layer for AI-generated task suggestions
// Runs before any suggestion is returned to the client

import {
  EVIDENCE_BASED_INTERVENTIONS,
  getInterventionById,
} from '../data/evidence-based-interventions';
import type { TaskCategory } from '../types/care-plan';

interface GeneratedTask {
  intervention_id: string;
  category: TaskCategory;
  title: string;
  hint_text: string;
  time: string;
  duration_minutes?: number;
  evidence_source?: string;
  recurrence?: string;
}

// Terms that must never appear in user-facing task text
const BANNED_TERMS = [
  'dementia',
  'cognitive decline',
  'brain training',
  "alzheimer's",
  'alzheimers',
  'alzheimer',
  'neurodegeneration',
  'cognitive impairment',
  'mental deterioration',
];

export function validateTaskSuggestion(
  task: GeneratedTask,
  patientStage?: string,
  mobilityFlags?: string[]
): { valid: boolean; reason?: string } {
  // 1. Must map to a real intervention ID
  const intervention = getInterventionById(task.intervention_id);
  if (!intervention) {
    return { valid: false, reason: `Unknown intervention_id: ${task.intervention_id}` };
  }

  // 2. Category must match
  if (task.category !== intervention.category) {
    return { valid: false, reason: `Category mismatch: task=${task.category}, intervention=${intervention.category}` };
  }

  // 3. Duration must be within 1.5x of evidence recommendation
  if (task.duration_minutes && task.duration_minutes > intervention.durationMinutes * 1.5) {
    return { valid: false, reason: `Duration ${task.duration_minutes}min exceeds 1.5x evidence recommendation of ${intervention.durationMinutes}min` };
  }

  // 4. Check contraindications against patient profile
  if (intervention.contraindications && mobilityFlags) {
    const flaggedContraindications = intervention.contraindications.filter(
      (c) => mobilityFlags.includes(c)
    );
    if (flaggedContraindications.length > 0) {
      return { valid: false, reason: `Contraindicated for patient: ${flaggedContraindications.join(', ')}` };
    }
  }

  // 5. Check for banned terms in title and hint_text
  const textToCheck = `${task.title} ${task.hint_text}`.toLowerCase();
  for (const term of BANNED_TERMS) {
    if (textToCheck.includes(term)) {
      return { valid: false, reason: `Contains banned term: "${term}"` };
    }
  }

  // 6. For moderate/late stages, filter out high-difficulty tasks
  if (patientStage === 'moderate' || patientStage === 'late') {
    if (intervention.difficultyLevel === 'engaging') {
      return { valid: false, reason: `Task difficulty "${intervention.difficultyLevel}" too high for ${patientStage} stage` };
    }
  }

  return { valid: true };
}

export function validateAndFilterSuggestions(
  tasks: GeneratedTask[],
  patientStage?: string,
  mobilityFlags?: string[]
): GeneratedTask[] {
  return tasks.filter((task) => {
    const result = validateTaskSuggestion(task, patientStage, mobilityFlags);
    if (!result.valid) {
      console.warn(`[task-validator] Rejected task: ${result.reason}`);
    }
    return result.valid;
  });
}

// Enrich a validated task with evidence data from the library
export function enrichWithEvidence(task: GeneratedTask): GeneratedTask & {
  evidence_source: string;
  evidence_finding: string;
} {
  const intervention = getInterventionById(task.intervention_id);
  if (!intervention) {
    return {
      ...task,
      evidence_source: '',
      evidence_finding: '',
    };
  }

  return {
    ...task,
    evidence_source: `${intervention.evidence.source} (${intervention.evidence.study})`,
    evidence_finding: intervention.evidence.finding,
  };
}

// Get valid intervention IDs (for quick lookup)
export function getValidInterventionIds(): Set<string> {
  return new Set(EVIDENCE_BASED_INTERVENTIONS.map((i) => i.id));
}
