'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserClient } from '@/lib/supabase';
import { useToast } from '@/components/toast';
import type { CrisisScenarioId } from '../types';
import { SCENARIO_TO_BEHAVIOUR_TYPE } from '../data/scenarios';

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

interface CrisisLoggerProps {
  scenarioId: CrisisScenarioId;
  householdId: string;
  caregiverId: string;
  patientId: string;
  onSaved: () => void;
}

export function CrisisLogger({
  scenarioId,
  householdId,
  caregiverId,
  patientId,
  onSaved,
}: CrisisLoggerProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const supabase = createBrowserClient();

  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const behaviourType = SCENARIO_TO_BEHAVIOUR_TYPE[scenarioId] || scenarioId;

      const { error } = await supabase.from('behaviour_incidents').insert({
        caregiver_id: caregiverId,
        household_id: householdId,
        patient_id: patientId,
        behaviour_type: behaviourType,
        severity: 3,
        time_of_day: getTimeOfDay(),
        what_happened: notes.trim() || `${scenarioId} episode`,
      });

      if (error) throw error;

      setSaved(true);
      showToast(t('caregiverApp.crisis.logger.saved'), 'success');
      onSaved();
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setSaving(false);
    }
  }, [scenarioId, notes, supabase, caregiverId, householdId, patientId, showToast, t, onSaved]);

  if (saved) {
    return (
      <div className="rounded-2xl border border-status-success/20 bg-status-success/5 p-4 text-center">
        <p className="text-sm text-status-success font-medium">
          {t('caregiverApp.crisis.logger.savedConfirmation')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card dark:bg-surface-elevated p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span>📝</span>
        <p className="text-sm font-medium text-text-primary">
          {t('caregiverApp.crisis.logger.title')}
        </p>
      </div>
      <p className="text-xs text-text-muted">
        {t('caregiverApp.crisis.logger.subtitle')}
      </p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t('caregiverApp.crisis.logger.placeholder')}
        className="input-warm w-full h-20 resize-none text-sm"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="btn-primary text-sm w-full disabled:opacity-50"
      >
        {saving
          ? t('common.saving')
          : t('caregiverApp.crisis.logger.saveButton')}
      </button>
    </div>
  );
}
