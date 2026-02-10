'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ReliefExercise, SliderValue } from '@ourturn/shared';
import { getRecommendedExercises } from '@ourturn/shared';
import { ExercisePlayer } from './exercise-player';

interface QuickReliefProps {
  stress: SliderValue | null;
  energy: SliderValue | null;
  sleep: SliderValue | null;
  onExerciseComplete: (exerciseId: string) => void;
}

export function QuickRelief({ stress, energy, sleep, onExerciseComplete }: QuickReliefProps) {
  const { t } = useTranslation();
  const [activeExercise, setActiveExercise] = useState<ReliefExercise | null>(null);

  const exercises = getRecommendedExercises(stress, energy, sleep);

  // Determine which exercises are recommended
  const isRecommended = (exercise: ReliefExercise): boolean => {
    const isHighStress = stress !== null && stress >= 4;
    const isLowEnergy = energy !== null && energy <= 2;
    const isPoorSleep = sleep !== null && sleep <= 2;

    return (
      (isHighStress && exercise.recommended_for.high_stress) ||
      (isLowEnergy && exercise.recommended_for.low_energy) ||
      (isPoorSleep && exercise.recommended_for.poor_sleep)
    );
  };

  const handleComplete = (exerciseId: string) => {
    onExerciseComplete(exerciseId);
    setActiveExercise(null);
  };

  return (
    <>
      <div className="card-paper p-6">
        <h2 className="text-lg font-display font-bold text-text-primary mb-4">
          {t('caregiverApp.toolkit.relief.title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {exercises.map((exercise) => {
            const recommended = isRecommended(exercise);
            return (
              <button
                key={exercise.id}
                onClick={() => setActiveExercise(exercise)}
                className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all text-center hover:shadow-md ${
                  recommended
                    ? 'border-brand-300 dark:border-brand-700 bg-brand-50/50 dark:bg-brand-900/20'
                    : 'border-surface-border bg-surface-card dark:bg-surface-elevated hover:border-brand-300'
                }`}
              >
                {recommended && (
                  <span className="absolute -top-2 -right-2 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {t('caregiverApp.toolkit.relief.recommended')}
                  </span>
                )}
                <span className="text-2xl mb-2">{exercise.icon}</span>
                <span className="text-sm font-semibold text-text-primary">
                  {t(`caregiverApp.toolkit.relief.exercises.${exercise.id}.name`, exercise.name)}
                </span>
                <span className="text-xs text-text-muted mt-1">
                  {t('caregiverApp.toolkit.relief.duration', { min: exercise.duration_minutes })}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeExercise && (
        <ExercisePlayer
          exercise={activeExercise}
          onComplete={handleComplete}
          onClose={() => setActiveExercise(null)}
        />
      )}
    </>
  );
}
