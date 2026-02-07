'use client';

import { useTranslation } from 'react-i18next';
import { getPrimaryEmergencyNumber } from '@ourturn/shared/constants/emergency-numbers';
import type { CrisisScenario, CrisisScenarioId } from '../types';

interface ScenarioGridProps {
  scenarios: CrisisScenario[];
  country: string;
  onSelectScenario: (id: CrisisScenarioId) => void;
  onBack: () => void;
}

export function ScenarioGrid({
  scenarios,
  country,
  onSelectScenario,
  onBack,
}: ScenarioGridProps) {
  const { t } = useTranslation();
  const emergencyNumber = getPrimaryEmergencyNumber(country);

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('caregiverApp.crisis.back')}
      </button>

      {/* Title */}
      <h2 className="text-lg font-display font-bold text-text-primary">
        {t('caregiverApp.crisis.scenarioGrid.title')}
      </h2>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() => onSelectScenario(scenario.id)}
            className="relative card-paper p-4 text-left hover:border-brand-300 dark:hover:border-brand-700 transition-colors group"
          >
            {/* Urgent badge */}
            {scenario.urgency === 'critical' && (
              <span className="absolute top-3 right-3 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-status-danger/10 text-status-danger">
                {t('caregiverApp.crisis.scenarioGrid.urgent')}
              </span>
            )}

            <div className="flex items-center gap-3">
              <span className="text-2xl">{scenario.emoji}</span>
              <div>
                <p className="text-sm font-medium text-text-primary group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {scenario.label}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {scenario.stepCountDescription}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Emergency button */}
      <button
        type="button"
        onClick={() => window.open(`tel:${emergencyNumber}`, '_self')}
        className="w-full flex items-center justify-center gap-2 bg-status-danger text-white font-medium py-3 rounded-2xl hover:bg-status-danger/90 transition-colors"
      >
        <span>🚨</span>
        {t('caregiverApp.crisis.callEmergency')} — {emergencyNumber}
      </button>
    </div>
  );
}
