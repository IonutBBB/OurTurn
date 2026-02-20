'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getActivitiesForLocale,
  getCategoriesForLocale,
  type ActivityCategory,
} from '@ourturn/shared';

interface ActivityTemplatePickerProps {
  onSelect: (activityType: string) => void;
  onClose: () => void;
}

export function ActivityTemplatePicker({ onSelect, onClose }: ActivityTemplatePickerProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.split('-')[0] || 'en';
  const categories = getCategoriesForLocale(locale);
  const activities = getActivitiesForLocale(locale);
  const [expandedCategory, setExpandedCategory] = useState<ActivityCategory | null>(
    categories[0]?.category ?? null
  );

  const activitiesByCategory = categories.map((cat) => ({
    ...cat,
    activities: activities.filter((a) => a.category === cat.category),
  }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-card dark:bg-surface-elevated rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <div>
            <h2 className="text-xl font-display font-bold text-text-primary">
              {t('caregiverApp.carePlan.activityPicker.title')}
            </h2>
            <p className="text-sm text-text-muted mt-1">
              {t('caregiverApp.carePlan.activityPicker.subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-secondary p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {activitiesByCategory.map(({ category, emoji, titleKey, activities }) => (
            <div key={category} className="mb-3">
              {/* Category header (accordion) */}
              <button
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                className="w-full flex items-center justify-between py-3 px-4 rounded-xl hover:bg-brand-50 dark:hover:bg-surface-inset transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{emoji}</span>
                  <span className="font-semibold text-text-primary">
                    {t(titleKey)}
                  </span>
                  <span className="text-xs text-text-muted">
                    ({activities.length})
                  </span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 text-text-muted transition-transform ${expandedCategory === category ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Activities list */}
              {expandedCategory === category && (
                <div className="mt-2 space-y-2 pl-4">
                  {activities.map((activity) => (
                    <button
                      key={activity.type}
                      onClick={() => onSelect(activity.type)}
                      className="w-full flex items-start gap-3 p-3 rounded-xl border border-surface-border hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-surface-inset transition-colors text-left"
                    >
                      <span className="text-2xl mt-0.5">{activity.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-text-primary">
                          {t(activity.titleKey)}
                        </div>
                        <div className="text-sm text-text-secondary mt-0.5 line-clamp-2">
                          {t(activity.descriptionKey)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
