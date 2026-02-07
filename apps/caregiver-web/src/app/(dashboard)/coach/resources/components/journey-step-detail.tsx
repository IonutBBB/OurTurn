'use client';

import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import type { JourneyStepDefinition, JourneyProgress, JourneyStepStatus } from '@ourturn/shared';

interface JourneyStepDetailProps {
  step: JourneyStepDefinition;
  progress?: JourneyProgress;
  onClose: () => void;
  onToggleChecklist: (slug: string, index: number) => void;
  onUpdateStatus: (slug: string, status: JourneyStepStatus) => void;
}

export function JourneyStepDetail({
  step,
  progress,
  onClose,
  onToggleChecklist,
  onUpdateStatus,
}: JourneyStepDetailProps) {
  const { t } = useTranslation('resources');
  const status = progress?.status ?? 'not_started';
  const checklist = progress?.checklist_state ?? new Array(step.checklistKeys.length).fill(false);

  const handleMarkComplete = () => {
    if (status === 'completed') {
      onUpdateStatus(step.slug, 'in_progress');
    } else {
      onUpdateStatus(step.slug, 'completed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onClose}
        className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
      >
        &larr; {t('journey.backToResources')}
      </button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <span className="text-4xl">{step.emoji}</span>
        <div>
          <h2 className="text-xl font-display font-bold text-text-primary">{t(step.titleKey)}</h2>
          <p className="text-sm text-text-muted mt-1">{step.timeEstimate}</p>
        </div>
      </div>

      {/* Content */}
      <div className="card-paper p-6 lg:p-8">
        <div className="text-sm text-text-primary leading-relaxed">
          <Markdown
            components={{
              h1: ({ children }) => <h1 className="text-xl font-bold font-display text-text-primary mt-6 mb-3 first:mt-0">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-semibold font-display text-text-primary mt-5 mb-2 first:mt-0">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-semibold font-display text-text-primary mt-4 mb-2 first:mt-0">{children}</h3>,
              h4: ({ children }) => <h4 className="text-sm font-semibold text-text-primary mt-3 mb-1.5">{children}</h4>,
              p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-outside pl-5 mb-3 space-y-1.5">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-outside pl-5 mb-3 space-y-1.5">{children}</ol>,
              li: ({ children }) => <li className="pl-0.5">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              hr: () => <hr className="my-4 border-surface-border" />,
              blockquote: ({ children }) => <blockquote className="border-l-4 border-brand-300 pl-4 my-3 text-text-muted italic">{children}</blockquote>,
            }}
          >
            {t(step.contentKey)}
          </Markdown>
        </div>
      </div>

      {/* Checklist */}
      <div className="card-paper p-6 lg:p-8 space-y-4">
        <h3 className="text-base font-semibold text-text-primary">{t('journey.checklist')}</h3>
        {step.checklistKeys.map((key, index) => {
          const checked = checklist[index] ?? false;
          return (
            <button
              key={index}
              onClick={() => onToggleChecklist(step.slug, index)}
              className="flex items-center gap-3 w-full text-left min-h-[48px] py-2 group"
            >
              <div
                className={`w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  checked
                    ? 'bg-status-success border-status-success'
                    : 'border-surface-border bg-surface-card group-hover:border-brand-400'
                }`}
              >
                {checked && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span
                className={`text-sm leading-relaxed ${
                  checked ? 'text-text-muted line-through' : 'text-text-primary'
                }`}
              >
                {t(key)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mark Complete button */}
      <button
        onClick={handleMarkComplete}
        className={`w-full py-3 rounded-2xl text-sm font-semibold transition-colors ${
          status === 'completed'
            ? 'bg-status-success/10 text-status-success border border-status-success hover:bg-status-success/20'
            : 'btn-primary'
        }`}
      >
        {status === 'completed' ? t('journey.markInProgress') : t('journey.markComplete')}
      </button>

      {/* Disclaimer */}
      <p className="text-xs text-text-muted italic">{t('journey.disclaimer')}</p>
    </div>
  );
}
