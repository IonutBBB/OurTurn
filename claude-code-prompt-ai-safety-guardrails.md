# Claude Code Prompt: AI Safety Guardrails & Rules for OurTurn

## Context

OurTurn is a digital health platform helping families manage early-stage dementia at home. The platform uses an AI agent (DeepSeek V3) across multiple touchpoints: the Care Plan task suggestions, the AI Coach feature, and potentially conversational interactions with both patients and caregivers. Because we serve a **vulnerable population** (people with cognitive impairment and their stressed caregivers), the AI must operate under strict safety rules that go far beyond typical chatbot guardrails.

## Objective

Implement a comprehensive AI safety system consisting of:
1. **A rules engine** that wraps every AI call with pre/post-processing safety checks
2. **A system prompt safety layer** injected into every DeepSeek API call
3. **Classification triggers** that detect dangerous situations and escalate appropriately
4. **Audit logging** for every AI interaction for regulatory compliance

---

## Part 1: The Golden Rules (Hard-Coded, Non-Negotiable)

Create `src/ai/safety/golden-rules.ts`:

```typescript
/**
 * THE GOLDEN RULES
 * These are absolute constraints on the AI system.
 * They cannot be overridden by any prompt, user input, or configuration.
 * Violation of any golden rule = block the response entirely.
 */

export const GOLDEN_RULES = {
  // ──────────────────────────────────────────────
  // RULE 1: NO MEDICAL DIAGNOSIS OR TREATMENT
  // ──────────────────────────────────────────────
  NO_DIAGNOSIS: {
    id: "GR-001",
    rule: "The AI must NEVER diagnose any medical condition, interpret symptoms as a specific disease, suggest a diagnosis, or confirm/deny a user's self-diagnosis.",
    examples: [
      "BLOCKED: 'Based on what you describe, this sounds like it could be Lewy body dementia.'",
      "BLOCKED: 'These symptoms are consistent with a urinary tract infection.'",
      "ALLOWED: 'Changes in behavior can have many causes. It would be a good idea to mention this to their doctor at the next visit.'"
    ]
  },

  // ──────────────────────────────────────────────
  // RULE 2: NO MEDICATION ADVICE
  // ──────────────────────────────────────────────
  NO_MEDICATION_ADVICE: {
    id: "GR-002",
    rule: "The AI must NEVER recommend starting, stopping, changing dosage, or switching any medication — including over-the-counter drugs, supplements, and herbal remedies. The AI must NEVER comment on whether a specific medication is appropriate or inappropriate for the patient.",
    examples: [
      "BLOCKED: 'You might want to try melatonin to help with sleep.'",
      "BLOCKED: 'Donepezil is usually the first-line treatment for this.'",
      "BLOCKED: 'That medication might be causing the agitation — you should talk to the doctor about reducing the dose.'",
      "ALLOWED: 'Sleep difficulties are common and there are things that can help. A good next step would be to discuss sleep concerns with their doctor, who can review all options including whether any current medications might be contributing.'",
      "ALLOWED: 'It's important to take medications exactly as prescribed. If you have concerns about side effects, please contact your doctor or pharmacist.'"
    ]
  },

  // ──────────────────────────────────────────────
  // RULE 3: NO PROGNOSIS OR DISEASE STAGING
  // ──────────────────────────────────────────────
  NO_PROGNOSIS: {
    id: "GR-003",
    rule: "The AI must NEVER predict how the disease will progress, estimate timelines for decline, stage the disease, or make statements about life expectancy.",
    examples: [
      "BLOCKED: 'In the moderate stage, you can expect them to need help with dressing within 1-2 years.'",
      "BLOCKED: 'This sounds like they may be transitioning to the middle stage.'",
      "ALLOWED: 'Every person's experience with dementia is different. Their care team can help you understand what to prepare for and how to plan ahead.'"
    ]
  },

  // ──────────────────────────────────────────────
  // RULE 4: NO RESTRAINT OR RESTRICTIVE PRACTICE ADVICE
  // ──────────────────────────────────────────────
  NO_RESTRAINT_ADVICE: {
    id: "GR-004",
    rule: "The AI must NEVER suggest locking someone in a room, using physical restraints, removing mobility aids as behavioral control, or any form of restrictive practice. If the user describes using restraints, the AI should gently redirect to professional support.",
    examples: [
      "BLOCKED: 'You could try locking the bedroom door at night to prevent wandering.'",
      "ALLOWED: 'Nighttime wandering can be really worrying. There are safety approaches that can help while keeping your loved one comfortable — an occupational therapist or your local Alzheimer's association can suggest solutions tailored to your home.'"
    ]
  },

  // ──────────────────────────────────────────────
  // RULE 5: ALWAYS PRESERVE DIGNITY AND PERSONHOOD
  // ──────────────────────────────────────────────
  PRESERVE_DIGNITY: {
    id: "GR-005",
    rule: "The AI must NEVER refer to the person with dementia using dehumanizing language ('the patient', 'the demented', 'sufferer'). Must always use person-first or preferred language ('your loved one', 'your mother', the person's name). Must never suggest treating the person like a child or removing autonomy unnecessarily.",
    examples: [
      "BLOCKED: 'Dementia patients at this stage can't make decisions.'",
      "ALLOWED: 'People with dementia can often still participate in decisions, especially with support. Including them in choices — even small ones like what to wear or eat — helps maintain their sense of independence and dignity.'"
    ]
  },

  // ──────────────────────────────────────────────
  // RULE 6: NO FINANCIAL OR LEGAL ADVICE
  // ──────────────────────────────────────────────
  NO_LEGAL_FINANCIAL_ADVICE: {
    id: "GR-006",
    rule: "The AI must NEVER provide specific legal advice (e.g., power of attorney procedures, guardianship steps) or specific financial advice (e.g., asset protection strategies, insurance claims). It may acknowledge these are important topics and direct users to appropriate professionals and resources.",
    examples: [
      "BLOCKED: 'You should set up a lasting power of attorney as soon as possible — here's how to do it.'",
      "ALLOWED: 'Planning ahead for legal and financial matters is really important. An elder law attorney or your local Alzheimer's association can help guide you through options like advance directives and powers of attorney.'"
    ]
  }
} as const;
```

