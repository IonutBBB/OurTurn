'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

type Phase = 'ready' | 'inhale' | 'hold' | 'exhale' | 'done';

const INHALE_MS = 4000;
const HOLD_MS = 3000;
const EXHALE_MS = 5000;
const TOTAL_CYCLES = 2;

interface BreathingTimerProps {
  onComplete: () => void;
}

export function BreathingTimer({ onComplete }: BreathingTimerProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('ready');
  const [cycle, setCycle] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const runPhase = useCallback(
    (currentPhase: Phase, currentCycle: number) => {
      setPhase(currentPhase);

      if (currentPhase === 'inhale') {
        timerRef.current = setTimeout(() => runPhase('hold', currentCycle), INHALE_MS);
      } else if (currentPhase === 'hold') {
        timerRef.current = setTimeout(() => runPhase('exhale', currentCycle), HOLD_MS);
      } else if (currentPhase === 'exhale') {
        const nextCycle = currentCycle + 1;
        if (nextCycle >= TOTAL_CYCLES) {
          timerRef.current = setTimeout(() => {
            setCycle(nextCycle);
            setPhase('done');
          }, EXHALE_MS);
        } else {
          timerRef.current = setTimeout(() => {
            setCycle(nextCycle);
            runPhase('inhale', nextCycle);
          }, EXHALE_MS);
        }
      }
    },
    []
  );

  const handleStart = useCallback(() => {
    setCycle(0);
    runPhase('inhale', 0);
  }, [runPhase]);

  const scale =
    phase === 'inhale' || phase === 'hold' ? 'scale-125' : 'scale-100';

  const phaseLabel = (() => {
    switch (phase) {
      case 'ready':
        return t('caregiverApp.crisis.breathing.tapToStart');
      case 'inhale':
        return t('caregiverApp.crisis.breathing.breatheIn');
      case 'hold':
        return t('caregiverApp.crisis.breathing.hold');
      case 'exhale':
        return t('caregiverApp.crisis.breathing.breatheOut');
      case 'done':
        return t('caregiverApp.crisis.breathing.done');
    }
  })();

  return (
    <div className="flex flex-col items-center py-6">
      <button
        type="button"
        onClick={phase === 'ready' ? handleStart : undefined}
        disabled={phase !== 'ready'}
        className={`
          relative w-32 h-32 rounded-full transition-transform duration-[4000ms] ease-in-out
          ${scale}
          ${phase === 'ready' ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'}
          bg-gradient-to-br from-status-success/20 to-status-success/10
          border-2 border-status-success/40
          flex items-center justify-center
        `}
      >
        {phase === 'done' ? (
          <svg
            className="w-10 h-10 text-status-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <div
            className={`
              w-16 h-16 rounded-full bg-status-success/30 transition-transform duration-[4000ms] ease-in-out
              ${phase === 'inhale' || phase === 'hold' ? 'scale-110' : 'scale-100'}
            `}
          />
        )}
      </button>

      <p className="mt-4 text-sm font-medium text-text-secondary text-center">
        {phaseLabel}
      </p>

      {phase !== 'ready' && phase !== 'done' && (
        <p className="mt-1 text-xs text-text-muted">
          {t('caregiverApp.crisis.breathing.cycle', {
            current: cycle + 1,
            total: TOTAL_CYCLES,
          })}
        </p>
      )}

      {phase === 'done' && (
        <button
          type="button"
          onClick={onComplete}
          className="btn-primary mt-4 text-sm"
        >
          {t('caregiverApp.crisis.breathing.continue')}
        </button>
      )}
    </div>
  );
}
