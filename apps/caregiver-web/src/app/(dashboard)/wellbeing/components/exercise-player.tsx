'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ReliefExercise } from '@ourturn/shared';

interface ExercisePlayerProps {
  exercise: ReliefExercise;
  onComplete: (exerciseId: string) => void;
  onClose: () => void;
}

export function ExercisePlayer({ exercise, onComplete, onClose }: ExercisePlayerProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(exercise.steps[0].duration_seconds);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const advanceStep = useCallback(() => {
    if (currentStep < exercise.steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setTimeLeft(exercise.steps[nextStep].duration_seconds);
    } else {
      setIsComplete(true);
      clearTimer();
      onComplete(exercise.id);
    }
  }, [currentStep, exercise, clearTimer, onComplete]);

  // Timer tick
  useEffect(() => {
    if (isPaused || isComplete) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          advanceStep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isPaused, isComplete, currentStep, advanceStep, clearTimer]);

  // Pause on tab switch (visibilitychange)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setIsPaused(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const step = exercise.steps[currentStep];
  const progress = step ? ((step.duration_seconds - timeLeft) / step.duration_seconds) * 100 : 100;
  const isBreathingStep = step?.type === 'breathe_in' || step?.type === 'breathe_out' || step?.type === 'hold';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={exercise.name}
    >
      <div
        className="bg-surface-card rounded-3xl shadow-xl max-w-lg w-full mx-4 p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-display font-bold text-text-primary">
            {exercise.icon} {exercise.name}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-border/50 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
            aria-label={t('caregiverApp.toolkit.relief.close')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isComplete ? (
          /* Completion state */
          <div className="py-8">
            <div className="text-5xl mb-4">✨</div>
            <p className="text-lg font-semibold text-text-primary mb-2">
              {t('caregiverApp.toolkit.relief.complete')}
            </p>
            <button
              onClick={onClose}
              className="btn-primary mt-4 px-6 py-2"
            >
              {t('caregiverApp.toolkit.relief.close')}
            </button>
          </div>
        ) : (
          <>
            {/* Step indicator */}
            <p className="text-sm text-text-muted mb-4">
              {t('caregiverApp.toolkit.relief.stepOf', {
                current: currentStep + 1,
                total: exercise.steps.length,
              })}
            </p>

            {/* Breathing animation circle */}
            {isBreathingStep && !prefersReducedMotion.current ? (
              <div className="relative w-40 h-40 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="currentColor"
                    className="text-surface-border"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="currentColor"
                    className="text-brand-500 transition-all duration-1000"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${progress * 2.76} 276`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-display font-bold text-brand-600">{timeLeft}</span>
                </div>
              </div>
            ) : (
              /* Non-breathing timer */
              <div className="relative w-40 h-40 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="currentColor"
                    className="text-surface-border"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="currentColor"
                    className="text-brand-500"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${progress * 2.76} 276`}
                    style={prefersReducedMotion.current ? {} : { transition: 'stroke-dasharray 1s linear' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-display font-bold text-brand-600">{timeLeft}</span>
                </div>
              </div>
            )}

            {/* Instruction */}
            <p className="text-lg text-text-primary font-medium leading-relaxed mb-6 min-h-[3.5rem]">
              {step.instruction}
            </p>

            {/* Controls */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="btn-secondary px-6 py-2"
              >
                {isPaused
                  ? t('caregiverApp.toolkit.relief.resume')
                  : t('caregiverApp.toolkit.relief.pause')}
              </button>
              <button
                onClick={onClose}
                className="text-sm text-text-muted hover:text-text-secondary underline"
              >
                {t('caregiverApp.toolkit.relief.close')}
              </button>
            </div>

            {/* Step progress bar */}
            <div className="flex gap-1 mt-6">
              {exercise.steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i < currentStep
                      ? 'bg-brand-500'
                      : i === currentStep
                        ? 'bg-brand-300'
                        : 'bg-surface-border'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
