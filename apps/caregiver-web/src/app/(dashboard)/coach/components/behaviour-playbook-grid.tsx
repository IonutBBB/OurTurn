'use client';

import { useTranslation } from 'react-i18next';
import type { BehaviourPlaybook } from '@ourturn/shared';

interface PlaybookGridProps {
  playbooks: BehaviourPlaybook[];
  onSelect: (playbook: BehaviourPlaybook) => void;
}

export function PlaybookGrid({ playbooks, onSelect }: PlaybookGridProps) {
  const { t } = useTranslation();

  return (
    <div className="card-paper p-6">
      <h2 className="text-lg font-display font-bold text-text-primary mb-2">
        {t('caregiverApp.toolkit.behaviours.playbooks.title')}
      </h2>
      <p className="text-sm text-text-secondary mb-5">
        {t('caregiverApp.toolkit.behaviours.playbooks.subtitle')}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {playbooks.map((playbook) => (
          <button
            key={playbook.id}
            onClick={() => onSelect(playbook)}
            className="flex flex-col items-center p-4 rounded-2xl border-2 border-surface-border bg-surface-card dark:bg-surface-elevated hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all text-center min-h-[88px]"
          >
            <span className="text-2xl mb-2">{playbook.emoji}</span>
            <span className="text-sm font-semibold text-text-primary leading-tight">
              {playbook.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
