'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/toast';
import type { Patient } from '@ourturn/shared';

interface DailyScheduleSectionProps {
  patient: Patient;
}

export default function DailyScheduleSection({ patient }: DailyScheduleSectionProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const supabase = createBrowserClient();

  const [wakeTime, setWakeTime] = useState(patient.wake_time || '07:00');
  const [sleepTime, setSleepTime] = useState(patient.sleep_time || '21:00');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          wake_time: wakeTime,
          sleep_time: sleepTime,
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
        {t('caregiverApp.settings.dailySchedule')}
      </h2>
      <p className="text-sm text-text-secondary mb-4">
        {t('caregiverApp.settings.dailyScheduleDesc')}
      </p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1.5">
              {t('caregiverApp.settings.wakeTime')}
            </label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="input-warm w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1.5">
              {t('caregiverApp.settings.sleepTime')}
            </label>
            <input
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className="input-warm w-full"
            />
          </div>
        </div>
        <p className="text-sm text-text-muted italic">
          {t('caregiverApp.settings.mealTimesNote')}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary disabled:opacity-50"
          >
            {isSaving ? t('caregiverApp.settings.savingSchedule') : t('caregiverApp.settings.saveSchedule')}
          </button>
          {saved && (
            <span className="text-sm text-status-success">{t('common.saved')}</span>
          )}
        </div>
      </div>
    </div>
  );
}
