'use client';

import { useTranslation } from 'react-i18next';

interface PersonalizationBoxProps {
  patientName: string;
  strategies: string[] | null;
}

export function PersonalizationBox({ patientName, strategies }: PersonalizationBoxProps) {
  const { t } = useTranslation();

  if (!strategies || strategies.length === 0) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface-card dark:bg-surface-elevated p-4">
        <p className="text-sm text-text-muted">
          {t('caregiverApp.crisis.personalization.empty', { name: patientName })}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-status-success/20 bg-status-success/5 p-4">
      <p className="text-[10px] font-bold tracking-widest uppercase text-status-success mb-2">
        {t('caregiverApp.crisis.personalization.label', { name: patientName })}
      </p>
      <p className="text-sm text-text-secondary leading-relaxed">
        {strategies.join(', ')}
      </p>
    </div>
  );
}
