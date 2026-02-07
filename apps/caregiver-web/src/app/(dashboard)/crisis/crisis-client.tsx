'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/toast';
import type { LocationAlert, BehaviourIncident } from '@ourturn/shared';

import type { CrisisView, CrisisScenarioId } from './types';
import { CRISIS_SCENARIOS } from './data/scenarios';
import { CrisisStatusPanel } from './components/crisis-status-panel';
import { SupportResources } from './components/support-resources';
import { CrisisEntryPoint } from './components/crisis-entry-point';
import { ScenarioGrid } from './components/scenario-grid';
import { RemoteActions } from './components/remote-actions';
import { ScenarioGuide } from './components/scenario-guide';

interface CrisisClientProps {
  caregiverId: string;
  householdId: string;
  patientId: string;
  country: string;
  patientName: string;
  calmingStrategies: string[] | null;
  latestLocation: { latitude: number; longitude: number; timestamp: string; location_label: string } | null;
  initialAlerts: LocationAlert[];
  behaviourIncidents: BehaviourIncident[];
  familyCaregivers: { id: string; name: string; email: string; role: string }[];
}

export default function CrisisClient({
  caregiverId,
  householdId,
  patientId,
  country,
  patientName,
  calmingStrategies,
  latestLocation,
  initialAlerts,
  behaviourIncidents,
  familyCaregivers,
}: CrisisClientProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [view, setView] = useState<CrisisView>('entry');
  const [selectedScenario, setSelectedScenario] = useState<CrisisScenarioId | null>(null);
  const [alerts, setAlerts] = useState<LocationAlert[]>(initialAlerts);

  // Handle acknowledging an alert
  const handleAcknowledge = useCallback(
    async (alertId: string) => {
      try {
        const { createBrowserClient } = await import('@/lib/supabase');
        const supabase = createBrowserClient();

        const { error } = await supabase
          .from('location_alerts')
          .update({
            acknowledged: true,
            acknowledged_by: caregiverId,
            acknowledged_at: new Date().toISOString(),
          })
          .eq('id', alertId);

        if (error) throw error;

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
    [caregiverId, showToast, t]
  );

  // Handle alert family
  const handleAlertFamily = useCallback(async () => {
    try {
      const res = await fetch('/api/crisis/alert-family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ householdId }),
      });

      if (!res.ok) throw new Error('Failed');
      showToast(t('caregiverApp.crisis.alertFamilySent'), 'success');
    } catch {
      showToast(t('caregiverApp.crisis.alertFamilyFailed'), 'error');
    }
  }, [householdId, showToast, t]);

  // Navigation handlers
  const handleSelectWith = useCallback(() => setView('scenarios'), []);
  const handleSelectRemote = useCallback(() => setView('remote'), []);
  const handleBackToEntry = useCallback(() => {
    setView('entry');
    setSelectedScenario(null);
  }, []);
  const handleSelectScenario = useCallback((id: CrisisScenarioId) => {
    setSelectedScenario(id);
    setView('guide');
  }, []);
  const handleBackToScenarios = useCallback(() => {
    setSelectedScenario(null);
    setView('scenarios');
  }, []);

  // Find the selected scenario object
  const scenario = selectedScenario
    ? CRISIS_SCENARIOS.find((s) => s.id === selectedScenario)
    : null;

  // Render the correct layer
  const renderContent = () => {
    switch (view) {
      case 'entry':
        return (
          <CrisisEntryPoint
            patientName={patientName}
            country={country}
            incidents={behaviourIncidents}
            onSelectWith={handleSelectWith}
            onSelectRemote={handleSelectRemote}
          />
        );

      case 'scenarios':
        return (
          <ScenarioGrid
            scenarios={CRISIS_SCENARIOS}
            country={country}
            onSelectScenario={handleSelectScenario}
            onBack={handleBackToEntry}
          />
        );

      case 'remote':
        return (
          <RemoteActions
            patientName={patientName}
            latestLocation={latestLocation}
            country={country}
            householdId={householdId}
            onAlertFamily={handleAlertFamily}
            onSwitchToWith={handleSelectWith}
            onBack={handleBackToEntry}
          />
        );

      case 'guide':
        if (!scenario) return null;
        return (
          <ScenarioGuide
            scenario={scenario}
            patientName={patientName}
            calmingStrategies={calmingStrategies}
            householdId={householdId}
            caregiverId={caregiverId}
            patientId={patientId}
            country={country}
            onBack={handleBackToScenarios}
            onAlertFamily={handleAlertFamily}
          />
        );
    }
  };

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
        <div className="lg:col-span-2">
          {renderContent()}
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-6">
          <SupportResources
            country={country}
            familyCaregivers={familyCaregivers}
          />
        </div>
      </div>
    </div>
  );
}
