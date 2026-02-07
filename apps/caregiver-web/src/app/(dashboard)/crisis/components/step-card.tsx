'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ScenarioStep, StepType } from '../types';
import { BreathingTimer } from './breathing-timer';

const STEP_TYPE_COLORS: Record<StepType, { bg: string; border: string; text: string; circle: string }> = {
  breathe: {
    bg: 'bg-status-success/5',
    border: 'border-status-success/20',
    text: 'text-status-success',
    circle: 'bg-status-success/20 text-status-success',
  },
  assess: {
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    circle: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  },
  do: {
    bg: 'bg-blue-500/5',
    border: 'border-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    circle: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  },
  escalate: {
    bg: 'bg-status-danger/5',
    border: 'border-status-danger/20',
    text: 'text-status-danger',
    circle: 'bg-status-danger/20 text-status-danger',
  },
};

const STEP_TYPE_LABELS: Record<StepType, string> = {
  breathe: 'GROUND YOURSELF',
  assess: 'ASSESS',
  do: 'DO THIS',
  escalate: 'ESCALATE',
};

interface StepCardProps {
  step: ScenarioStep;
  stepIndex: number;
  isOpen: boolean;
  onToggle: () => void;
  patientName: string;
  country: string;
  onActionAlertFamily?: () => void;
  onEmergencyCall?: () => void;
}

export function StepCard({
  step,
  stepIndex,
  isOpen,
  onToggle,
  patientName,
  country,
  onActionAlertFamily,
  onEmergencyCall,
}: StepCardProps) {
  const { t } = useTranslation();
  const colors = STEP_TYPE_COLORS[step.type];
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggleCheck = (idx: number) => {
    setChecked((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleAction = () => {
    if (step.action === 'call_emergency') {
      onEmergencyCall?.();
    } else if (step.action === 'breathing') {
      // Breathing timer is inline
    }
    // "Open Location" and "Alert All Family Members" are handled via actionLabel
    if (step.actionLabel?.includes('Location')) {
      window.open('/location', '_self');
    }
    if (step.actionLabel?.includes('Family')) {
      onActionAlertFamily?.();
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-colors ${
        isOpen ? `${colors.bg} ${colors.border}` : 'border-surface-border bg-surface-card dark:bg-surface-elevated'
      }`}
    >
      {/* Header — always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        {/* Step number circle */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${colors.circle}`}
        >
          {stepIndex + 1}
        </div>

        <div className="flex-1 min-w-0">
          <span className={`text-[10px] font-bold tracking-widest uppercase ${colors.text}`}>
            {STEP_TYPE_LABELS[step.type]}
          </span>
          <p className="text-sm font-medium text-text-primary truncate">
            {step.title}
          </p>
        </div>

        {/* Chevron */}
        <svg
          className={`w-5 h-5 text-text-muted shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="px-4 pb-4 pl-[60px] space-y-4">
          {/* Instruction */}
          <p className="text-sm text-text-secondary leading-relaxed">
            {step.instruction}
          </p>

          {/* Breathing timer */}
          {step.action === 'breathing' && (
            <BreathingTimer onComplete={() => {}} />
          )}

          {/* Checklist */}
          {step.checklist && step.checklist.length > 0 && (
            <div className="space-y-2">
              {step.checklist.map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={!!checked[idx]}
                    onChange={() => toggleCheck(idx)}
                    className="mt-0.5 w-4 h-4 rounded border-surface-border text-brand-600 focus:ring-brand-500"
                  />
                  <span
                    className={`text-sm ${
                      checked[idx]
                        ? 'text-text-muted line-through'
                        : 'text-text-secondary'
                    }`}
                  >
                    {item}
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Tips */}
          {step.tips && step.tips.length > 0 && (
            <div className="space-y-2">
              {step.tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-sm text-text-secondary"
                >
                  <span className="text-text-muted mt-0.5 shrink-0">•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action button */}
          {step.actionLabel && step.action !== 'breathing' && (
            <button
              type="button"
              onClick={handleAction}
              className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${
                step.action === 'call_emergency'
                  ? 'bg-status-danger text-white hover:bg-status-danger/90'
                  : 'btn-primary'
              }`}
            >
              {step.actionLabel} &rarr;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
