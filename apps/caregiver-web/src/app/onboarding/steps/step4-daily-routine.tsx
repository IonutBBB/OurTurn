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
      <p className="text-text-secondary text-sm mb-4">
        {t('caregiverApp.onboarding.dailyRoutineIntro')}
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="wakeTime" className="block text-sm font-semibold text-text-primary mb-1.5">
            {t('caregiverApp.onboarding.wakeTime')}
          </label>
          <input
            id="wakeTime"
            type="time"
            value={data.wakeTime}
            onChange={(e) => updateData({ wakeTime: e.target.value })}
            className="input-warm w-full"
          />
        </div>

        <div>
          <label htmlFor="sleepTime" className="block text-sm font-semibold text-text-primary mb-1.5">
            {t('caregiverApp.onboarding.sleepTime')}
          </label>
          <input
            id="sleepTime"
            type="time"
            value={data.sleepTime}
            onChange={(e) => updateData({ sleepTime: e.target.value })}
            className="input-warm w-full"
          />
        </div>
      </div>

      <div className="border-t border-surface-border pt-6">
        <h3 className="text-sm font-medium font-display text-text-primary mb-4">
          {t('caregiverApp.onboarding.mealTimes')}
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="breakfastTime" className="block text-sm text-text-secondary mb-1">
              {t('caregiverApp.onboarding.breakfast')}
            </label>
            <input
              id="breakfastTime"
              type="time"
              value={data.breakfastTime}
              onChange={(e) => updateData({ breakfastTime: e.target.value })}
              className="input-warm w-full text-sm"
            />
          </div>

          <div>
            <label htmlFor="lunchTime" className="block text-sm text-text-secondary mb-1">
              {t('caregiverApp.onboarding.lunch')}
            </label>
            <input
              id="lunchTime"
              type="time"
              value={data.lunchTime}
              onChange={(e) => updateData({ lunchTime: e.target.value })}
              className="input-warm w-full text-sm"
            />
          </div>

          <div>
            <label htmlFor="dinnerTime" className="block text-sm text-text-secondary mb-1">
              {t('caregiverApp.onboarding.dinner')}
            </label>
            <input
              id="dinnerTime"
              type="time"
              value={data.dinnerTime}
              onChange={(e) => updateData({ dinnerTime: e.target.value })}
              className="input-warm w-full text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="typicalDay" className="block text-sm font-semibold text-text-primary mb-1.5">
          {t('caregiverApp.onboarding.typicalDay')}
        </label>
        <textarea
          id="typicalDay"
          value={data.typicalDay}
          onChange={(e) => updateData({ typicalDay: e.target.value })}
          rows={4}
          className="input-warm w-full"
          placeholder={t('caregiverApp.onboarding.typicalDayPlaceholder')}
        />
      </div>
    </div>
  );
}
