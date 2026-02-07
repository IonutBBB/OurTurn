/**
 * SAFETY CLASSIFICATION SYSTEM
 * Every user message is classified before the AI processes it.
 * Classification determines: routing, response constraints, and escalation.
 */

export enum SafetyLevel {
  GREEN = 'green',
  YELLOW = 'yellow',
  ORANGE = 'orange',
  RED = 'red',
}

export interface ClassificationResult {
  level: SafetyLevel;
  triggers: string[];
  triggerCategory?: string;
  referralTarget?: string;
  blockedTopics?: string[];
}

interface TriggerDef {
  patterns: string[];
  response: string;
  action: string;
  referralTarget?: string;
  blockedTopics?: string[];
}

const RED_TRIGGERS: Record<string, TriggerDef> = {
  selfHarm: {
    patterns: [
      'want to die', 'kill myself', 'end it all', "can't go on",
      'better off without me', 'no reason to live', 'suicidal',
      'hurt myself', 'self-harm', "don't want to be here anymore",
      'take all the pills', 'overdose on purpose',
    ],
    response: 'CRISIS_SELF_HARM',
    action: 'Show crisis resources immediately. Do NOT attempt counseling.',
  },
  abuseDetected: {
    patterns: [
      'i hit them', 'i slapped', 'i shook them', 'i locked them in',
      'not feeding them', 'left alone for days', 'tied them',
      'taking their money', 'forging their signature',
      'they have bruises', 'someone is hurting them',
    ],
    response: 'CRISIS_ABUSE',
    action: 'Show adult protective services resources.',
  },
  immediateDanger: {
    patterns: [
      'left the stove on', 'went missing', "can't find them anywhere",
      'wandered off and', 'not breathing', "fell and can't get up",
      'choking right now', 'unconscious', 'having a seizure',
      'took wrong medication', 'took too many pills',
    ],
    response: 'CRISIS_EMERGENCY',
    action: 'Direct to call emergency services immediately.',
  },
  caregiverCrisis: {
    patterns: [
      "i can't do this anymore and", "i'm going to snap",
      'i want to hurt them', "i'm afraid i'll hurt",
      "i'm having a breakdown", 'going to lose it completely',
    ],
    response: 'CRISIS_CAREGIVER',
    action: 'Acknowledge distress, show caregiver crisis line and respite care resources.',
  },
};

const ORANGE_TRIGGERS: Record<string, TriggerDef> = {
  medicationConfusion: {
    patterns: [
      'wrong pills', 'double dose', 'missed medication',
      'mixed up medications', 'what does this pill do',
      'should i give them', 'can they take', 'medication interaction',
      'stopped their medication', 'ran out of medication',
    ],
    response: 'REFER_MEDICATION',
    action: 'Do NOT advise on medication. Direct to pharmacist or prescribing doctor.',
    referralTarget: 'pharmacist or prescribing doctor',
    blockedTopics: ['medication names', 'dosages', 'drug interactions'],
  },
  suddenChange: {
    patterns: [
      'suddenly confused', 'dramatic change', 'overnight decline',
      'acting completely different', "doesn't recognize me anymore",
      'became aggressive out of nowhere', 'hallucinating',
      "suddenly can't walk", 'new symptom appeared',
    ],
    response: 'REFER_URGENT_MEDICAL',
    action: 'Sudden changes may indicate delirium, infection, or stroke. Recommend same-day medical evaluation.',
    referralTarget: 'doctor or urgent care — same-day evaluation',
    blockedTopics: ['diagnosis', 'disease staging', 'prognosis'],
  },
  fallsInjury: {
    patterns: [
      'fell today', 'keeps falling', 'hit their head',
      "can't bear weight", 'swollen after fall', 'bleeding after fall',
    ],
    response: 'REFER_FALLS',
    action: 'Falls in elderly require medical assessment.',
    referralTarget: 'doctor or emergency services depending on severity',
    blockedTopics: ['diagnosis', 'medication'],
  },
  drivingSafety: {
    patterns: [
      'still driving', 'had an accident while driving', 'got lost driving',
      'should they drive', 'keys to the car', 'driving and dementia',
    ],
    response: 'REFER_DRIVING',
    action: 'Do NOT make a determination. Refer to GP for driving assessment.',
    referralTarget: 'doctor for a formal driving assessment',
    blockedTopics: ['fitness to drive determination'],
  },
  swallowingDifficulty: {
    patterns: [
      'choking on food', 'difficulty swallowing', 'refusing to eat for days',
      'not eating for days', 'lost a lot of weight', 'aspirating food',
    ],
    response: 'REFER_NUTRITION',
    action: 'Eating/swallowing changes can be serious. Refer to GP and speech-language therapist.',
    referralTarget: 'doctor and speech-language therapist',
    blockedTopics: ['dietary prescriptions', 'medical nutrition'],
  },
};

