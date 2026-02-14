'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CrisisScenario } from '../types';
import { StepCard } from './step-card';
import { PersonalizationBox } from './personalization-box';
import { CrisisLogger } from './crisis-logger';

interface ScenarioGuideProps {
  scenario: CrisisScenario;
  patientName: string;
  calmingStrategies: string[] | null;
  householdId: string;
  caregiverId: string;
  patientId: string;
  onBack: () => void;
  onAlertFamily: () => void;
}

export function ScenarioGuide({
  scenario,
  patientName,
  calmingStrategies,
  householdId,
  caregiverId,
  patientId,
  onBack,
  onAlertFamily,
}: ScenarioGuideProps) {
  const { t } = useTranslation();
  const [openStep, setOpenStep] = useState(0);

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
        {t('caregiverApp.crisis.backToSituations')}
      </button>

      {/* Scenario header */}
      <div>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{scenario.emoji}</span>
          <div>
            <h2 className="text-xl font-display font-bold text-text-primary">
              {t(`caregiverApp.crisis.scenarioLabels.${scenario.id}`)}
            </h2>
            <p className="text-sm text-text-secondary">
              {scenario.stepCountDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Personalization box */}
      <PersonalizationBox
        patientName={patientName}
        strategies={calmingStrategies}
      />

      {/* Steps accordion */}
      <div className="space-y-2">
        {scenario.steps.map((step, idx) => (
          <StepCard
            key={idx}
            step={step}
            stepIndex={idx}
            isOpen={openStep === idx}
            onToggle={() => setOpenStep(openStep === idx ? -1 : idx)}
            patientName={patientName}
            onActionAlertFamily={onAlertFamily}
          />
        ))}
      </div>

      {/* Crisis logger */}
      <CrisisLogger
        scenarioId={scenario.id}
        householdId={householdId}
        caregiverId={caregiverId}
        patientId={patientId}
        onSaved={() => {}}
      />

    </div>
  );
}
