'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

interface WeeklyInsightsProps {
  trend: TrendPoint[];
}

const CHART_COLORS = {
  energy: '#22c55e',  // green
  stress: '#f59e0b',  // amber
  sleep: '#3b82f6',   // blue
};

export function WeeklyInsights({ trend }: WeeklyInsightsProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [insights, setInsights] = useState<InsightCard[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateInsights = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/toolkit-insights', { method: 'POST' });
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

  const hasData = trend.some((p) => p.energy !== null || p.stress !== null || p.sleep !== null);

  return (
    <div className="card-paper p-5">
      <h3 className="text-sm font-display font-bold text-text-primary mb-3">
        {t('caregiverApp.toolkit.insights.title')}
      </h3>

      {!hasData ? (
        <p className="text-sm text-text-muted">{t('caregiverApp.toolkit.insights.noData')}</p>
      ) : (
        <>
          {/* SVG line charts */}
          <div className="space-y-3">
            <MiniChart
              label={t('caregiverApp.toolkit.insights.energy')}
              data={trend.map((p) => p.energy)}
              color={CHART_COLORS.energy}
            />
            <MiniChart
              label={t('caregiverApp.toolkit.insights.stress')}
              data={trend.map((p) => p.stress)}
              color={CHART_COLORS.stress}
            />
            <MiniChart
              label={t('caregiverApp.toolkit.insights.sleep')}
              data={trend.map((p) => p.sleep)}
              color={CHART_COLORS.sleep}
            />
          </div>

          {/* AI Insights */}
          <div className="mt-4 pt-4 border-t border-surface-border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-text-secondary">
                {t('caregiverApp.toolkit.insights.aiInsights')}
              </h4>
              <button
                onClick={generateInsights}
                disabled={isGenerating}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50"
              >
                {isGenerating
                  ? t('caregiverApp.toolkit.insights.generating')
                  : t('caregiverApp.toolkit.insights.generateInsights')}
              </button>
            </div>
            {insights && (
              <div className="space-y-2">
                {insights.map((insight, i) => (
                  <div key={i} className="p-3 rounded-xl bg-surface-elevated/50 border border-surface-border">
                    <p className="text-sm text-text-primary">{insight.text}</p>
                    <p className="text-xs text-brand-600 mt-1">{insight.suggestion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MiniChart({
  label,
  data,
  color,
}: {
  label: string;
  data: (number | null)[];
  color: string;
}) {
  // Filter out nulls/undefined for the line, keeping original indices
  const points = data
    .map((v, i) => (v != null && Number.isFinite(v) ? { x: i, y: v } : null))
    .filter((p): p is { x: number; y: number } => p !== null);

  if (points.length < 2) return null;

  const width = 200;
  const height = 32;
  const padding = 2;

  const maxX = data.length - 1 || 1;
  const scaleX = (x: number) => padding + (x / maxX) * (width - padding * 2);
  const scaleY = (y: number) => height - padding - ((y - 1) / 4) * (height - padding * 2);

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`)
    .join(' ');

  const latest = points[points.length - 1];

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-muted w-12">{label}</span>
      <svg width={width} height={height} className="flex-1" viewBox={`0 0 ${width} ${height}`}>
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {latest && (
          <circle cx={scaleX(latest.x)} cy={scaleY(latest.y)} r="3" fill={color} />
        )}
      </svg>
      <span className="text-xs font-semibold text-text-primary w-4 text-right">
        {latest?.y ?? '-'}
      </span>
    </div>
  );
}
