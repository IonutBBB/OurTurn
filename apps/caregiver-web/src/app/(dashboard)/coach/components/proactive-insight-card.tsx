'use client';

import { useTranslation } from 'react-i18next';

interface InsightData {
  text: string;
  suggestion: string;
  category: 'positive' | 'attention' | 'suggestion';
}

interface ProactiveInsightCardProps {
  insight: InsightData | null;
  patientName: string;
  onDiscuss: (insightText: string) => void;
}

const categoryStyles = {
  positive: 'bg-status-success-bg border-status-success/20 text-status-success',
  attention: 'bg-status-amber-bg border-status-amber/20 text-status-amber',
  suggestion: 'bg-brand-50 dark:bg-brand-50/20 border-brand-200 dark:border-brand-200/30 text-brand-700 dark:text-brand-300',
};

export default function ProactiveInsightCard({
  insight,
  patientName,
  onDiscuss,
}: ProactiveInsightCardProps) {
  const { t } = useTranslation();

  if (!insight) {
    return (
      <div className="card-paper p-4 border-l-4 border-l-brand-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="section-label mb-1">{t('caregiverApp.coach.hub.insight.title')}</p>
            <p className="text-sm text-text-secondary">
              {t('caregiverApp.coach.hub.insight.fallback', { name: patientName })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const style = categoryStyles[insight.category];

  return (
    <div className={`card-paper p-4 border-l-4 ${
      insight.category === 'positive' ? 'border-l-status-success' :
      insight.category === 'attention' ? 'border-l-status-amber' :
      'border-l-brand-500'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="section-label mb-1">{t('caregiverApp.coach.hub.insight.title')}</p>
          <p className="text-sm text-text-primary font-medium">{insight.text}</p>
          {insight.suggestion && (
            <p className="text-xs text-text-secondary mt-1">{insight.suggestion}</p>
          )}
        </div>
        <button
          onClick={() => onDiscuss(insight.text)}
          className="btn-primary text-xs px-3 py-1.5 shrink-0"
        >
          {t('caregiverApp.coach.hub.insight.discuss')}
        </button>
      </div>
    </div>
  );
}
