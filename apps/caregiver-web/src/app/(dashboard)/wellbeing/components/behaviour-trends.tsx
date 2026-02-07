'use client';

import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { BehaviourIncident } from '@ourturn/shared';
import { BEHAVIOUR_TYPES } from '@ourturn/shared';

interface BehaviourTrendsProps {
  incidents: BehaviourIncident[];
}

export function BehaviourTrends({ incidents }: BehaviourTrendsProps) {
  const { t } = useTranslation();

  // Bar chart: incidents by type
  const typeCounts = BEHAVIOUR_TYPES.map((bt) => ({
    name: bt.label,
    emoji: bt.emoji,
    count: incidents.filter((i) => i.behaviour_type === bt.type).length,
  })).filter((d) => d.count > 0);

  // Heatmap: time_of_day × day_of_week
  const timeSlots = ['morning', 'afternoon', 'evening', 'night'] as const;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const heatmapData: Record<string, Record<string, number>> = {};
  timeSlots.forEach((time) => {
    heatmapData[time] = {};
    days.forEach((day) => { heatmapData[time][day] = 0; });
  });

  incidents.forEach((incident) => {
    if (!incident.time_of_day) return;
    const date = new Date(incident.logged_at);
    const dayIdx = date.getDay();
    const dayName = days[dayIdx === 0 ? 6 : dayIdx - 1]; // Convert Sunday=0 to Mon-based
    heatmapData[incident.time_of_day][dayName]++;
  });

  const maxHeatmapValue = Math.max(
    1,
    ...Object.values(heatmapData).flatMap((row) => Object.values(row))
  );

  const getHeatColor = (value: number) => {
    if (value === 0) return 'bg-surface-border/40';
    const intensity = value / maxHeatmapValue;
    if (intensity <= 0.33) return 'bg-status-amber/30';
    if (intensity <= 0.66) return 'bg-status-amber/60';
    return 'bg-status-danger/50';
  };

  return (
    <div className="card-paper p-6">
      <h2 className="text-lg font-display font-bold text-text-primary mb-2">
        {t('caregiverApp.toolkit.insights.behaviour.title')}
      </h2>
      <p className="text-sm text-text-secondary mb-5">
        {t('caregiverApp.toolkit.insights.behaviour.subtitle')}
      </p>

      {/* Bar Chart by Type */}
      {typeCounts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">
            {t('caregiverApp.toolkit.insights.behaviour.byType')}
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeCounts} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-border, #e5e7eb)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: 'var(--color-text-muted, #9ca3af)' }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--color-text-muted, #9ca3af)' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface-card, white)',
                    border: '1px solid var(--color-surface-border, #e5e7eb)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-brand-500, #c0634a)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Heatmap */}
      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">
          {t('caregiverApp.toolkit.insights.behaviour.heatmap')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-xs text-text-muted font-normal text-left pr-3 pb-2" />
                {days.map((day) => (
                  <th key={day} className="text-xs text-text-muted font-normal text-center pb-2 px-1">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time}>
                  <td className="text-xs text-text-muted pr-3 py-1 capitalize">{time}</td>
                  {days.map((day) => {
                    const value = heatmapData[time][day];
                    return (
                      <td key={day} className="px-1 py-1">
                        <div
                          className={`w-full aspect-square rounded-lg ${getHeatColor(value)} flex items-center justify-center min-w-[28px]`}
                          title={`${time} ${day}: ${value} incidents`}
                        >
                          {value > 0 && (
                            <span className="text-[10px] font-medium text-text-primary">{value}</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
