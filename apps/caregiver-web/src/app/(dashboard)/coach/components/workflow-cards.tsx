'use client';

import { useTranslation } from 'react-i18next';

const WORKFLOWS = [
  { key: 'plan_tomorrow', icon: '\u{1F4C5}' },
  { key: 'doctor_visit', icon: '\u{1FA7A}' },
  { key: 'review_week', icon: '\u{1F4C8}' },
  { key: 'adjust_plan', icon: '\u2699\uFE0F' },
] as const;

interface WorkflowCardsProps {
  onSelect: (workflowKey: string) => void;
}

export default function WorkflowCards({ onSelect }: WorkflowCardsProps) {
  const { t } = useTranslation();

  return (
    <section>
      <div className="mb-3">
        <h2 className="section-label">{t('caregiverApp.coach.hub.planPrepare.title')}</h2>
        <p className="text-xs text-text-muted">{t('caregiverApp.coach.hub.planPrepare.subtitle')}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {WORKFLOWS.map(({ key, icon }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className="card-paper card-interactive p-4 text-left"
          >
            <span className="text-lg mb-1 block">{icon}</span>
            <p className="text-sm font-medium text-text-primary">
              {t(`caregiverApp.coach.hub.planPrepare.${key}`)}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              {t(`caregiverApp.coach.hub.planPrepare.${key}_desc`)}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
