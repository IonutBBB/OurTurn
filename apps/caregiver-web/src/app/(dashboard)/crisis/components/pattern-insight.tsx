'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { BehaviourIncident, TimeOfDay } from '@ourturn/shared';

interface PatternInsightProps {
  incidents: BehaviourIncident[];
}

const TIME_LABELS: Record<TimeOfDay, string> = {
  morning: 'morning',
  afternoon: 'afternoon',
  evening: 'evening',
  night: 'night',
};

export function PatternInsight({ incidents }: PatternInsightProps) {
  const { t } = useTranslation();

  const insight = useMemo(() => {
    if (incidents.length === 0) return null;

    // Count this week
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeek = incidents.filter(
      (i) => new Date(i.logged_at) >= weekAgo
    );

    // Most common time of day
    const timeCounts: Record<string, number> = {};
    for (const inc of incidents) {
      if (inc.time_of_day) {
        timeCounts[inc.time_of_day] = (timeCounts[inc.time_of_day] || 0) + 1;
      }
    }
    const topTime = Object.entries(timeCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] as TimeOfDay | undefined;

    // Most frequent type
    const typeCounts: Record<string, number> = {};
    for (const inc of incidents) {
      typeCounts[inc.behaviour_type] =
        (typeCounts[inc.behaviour_type] || 0) + 1;
    }
    const topType = Object.entries(typeCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    return {
      total: incidents.length,
      thisWeekCount: thisWeek.length,
      topTime,
      topType,
    };
  }, [incidents]);

  // No incidents
  if (!insight) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <span className="text-lg">📊</span>
          <p className="text-sm text-text-muted">
            {t('caregiverApp.crisis.patterns.noEvents')}
          </p>
        </div>
      </div>
    );
  }

  // 1-2 events: basic count
  if (insight.total < 3) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <span className="text-lg">📊</span>
          <p className="text-sm text-text-secondary">
            {t('caregiverApp.crisis.patterns.fewEvents', {
              count: insight.total,
            })}
          </p>
        </div>
      </div>
    );
  }

  // 3+ events: detailed pattern
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
      <div className="flex items-start gap-3">
        <span className="text-lg">📊</span>
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400">
            {t('caregiverApp.crisis.patterns.title')}
          </p>
          <p className="text-sm text-text-secondary">
            {insight.topTime &&
              t('caregiverApp.crisis.patterns.timePattern', {
                time: TIME_LABELS[insight.topTime],
              })}{' '}
            {t('caregiverApp.crisis.patterns.weekCount', {
              count: insight.thisWeekCount,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
