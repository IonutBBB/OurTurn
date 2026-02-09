'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { useToast } from '@/components/toast';

interface TrendPoint {
  date: string;
  energy: number | null;
  stress: number | null;
  sleep: number | null;
}

interface InsightCard {
  category: string;
  text: string;
  suggestion: string;
}

interface WeeklyDigestProps {
  trend: TrendPoint[];
  incidentCount: number;
}

export function WeeklyDigest({ trend, incidentCount }: WeeklyDigestProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [insights, setInsights] = useState<InsightCard[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const hasData = trend.some((p) => p.energy != null || p.stress != null || p.sleep != null);

  const generateDigest = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/toolkit-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: i18n.language }),
      });
      if (res.status === 429) {
        showToast(t('common.error'), 'error');
        return;
      }
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setInsights(data.insights);
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Compute summary stats
  const recentWeek = trend.slice(-7);
  const avgEnergy = recentWeek.filter((p) => p.energy != null).length > 0
    ? (recentWeek.reduce((s, p) => s + (p.energy || 0), 0) / recentWeek.filter((p) => p.energy != null).length).toFixed(1)
    : null;
  const avgStress = recentWeek.filter((p) => p.stress != null).length > 0
    ? (recentWeek.reduce((s, p) => s + (p.stress || 0), 0) / recentWeek.filter((p) => p.stress != null).length).toFixed(1)
    : null;
  const avgSleep = recentWeek.filter((p) => p.sleep != null).length > 0
    ? (recentWeek.reduce((s, p) => s + (p.sleep || 0), 0) / recentWeek.filter((p) => p.sleep != null).length).toFixed(1)
    : null;

  return (
    <div className="card-paper p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-display font-bold text-text-primary">
            {t('caregiverApp.toolkit.insights.digest.title')}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {t('caregiverApp.toolkit.insights.digest.subtitle')}
          </p>
        </div>
        <button
          onClick={generateDigest}
          disabled={isGenerating || !hasData}
          className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
        >
          {isGenerating
            ? t('caregiverApp.toolkit.insights.generating')
            : t('caregiverApp.toolkit.insights.digest.generate')}
        </button>
      </div>

      {/* Quick Stats */}
      {hasData && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {avgEnergy && (
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-center">
              <p className="text-2xl font-bold text-green-600">{avgEnergy}</p>
              <p className="text-xs text-green-700 dark:text-green-400">{t('caregiverApp.toolkit.insights.wellness.energy')}</p>
            </div>
          )}
          {avgStress && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-center">
              <p className="text-2xl font-bold text-amber-600">{avgStress}</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">{t('caregiverApp.toolkit.insights.wellness.stress')}</p>
            </div>
          )}
          {avgSleep && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
              <p className="text-2xl font-bold text-blue-600">{avgSleep}</p>
              <p className="text-xs text-blue-700 dark:text-blue-400">{t('caregiverApp.toolkit.insights.wellness.sleep')}</p>
            </div>
          )}
        </div>
      )}

      {/* Behaviour Summary */}
      {incidentCount > 0 && (
        <div className="p-3 rounded-xl bg-surface-elevated/50 border border-surface-border mb-5">
          <p className="text-sm text-text-primary">
            {t('caregiverApp.toolkit.insights.digest.behaviourSummary', { count: incidentCount })}
          </p>
        </div>
      )}

      {/* AI Insights */}
      {insights && (
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div key={i} className="p-4 rounded-xl bg-surface-elevated/50 border border-surface-border">
              <p className="text-sm text-text-primary">{insight.text}</p>
              <p className="text-xs text-brand-600 mt-2">{insight.suggestion}</p>
            </div>
          ))}
        </div>
      )}

      {!hasData && (
        <p className="text-sm text-text-muted text-center py-4">
          {t('caregiverApp.toolkit.insights.noData')}
        </p>
      )}
    </div>
  );
}
