'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const DE_ESCALATION_STEPS = [
  { key: 'stayCalm', icon: '🧘' },
  { key: 'validateFeelings', icon: '💙' },
  { key: 'simplifyEnvironment', icon: '🔇' },
  { key: 'redirectAttention', icon: '🎵' },
  { key: 'useGentleTouch', icon: '🤝' },
  { key: 'giveSpace', icon: '🕐' },
];

const BREATHING_DURATION = 30;
const STEP_DURATION = 60;

interface DeEscalationWizardProps {
  onClose: () => void;
  onComplete: (notes: string) => void;
}

type Phase = 'breathing' | 'steps' | 'completion';

export function DeEscalationWizard({ onClose, onComplete }: DeEscalationWizardProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('breathing');
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BREATHING_DURATION);
  const [notes, setNotes] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Timer tick
  useEffect(() => {
    if (phase === 'completion') return;

    const duration = phase === 'breathing' ? BREATHING_DURATION : STEP_DURATION;
    setTimeLeft(duration);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-advance on timer expiry
          if (phase === 'breathing') {
            setPhase('steps');
            setCurrentStep(0);
          } else {
            // Advance to next step or completion
            if (currentStep < DE_ESCALATION_STEPS.length - 1) {
              setCurrentStep((s) => s + 1);
            } else {
              setPhase('completion');
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [phase, currentStep, clearTimer]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSkipBreathing = () => {
    clearTimer();
    setPhase('steps');
    setCurrentStep(0);
  };

  const handleThisHelped = () => {
    clearTimer();
    setPhase('completion');
  };

  const handleTryNext = () => {
    clearTimer();
    if (currentStep < DE_ESCALATION_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setPhase('completion');
    }
  };

  const handleSaveAndClose = () => {
    onComplete(notes);
  };

  const handleCloseWithoutSaving = () => {
    onComplete('');
  };

  const totalDuration = phase === 'breathing' ? BREATHING_DURATION : STEP_DURATION;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('caregiverApp.crisis.deEscalationGuide')}
    >
      <div
        className="bg-surface-card rounded-3xl shadow-xl max-w-lg w-full mx-4 p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-border/50 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
            aria-label={t('common.cancel')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Breathing Phase */}
        {phase === 'breathing' && (
          <>
            <h3 className="text-lg font-display font-bold text-text-primary mb-2">
              {t('caregiverApp.crisis.wizard.breathingTitle')}
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              {t('caregiverApp.crisis.wizard.breathingInstruction')}
            </p>

            {/* Circular timer */}
            <div className="relative w-40 h-40 mx-auto mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="44"
                  fill="none" stroke="currentColor"
                  className="text-surface-border" strokeWidth="6"
                />
                <circle
                  cx="50" cy="50" r="44"
                  fill="none" stroke="currentColor"
                  className="text-brand-500"
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${progress * 2.76} 276`}
                  style={{ transition: 'stroke-dasharray 1s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-display font-bold text-brand-600 dark:text-brand-400">
                  {timeLeft}
                </span>
              </div>
            </div>

            <button
              onClick={handleSkipBreathing}
              className="text-sm text-text-muted hover:text-text-secondary underline"
            >
              {t('caregiverApp.crisis.wizard.skip')}
            </button>
          </>
        )}

        {/* Steps Phase */}
        {phase === 'steps' && (
          <>
            <p className="text-sm text-text-muted mb-2">
              {t('caregiverApp.crisis.wizard.stepOf', {
                current: currentStep + 1,
                total: DE_ESCALATION_STEPS.length,
              })}
            </p>

            {/* Circular timer */}
            <div className="relative w-36 h-36 mx-auto mb-5">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="44"
                  fill="none" stroke="currentColor"
                  className="text-surface-border" strokeWidth="6"
                />
                <circle
                  cx="50" cy="50" r="44"
                  fill="none" stroke="currentColor"
                  className="text-brand-500"
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${progress * 2.76} 276`}
                  style={{ transition: 'stroke-dasharray 1s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-display font-bold text-brand-600 dark:text-brand-400">
                  {timeLeft}
                </span>
              </div>
            </div>

            {/* Step content */}
            <div className="mb-5">
              <span className="text-3xl mb-2 block">
                {DE_ESCALATION_STEPS[currentStep].icon}
              </span>
              <h3 className="text-lg font-display font-bold text-text-primary mb-2">
                {t(`caregiverApp.crisis.steps.${DE_ESCALATION_STEPS[currentStep].key}.title`)}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-3">
                {t(`caregiverApp.crisis.steps.${DE_ESCALATION_STEPS[currentStep].key}.detail`)}
              </p>
              {/* Script phrase */}
              <div className="card-inset rounded-2xl p-3 mx-4">
                <p className="text-sm italic text-brand-700 dark:text-brand-300 leading-relaxed">
                  &ldquo;{t(`caregiverApp.crisis.steps.${DE_ESCALATION_STEPS[currentStep].key}.script`)}&rdquo;
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-3">
              <button onClick={handleThisHelped} className="btn-primary px-5 py-2">
                {t('caregiverApp.crisis.wizard.thisHelped')}
              </button>
              <button onClick={handleTryNext} className="btn-secondary px-5 py-2">
                {t('caregiverApp.crisis.wizard.tryNext')}
              </button>
            </div>

            {/* Step progress bar */}
            <div className="flex gap-1 mt-6">
              {DE_ESCALATION_STEPS.map((_, i) => (
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

        {/* Completion Phase */}
        {phase === 'completion' && (
          <>
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-lg font-display font-bold text-text-primary mb-2">
              {t('caregiverApp.crisis.wizard.completionTitle')}
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              {t('caregiverApp.crisis.wizard.completionDesc')}
            </p>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('caregiverApp.crisis.wizard.crisisNotesPlaceholder')}
              className="input-warm w-full h-28 resize-none mb-4"
            />

            <div className="flex justify-center gap-3">
              <button onClick={handleSaveAndClose} className="btn-primary px-5 py-2">
                {t('caregiverApp.crisis.wizard.saveAndClose')}
              </button>
              <button
                onClick={handleCloseWithoutSaving}
                className="text-sm text-text-muted hover:text-text-secondary underline"
              >
                {t('caregiverApp.crisis.wizard.closeWithoutSaving')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
