'use client';

import { useTranslation } from 'react-i18next';
import type { OnboardingData } from '../page';

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const dementiaTypes = [
  'alzheimers',
  'vascular',
  'lewyBody',
  'frontotemporal',
  'mixed',
  'other',
  'notSure',
];

export function Step2AboutLovedOne({ data, updateData }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="patientName" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          {t('caregiverApp.onboarding.theirName')} *
        </label>
        <input
          id="patientName"
          type="text"
          value={data.patientName}
          onChange={(e) => updateData({ patientName: e.target.value })}
          required
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="First name"
        />
      </div>

      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          {t('caregiverApp.onboarding.dateOfBirth')}{' '}
          <span className="text-gray-500 dark:text-gray-400">({t('caregiverApp.onboarding.optional')})</span>
        </label>
        <input
          id="dateOfBirth"
          type="date"
          value={data.dateOfBirth}
          onChange={(e) => updateData({ dateOfBirth: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div>
        <label htmlFor="dementiaType" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          {t('caregiverApp.onboarding.dementiaType')}
        </label>
        <select
          id="dementiaType"
          value={data.dementiaType}
          onChange={(e) => updateData({ dementiaType: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">Select type (optional)</option>
          {dementiaTypes.map((type) => (
            <option key={type} value={type}>
              {t(`caregiverApp.onboarding.dementiaTypes.${type}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="homeAddress" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          {t('caregiverApp.onboarding.homeAddress')} *
        </label>
        <input
          id="homeAddress"
          type="text"
          value={data.homeAddress}
          onChange={(e) => updateData({ homeAddress: e.target.value })}
          required
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Full home address"
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Used for the &quot;Take Me Home&quot; feature in the patient app
        </p>
      </div>
    </div>
  );
}
