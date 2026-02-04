'use client';

import { useTranslation } from 'react-i18next';
import type { OnboardingData } from '../page';

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const relationships = [
  'mother',
  'father',
  'spouse',
  'grandmother',
  'grandfather',
  'sibling',
  'friend',
  'other',
];

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'RO', name: 'Romania' },
  { code: 'PL', name: 'Poland' },
  { code: 'IN', name: 'India' },
  { code: 'JP', name: 'Japan' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
];

export function Step1AboutYou({ data, updateData }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="caregiverName" className="block text-sm font-medium text-text-primary mb-1">
          {t('caregiverApp.onboarding.yourName')} *
        </label>
        <input
          id="caregiverName"
          type="text"
          value={data.caregiverName}
          onChange={(e) => updateData({ caregiverName: e.target.value })}
          required
          className="w-full px-4 py-3 border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-gray-800 text-text-primary"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="relationship" className="block text-sm font-medium text-text-primary mb-1">
          {t('caregiverApp.onboarding.relationship')} *
        </label>
        <select
          id="relationship"
          value={data.relationship}
          onChange={(e) => updateData({ relationship: e.target.value })}
          required
          className="w-full px-4 py-3 border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-gray-800 text-text-primary"
        >
          <option value="">{t('caregiverApp.onboarding.selectRelationship')}</option>
          {relationships.map((rel) => (
            <option key={rel} value={rel}>
              {t(`caregiverApp.onboarding.relationships.${rel}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="country" className="block text-sm font-medium text-text-primary mb-1">
          {t('caregiverApp.onboarding.country')} *
        </label>
        <select
          id="country"
          value={data.country}
          onChange={(e) => updateData({ country: e.target.value })}
          required
          className="w-full px-4 py-3 border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-gray-800 text-text-primary"
        >
          <option value="">Select country</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