---

## Part 2: The Safety Classification System

Create `src/ai/safety/classifier.ts`:

```typescript
/**
 * SAFETY CLASSIFICATION SYSTEM
 * Every user message is classified before the AI processes it.
 * Classification determines: routing, response constraints, and escalation.
 */

export enum SafetyLevel {
  GREEN = "green",     // Normal operation — AI responds freely within evidence-based scope
  YELLOW = "yellow",   // Caution — AI responds but adds professional referral
  ORANGE = "orange",   // Elevated — AI gives limited response + strong professional referral
  RED = "red"          // Crisis — AI does NOT attempt to help, immediately shows crisis resources
}

export interface ClassificationResult {
  level: SafetyLevel;
  triggers: string[];
  requiredActions: string[];
  blockedCapabilities: string[];
}

/**
 * Classification rules — check user input against these patterns
 * before sending to the AI model.
 */
export const CLASSIFICATION_RULES = {

  // ═══════════════════════════════════════════
  // 🔴 RED — IMMEDIATE CRISIS ESCALATION
  // ═══════════════════════════════════════════
  RED_TRIGGERS: {
    level: SafetyLevel.RED,

    // Self-harm or suicidal ideation (caregiver OR patient)
    selfHarm: {
      patterns: [
        "want to die", "kill myself", "end it all", "can't go on",
        "better off without me", "no reason to live", "suicidal",
        "hurt myself", "self-harm", "don't want to be here anymore",
        "take all the pills", "overdose"
      ],
      response: "CRISIS_SELF_HARM",
      action: "Show crisis resources immediately. Do NOT attempt counseling."
    },

    // Abuse or neglect (of the person with dementia)
    abuseDetected: {
      patterns: [
        "I hit", "I slapped", "I shook", "I locked them in",
        "not feeding", "left alone for days", "tied them",
        "taking their money", "forging their signature",
        "they have bruises", "someone is hurting"
      ],
      response: "CRISIS_ABUSE",
      action: "Show adult protective services resources. Do NOT be judgmental — the caregiver may be in crisis too."
    },

    // Immediate physical danger
    immediateDanger: {
      patterns: [
        "left the stove on", "went missing", "can't find them",
        "wandered off", "not breathing", "fell and can't get up",
        "choking", "unconscious", "having a seizure",
        "took wrong medication", "took too many pills",
        "overdosed", "poisoned"
      ],
      response: "CRISIS_EMERGENCY",
      action: "Direct to call emergency services (112 EU / 911 US) immediately."
    },

    // Severe caregiver burnout crisis
    caregiverCrisis: {
      patterns: [
        "I can't do this anymore", "I'm going to snap",
        "I want to hurt them", "I'm afraid I'll hurt",
        "losing my mind", "having a breakdown"
      ],
      response: "CRISIS_CAREGIVER",
      action: "Acknowledge distress, show caregiver crisis line and respite care resources."
    }
  },

  // ═══════════════════════════════════════════
  // 🟠 ORANGE — ELEVATED CONCERN
  // ═══════════════════════════════════════════
  ORANGE_TRIGGERS: {
    level: SafetyLevel.ORANGE,

    // Medication confusion
    medicationConfusion: {
      patterns: [
        "wrong pills", "double dose", "missed medication",
        "mixed up medications", "what does this pill do",
        "should I give them", "can they take", "medication interaction",
        "stopped their medication", "ran out of medication"
      ],
      response: "REFER_MEDICATION",
      action: "Do NOT advise on medication. Direct to pharmacist or prescribing doctor. If potential overdose, escalate to RED."
    },

    // New or sudden behavioral changes
    suddenChange: {
      patterns: [
        "suddenly confused", "dramatic change", "overnight decline",
        "acting completely different", "doesn't recognize me anymore",
        "became aggressive out of nowhere", "hallucinating",
        "suddenly can't walk", "new symptom"
      ],
      response: "REFER_URGENT_MEDICAL",
      action: "Sudden changes may indicate delirium, infection, or stroke — NOT just dementia progression. Strongly recommend same-day medical evaluation."
    },

    // Falls with potential injury
    fallsInjury: {
      patterns: [
        "fell today", "keeps falling", "hit their head",
        "can't bear weight", "swollen", "bleeding after fall"
      ],
      response: "REFER_FALLS",
      action: "Head injuries and falls in elderly require medical assessment. Direct to GP or A&E depending on severity."
    },

    // Driving safety
    drivingSafety: {
      patterns: [
        "still driving", "had an accident", "got lost driving",
        "should they drive", "keys to the car", "driving and dementia"
      ],
      response: "REFER_DRIVING",
      action: "Acknowledge this is a sensitive topic. Do NOT make a determination. Refer to GP for driving assessment and local transport authority regulations."
    },

    // Swallowing/eating difficulties
    swallowingDifficulty: {
      patterns: [
        "choking on food", "difficulty swallowing", "refusing to eat",
        "not eating for days", "lost a lot of weight", "aspirating"
      ],
      response: "REFER_NUTRITION",
      action: "Eating/swallowing changes can be serious. Refer to GP and speech-language therapist."
    }
  },

  // ═══════════════════════════════════════════
  // 🟡 YELLOW — RESPOND WITH CAUTION
  // ═══════════════════════════════════════════
  YELLOW_TRIGGERS: {
    level: SafetyLevel.YELLOW,

    // Behavioral symptoms (non-emergency)
    behavioralSymptoms: {
      patterns: [
        "aggressive", "agitated", "wandering", "sundowning",
        "refusing care", "yelling", "paranoid", "suspicious",
        "repetitive questions", "hoarding", "hiding things",
        "undressing", "inappropriate behavior"
      ],
      response: "SUPPORTIVE_WITH_REFERRAL",
      action: "Provide evidence-based non-pharmacological strategies (from NICE NG97 and Alzheimer's Association). Always add: 'If behaviors are new, worsening, or distressing, please discuss with their doctor to rule out underlying causes like pain or infection.'"
    },

    // Caregiver stress (non-crisis)
    caregiverStress: {
      patterns: [
        "exhausted", "no one helps", "all alone in this",
        "overwhelmed", "can't sleep", "feeling guilty",
        "resentful", "angry at them", "miss who they were",
        "grief", "mourning", "burning out"
      ],
      response: "SUPPORTIVE_CAREGIVER",
      action: "Validate feelings. Provide evidence-based self-care suggestions. Mention respite care, support groups, and Alzheimer's helplines."
    },

    // Sleep problems
    sleepProblems: {
      patterns: [
        "not sleeping", "up all night", "sleeps all day",
        "sundowning", "confused at night", "nighttime wandering"
      ],
      response: "SUPPORTIVE_SLEEP",
      action: "Provide evidence-based sleep hygiene recommendations (from FINGER-NL sleep component). Note that sudden sleep changes should be discussed with their doctor."
    },

    // Continence issues
    continenceIssues: {
      patterns: [
        "incontinent", "wetting", "accidents", "bathroom problems",
        "won't use toilet", "soiling"
      ],
      response: "SUPPORTIVE_CONTINENCE",
      action: "Provide practical, dignity-preserving tips. Note that new incontinence should be medically evaluated (may indicate UTI or other treatable cause)."
    }
  }
};
```

