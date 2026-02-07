'use client';

import { useTranslation } from 'react-i18next';
import { getPrimaryEmergencyNumber } from '@ourturn/shared/constants/emergency-numbers';
import type { BehaviourIncident } from '@ourturn/shared';
import { PatternInsight } from './pattern-insight';

interface CrisisEntryPointProps {
  patientName: string;
  country: string;
  incidents: BehaviourIncident[];
  onSelectWith: () => void;
  onSelectRemote: () => void;
}

export function CrisisEntryPoint({
  patientName,
  country,
  incidents,
  onSelectWith,
  onSelectRemote,
}: CrisisEntryPointProps) {
  const { t } = useTranslation();
  const emergencyNumber = getPrimaryEmergencyNumber(country);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-display font-bold text-text-primary">
          {t('caregiverApp.crisis.entry.title')}
        </h2>
        <p className="text-sm text-text-muted mt-1">
          {t('caregiverApp.crisis.entry.subtitle')}
        </p>
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* I'm with them */}
        <button
          type="button"
          onClick={onSelectWith}
          className="card-paper p-6 text-left hover:border-brand-300 dark:hover:border-brand-700 transition-colors group"
        >
          <span className="text-3xl">🏠</span>
          <h3 className="text-base font-display font-bold text-text-primary mt-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {t('caregiverApp.crisis.entry.withThem', { name: patientName })}
          </h3>
          <p className="text-sm text-text-muted mt-1">
            {t('caregiverApp.crisis.entry.withThemDesc')}
          </p>
        </button>

        {/* I'm not there */}
        <button
          type="button"
          onClick={onSelectRemote}
          className="card-paper p-6 text-left hover:border-brand-300 dark:hover:border-brand-700 transition-colors group"
        >
          <span className="text-3xl">📱</span>
          <h3 className="text-base font-display font-bold text-text-primary mt-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {t('caregiverApp.crisis.entry.notThere')}
          </h3>
          <p className="text-sm text-text-muted mt-1">
            {t('caregiverApp.crisis.entry.notThereDesc')}
          </p>
        </button>
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

      {/* Pattern insight */}
      <PatternInsight incidents={incidents} />
    </div>
  );
}