const YELLOW_TRIGGERS: Record<string, TriggerDef> = {
  behavioralSymptoms: {
    patterns: [
      'aggressive behavior', 'agitated', 'wandering at night', 'sundowning',
      'refusing care', 'yelling at me', 'paranoid', 'suspicious of everyone',
      'repetitive questions', 'hoarding things', 'hiding things',
      'undressing in public', 'inappropriate behavior',
    ],
    response: 'SUPPORTIVE_WITH_REFERRAL',
    action: 'Provide evidence-based non-pharmacological strategies.',
  },
  caregiverStress: {
    patterns: [
      'so exhausted', 'no one helps me', 'all alone in this',
      'completely overwhelmed', "can't sleep at all", 'feeling guilty',
      'resentful', 'angry at them', 'miss who they were',
      'grieving', 'mourning who they were', 'burning out',
    ],
    response: 'SUPPORTIVE_CAREGIVER',
    action: 'Validate feelings. Provide self-care suggestions. Mention respite care and support groups.',
  },
  sleepProblems: {
    patterns: [
      'not sleeping at all', 'up all night', 'sleeps all day',
      'confused at night', 'nighttime wandering',
    ],
    response: 'SUPPORTIVE_SLEEP',
    action: 'Provide evidence-based sleep hygiene recommendations.',
  },
  continenceIssues: {
    patterns: [
      'incontinent', 'wetting themselves', 'bathroom accidents',
      "won't use the toilet", 'soiling clothes',
    ],
    response: 'SUPPORTIVE_CONTINENCE',
    action: 'Provide practical, dignity-preserving tips.',
  },
};

function messageLower(message: string): string {
  return message.toLowerCase();
}

function checkTriggerGroup(
  message: string,
  triggers: Record<string, TriggerDef>,
): { triggered: boolean; category?: string; trigger?: TriggerDef } {
  const lower = messageLower(message);
  for (const [category, trigger] of Object.entries(triggers)) {
    for (const pattern of trigger.patterns) {
      if (lower.includes(pattern)) {
        return { triggered: true, category, trigger };
      }
    }
  }
  return { triggered: false };
}

export function classifyMessage(message: string): ClassificationResult {
  // Check RED triggers first (highest priority)
  const redCheck = checkTriggerGroup(message, RED_TRIGGERS);
  if (redCheck.triggered && redCheck.trigger && redCheck.category) {
    return {
      level: SafetyLevel.RED,
      triggers: [redCheck.trigger.response],
      triggerCategory: redCheck.category,
    };
  }

  // Check ORANGE triggers
  const orangeCheck = checkTriggerGroup(message, ORANGE_TRIGGERS);
  if (orangeCheck.triggered && orangeCheck.trigger && orangeCheck.category) {
    return {
      level: SafetyLevel.ORANGE,
      triggers: [orangeCheck.trigger.response],
      triggerCategory: orangeCheck.category,
      referralTarget: orangeCheck.trigger.referralTarget,
      blockedTopics: orangeCheck.trigger.blockedTopics,
    };
  }

  // Check YELLOW triggers
  const yellowCheck = checkTriggerGroup(message, YELLOW_TRIGGERS);
  if (yellowCheck.triggered && yellowCheck.trigger && yellowCheck.category) {
    return {
      level: SafetyLevel.YELLOW,
      triggers: [yellowCheck.trigger.response],
      triggerCategory: yellowCheck.category,
    };
  }

  // GREEN — normal operation
  return {
    level: SafetyLevel.GREEN,
    triggers: [],
  };
}
