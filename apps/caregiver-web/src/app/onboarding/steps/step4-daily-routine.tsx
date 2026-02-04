'use client';

import { useTranslation } from 'react-i18next';
import type { OnboardingData } from '../page';

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function Step4DailyRoutine({ data, updateData }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
        We&apos;ll use this to create a suggested daily plan. You can customize it later.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="wakeTime" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            {t('caregiverApp.onboarding.wakeTime')}
          </label>
          <input
            id="wakeTime"
            type="time"
            value={data.wakeTime}
            onChange={(e) => updateData({ wakeTime: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label htmlFor="sleepTime" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            {t('caregiverApp.onboarding.sleepTime')}
          </label>
          <input
            id="sleepTime"
            type="time"
            value={data.sleepTime}
            onChange={(e) => updateData({ sleepTime: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
          {t('caregiverApp.onboarding.mealTimes')}
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="breakfastTime" className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              {t('caregiverApp.onboarding.breakfast')}
            </label>
            <input
              id="breakfastTime"
              type="time"
              value={data.breakfastTime}
              onChange={(e) => updateData({ breakfastTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label htmlFor="lunchTime" className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              {t('caregiverApp.onboarding.lunch')}
            </label>
            <input
              id="lunchTime"
              type="time"
              value={data.lunchTime}
              onChange={(e) => updateData({ lunchTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label htmlFor="dinnerTime" className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              {t('caregiverApp.onboarding.dinner')}
            </label>
            <input
              id="dinnerTime"
              type="time"
              value={data.dinnerTime}
              onChange={(e) => updateData({ dinnerTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="typicalDay" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          {t('caregiverApp.onboarding.typicalDay')}
        </label>
        <textarea
          id="typicalDay"
          value={data.typicalDay}
          onChange={(e) => updateData({ typicalDay: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Describe any routines, activities, or preferences that should be part of the daily plan..."
        />
      </div>
    </div>
  );
}
