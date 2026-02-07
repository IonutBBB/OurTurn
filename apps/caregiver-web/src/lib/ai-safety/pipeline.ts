/**
 * SAFETY PIPELINE
 * Wraps every AI interaction with pre-processing (input classification)
 * and post-processing (output validation) checks.
 */

import { SafetyLevel, classifyMessage } from './classifier';
import type { ClassificationResult } from './classifier';
import type { CrisisResponse } from './crisis-responses';
import { CRISIS_RESPONSES } from './crisis-responses';
import { scanForMedications } from './medication-blocklist';
import { getDisclaimerForTrigger } from './disclaimers';

// ──────────────────────────────────────────────
// PRE-PROCESSING: Runs BEFORE sending to Gemini
// ──────────────────────────────────────────────

export interface PreProcessResult {
  proceed: boolean;
  safetyLevel: SafetyLevel;
  classification: ClassificationResult;
  staticResponse?: CrisisResponse;
  contextInjection?: string;
  blockedTopics?: string[];
  disclaimer?: string;
}

export function preProcess(
  userMessage: string,
  userRole: 'patient' | 'caregiver' = 'caregiver',
): PreProcessResult {
  const classification = classifyMessage(userMessage);

  // RED — return static crisis response, do NOT call AI
  if (classification.level === SafetyLevel.RED) {
    const responseKey = classification.triggers[0];
    const staticResponse = CRISIS_RESPONSES[responseKey];
    return {
      proceed: false,
      safetyLevel: SafetyLevel.RED,
      classification,
      staticResponse: staticResponse || CRISIS_RESPONSES.CRISIS_EMERGENCY,
    };
  }

  // ORANGE — AI responds but with strong constraints
  if (classification.level === SafetyLevel.ORANGE) {
    const referralTarget = classification.referralTarget || 'their healthcare provider';
    return {
      proceed: true,
      safetyLevel: SafetyLevel.ORANGE,
      classification,
      contextInjection: `
SAFETY CONTEXT: The user's message involves ${classification.triggerCategory || 'a medical concern'}.
You MUST include a strong recommendation to consult a ${referralTarget} in your response.
Do NOT attempt to resolve the clinical issue yourself.
Focus on emotional support and practical non-clinical tips only.
Do NOT name any specific medications, dosages, or treatments.`,
      blockedTopics: classification.blockedTopics,
      disclaimer: getDisclaimerForTrigger(classification.triggerCategory || ''),
    };
  }

  // YELLOW — AI responds with gentle disclaimer
  if (classification.level === SafetyLevel.YELLOW) {
    return {
      proceed: true,
      safetyLevel: SafetyLevel.YELLOW,
      classification,
      contextInjection: `
SAFETY CONTEXT: The user's message touches on ${classification.triggerCategory || 'a sensitive topic'}.
Include a gentle note that if this is new or worsening, it should be discussed with their healthcare provider.
Focus on evidence-based non-pharmacological strategies.`,
      disclaimer: getDisclaimerForTrigger(classification.triggerCategory || ''),
    };
  }

  // GREEN — normal operation
  return {
    proceed: true,
    safetyLevel: SafetyLevel.GREEN,
    classification,
  };
}

// ──────────────────────────────────────────────
// POST-PROCESSING: Runs AFTER receiving AI response
// ──────────────────────────────────────────────

export interface PostProcessResult {
  approved: boolean;
  response: string;
  violations: string[];
  disclaimerAppended: boolean;
}

