'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserClient } from '@/lib/supabase';
import { useToast } from '@/components/toast';
import type { BehaviourIncident, BehaviourType, TimeOfDay } from '@ourturn/shared';
import { BEHAVIOUR_TYPES, BEHAVIOUR_TRIGGERS } from '@ourturn/shared';

interface IncidentLoggerProps {
  caregiverId: string;
  householdId: string;
  patientId: string;
  prefillType?: string;
  onClose: () => void;
  onSaved: (incident: BehaviourIncident) => void;
}

export function IncidentLogger({
  caregiverId,
  householdId,
  patientId,
  prefillType,
  onClose,
  onSaved,
}: IncidentLoggerProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const supabase = createBrowserClient();

  const [behaviourType, setBehaviourType] = useState<BehaviourType | ''>(
    (prefillType as BehaviourType) || ''
  );
  const [severity, setSeverity] = useState<number>(3);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay | ''>('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [whatHappened, setWhatHappened] = useState('');
  const [whatHelped, setWhatHelped] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleSave = async () => {
    if (!behaviourType || !whatHappened.trim()) return;
    setIsSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast(t('common.error'), 'error');
        return;
      }

      const { data, error } = await supabase
        .from('behaviour_incidents')
        .insert({
          caregiver_id: caregiverId,
          household_id: householdId,
          patient_id: patientId,
          behaviour_type: behaviourType,
          severity,
          time_of_day: timeOfDay || null,
          duration_minutes: durationMinutes ? parseInt(durationMinutes, 10) : null,
          possible_triggers: selectedTriggers,
          what_happened: whatHappened.trim(),
          what_helped: whatHelped.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;
      onSaved(data);
      showToast(t('caregiverApp.toolkit.behaviours.logger.saved'), 'success');
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const timeOptions: { value: TimeOfDay; label: string }[] = [
    { value: 'morning', label: t('caregiverApp.toolkit.behaviours.logger.morning') },
    { value: 'afternoon', label: t('caregiverApp.toolkit.behaviours.logger.afternoon') },
    { value: 'evening', label: t('caregiverApp.toolkit.behaviours.logger.evening') },
    { value: 'night', label: t('caregiverApp.toolkit.behaviours.logger.night') },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('caregiverApp.toolkit.behaviours.logger.title')}
    >
      <div
        className="bg-surface-card rounded-3xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface-card rounded-t-3xl border-b border-surface-border p-6 flex items-center justify-between z-10">
          <h2 className="text-lg font-display font-bold text-text-primary">
            {t('caregiverApp.toolkit.behaviours.logger.title')}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-border/50 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
            aria-label={t('common.cancel')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Behaviour Type */}
          <div>
            <label className="text-sm font-semibold text-text-primary block mb-2">
              {t('caregiverApp.toolkit.behaviours.logger.typeLabel')}
            </label>
            <select
              value={behaviourType}
              onChange={(e) => setBehaviourType(e.target.value as BehaviourType)}
              className="input-warm w-full"
            >
              <option value="">{t('caregiverApp.toolkit.behaviours.logger.selectType')}</option>
              {BEHAVIOUR_TYPES.map((bt) => (
                <option key={bt.type} value={bt.type}>
                  {bt.emoji} {bt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="text-sm font-semibold text-text-primary block mb-2">
              {t('caregiverApp.toolkit.behaviours.logger.severity')}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setSeverity(level)}
                  className={`w-10 h-10 rounded-full border-2 text-sm font-bold transition-all ${
                    severity === level
                      ? level <= 2
                        ? 'border-status-success bg-status-success text-white'
                        : level === 3
                          ? 'border-status-amber bg-status-amber text-white'
                          : 'border-status-danger bg-status-danger text-white'
                      : 'border-surface-border text-text-muted hover:border-brand-300'
                  }`}
                  aria-label={`${t('caregiverApp.toolkit.behaviours.logger.severity')} ${level}`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-text-muted">{t('caregiverApp.toolkit.behaviours.logger.mild')}</span>
              <span className="text-xs text-text-muted">{t('caregiverApp.toolkit.behaviours.logger.severe')}</span>
            </div>
          </div>

          {/* Time of Day */}
          <div>
            <label className="text-sm font-semibold text-text-primary block mb-2">
              {t('caregiverApp.toolkit.behaviours.logger.timeOfDay')}
            </label>
            <div className="flex flex-wrap gap-2">
              {timeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTimeOfDay(timeOfDay === opt.value ? '' : opt.value)}
                  className={`px-3 py-2 text-sm rounded-full border transition-colors ${
                    timeOfDay === opt.value
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                      : 'border-surface-border text-text-secondary hover:border-brand-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm font-semibold text-text-primary block mb-2">
              {t('caregiverApp.toolkit.behaviours.logger.duration')}
            </label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder={t('caregiverApp.toolkit.behaviours.logger.durationPlaceholder')}
              className="input-warm w-full"
              min={1}
            />
          </div>

          {/* Triggers */}
          <div>
            <label className="text-sm font-semibold text-text-primary block mb-2">
              {t('caregiverApp.toolkit.behaviours.logger.triggers')}
            </label>
            <div className="flex flex-wrap gap-2">
              {BEHAVIOUR_TRIGGERS.map((trigger) => (
                <button
                  key={trigger}
                  onClick={() => toggleTrigger(trigger)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    selectedTriggers.includes(trigger)
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                      : 'border-surface-border text-text-secondary hover:border-brand-300'
                  }`}
                >
                  {t(`caregiverApp.toolkit.behaviours.logger.trigger_${trigger}`)}
                </button>
              ))}
            </div>
          </div>

          {/* What happened */}
          <div>
            <label className="text-sm font-semibold text-text-primary block mb-2">
              {t('caregiverApp.toolkit.behaviours.logger.whatHappened')}
            </label>
            <textarea
              value={whatHappened}
              onChange={(e) => setWhatHappened(e.target.value)}
              placeholder={t('caregiverApp.toolkit.behaviours.logger.whatHappenedPlaceholder')}
              className="input-warm w-full resize-none"
              rows={3}
            />
          </div>

          {/* What helped */}
          <div>
            <label className="text-sm font-semibold text-text-primary block mb-2">
              {t('caregiverApp.toolkit.behaviours.logger.whatHelped')}
            </label>
            <textarea
              value={whatHelped}
              onChange={(e) => setWhatHelped(e.target.value)}
              placeholder={t('caregiverApp.toolkit.behaviours.logger.whatHelpedPlaceholder')}
              className="input-warm w-full resize-none"
              rows={2}
            />
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={isSaving || !behaviourType || !whatHappened.trim()}
            className="w-full btn-primary py-3 text-sm font-medium disabled:opacity-50"
          >
            {isSaving ? t('common.saving') : t('caregiverApp.toolkit.behaviours.logger.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
