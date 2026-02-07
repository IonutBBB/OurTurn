'use client';

import { useTranslation } from 'react-i18next';

interface JourneyProgressBarProps {
  completedCount: number;
  totalCount: number;
  stepStatuses: string[];
}

export function JourneyProgressBar({ completedCount, totalCount, stepStatuses }: JourneyProgressBarProps) {
  const { t } = useTranslation('resources');

  const getColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-status-success';
      case 'in_progress': return 'bg-status-amber';
      default: return 'bg-surface-border';
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-status-success';
      case 'in_progress': return 'border-status-amber';
      default: return 'border-surface-border';
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center">
        {stepStatuses.map((status, i) => (
          <div key={i} className="flex items-center">
            {i > 0 && (
              <div
                className={`w-8 h-0.5 ${
                  stepStatuses[i - 1] === 'completed' ? 'bg-status-success' : 'bg-surface-border'
                }`}
              />
            )}
            <div
              className={`w-4 h-4 rounded-full border-2 ${getBorderColor(status)} ${
                status === 'not_started' ? 'bg-surface-card' : getColor(status)
              }`}
            />
          </div>
        ))}
      </div>
      <p className="text-sm text-text-muted">
        {t('journey.progressLabel', { completed: completedCount, total: totalCount })}
      </p>
    </div>
  );
}
