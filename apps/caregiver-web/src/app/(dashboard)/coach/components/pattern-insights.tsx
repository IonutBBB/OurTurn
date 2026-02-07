'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/toast';

interface PatternInsightsProps {
  householdId: string;
  incidentCount: number;
}

interface PatternCard {
  title: string;
  insight: string;
  suggestion: string;
}

export function PatternInsights({ householdId, incidentCount }: PatternInsightsProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [patterns, setPatterns] = useState<PatternCard[] | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);

  const analysePatterns = async () => {
    setIsAnalysing(true);
    try {
      const res = await fetch('/api/ai/behaviour-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ householdId }),
      });
      if (res.status === 429) {
        showToast(t('common.error'), 'error');
        return;
      }
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (data.notEnoughData) {
        setPatterns([]);
        return;
      }
      setPatterns(data.patterns);
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setIsAnalysing(false);
    }
  };

  return (
    <div className="card-paper p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-display font-bold text-text-primary">
            {t('caregiverApp.toolkit.behaviours.patterns.title')}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {t('caregiverApp.toolkit.behaviours.patterns.subtitle', { count: incidentCount })}
          </p>
        </div>
        <button
          onClick={analysePatterns}
          disabled={isAnalysing}
          className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
        >
          {isAnalysing
            ? t('caregiverApp.toolkit.behaviours.patterns.analysing')
            : t('caregiverApp.toolkit.behaviours.patterns.analyse')}
        </button>
      </div>

      {patterns && patterns.length === 0 && (
        <p className="text-sm text-text-muted text-center py-4">
          {t('caregiverApp.toolkit.behaviours.patterns.notEnoughData')}
        </p>
      )}

      {patterns && patterns.length > 0 && (
        <div className="space-y-3">
          {patterns.map((pattern, i) => (
            <div key={i} className="p-4 rounded-xl bg-surface-elevated/50 border border-surface-border">
              <h4 className="text-sm font-semibold text-text-primary mb-1">{pattern.title}</h4>
              <p className="text-sm text-text-secondary">{pattern.insight}</p>
              <p className="text-xs text-brand-600 mt-2">{pattern.suggestion}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
