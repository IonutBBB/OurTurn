'use client';

import { useTranslation } from 'react-i18next';

const SITUATIONS = [
  'refusing_food',
  'refusing_medication',
  'agitated',
  'not_recognizing',
  'repetitive_questions',
  'sundowning',
  'wants_to_leave',
  'caregiver_overwhelmed',
] as const;

interface SituationCardsProps {
  onSelect: (situationKey: string) => void;
}

export default function SituationCards({ onSelect }: SituationCardsProps) {
  const { t } = useTranslation();

  return (
    <section>
      <div className="mb-3">
        <h2 className="section-label">{t('caregiverApp.coach.hub.rightNow.title')}</h2>
        <p className="text-xs text-text-muted">{t('caregiverApp.coach.hub.rightNow.subtitle')}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {SITUATIONS.map((key) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className="px-3 py-2 text-sm card-paper card-interactive border-l-2 border-l-status-amber hover:border-l-status-amber/80"
          >
            {t(`caregiverApp.coach.hub.rightNow.${key}`)}
          </button>
        ))}
      </div>
    </section>
  );
}
