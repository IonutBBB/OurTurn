'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserClient } from '@/lib/supabase';
import { useToast } from '@/components/toast';
import type { LocationAlert } from '@ourturn/shared';

import { CrisisStatusPanel } from './components/crisis-status-panel';
import { ContextQuickActions } from './components/context-quick-actions';
import { DeEscalationWizard } from './components/de-escalation-wizard';
import { CrisisHistory } from './components/crisis-history';
import { SupportResources } from './components/support-resources';

type Mode = 'in_person' | 'remote';

interface CrisisEntry {
  id: string;
  content: string;
  created_at: string;
  author_name: string;
}

interface CrisisClientProps {
  caregiverId: string;
  householdId: string;
  country: string;
  patientName: string;
  latestLocation: { latitude: number; longitude: number; timestamp: string; location_label: string } | null;
  initialAlerts: LocationAlert[];
  crisisEntries: CrisisEntry[];
  familyCaregivers: { id: string; name: string; email: string; role: string }[];
  primaryCaregiver: { name: string; email: string } | null;
}

export default function CrisisClient({
  caregiverId,
  householdId,
  country,
  patientName,
  latestLocation,
  initialAlerts,
  crisisEntries: initialCrisisEntries,
  familyCaregivers,
  primaryCaregiver,
}: CrisisClientProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const supabase = createBrowserClient();

  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('crisis-mode') as Mode) || 'in_person';
    }
    return 'in_person';
  });
  const [showWizard, setShowWizard] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [isAlertingFamily, setIsAlertingFamily] = useState(false);
  const [alerts, setAlerts] = useState<LocationAlert[]>(initialAlerts);
  const [crisisEntries, setCrisisEntries] = useState<CrisisEntry[]>(initialCrisisEntries);
  const [logNotes, setLogNotes] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  // Persist mode to localStorage
  useEffect(() => {
    localStorage.setItem('crisis-mode', mode);
  }, [mode]);

  // Handle acknowledging an alert
  const handleAcknowledge = useCallback(
    async (alertId: string) => {
      try {
        const { error } = await supabase
          .from('location_alerts')
          .update({
            acknowledged: true,
            acknowledged_by: caregiverId,
            acknowledged_at: new Date().toISOString(),
          })
          .eq('id', alertId);

        if (error) throw error;

        // Also resolve any active escalation
        await supabase
          .from('alert_escalations')
          .update({
            resolved: true,
            resolved_at: new Date().toISOString(),
            resolved_by: caregiverId,
          })
          .eq('alert_id', alertId)
          .eq('resolved', false);

        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alertId
              ? { ...a, acknowledged: true, acknowledged_by: caregiverId }
              : a
          )
        );
      } catch {
        showToast(t('common.error'), 'error');
      }
    },
    [caregiverId, supabase, showToast, t]
  );

  // Handle alert family
  const handleAlertFamily = useCallback(async () => {
    setIsAlertingFamily(true);
    try {
      const res = await fetch('/api/crisis/alert-family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ householdId }),
      });

      if (!res.ok) throw new Error('Failed');

      showToast(t('caregiverApp.crisis.actions.alertFamilySent'), 'success');
    } catch {
      showToast(t('caregiverApp.crisis.actions.alertFamilyFailed'), 'error');
    } finally {
      setIsAlertingFamily(false);
    }
  }, [householdId, showToast, t]);

  // Handle wizard completion
  const handleWizardComplete = useCallback(
    async (notes: string) => {
      setShowWizard(false);

      if (notes.trim()) {
        try {
          const { data, error } = await supabase
            .from('care_journal_entries')
            .insert({
              household_id: householdId,
              author_id: caregiverId,
              content: notes.trim(),
              entry_type: 'crisis',
            })
            .select('id, content, created_at')
            .single();

          if (error) throw error;

          // Add to local entries
          if (data) {
            setCrisisEntries((prev) => [
              {
                id: data.id,
                content: data.content,
                created_at: data.created_at,
                author_name: t('common.you'),
              },
              ...prev,
            ]);
          }

          showToast(t('caregiverApp.crisis.eventLogged'), 'success');
        } catch {
          showToast(t('common.error'), 'error');
        }
      }
    },
    [supabase, householdId, caregiverId, showToast, t]
  );

  // Handle log event form
  const handleLogCrisis = useCallback(async () => {
    if (!logNotes.trim()) return;
    setIsLogging(true);

    try {
      const { data, error } = await supabase
        .from('care_journal_entries')
        .insert({
          household_id: householdId,
          author_id: caregiverId,
          content: logNotes.trim(),
          entry_type: 'crisis',
        })
        .select('id, content, created_at')
        .single();

      if (error) throw error;

      if (data) {
        setCrisisEntries((prev) => [
          {
            id: data.id,
            content: data.content,
            created_at: data.created_at,
            author_name: t('common.you'),
          },
          ...prev,
        ]);
      }

      setLogNotes('');
      setShowLogForm(false);
      showToast(t('caregiverApp.crisis.eventLogged'), 'success');
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setIsLogging(false);
    }
  }, [logNotes, supabase, householdId, caregiverId, showToast, t]);

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div>
        <h1 className="heading-display text-2xl">
          {t('caregiverApp.crisis.title').split(' ')[0]}{' '}
          <span className="heading-accent">{t('caregiverApp.crisis.title').split(' ').slice(1).join(' ')}</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">{t('caregiverApp.crisis.subtitle')}</p>
      </div>

      {/* Status Panel — full width */}
      <CrisisStatusPanel
        alerts={alerts}
        latestLocation={latestLocation}
        patientName={patientName}
        caregiverId={caregiverId}
        onAcknowledge={handleAcknowledge}
      />

      {/* Main Content — 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <ContextQuickActions
            mode={mode}
            onModeChange={setMode}
            country={country}
            patientName={patientName}
            primaryCaregiver={primaryCaregiver}
            onStartDeEscalation={() => setShowWizard(true)}
            onAlertFamily={handleAlertFamily}
            onLogEvent={() => setShowLogForm(true)}
            isAlertingFamily={isAlertingFamily}
          />

          {/* Log Event Form */}
          {showLogForm && (
            <div className="card-paper p-6">
              <h2 className="font-display font-bold text-text-primary mb-3">
                {t('caregiverApp.crisis.logEvent')}
              </h2>
              <textarea
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder={t('caregiverApp.crisis.logPlaceholder')}
                className="input-warm w-full h-32 resize-none"
              />
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleLogCrisis}
                  disabled={isLogging || !logNotes.trim()}
                  className="btn-primary disabled:opacity-50"
                >
                  {isLogging ? t('common.saving') : t('common.save')}
                </button>
                <button
                  onClick={() => setShowLogForm(false)}
                  className="btn-secondary"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Crisis History */}
          <CrisisHistory entries={crisisEntries} />
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-6">
          <SupportResources
            country={country}
            familyCaregivers={familyCaregivers}
          />
        </div>
      </div>

      {/* De-Escalation Wizard Modal */}
      {showWizard && (
        <DeEscalationWizard
          onClose={() => setShowWizard(false)}
          onComplete={handleWizardComplete}
        />
      )}
    </div>
  );
}
