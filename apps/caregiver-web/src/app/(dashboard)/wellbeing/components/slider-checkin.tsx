'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SliderValue, CaregiverWellbeingLog } from '@ourturn/shared';
import { ENERGY_LABELS, STRESS_LABELS, CAREGIVER_SLEEP_LABELS } from '@ourturn/shared';
import { createBrowserClient } from '@/lib/supabase';
import { useToast } from '@/components/toast';

interface SliderCheckinProps {
  caregiverId: string;
  initialLog: CaregiverWellbeingLog | null;
  onLogUpdated: (log: CaregiverWellbeingLog) => void;
}

const SLIDER_COLORS = {
  energy: { track: 'from-red-300 to-green-400', thumb: 'accent-brand-600' },
  stress: { track: 'from-green-300 to-red-400', thumb: 'accent-status-amber' },
  sleep: { track: 'from-red-300 to-blue-400', thumb: 'accent-brand-600' },
};

export function SliderCheckin({ caregiverId, initialLog, onLogUpdated }: SliderCheckinProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const supabase = createBrowserClient();
  const today = new Date().toISOString().split('T')[0];

  const [energy, setEnergy] = useState<SliderValue>((initialLog?.energy_level as SliderValue) || 3);
  const [stress, setStress] = useState<SliderValue>((initialLog?.stress_level as SliderValue) || 3);
  const [sleep, setSleep] = useState<SliderValue>((initialLog?.sleep_quality_rating as SliderValue) || 3);
  const [hasInteracted, setHasInteracted] = useState(
    initialLog?.energy_level !== null || initialLog?.stress_level !== null || initialLog?.sleep_quality_rating !== null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const logRef = useRef(initialLog);
  useEffect(() => { logRef.current = initialLog; }, [initialLog]);

  const save = useCallback(async () => {
    if (!hasInteracted) return;
    setIsSaving(true);
    try {
      const payload = {
        caregiver_id: caregiverId,
        date: today,
        energy_level: energy,
        stress_level: stress,
        sleep_quality_rating: sleep,
      };

      const { data, error } = await supabase
        .from('caregiver_wellbeing_logs')
        .upsert(payload, { onConflict: 'caregiver_id,date' })
        .select()
        .single();

      if (error) throw error;
      onLogUpdated(data);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setIsSaving(false);
    }
  }, [energy, stress, sleep, caregiverId, today, hasInteracted, supabase, showToast, t, onLogUpdated]);

  // Auto-save 1s after change
  useEffect(() => {
    if (!hasInteracted) return;
    const timeout = setTimeout(save, 1000);
    return () => clearTimeout(timeout);
  }, [energy, stress, sleep, save, hasInteracted]);

  const handleSliderChange = (setter: (v: SliderValue) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasInteracted(true);
    setter(Number(e.target.value) as SliderValue);
  };

  return (
    <div className="card-paper p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-display font-bold text-text-primary">
          {t('caregiverApp.toolkit.checkin.title')}
        </h2>
        {showSaved && (
          <span className="text-sm text-status-success bg-status-success-bg px-3 py-1 rounded-full">
            {t('common.saved')}
          </span>
        )}
        {isSaving && (
          <span className="text-sm text-text-muted">{t('common.loading')}</span>
        )}
      </div>

      <div className="space-y-6">
        {/* Energy Slider */}
        <SliderRow
          label={t('caregiverApp.toolkit.checkin.energy')}
          lowLabel={t('caregiverApp.toolkit.checkin.energyLow')}
          highLabel={t('caregiverApp.toolkit.checkin.energyHigh')}
          value={energy}
          onChange={handleSliderChange(setEnergy)}
          labels={ENERGY_LABELS}
          gradientClass={SLIDER_COLORS.energy.track}
        />

        {/* Stress Slider */}
        <SliderRow
          label={t('caregiverApp.toolkit.checkin.stress')}
          lowLabel={t('caregiverApp.toolkit.checkin.stressLow')}
          highLabel={t('caregiverApp.toolkit.checkin.stressHigh')}
          value={stress}
          onChange={handleSliderChange(setStress)}
          labels={STRESS_LABELS}
          gradientClass={SLIDER_COLORS.stress.track}
        />

        {/* Sleep Slider */}
        <SliderRow
          label={t('caregiverApp.toolkit.checkin.sleep')}
          lowLabel={t('caregiverApp.toolkit.checkin.sleepLow')}
          highLabel={t('caregiverApp.toolkit.checkin.sleepHigh')}
          value={sleep}
          onChange={handleSliderChange(setSleep)}
          labels={CAREGIVER_SLEEP_LABELS}
          gradientClass={SLIDER_COLORS.sleep.track}
        />
      </div>
    </div>
  );
}

function SliderRow({
  label,
  lowLabel,
  highLabel,
  value,
  onChange,
  labels,
  gradientClass,
}: {
  label: string;
  lowLabel: string;
  highLabel: string;
  value: SliderValue;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  labels: Record<SliderValue, string>;
  gradientClass: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-text-primary">{label}</span>
        <span className="text-sm font-medium text-brand-600">{labels[value]}</span>
      </div>
      <div className="relative">
        <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-gradient-to-r ${gradientClass} opacity-30`} />
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={onChange}
          className="slider-toolkit w-full relative z-10"
          aria-label={label}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-text-muted">{lowLabel}</span>
        <span className="text-xs text-text-muted">{highLabel}</span>
      </div>
    </div>
  );
}
