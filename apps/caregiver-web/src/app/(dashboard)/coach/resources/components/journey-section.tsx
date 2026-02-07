'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { JOURNEY_STEPS } from '@ourturn/shared';
import type { JourneyStepDefinition, JourneyProgress } from '@ourturn/shared';

interface JourneySectionProps {
  progressMap: Record<string, JourneyProgress>;
  onSelectStep: (step: JourneyStepDefinition) => void;
}

const INITIAL_VISIBLE = 3;

export function JourneySection({ progressMap, onSelectStep }: JourneySectionProps) {
  const { t } = useTranslation('resources');
  const [showAll, setShowAll] = useState(false);

  const visibleSteps = showAll ? JOURNEY_STEPS : JOURNEY_STEPS.slice(0, INITIAL_VISIBLE);

  const getAccentClass = (status: string) => {
    switch (status) {
      case 'completed': return 'border-l-status-success';
      case 'in_progress': return 'border-l-status-amber';
      default: return 'border-l-surface-border';
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xs font-display font-medium uppercase tracking-widest text-text-muted">
          {t('journey.sectionTitle')}
        </h2>
        <p className="text-sm text-text-muted mt-1">{t('journey.sectionSubtitle')}</p>
      </div>

      <div className="space-y-3">
        {visibleSteps.map((step) => {
          const progress = progressMap[step.slug];
          const status = progress?.status ?? 'not_started';
          const checklist = progress?.checklist_state ?? [];
          const checkedCount = checklist.filter(Boolean).length;

          return (
            <button
              key={step.slug}
              onClick={() => onSelectStep(step)}
              className={`w-full text-left card-paper p-4 border-l-[3px] ${getAccentClass(status)} flex items-center gap-4 hover:shadow-md transition-shadow`}
            >
              <span className="text-3xl flex-shrink-0">{step.emoji}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-text-primary">{t(step.titleKey)}</h3>
                <p className="text-sm text-text-secondary line-clamp-1">{t(step.subtitleKey)}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-text-muted">{step.timeEstimate}</span>
                  {checkedCount > 0 && (
                    <span className="text-xs text-status-success font-medium">
                      {t('journey.checklistProgress', { done: checkedCount, total: step.checklistKeys.length })}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xl text-text-muted flex-shrink-0">&rsaquo;</span>
            </button>
          );
        })}
      </div>

      {JOURNEY_STEPS.length > INITIAL_VISIBLE && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            {showAll ? t('journey.showLess') : t('journey.showAll')}
          </button>
        </div>
      )}
    </section>
  );
}
