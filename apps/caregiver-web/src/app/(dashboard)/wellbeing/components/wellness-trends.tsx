'use client';

import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

interface TrendPoint {
  date: string;
  energy: number | null;
  stress: number | null;
  sleep: number | null;
}

interface WellnessTrendsProps {
  trend: TrendPoint[];
}

const CHART_CONFIG = [
  { key: 'energy', color: '#22c55e', label: 'Energy' },
  { key: 'stress', color: '#f59e0b', label: 'Stress' },
  { key: 'sleep', color: '#3b82f6', label: 'Sleep' },
] as const;

export function WellnessTrends({ trend }: WellnessTrendsProps) {
  const { t, i18n } = useTranslation();

  const hasData = trend.some((p) => p.energy != null || p.stress != null || p.sleep != null);

  if (!hasData) {
    return (
      <div className="card-paper p-6 text-center">
        <h2 className="text-lg font-display font-bold text-text-primary mb-2">
          {t('caregiverApp.toolkit.insights.wellness.title')}
        </h2>
        <p className="text-sm text-text-muted">
          {t('caregiverApp.toolkit.insights.wellness.noData')}
        </p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="card-paper p-6">
      <h2 className="text-lg font-display font-bold text-text-primary mb-2">
        {t('caregiverApp.toolkit.insights.wellness.title')}
      </h2>
      <p className="text-sm text-text-secondary mb-5">
        {t('caregiverApp.toolkit.insights.wellness.subtitle')}
      </p>

      <div className="space-y-6">
        {CHART_CONFIG.map(({ key, color, label }) => {
          const chartData = trend
            .filter((p) => p[key] != null)
            .map((p) => ({ date: formatDate(p.date), value: p[key] }));

          if (chartData.length < 2) return null;

          return (
            <div key={key}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm font-semibold text-text-primary">
                  {t(`caregiverApp.toolkit.insights.wellness.${key}`)}
                </span>
              </div>
              <div className="h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-border, #e5e7eb)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: 'var(--color-text-muted, #9ca3af)' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={[1, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tick={{ fontSize: 10, fill: 'var(--color-text-muted, #9ca3af)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-surface-card, white)',
                        border: '1px solid var(--color-surface-border, #e5e7eb)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    {/* Green zone for energy/sleep (4-5 is good) or stress (1-2 is good) */}
                    <ReferenceLine
                      y={3}
                      stroke="var(--color-surface-border, #e5e7eb)"
                      strokeDasharray="3 3"
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={color}
                      strokeWidth={2}
                      dot={{ r: 3, fill: color }}
                      activeDot={{ r: 5 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
