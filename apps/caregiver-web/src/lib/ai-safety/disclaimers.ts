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
    "This information is for general support purposes. For medical concerns or decisions about care, please consult with your loved one's healthcare team.",
};

/**
 * Pick the most relevant disclaimer based on the trigger category.
 */
export function getDisclaimerForTrigger(triggerCategory: string): string {
  const mapping: Record<string, string> = {
    behavioralSymptoms: 'behavioral_change',
    caregiverStress: 'caregiver_wellbeing',
    sleepProblems: 'sleep',
    continenceIssues: 'general',
    medicationConfusion: 'medication_adjacent',
    suddenChange: 'general',
    fallsInjury: 'falls',
    drivingSafety: 'general',
    swallowingDifficulty: 'nutrition',
  };

  const key = mapping[triggerCategory] || 'general';
  return CONTEXTUAL_DISCLAIMERS[key];
}