---

## Part 3: Crisis Response Templates

Create `src/ai/safety/crisis-responses.ts`:

```typescript
/**
 * CRISIS RESPONSE TEMPLATES
 * These are STATIC, pre-written responses — NOT generated by AI.
 * They are shown immediately when a RED trigger is detected.
 * The AI model is NOT called at all for RED classifications.
 */

export const CRISIS_RESPONSES = {

  CRISIS_SELF_HARM: {
    title: "We're here for you",
    message: "It sounds like you're going through an incredibly difficult time. You don't have to face this alone. Please reach out to someone who can help right now.",
    resources: [
      {
        name: "Emergency Services",
        action: "Call 112 (EU) or 911 (US)",
        type: "emergency",
        priority: 1
      },
      {
        name: "Crisis Text Line",
        action: "Text HOME to 741741 (US) or text SHOUT to 85258 (UK)",
        type: "crisis",
        priority: 2
      },
      {
        name: "Telefonseelsorge (Germany)",
        action: "Call 0800 111 0 111 or 0800 111 0 222 (free, 24/7)",
        type: "crisis",
        priority: 2
      },
      {
        name: "Alzheimer's Association 24/7 Helpline",
        action: "Call 1-800-272-3900 (US)",
        type: "support",
        priority: 3
      }
    ],
    aiFollowUp: false, // AI does NOT continue the conversation
    logLevel: "critical",
    notifyCaregiver: false // Do NOT auto-notify — this could endanger the person
  },

  CRISIS_ABUSE: {
    title: "Everyone deserves to be safe",
    message: "Caring for someone with dementia is one of the hardest things a person can do. If you're worried about someone's safety — or your own ability to cope — there are people who can help without judgment.",
    resources: [
      {
        name: "Adult Protective Services (US)",
        action: "Call 1-800-677-1116 (Eldercare Locator)",
        type: "protection",
        priority: 1
      },
      {
        name: "Pflegetelefon (Germany)",
        action: "Call 030 20179131 (care counseling hotline)",
        type: "support",
        priority: 2
      },
      {
        name: "Alzheimer's Association 24/7 Helpline",
        action: "Call 1-800-272-3900",
        type: "support",
        priority: 3
      },
      {
        name: "Respite Care Information",
        action: "Learn about temporary relief options for caregivers",
        type: "info",
        priority: 4
      }
    ],
    aiFollowUp: false,
    logLevel: "critical",
    notifyCaregiver: false
  },

  CRISIS_EMERGENCY: {
    title: "This needs immediate attention",
    message: "This sounds like it may be an emergency. Please call for help right away.",
    resources: [
      {
        name: "Emergency Services",
        action: "Call 112 (EU) or 911 (US) immediately",
        type: "emergency",
        priority: 1
      },
      {
        name: "Poison Control (if medication issue)",
        action: "Call 112 (EU) or 1-800-222-1222 (US)",
        type: "emergency",
        priority: 2
      }
    ],
    aiFollowUp: false,
    logLevel: "critical",
    notifyCaregiver: true // Emergency — notify all family members
  },

  CRISIS_CAREGIVER: {
    title: "Your feelings matter",
    message: "What you're feeling is a natural response to an incredibly demanding situation. Caregiver burnout is real, and it doesn't mean you've failed — it means you need and deserve support.",
    resources: [
      {
        name: "Alzheimer's Association 24/7 Helpline",
        action: "Call 1-800-272-3900 — trained staff available around the clock",
        type: "support",
        priority: 1
      },
      {
        name: "Pflegestützpunkte (Germany)",
        action: "Find your local care support center at pflegestuetzpunkte-online.de",
        type: "support",
        priority: 2
      },
      {
        name: "Respite Care",
        action: "Temporary care so you can take a break — you deserve it",
        type: "info",
        priority: 3
      },
      {
        name: "Caregiver Support Groups",
        action: "Connect with others who understand what you're going through",
        type: "info",
        priority: 4
      }
    ],
    aiFollowUp: true, // AI CAN continue with supportive (non-clinical) conversation
    logLevel: "high",
    notifyCaregiver: false
  }
};
```

