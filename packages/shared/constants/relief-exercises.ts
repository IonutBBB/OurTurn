import type { ReliefExercise, SliderValue } from '../types/wellbeing';

export const RELIEF_EXERCISES: ReliefExercise[] = [
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    category: 'breathing',
    duration_minutes: 2,
    icon: '🌬️',
    recommended_for: { high_stress: true, low_energy: false, poor_sleep: true },
    steps: [
      { instruction: 'Get comfortable and close your eyes', duration_seconds: 5, type: 'rest' },
      { instruction: 'Breathe in slowly through your nose', duration_seconds: 4, type: 'breathe_in' },
      { instruction: 'Hold your breath gently', duration_seconds: 4, type: 'hold' },
      { instruction: 'Breathe out slowly through your mouth', duration_seconds: 4, type: 'breathe_out' },
      { instruction: 'Hold before the next breath', duration_seconds: 4, type: 'hold' },
      { instruction: 'Breathe in slowly through your nose', duration_seconds: 4, type: 'breathe_in' },
      { instruction: 'Hold your breath gently', duration_seconds: 4, type: 'hold' },
      { instruction: 'Breathe out slowly through your mouth', duration_seconds: 4, type: 'breathe_out' },
      { instruction: 'Hold before the next breath', duration_seconds: 4, type: 'hold' },
      { instruction: 'Breathe in slowly through your nose', duration_seconds: 4, type: 'breathe_in' },
      { instruction: 'Hold your breath gently', duration_seconds: 4, type: 'hold' },
      { instruction: 'Breathe out slowly through your mouth', duration_seconds: 4, type: 'breathe_out' },
      { instruction: 'Hold before the next breath', duration_seconds: 4, type: 'hold' },
      { instruction: 'Breathe in slowly through your nose', duration_seconds: 4, type: 'breathe_in' },
      { instruction: 'Hold your breath gently', duration_seconds: 4, type: 'hold' },
      { instruction: 'Breathe out slowly through your mouth', duration_seconds: 4, type: 'breathe_out' },
      { instruction: 'Hold before the next breath', duration_seconds: 4, type: 'hold' },
      { instruction: 'Breathe in slowly through your nose', duration_seconds: 4, type: 'breathe_in' },
      { instruction: 'Hold your breath gently', duration_seconds: 4, type: 'hold' },
      { instruction: 'Breathe out slowly through your mouth', duration_seconds: 4, type: 'breathe_out' },
      { instruction: 'Hold before the next breath', duration_seconds: 4, type: 'hold' },
      { instruction: 'Breathe in slowly through your nose', duration_seconds: 4, type: 'breathe_in' },
      { instruction: 'Hold your breath gently', duration_seconds: 4, type: 'hold' },
      { instruction: 'Breathe out slowly through your mouth', duration_seconds: 4, type: 'breathe_out' },
      { instruction: 'Well done. Take a moment to notice how you feel.', duration_seconds: 5, type: 'rest' },
    ],
  },
  {
    id: '54321-grounding',
    name: '5-4-3-2-1 Grounding',
    category: 'grounding',
    duration_minutes: 3,
    icon: '🌿',
    recommended_for: { high_stress: true, low_energy: false, poor_sleep: false },
    steps: [
      { instruction: 'Take a slow, deep breath and look around you', duration_seconds: 10, type: 'rest' },
      { instruction: 'Name 5 things you can SEE right now', duration_seconds: 30, type: 'observe' },
      { instruction: 'Name 4 things you can TOUCH right now', duration_seconds: 25, type: 'observe' },
      { instruction: 'Name 3 things you can HEAR right now', duration_seconds: 25, type: 'observe' },
      { instruction: 'Name 2 things you can SMELL right now', duration_seconds: 20, type: 'observe' },
      { instruction: 'Name 1 thing you can TASTE right now', duration_seconds: 15, type: 'observe' },
      { instruction: 'Take another deep breath. You are here, and you are safe.', duration_seconds: 15, type: 'rest' },
    ],
  },
  {
    id: 'gratitude-moment',
    name: 'Gratitude Moment',
    category: 'gratitude',
    duration_minutes: 2,
    icon: '🙏',
    recommended_for: { high_stress: false, low_energy: true, poor_sleep: false },
    steps: [
      { instruction: 'Close your eyes and take a calming breath', duration_seconds: 10, type: 'rest' },
      { instruction: 'Think of one person you are grateful for and why', duration_seconds: 20, type: 'action' },
      { instruction: 'Think of one thing that happened today that was good, even if small', duration_seconds: 20, type: 'action' },
      { instruction: 'Think of one thing about yourself that you appreciate', duration_seconds: 20, type: 'action' },
      { instruction: 'Hold those three things in your mind and breathe deeply', duration_seconds: 15, type: 'rest' },
      { instruction: 'Carry this feeling of gratitude with you.', duration_seconds: 5, type: 'rest' },
    ],
  },
  {
    id: 'progressive-muscle-relaxation',
    name: 'Progressive Muscle Relaxation',
    category: 'relaxation',
    duration_minutes: 3,
    icon: '💆',
    recommended_for: { high_stress: true, low_energy: false, poor_sleep: true },
    steps: [
      { instruction: 'Sit or lie down comfortably. Close your eyes.', duration_seconds: 10, type: 'rest' },
      { instruction: 'Squeeze both fists tightly for 5 seconds...', duration_seconds: 5, type: 'action' },
      { instruction: 'Release and feel the tension melt away', duration_seconds: 10, type: 'rest' },
      { instruction: 'Tense your shoulders — lift them toward your ears...', duration_seconds: 5, type: 'action' },
      { instruction: 'Release and let your shoulders drop', duration_seconds: 10, type: 'rest' },
      { instruction: 'Scrunch your face tightly — forehead, eyes, jaw...', duration_seconds: 5, type: 'action' },
      { instruction: 'Release and let your face relax completely', duration_seconds: 10, type: 'rest' },
      { instruction: 'Tense your stomach muscles...', duration_seconds: 5, type: 'action' },
      { instruction: 'Release and breathe into your belly', duration_seconds: 10, type: 'rest' },
      { instruction: 'Squeeze your legs and feet tightly...', duration_seconds: 5, type: 'action' },
      { instruction: 'Release and feel the warmth flow through your legs', duration_seconds: 10, type: 'rest' },
      { instruction: 'Breathe deeply. Your whole body is relaxed.', duration_seconds: 10, type: 'rest' },
      { instruction: 'Gently open your eyes when you are ready.', duration_seconds: 10, type: 'rest' },
    ],
  },
  {
    id: 'mindful-break',
    name: 'Mindful Break',
    category: 'mindfulness',
    duration_minutes: 2,
    icon: '🧘',
    recommended_for: { high_stress: false, low_energy: true, poor_sleep: true },
    steps: [
      { instruction: 'Pause whatever you are doing. This moment is yours.', duration_seconds: 5, type: 'rest' },
      { instruction: 'Close your eyes and take 3 slow, deep breaths', duration_seconds: 15, type: 'breathe_in' },
      { instruction: 'Notice how your body feels right now — no need to change anything', duration_seconds: 15, type: 'observe' },
      { instruction: 'Listen to the sounds around you, near and far', duration_seconds: 15, type: 'observe' },
      { instruction: 'Feel the surface beneath you and the air on your skin', duration_seconds: 15, type: 'observe' },
      { instruction: 'Silently say: "I am doing my best, and that is enough."', duration_seconds: 15, type: 'action' },
      { instruction: 'Take one more deep breath', duration_seconds: 10, type: 'breathe_in' },
      { instruction: 'Gently open your eyes. You are refreshed.', duration_seconds: 10, type: 'rest' },
    ],
  },
  {
    id: 'breathing-478',
    name: '4-7-8 Breathing',
    category: 'breathing',
    duration_minutes: 3,
    icon: '🌊',
    recommended_for: { high_stress: true, low_energy: false, poor_sleep: true },
    steps: [
      { instruction: 'Sit comfortably and relax your shoulders', duration_seconds: 5, type: 'rest' },
      { instruction: 'Breathe in quietly through your nose for 4 counts', duration_seconds: 4, type: 'breathe_in' },
      { instruction: 'Hold your breath for 7 counts', duration_seconds: 7, type: 'hold' },
      { instruction: 'Exhale completely through your mouth for 8 counts', duration_seconds: 8, type: 'breathe_out' },
      { instruction: 'Breathe in quietly through your nose for 4 counts', duration_seconds: 4, type: 'breathe_in' },
      { instruction: 'Hold your breath for 7 counts', duration_seconds: 7, type: 'hold' },
      { instruction: 'Exhale completely through your mouth for 8 counts', duration_seconds: 8, type: 'breathe_out' },
      { instruction: 'Breathe in quietly through your nose for 4 counts', duration_seconds: 4, type: 'breathe_in' },
      { instruction: 'Hold your breath for 7 counts', duration_seconds: 7, type: 'hold' },
      { instruction: 'Exhale completely through your mouth for 8 counts', duration_seconds: 8, type: 'breathe_out' },
      { instruction: 'Breathe in quietly through your nose for 4 counts', duration_seconds: 4, type: 'breathe_in' },
      { instruction: 'Hold your breath for 7 counts', duration_seconds: 7, type: 'hold' },
      { instruction: 'Exhale completely through your mouth for 8 counts', duration_seconds: 8, type: 'breathe_out' },
      { instruction: 'Breathe in quietly through your nose for 4 counts', duration_seconds: 4, type: 'breathe_in' },
      { instruction: 'Hold your breath for 7 counts', duration_seconds: 7, type: 'hold' },
      { instruction: 'Exhale completely through your mouth for 8 counts', duration_seconds: 8, type: 'breathe_out' },
      { instruction: 'Notice how much calmer your body feels now.', duration_seconds: 5, type: 'rest' },
    ],
  },
  {
    id: 'permission-slip',
    name: 'Permission Slip',
    category: 'mindfulness',
    duration_minutes: 2,
    icon: '📝',
    recommended_for: { high_stress: true, low_energy: true, poor_sleep: false },
    steps: [
      { instruction: 'Take a deep breath and give yourself a moment', duration_seconds: 5, type: 'rest' },
      { instruction: 'Say to yourself: "I give myself permission to not be perfect today"', duration_seconds: 10, type: 'action' },
      { instruction: 'Say: "I give myself permission to ask for help"', duration_seconds: 10, type: 'action' },
      { instruction: 'Say: "I give myself permission to feel what I feel without guilt"', duration_seconds: 10, type: 'action' },
      { instruction: 'Say: "I give myself permission to take a break"', duration_seconds: 10, type: 'action' },
      { instruction: 'Say: "I am doing my best, and that is enough"', duration_seconds: 10, type: 'action' },
      { instruction: 'Take a deep breath and hold these words close', duration_seconds: 10, type: 'rest' },
      { instruction: 'You deserve compassion too. Carry this with you.', duration_seconds: 5, type: 'rest' },
    ],
  },
  {
    id: 'quick-walk',
    name: 'Quick Walk Prompt',
    category: 'grounding',
    duration_minutes: 2,
    icon: '🚶‍♀️',
    recommended_for: { high_stress: false, low_energy: true, poor_sleep: false },
    steps: [
      { instruction: 'Stand up and stretch your arms above your head', duration_seconds: 10, type: 'action' },
      { instruction: 'Walk to the nearest window or door and look outside', duration_seconds: 15, type: 'observe' },
      { instruction: 'Take 5 slow steps and feel each foot touch the ground', duration_seconds: 15, type: 'action' },
      { instruction: 'Look up — notice the sky, ceiling, or something above you', duration_seconds: 10, type: 'observe' },
      { instruction: 'Take 5 more slow, intentional steps', duration_seconds: 15, type: 'action' },
      { instruction: 'Shake your hands and arms loosely for a few seconds', duration_seconds: 10, type: 'action' },
      { instruction: 'Roll your shoulders back 3 times', duration_seconds: 10, type: 'action' },
      { instruction: 'You moved your body. That counts. Well done.', duration_seconds: 5, type: 'rest' },
    ],
  },
];

/**
 * Returns exercises recommended for the caregiver's current state.
 * Recommended exercises appear first, followed by the rest.
 */
export function getRecommendedExercises(
  stress: SliderValue | null,
  energy: SliderValue | null,
  sleep: SliderValue | null
): ReliefExercise[] {
  const isHighStress = stress !== null && stress >= 4;
  const isLowEnergy = energy !== null && energy <= 2;
  const isPoorSleep = sleep !== null && sleep <= 2;

  // If no signals, return all exercises in default order
  if (!isHighStress && !isLowEnergy && !isPoorSleep) {
    return RELIEF_EXERCISES;
  }

  const recommended: ReliefExercise[] = [];
  const others: ReliefExercise[] = [];

  for (const exercise of RELIEF_EXERCISES) {
    const { high_stress, low_energy, poor_sleep } = exercise.recommended_for;
    const isMatch =
      (isHighStress && high_stress) ||
      (isLowEnergy && low_energy) ||
      (isPoorSleep && poor_sleep);

    if (isMatch) {
      recommended.push(exercise);
    } else {
      others.push(exercise);
    }
  }

  return [...recommended, ...others];
}
