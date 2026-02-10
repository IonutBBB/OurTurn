'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserClient } from '@/lib/supabase';
import { useToast } from '@/components/toast';
import { CRISIS_SCENARIOS, SCENARIO_TO_BEHAVIOUR_TYPE } from '../data/scenarios';

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

interface QuickCrisisLoggerProps {
  householdId: string;
  caregiverId: string;
  patientId: string;
  onSaved: () => void;
}

export function QuickCrisisLogger({
  householdId,
  caregiverId,
  patientId,
  onSaved,
}: QuickCrisisLoggerProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const supabase = createBrowserClient();

  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!selectedType) return;
    setSaving(true);
    try {
      const behaviourType = SCENARIO_TO_BEHAVIOUR_TYPE[selectedType] || selectedType;

      const { error } = await supabase.from('behaviour_incidents').insert({
        caregiver_id: caregiverId,
        household_id: householdId,
        patient_id: patientId,
        behaviour_type: behaviourType,
        severity: 3,
        time_of_day: getTimeOfDay(),
        what_happened: notes.trim() || `${selectedType} episode`,
      });

      if (error) throw error;

      showToast(t('caregiverApp.crisis.logger.saved'), 'success');
      setOpen(false);
      setSelectedType('');
      setNotes('');
      onSaved();
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setSaving(false);
    }
  }, [selectedType, notes, supabase, caregiverId, householdId, patientId, showToast, t, onSaved]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 py-3 px-4 transition-colors"
      >
        <span>📝</span>
        <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
          {t('caregiverApp.crisis.quickLog.button')}
        </span>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card dark:bg-surface-elevated p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>📝</span>
          <p className="text-sm font-medium text-text-primary">
            {t('caregiverApp.crisis.quickLog.title')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setOpen(false); setSelectedType(''); setNotes(''); }}
          className="text-text-muted hover:text-text-primary text-sm"
        >
          ✕
        </button>
      </div>

      {/* Behaviour type selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {CRISIS_SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedType(s.id)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
              selectedType === s.id
                ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                : 'border-surface-border hover:border-brand-300 text-text-secondary'
            }`}
          >
            <span>{s.emoji}</span>
            <span className="truncate">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Notes */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t('caregiverApp.crisis.logger.placeholder')}
        className="input-warm w-full h-20 resize-none text-sm"
      />

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !selectedType}
        className="btn-primary text-sm w-full disabled:opacity-50"
      >
        {saving
          ? t('common.saving')
          : t('caregiverApp.crisis.logger.saveButton')}
      </button>
    </div>
  );
}