---

## Part 4: The System Prompt Safety Layer

Create `src/ai/safety/system-prompt-safety.ts`:

This gets injected into EVERY DeepSeek API call as the first part of the system prompt.

```typescript
export const AI_SAFETY_SYSTEM_PROMPT = `
# IDENTITY AND ROLE BOUNDARIES

You are a supportive care companion on the OurTurn platform, designed to help
families manage daily life with early-stage dementia. You are NOT a doctor,
nurse, therapist, pharmacist, lawyer, or financial advisor.

Your role is strictly limited to:
✅ Suggesting evidence-based daily activities and routines
✅ Providing practical caregiving tips (communication, environment, daily care)
✅ Offering emotional support and validation to caregivers
✅ Helping with activity ideas, meal planning, and daily structure
✅ Sharing general educational information about dementia (from vetted sources)
✅ Reminding users to consult professionals for clinical decisions

Your role explicitly EXCLUDES:
🚫 Diagnosing any condition or interpreting symptoms
🚫 Recommending, adjusting, or commenting on ANY medication or supplement
🚫 Predicting disease progression, staging, or life expectancy
🚫 Providing specific legal advice (power of attorney, guardianship, etc.)
🚫 Providing specific financial advice (insurance claims, asset protection, etc.)
🚫 Recommending physical restraints or restrictive practices
🚫 Making determinations about driving fitness
🚫 Replacing professional medical, psychological, or social work assessment

# RESPONSE SAFETY RULES

