'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BehaviourIncident, BehaviourType } from '@ourturn/shared';
import { BEHAVIOUR_TYPES } from '@ourturn/shared';

interface BehaviourTimelineProps {
  incidents: BehaviourIncident[];
}

export function BehaviourTimeline({ incidents }: BehaviourTimelineProps) {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState<BehaviourType | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === 'all'
    ? incidents
    : incidents.filter((i) => i.behaviour_type === filter);

  // Group by date
  const grouped = filtered.reduce<Record<string, BehaviourIncident[]>>((acc, incident) => {
    const date = new Date(incident.logged_at).toLocaleDateString(i18n.language, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(incident);
    return acc;
  }, {});

  const getTypeInfo = (type: BehaviourType) =>
    BEHAVIOUR_TYPES.find((bt) => bt.type === type) || { emoji: '❓', label: type };

  const severityDots = (level: number) => (
    <div className="flex gap-0.5" aria-label={`Severity ${level} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i <= level
              ? level <= 2
                ? 'bg-status-success'
                : level === 3
                  ? 'bg-status-amber'
                  : 'bg-status-danger'
              : 'bg-surface-border'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="card-paper p-6">
      <h2 className="text-lg font-display font-bold text-text-primary mb-4">
        {t('caregiverApp.toolkit.behaviours.timeline.title')}
      </h2>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
            filter === 'all'
              ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/30 text-brand-700'
              : 'border-surface-border text-text-secondary hover:border-brand-300'
          }`}
        >
          {t('caregiverApp.toolkit.behaviours.timeline.all')}
        </button>
        {BEHAVIOUR_TYPES.map((bt) => (
          <button
            key={bt.type}
            onClick={() => setFilter(bt.type)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              filter === bt.type
                ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/30 text-brand-700'
                : 'border-surface-border text-text-secondary hover:border-brand-300'
            }`}
          >
            {bt.emoji} {t(`caregiverApp.toolkit.behaviours.types.${bt.type}`)}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {Object.entries(grouped).length === 0 ? (
        <p className="text-sm text-text-muted text-center py-4">
          {t('caregiverApp.toolkit.behaviours.timeline.noIncidents')}
        </p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dayIncidents]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-text-secondary mb-3">{date}</h3>
              <div className="space-y-2">
                {dayIncidents.map((incident) => {
                  const typeInfo = getTypeInfo(incident.behaviour_type);
                  const isExpanded = expandedId === incident.id;
                  const time = new Date(incident.logged_at).toLocaleTimeString(i18n.language, {
                    hour: 'numeric',
                    minute: '2-digit',
                  });

                  return (
                    <div key={incident.id}>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : incident.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-elevated/50 border border-surface-border hover:bg-surface-elevated transition-colors text-left"
                      >
                        <span className="text-lg">{typeInfo.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text-primary">{t(`caregiverApp.toolkit.behaviours.types.${incident.behaviour_type}`)}</span>
                            {severityDots(incident.severity)}
                          </div>
                          <p className="text-xs text-text-muted truncate">{incident.what_happened}</p>
                        </div>
                        <span className="text-xs text-text-muted flex-shrink-0">{time}</span>
                        <svg
                          className={`w-4 h-4 text-text-muted transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isExpanded && (
                        <div className="ml-10 mt-2 p-4 rounded-xl bg-surface-card border border-surface-border space-y-3">
                          <div>
                            <span className="text-xs font-semibold text-text-secondary">
                              {t('caregiverApp.toolkit.behaviours.logger.whatHappened')}
                            </span>
                            <p className="text-sm text-text-primary mt-1">{incident.what_happened}</p>
                          </div>
                          {incident.what_helped && (
                            <div>
                              <span className="text-xs font-semibold text-text-secondary">
                                {t('caregiverApp.toolkit.behaviours.logger.whatHelped')}
                              </span>
                              <p className="text-sm text-text-primary mt-1">{incident.what_helped}</p>
                            </div>
                          )}
                          {incident.possible_triggers.length > 0 && (
                            <div>
                              <span className="text-xs font-semibold text-text-secondary">
                                {t('caregiverApp.toolkit.behaviours.logger.triggers')}
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {incident.possible_triggers.map((trigger) => (
                                  <span key={trigger} className="text-xs px-2 py-0.5 rounded-full bg-surface-elevated border border-surface-border text-text-secondary">
                                    {t(`caregiverApp.toolkit.behaviours.logger.trigger_${trigger}`)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {incident.time_of_day && (
                            <span className="text-xs text-text-muted">
                              {t(`caregiverApp.toolkit.behaviours.logger.${incident.time_of_day}`)}
                              {incident.duration_minutes ? ` · ${incident.duration_minutes} min` : ''}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
