/**
 * AI Safety Guardrails — Unified Export
 *
 * Usage in route handlers:
 *   import { preProcess, postProcess, ... } from '@/lib/ai-safety';
 */

// Core types and enums
export { SafetyLevel } from './classifier';
export type { ClassificationResult } from './classifier';
export { classifyMessage } from './classifier';

// Golden rules
export { GOLDEN_RULES } from './golden-rules';

// Crisis responses
export type { CrisisResponse, CrisisResource } from './crisis-responses';
export { CRISIS_RESPONSES } from './crisis-responses';

// Crisis resources (localized)
export type { CountryCrisisResources, CrisisResourceEntry } from './crisis-resources';
export { CRISIS_RESOURCES, getResourcesForCountry } from './crisis-resources';

// System prompt safety layer
export { AI_SAFETY_SYSTEM_PROMPT, getPatientAppSafetyRules } from './system-prompt-safety';

// Medication blocklist
export { scanForMedications } from './medication-blocklist';

// Disclaimers
export { CONTEXTUAL_DISCLAIMERS, getDisclaimerForTrigger } from './disclaimers';

// Pipeline (pre/post processing)
export type { PreProcessResult, PostProcessResult } from './pipeline';
export { preProcess, postProcess, BLOCKED_RESPONSE_FALLBACK } from './pipeline';

// Audit logging
export type { SafetyAuditEntry } from './audit-log';
export { logSafetyEvent } from './audit-log';
