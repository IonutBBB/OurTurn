'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/toast';
import type { Patient } from '@ourturn/shared';

const dementiaTypes = [
  'alzheimers',
  'vascular',
  'lewyBody',
  'frontotemporal',
  'mixed',
  'other',
  'notSure',
];

interface PatientInformationSectionProps {
  patient: Patient;
}

export default function PatientInformationSection({ patient }: PatientInformationSectionProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const supabase = createBrowserClient();

  const [name, setName] = useState(patient.name);
  const [dateOfBirth, setDateOfBirth] = useState(patient.date_of_birth || '');
  const [dementiaType, setDementiaType] = useState(patient.dementia_type || '');
  const [homeAddress, setHomeAddress] = useState(patient.home_address_formatted || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          name,
          date_of_birth: dateOfBirth || null,
          dementia_type: dementiaType || null,
          home_address_formatted: homeAddress || null,
        })
        .eq('id', patient.id);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card-paper p-6">
      <h2 className="text-lg font-display font-bold text-text-primary mb-2">
        {t('caregiverApp.settings.patientInformation')}
      </h2>
      <p className="text-sm text-text-secondary mb-4">
        {t('caregiverApp.settings.patientInformationDesc')}
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1.5">
            {t('caregiverApp.settings.patientName')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-warm w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1.5">
            {t('caregiverApp.settings.dateOfBirth')}
          </label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="input-warm w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1.5">
            {t('caregiverApp.settings.dementiaType')}
          </label>
          <select
            value={dementiaType}
            onChange={(e) => setDementiaType(e.target.value)}
            className="input-warm w-full"
          >
            <option value="">{t('caregiverApp.settings.selectDementiaType')}</option>
            {dementiaTypes.map((type) => (
              <option key={type} value={type}>
                {t(`caregiverApp.onboarding.dementiaTypes.${type}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1.5">
            {t('caregiverApp.settings.homeAddress')}
          </label>
          <input
            type="text"
            value={homeAddress}
            onChange={(e) => setHomeAddress(e.target.value)}
            className="input-warm w-full"
            placeholder={t('caregiverApp.settings.homeAddressPlaceholder')}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="btn-primary disabled:opacity-50"
          >
            {isSaving ? t('caregiverApp.settings.savingPatientInfo') : t('caregiverApp.settings.savePatientInfo')}
          </button>
          {saved && (
            <span className="text-sm text-status-success">{t('common.saved')}</span>
          )}
        </div>
      </div>
    </div>
  );
}