export function postProcess(
  aiResponse: string,
  safetyLevel: SafetyLevel,
  userRole: 'patient' | 'caregiver' = 'caregiver',
  disclaimer?: string,
): PostProcessResult {
  const violations: string[] = [];

  // Check 1: Scan for medication names
  const medicationMentions = scanForMedications(aiResponse);
  if (medicationMentions.length > 0) {
    violations.push(
      `GR-002: Response mentions medications: ${medicationMentions.join(', ')}`,
    );
  }

  // Check 2: Scan for diagnostic language
  const diagnosticPatterns = [
    /this (?:sounds|looks|seems) like (?:a |an )?(?:case of |sign of |symptom of )/i,
    /you (?:may|might|probably) have/i,
    /this is (?:likely|probably|possibly) (?:a|an) /i,
    /i think (?:they|he|she) (?:has|have) /i,
    /consistent with (?:a )?diagnosis/i,
    /diagnosis of /i,
    /symptoms? (?:of|suggest|indicate) /i,
  ];
  for (const pattern of diagnosticPatterns) {
    if (pattern.test(aiResponse)) {
      violations.push(`GR-001: Response contains diagnostic language`);
      break;
    }
  }

  // Check 3: Scan for dosage/treatment instructions
  const treatmentPatterns = [
    /\d+\s*(?:mg|ml|mcg|units?|tablets?|capsules?|drops?)\b/i,
    /take \d+ (?:pills?|tablets?|capsules?)/i,
    /(?:increase|decrease|reduce|adjust).{0,20}(?:dose|dosage|medication)/i,
    /start taking /i,
    /stop taking /i,
  ];
  for (const pattern of treatmentPatterns) {
    if (pattern.test(aiResponse)) {
      violations.push(`GR-002: Response contains treatment instructions`);
      break;
    }
  }

  // Check 4: Scan for prognosis language
  const prognosisPatterns = [
    /will (?:eventually|likely|probably) (?:lose|decline|worsen|deteriorate)/i,
    /life expectancy/i,
    /years? (?:left|remaining|to live)/i,
    /\bterminal\b/i,
  ];
  for (const pattern of prognosisPatterns) {
    if (pattern.test(aiResponse)) {
      violations.push(`GR-003: Response contains prognosis language`);
      break;
    }
  }

  // Check 5: Scan for dehumanizing language
  const dehumanizingPatterns = [
    /dementia (?:patient|sufferer|victim)/i,
    /the demented/i,
    /a shell of/i,
    /gone already/i,
  ];
  for (const pattern of dehumanizingPatterns) {
    if (pattern.test(aiResponse)) {
      violations.push(`GR-005: Response contains dehumanizing language`);
      break;
    }
  }

  // Check 6: Patient-facing checks
  if (userRole === 'patient') {
    const prohibitedForPatient = [
      'dementia', 'alzheimer', 'cognitive decline', 'neurodegeneration',
      'brain disease', 'memory disease',
    ];
    for (const word of prohibitedForPatient) {
      if (aiResponse.toLowerCase().includes(word)) {
        violations.push(`Prohibited word in patient-facing response: "${word}"`);
      }
    }
  }

  // Decision: hard violations block, soft violations get disclaimer
  const hasHardViolation = violations.some(
    (v) => v.startsWith('GR-001') || v.startsWith('GR-002') || v.startsWith('GR-003'),
  );

  if (hasHardViolation) {
    return {
      approved: false,
      response: aiResponse,
      violations,
      disclaimerAppended: false,
    };
  }

  // Append disclaimer for YELLOW/ORANGE even without violations
  let finalResponse = aiResponse;
  let disclaimerAppended = false;
  if (
    disclaimer &&
    (safetyLevel === SafetyLevel.YELLOW || safetyLevel === SafetyLevel.ORANGE)
  ) {
    finalResponse = `${aiResponse}\n\n---\n\n${disclaimer}`;
    disclaimerAppended = true;
  }

  return {
    approved: true,
    response: finalResponse,
    violations,
    disclaimerAppended,
  };
}

/**
 * Safe fallback response when post-processing blocks the AI response.
 */
export const BLOCKED_RESPONSE_FALLBACK =
  "I want to make sure you get the best guidance on this. This is something that would be really helpful to discuss with their healthcare team, who can give you advice specific to your situation. In the meantime, is there anything else I can help with — like daily routine ideas, activity suggestions, or just someone to talk to?";