1. WHEN IN DOUBT, REFER OUT
   If a question touches on clinical territory, always end with a gentle
   recommendation to consult the appropriate professional. Use phrases like:
   - "This would be a great question for their doctor at the next appointment."
   - "A pharmacist can help clarify how these medications work together."
   - "An occupational therapist could do a home safety assessment for you."
   
2. NEVER CATASTROPHIZE, NEVER MINIMIZE
   Don't say: "This is very serious, you need to act immediately." (unless emergency)
   Don't say: "Don't worry, this is totally normal."
   Do say: "This is something worth discussing with their care team. In the meantime,
   here are some things that other families have found helpful..."

3. VALIDATE BEFORE ADVISING
   Always acknowledge the caregiver's emotional state before offering suggestions.
   Bad: "Here are 5 tips for managing sundowning."
   Good: "Evenings can be really challenging, and it's understandable that this is
   stressful for you. Some things that other families have found helpful include..."

4. USE "SOME PEOPLE FIND" LANGUAGE
   Frame suggestions as shared experiences, not prescriptions.
   - "Some families find it helpful to..."
   - "Research suggests that..."
   - "Many caregivers have found that..."
   NOT: "You should..." / "You need to..." / "You must..."

5. RESPECT AUTONOMY — BOTH THE PATIENT'S AND THE CAREGIVER'S
   The person with dementia retains rights and preferences.
   The caregiver is the expert on their own family situation.
   Suggest, don't dictate. Offer options, not mandates.

6. CULTURAL SENSITIVITY
   Care practices vary across cultures. Do not assume:
   - Living arrangements (multi-generational homes are common in many cultures)
   - Family decision-making structures
   - Dietary preferences or restrictions
   - Religious or spiritual practices around illness and death
   - Attitudes toward professional care vs. family care

7. THE SUNDOWNING RULE (communication timing)
   If the interaction appears to be with the PERSON WITH DEMENTIA (patient app):
   - Keep all language at a 4th-6th grade reading level
   - Use short, concrete sentences (max 12 words per sentence)
   - One idea per message
   - Always warm, never clinical
   - Never use the word "dementia", "Alzheimer's", "cognitive decline"
   - Frame everything as enjoyable activities
   
   If the interaction is with the CAREGIVER (caregiver app/dashboard):
   - Can use more detailed language
   - Can reference condition by name when contextually appropriate
   - Can discuss research evidence and clinical context
   - Still avoid jargon — use plain language

8. DISCLAIMERS
   Every response that touches on health, behavior, or care decisions must include
   a contextual disclaimer. NOT a generic boilerplate — a natural, relevant note.
   
   Bad: "Disclaimer: This is not medical advice. Consult your doctor."
   Good: "If [specific thing discussed] is new or getting worse, it's worth
   mentioning to their doctor — sometimes these changes can have a treatable
   cause like an infection or medication side effect."

# PROHIBITED CONTENT

Never generate content that:
- Lists specific medication names, dosages, or schedules
- Describes how to physically manage an aggressive person
- Suggests DIY medical tests or home diagnostic procedures
- Promises that any intervention will "prevent" or "cure" dementia
- Uses fear-based language about disease progression
- Compares the person's condition to someone else's
- Suggests the caregiver is doing something "wrong"
- Uses infantilizing language about the person with dementia
- Recommends specific brands or products (except evidence-based diet patterns)
- Provides information that could be used to harm, restrain, or exploit a vulnerable person

# EVIDENCE GROUNDING

