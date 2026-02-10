'use client';

import { useTranslation } from 'react-i18next';
import type { OnboardingData } from '../page';

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function Step3LifeStory({ data, updateData }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <p className="text-text-secondary text-sm mb-4">
        {t('caregiverApp.onboarding.lifeStoryIntro')}
      </p>

      <div>
        <label htmlFor="childhoodLocation" className="block text-sm font-semibold text-text-primary mb-1.5">
          {t('caregiverApp.onboarding.childhoodLocation')}
        </label>
        <input
          id="childhoodLocation"
          type="text"
          value={data.childhoodLocation}
          onChange={(e) => updateData({ childhoodLocation: e.target.value })}
          className="input-warm w-full"
          placeholder={t('caregiverApp.onboarding.childhoodLocationPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="career" className="block text-sm font-semibold text-text-primary mb-1.5">
          {t('caregiverApp.onboarding.career')}
        </label>
        <input
          id="career"
          type="text"
          value={data.career}
          onChange={(e) => updateData({ career: e.target.value })}
          className="input-warm w-full"
          placeholder={t('caregiverApp.onboarding.careerPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="hobbies" className="block text-sm font-semibold text-text-primary mb-1.5">
          {t('caregiverApp.onboarding.hobbies')}
        </label>
        <input
          id="hobbies"
          type="text"
          value={data.hobbies}
          onChange={(e) => updateData({ hobbies: e.target.value })}
          className="input-warm w-full"
          placeholder={t('caregiverApp.onboarding.hobbiesPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="favoriteMusic" className="block text-sm font-semibold text-text-primary mb-1.5">
          {t('caregiverApp.onboarding.favoriteMusic')}
        </label>
        <input
          id="favoriteMusic"
          type="text"
          value={data.favoriteMusic}
          onChange={(e) => updateData({ favoriteMusic: e.target.value })}
          className="input-warm w-full"
          placeholder={t('caregiverApp.onboarding.favoriteMusicPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="favoriteFoods" className="block text-sm font-semibold text-text-primary mb-1.5">
          {t('caregiverApp.onboarding.favoriteFoods')}
        </label>
        <input
          id="favoriteFoods"
          type="text"
          value={data.favoriteFoods}
          onChange={(e) => updateData({ favoriteFoods: e.target.value })}
          className="input-warm w-full"
          placeholder={t('caregiverApp.onboarding.favoriteFoodsPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="importantPeople" className="block text-sm font-semibold text-text-primary mb-1.5">
          {t('caregiverApp.onboarding.importantPeople')}
        </label>
        <textarea
          id="importantPeople"
          value={data.importantPeople}
          onChange={(e) => updateData({ importantPeople: e.target.value })}
          rows={2}
          className="input-warm w-full"
          placeholder={t('caregiverApp.onboarding.importantPeoplePlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="keyEvents" className="block text-sm font-semibold text-text-primary mb-1.5">
          {t('caregiverApp.onboarding.keyEvents')}
        </label>
        <textarea
          id="keyEvents"
          value={data.keyEvents}
          onChange={(e) => updateData({ keyEvents: e.target.value })}
          rows={2}
          className="input-warm w-full"
          placeholder={t('caregiverApp.onboarding.keyEventsPlaceholder')}
        />
      </div>
    </div>
  );
}
