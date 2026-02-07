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
  recentLogs?: CaregiverWellbeingLog[];
  onLogUpdated: (log: CaregiverWellbeingLog) => void;
}

const SLIDER_COLORS = {
  energy: { track: 'from-red-300 to-green-400', thumb: 'accent-brand-600' },
  stress: { track: 'from-green-300 to-red-400', thumb: 'accent-status-amber' },
  sleep: { track: 'from-red-300 to-blue-400', thumb: 'accent-brand-600' },
};

export function SliderCheckin({ caregiverId, initialLog, recentLogs = [], onLogUpdated }: SliderCheckinProps) {
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
  const [moodNotes, setMoodNotes] = useState(initialLog?.mood_notes || '');
  const [showNotes, setShowNotes] = useState(!!initialLog?.mood_notes);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Build sparkline data from the last 7 recent logs
  const sparklineData = (() => {
    const last7 = recentLogs.slice(0, 7).reverse();
    const toNumbers = (arr: (SliderValue | null)[]): number[] =>
      arr.filter((v) => v != null) as number[];
    return {
      energy: toNumbers(last7.map(l => l.energy_level)),
      stress: toNumbers(last7.map(l => l.stress_level)),
      sleep: toNumbers(last7.map(l => l.sleep_quality_rating)),
    };
  })();

  const logRef = useRef(initialLog);
  useEffect(() => { logRef.current = initialLog; }, [initialLog]);

  const save = useCallback(async () => {
    if (!hasInteracted) return;
    setIsSaving(true);
    try {
      // Verify session exists before writing
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('[SliderCheckin] No auth session — user may need to re-login');
        showToast(t('common.error'), 'error');
        return;
      }

      const payload = {
        caregiver_id: caregiverId,
        date: today,
        energy_level: energy,
        stress_level: stress,
        sleep_quality_rating: sleep,
        mood_notes: moodNotes || null,
      };

      const { error } = await supabase
        .from('caregiver_wellbeing_logs')
        .upsert(payload, { onConflict: 'caregiver_id,date' });

      if (error) {
        console.error('[SliderCheckin] Upsert failed:', error.message, '| code:', error.code, '| details:', error.details);
        throw error;
      }

      // Construct the updated log from local state (avoids extra SELECT round-trip)
      onLogUpdated({
        ...payload,
        id: '', // placeholder — not used downstream
      } as CaregiverWellbeingLog);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setIsSaving(false);
    }
  }, [energy, stress, sleep, moodNotes, caregiverId, today, hasInteracted, supabase, showToast, t, onLogUpdated]);

  // Auto-save 1s after change
  useEffect(() => {
    if (!hasInteracted) return;
    const timeout = setTimeout(save, 1000);
    return () => clearTimeout(timeout);
  }, [energy, stress, sleep, moodNotes, save, hasInteracted]);

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
          sparkline={sparklineData.energy}
          sparkColor="#22c55e"
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
          sparkline={sparklineData.stress}
          sparkColor="#f59e0b"
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
          sparkline={sparklineData.sleep}
          sparkColor="#3b82f6"
        />
      </div>

      {/* Mood notes */}
      <div className="mt-4 pt-4 border-t border-surface-border">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium"
        >
          {showNotes
            ? t('caregiverApp.toolkit.checkin.hideNotes')
            : t('caregiverApp.toolkit.checkin.addNote')}
        </button>
        {showNotes && (
          <textarea
            value={moodNotes}
            onChange={(e) => {
              setHasInteracted(true);
              setMoodNotes(e.target.value);
            }}
            placeholder={t('caregiverApp.toolkit.checkin.notesPlaceholder')}
            className="input-warm w-full mt-2 text-sm resize-none"
            rows={2}
          />
        )}
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
  sparkline = [],
  sparkColor = '#888',
}: {
  label: string;
  lowLabel: string;
  highLabel: string;
  value: SliderValue;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  labels: Record<SliderValue, string>;
  gradientClass: string;
  sparkline?: number[];
  sparkColor?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary">{label}</span>
          {sparkline.length >= 2 && <MiniSparkline data={sparkline} color={sparkColor} />}
        </div>
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

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const w = 48;
  const h = 12;
  const pad = 1;
  const maxX = data.length - 1;
  const pathD = data
    .map((v, i) => {
      const x = pad + (i / maxX) * (w - pad * 2);
      const y = h - pad - ((v - 1) / 4) * (h - pad * 2);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} className="opacity-60" aria-hidden="true">
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
