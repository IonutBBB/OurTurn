'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type TrialFeature = 'tasks' | 'caregiver' | 'aiCoach' | 'safeZones' | 'reports' | 'journal' | 'insights' | 'wellbeing';

interface ContextualTrialPromptProps {
  feature: TrialFeature;
  onStartTrial: () => void;
  isLoading?: boolean;
}

/**
 * Contextual upgrade prompt shown when a free-tier user hits a Plus feature limit.
 * Offers a 14-day free trial with messaging specific to what they're trying to do.
 */
export function ContextualTrialPrompt({ feature, onStartTrial, isLoading }: ContextualTrialPromptProps) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-200 dark:border-brand-800 bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-900/30 dark:to-brand-900/10 p-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">{getIcon(feature)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-display font-bold text-text-primary mb-1">
            {t('subscription.contextualTrial.title')}
          </h4>
          <p className="text-sm text-text-secondary mb-3">
            {t(`subscription.contextualTrial.${feature}`)}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onStartTrial}
              disabled={isLoading}
              className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
            >
              {isLoading ? t('subscription.activating') : t('subscription.contextualTrial.startTrial')}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              {t('subscription.contextualTrial.maybeLater')}
            </button>
          </div>
          <p className="text-[11px] text-text-muted mt-2">
            {t('subscription.contextualTrial.noCardRequired')}
          </p>
        </div>
      </div>
    </div>
  );
}

function getIcon(feature: TrialFeature): string {
  switch (feature) {
    case 'tasks': return '\u{2705}';
    case 'caregiver': return '\u{1F46A}';
    case 'aiCoach': return '\u{1F4AC}';
    case 'safeZones': return '\u{1F4CD}';
    case 'reports': return '\u{1F4CB}';
    case 'journal': return '\u{1F4D3}';
    case 'insights': return '\u{1F4CA}';
    case 'wellbeing': return '\u{1F33F}';
  }
}
