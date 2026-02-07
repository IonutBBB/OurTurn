'use client';

import { useTranslation } from 'react-i18next';

const TOPICS = [
  'daily_routines',
  'communication',
  'behaviors',
  'activities',
  'nutrition',
  'safety',
  'sleep',
] as const;

interface TopicCardsProps {
  patientName: string;
  onSelect: (topicKey: string) => void;
}

export default function TopicCards({ patientName, onSelect }: TopicCardsProps) {
  const { t } = useTranslation();

  return (
    <section>
      <div className="mb-3">
        <h2 className="section-label">{t('caregiverApp.coach.hub.learn.title')}</h2>
        <p className="text-xs text-text-muted">{t('caregiverApp.coach.hub.learn.subtitle', { name: patientName })}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {TOPICS.map((key) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className="px-3 py-2 text-sm card-paper card-interactive border-l-2 border-l-brand-300 hover:border-l-brand-500"
          >
            {t(`caregiverApp.coach.hub.learn.${key}`)}
          </button>
        ))}
      </div>
    </section>
  );
}