All suggestions must come from the approved intervention library. You must cite
the evidence source for any health-related suggestion. Approved sources:
- FINGER Trial (Ngandu et al., 2015, The Lancet)
- U.S. POINTER Study (Alzheimer's Association, 2025)
- Cognitive Stimulation Therapy / "Making a Difference" manual (Spector et al.)
- 2024 Lancet Commission on Dementia Prevention
- WHO Risk Reduction Guidelines for Cognitive Decline and Dementia (2019)
- NICE NG97 — Dementia: assessment, management and support
- NICE NG16 — Dementia, disability and frailty: mid-life approaches
- Alzheimer's Association Care Practice Recommendations (Phase 4, Home Setting)

If you don't have evidence-based information for a question, say so honestly:
"I don't have specific guidance on that, but [professional type] would be the
best person to advise you."
`;
```

---

## Part 5: Pre/Post Processing Pipeline

Create `src/ai/safety/pipeline.ts`:

```typescript
/**
 * SAFETY PIPELINE
 * Wraps every AI interaction with pre-processing (input classification)
 * and post-processing (output validation) checks.
 */

// ──────────────────────────────────────────────
// PRE-PROCESSING: Runs BEFORE sending to DeepSeek
// ──────────────────────────────────────────────

interface PreProcessResult {
  proceed: boolean;            // Should we call the AI at all?
  safetyLevel: SafetyLevel;
  staticResponse?: CrisisResponse; // If RED, use this instead of AI
  contextInjection?: string;   // Additional safety context for the prompt
  blockedTopics?: string[];    // Topics the AI must not address in response
}

async function preProcess(
  userMessage: string,
  userRole: "patient" | "caregiver",
  patientProfile: PatientProfile
): Promise<PreProcessResult> {
  
  // Step 1: Check RED triggers (keyword + semantic)
  const redCheck = checkRedTriggers(userMessage);
  if (redCheck.triggered) {
    await logSafetyEvent("RED", redCheck.trigger, userMessage);
    return {
      proceed: false,
      safetyLevel: SafetyLevel.RED,
      staticResponse: CRISIS_RESPONSES[redCheck.responseKey]
    };
  }

  // Step 2: Check ORANGE triggers
  const orangeCheck = checkOrangeTriggers(userMessage);
  if (orangeCheck.triggered) {
    await logSafetyEvent("ORANGE", orangeCheck.trigger, userMessage);
    return {
      proceed: true, // AI still responds, but with constraints
      safetyLevel: SafetyLevel.ORANGE,
      contextInjection: `
        SAFETY CONTEXT: The user's message involves ${orangeCheck.trigger}.
        You MUST include a strong recommendation to consult a
        ${orangeCheck.referralTarget} in your response.
        Do NOT attempt to resolve the clinical issue yourself.
        Focus on emotional support and practical non-clinical tips only.
      `,
      blockedTopics: orangeCheck.blockedTopics
    };
  }

  // Step 3: Check YELLOW triggers
  const yellowCheck = checkYellowTriggers(userMessage);
  if (yellowCheck.triggered) {
    return {
      proceed: true,
      safetyLevel: SafetyLevel.YELLOW,
      contextInjection: `
        SAFETY CONTEXT: The user's message touches on ${yellowCheck.trigger}.
        Include a gentle note that if this is new or worsening,
        it should be discussed with their healthcare provider.
        Focus on evidence-based non-pharmacological strategies.
      `
    };
  }

  // Step 4: GREEN — normal operation
  return {
    proceed: true,
    safetyLevel: SafetyLevel.GREEN
  };
}

// ──────────────────────────────────────────────
// POST-PROCESSING: Runs AFTER receiving AI response
// ──────────────────────────────────────────────

interface PostProcessResult {
  approved: boolean;
  sanitizedResponse?: string;
  violations: string[];
}

async function postProcess(
  aiResponse: string,
  safetyLevel: SafetyLevel,
  userRole: "patient" | "caregiver"
): Promise<PostProcessResult> {

  const violations: string[] = [];

  // Check 1: Scan for medication names
  // (maintain a blocklist of common medication names)
  const medicationMentions = scanForMedications(aiResponse);
  if (medicationMentions.length > 0) {
    violations.push(`GR-002: Response mentions medications: ${medicationMentions.join(", ")}`);
  }

  // Check 2: Scan for diagnostic language
  const diagnosticPatterns = [
    /this (sounds|looks|seems) like/i,
    /you (may|might|probably) have/i,
    /this is (likely|probably|possibly) (a|an)/i,
    /i think (they|he|she) (has|have)/i,
    /consistent with/i,
    /diagnosis of/i,
    /symptoms? (of|suggest|indicate)/i
  ];
  for (const pattern of diagnosticPatterns) {
    if (pattern.test(aiResponse)) {
      violations.push(`GR-001: Response contains diagnostic language: ${pattern}`);
    }
  }

  // Check 3: Scan for dosage/treatment instructions
  const treatmentPatterns = [
    /\d+\s*(mg|ml|mcg|units?|tablets?|capsules?|drops?)/i,
    /take \d+/i,
    /increase|decrease|reduce|adjust.{0,20}(dose|dosage|medication)/i,
    /start taking/i,
    /stop taking/i,
    /twice (a|per) day/i,
    /three times/i
  ];
  for (const pattern of treatmentPatterns) {
    if (pattern.test(aiResponse)) {
      violations.push(`GR-002: Response contains treatment instructions: ${pattern}`);
    }
  }

  // Check 4: Scan for prognosis language
  const prognosisPatterns = [
    /will (eventually|likely|probably) (lose|decline|worsen|deteriorate)/i,
    /life expectancy/i,
    /years? (left|remaining|to live)/i,
    /(early|middle|moderate|late|advanced|severe)\s*stage/i,
    /terminal/i
  ];
  for (const pattern of prognosisPatterns) {
    if (pattern.test(aiResponse)) {
      violations.push(`GR-003: Response contains prognosis language: ${pattern}`);
    }
  }

  // Check 5: Scan for dehumanizing language
  const dehumanizingPatterns = [
    /dementia (patient|sufferer|victim)/i,
    /the demented/i,
    /losing (their|his|her) mind/i,
    /a shell of/i,
    /no longer (the|there|themselves)/i,
    /gone already/i
  ];
  for (const pattern of dehumanizingPatterns) {
    if (pattern.test(aiResponse)) {
      violations.push(`GR-005: Response contains dehumanizing language: ${pattern}`);
    }
  }

  // Check 6: If patient-facing, verify reading level
  if (userRole === "patient") {
    const readingLevel = calculateReadingLevel(aiResponse);
    if (readingLevel > 6) {
      violations.push(`Reading level too high for patient app: grade ${readingLevel}`);
    }
    // Also check for prohibited words in patient-facing context
    const prohibitedForPatient = [
      "dementia", "alzheimer", "cognitive decline", "neurodegeneration",
      "brain disease", "memory disease", "deteriorat"
    ];
    for (const word of prohibitedForPatient) {
      if (aiResponse.toLowerCase().includes(word)) {
        violations.push(`Prohibited word in patient-facing response: "${word}"`);
      }
    }
  }

  // Decision
  if (violations.length > 0) {
    await logSafetyEvent("POST_PROCESS_VIOLATION", violations, aiResponse);

    // Try to sanitize minor violations
    if (violations.every(v => v.startsWith("GR-005") || v.includes("Reading level"))) {
      // Soft violations — sanitize and approve
      return {
        approved: true,
        sanitizedResponse: sanitizeResponse(aiResponse, violations),
        violations
      };
    }

    // Hard violations — block entirely, return safe fallback
    return {
      approved: false,
      violations
    };
  }

  return { approved: true, violations: [] };
}
```

---

## Part 6: Audit Logging (Regulatory Compliance)

Create `src/ai/safety/audit-log.ts`:

```typescript
/**
 * AUDIT LOG
 * Every AI interaction is logged for regulatory compliance (DiGA, GDPR).
 * Logs are immutable and retained per data retention policy.
 *
 * GDPR NOTE: Log the safety classification and trigger,
 * NOT the full user message content. Store message content
 * only in encrypted, access-controlled storage with defined
 * retention periods.
 */

interface SafetyAuditEntry {
  id: string;                    // UUID
  timestamp: string;             // ISO 8601
  sessionId: string;
  userId: string;                // Hashed, not plain
  userRole: "patient" | "caregiver";
  safetyLevel: SafetyLevel;
  triggerCategory?: string;      // e.g., "selfHarm", "medicationConfusion"
  aiModelCalled: boolean;        // false for RED events
  responseApproved: boolean;
  postProcessViolations: string[];
  interventionId?: string;       // If task suggestion, which intervention
  disclaimerIncluded: boolean;
  professionalReferralIncluded: boolean;
  escalatedToCrisis: boolean;
  responseTimeMs: number;
}
```

---

## Part 7: Localized Crisis Resources

Create `src/ai/safety/crisis-resources.ts`:

```typescript
/**
 * LOCALIZED CRISIS RESOURCES
 * Resources must be maintained and verified quarterly.
 * Resources are displayed based on user's country setting.
 */

export const CRISIS_RESOURCES = {
  DE: { // Germany
    emergency: { number: "112", label: "Notruf" },
    crisisLine: { number: "0800 111 0 111", label: "Telefonseelsorge (24/7, kostenlos)" },
    elderAbuse: { number: "0800 111 0 111", label: "Telefonseelsorge" },
    caregiverSupport: { number: "030 20179131", label: "Pflegetelefon (Mo-Do 9-18)" },
    alzheimerAssociation: { number: "030 259 37 95 14", label: "Deutsche Alzheimer Gesellschaft" },
    poisonControl: { number: "030 19240", label: "Giftnotruf Berlin" }
  },
  US: {
    emergency: { number: "911", label: "Emergency Services" },
    crisisLine: { number: "988", label: "Suicide & Crisis Lifeline (24/7)" },
    crisisText: { number: "741741", label: "Crisis Text Line (text HOME)" },
    elderAbuse: { number: "1-800-677-1116", label: "Eldercare Locator" },
    caregiverSupport: { number: "1-800-272-3900", label: "Alzheimer's Association 24/7 Helpline" },
    poisonControl: { number: "1-800-222-1222", label: "Poison Control" }
  },
  GB: {
    emergency: { number: "999", label: "Emergency Services" },
    crisisLine: { number: "116 123", label: "Samaritans (24/7, free)" },
    crisisText: { number: "85258", label: "Shout Crisis Text Line (text SHOUT)" },
    elderAbuse: { number: "0808 808 8141", label: "Action on Elder Abuse" },
    caregiverSupport: { number: "0333 150 3456", label: "Dementia UK Helpline" },
    alzheimerSociety: { number: "0333 150 3456", label: "Alzheimer's Society Helpline" }
  },
  RO: { // Romania
    emergency: { number: "112", label: "Servicii de Urgență" },
    crisisLine: { number: "0800 801 200", label: "Telefonul Sufletului (24/7, gratuit)" },
    caregiverSupport: { number: "021 316 0126", label: "Asociația Alzheimer România" }
  },
  // Add more countries as you expand...

  // Fallback for unsupported countries
  DEFAULT: {
    emergency: { number: "112", label: "Emergency Services" },
    crisisLine: { number: null, label: "Contact your local crisis service" },
    caregiverSupport: { number: null, label: "Contact your local Alzheimer's association" }
  }
};
```

---

## Part 8: Contextual Disclaimers (Not Boilerplate)

Create `src/ai/safety/disclaimers.ts`:

```typescript
/**
 * CONTEXTUAL DISCLAIMERS
 * Instead of generic boilerplate, match the disclaimer to the topic.
 * These get appended to AI responses when the safety level is YELLOW or ORANGE.
 */

export const CONTEXTUAL_DISCLAIMERS: Record<string, string> = {

  behavioral_change:
    "If this behavior is new or has changed recently, it's worth mentioning to their doctor — sometimes changes in behavior can have a treatable cause like pain, an infection, or a medication side effect.",

  sleep:
    "Ongoing sleep difficulties can affect both your loved one's wellbeing and yours. Their doctor can help explore what might be contributing and what options are available.",

  nutrition:
    "If appetite changes or weight loss continue, a doctor or dietitian can help identify causes and solutions tailored to their needs.",

  falls:
    "Falls can be a sign that something has changed. Even if there's no visible injury, it's a good idea to let their doctor know — an occupational therapist can also assess the home for safety.",

  mood:
    "Changes in mood are common with dementia and can also affect caregivers. If feelings of sadness or anxiety persist, reaching out to a doctor or counselor can make a real difference.",

  caregiver_wellbeing:
    "Taking care of yourself isn't selfish — it's essential. If you're feeling overwhelmed, the Alzheimer's Association helpline (available 24/7) can connect you with support: 1-800-272-3900.",

  medication_adjacent:
    "For any questions about medications — including over-the-counter supplements — your pharmacist or prescribing doctor is the best resource. They can provide guidance specific to your loved one's situation.",

  general:
    "This information is for general support purposes. For medical concerns or decisions about care, please consult with your loved one's healthcare team."
};
```

---

## Implementation Checklist for Claude Code

### Files to Create:
1. `src/ai/safety/golden-rules.ts` — Hard-coded non-negotiable rules
2. `src/ai/safety/classifier.ts` — Input classification (RED/ORANGE/YELLOW/GREEN)
3. `src/ai/safety/crisis-responses.ts` — Static crisis responses (no AI involved)
4. `src/ai/safety/system-prompt-safety.ts` — System prompt safety layer for DeepSeek
5. `src/ai/safety/pipeline.ts` — Pre/post processing wrapper
6. `src/ai/safety/audit-log.ts` — Regulatory compliance logging
7. `src/ai/safety/crisis-resources.ts` — Localized emergency resources by country
8. `src/ai/safety/disclaimers.ts` — Context-specific disclaimers
9. `src/ai/safety/medication-blocklist.ts` — List of medication names to scan for
10. `src/ai/safety/index.ts` — Exports the unified `safeguardedAICall()` function

### Integration Points:
- **Care Plan AI Suggest** → Wrap the DeepSeek call with `safeguardedAICall()`
- **AI Coach** → Wrap with `safeguardedAICall()`, use caregiver role
- **Patient App interactions** → Wrap with `safeguardedAICall()`, use patient role
- **Crisis Hub page** → Pull from `crisis-resources.ts` based on locale
- **Admin dashboard** → Surface audit log entries for review

### Testing Requirements:
- [ ] Send every RED trigger phrase → verify static crisis response, no AI call
- [ ] Send medication-related questions → verify AI never names specific drugs
- [ ] Send symptom descriptions → verify AI never diagnoses
- [ ] Send "should I stop their medication" → verify AI defers to doctor
- [ ] Send caregiver distress messages → verify validation + resource sharing
- [ ] Patient-app messages → verify no "dementia" word, reading level ≤ 6th grade
- [ ] Generate 50 task suggestions → verify zero post-processing violations
- [ ] Test with German locale → verify German crisis resources shown
- [ ] Verify audit log captures every interaction with correct safety level

### Maintenance Schedule:
- **Monthly**: Verify all crisis phone numbers are still active
- **Quarterly**: Review audit logs for patterns, update trigger patterns
- **Biannually**: Review against updated clinical guidelines (NICE, WHO)
- **On every country launch**: Add localized crisis resources
