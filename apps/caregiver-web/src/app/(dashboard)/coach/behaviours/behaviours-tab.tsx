'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
import type { BehaviourPlaybook, BehaviourIncident } from '@ourturn/shared';
import { PlaybookGrid } from '../components/behaviour-playbook-grid';
import { PlaybookDetailView } from '../components/playbook-detail-view';
import { IncidentLogger } from '../components/incident-logger';
import { BehaviourTimeline } from '../components/behaviour-timeline';
import { PatternInsights } from '../components/pattern-insights';

interface BehavioursTabProps {
  caregiverId: string;
  householdId: string;
  patientId: string;
  patientName: string;
  playbooks: BehaviourPlaybook[];
  incidents: BehaviourIncident[];
}

export function BehavioursTab({
  caregiverId,
  householdId,
  patientId,
  patientName,
  playbooks,
  incidents: initialIncidents,
}: BehavioursTabProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const shouldOpenLogger = searchParams.get('log') === 'true';

  const [incidents, setIncidents] = useState<BehaviourIncident[]>(initialIncidents);
  const [selectedPlaybook, setSelectedPlaybook] = useState<BehaviourPlaybook | null>(null);
  const [showLogger, setShowLogger] = useState(shouldOpenLogger);
  const [loggerPrefill, setLoggerPrefill] = useState<string | undefined>(undefined);

  const handleIncidentLogged = (incident: BehaviourIncident) => {
    setIncidents((prev) => [incident, ...prev]);
    setShowLogger(false);
    setLoggerPrefill(undefined);
  };

  const handleLogFromPlaybook = (behaviourType: string) => {
    setSelectedPlaybook(null);
    setLoggerPrefill(behaviourType);
    setShowLogger(true);
  };

  return (
    <div className="space-y-6">
      {/* Playbook Grid */}
      <PlaybookGrid
        playbooks={playbooks}
        onSelect={setSelectedPlaybook}
      />

      {/* Log Incident Button */}
      <div className="flex justify-center">
        <button
          onClick={() => { setLoggerPrefill(undefined); setShowLogger(true); }}
          className="btn-primary px-6 py-3 text-sm font-medium"
        >
          {t('caregiverApp.toolkit.behaviours.logger.logIncident')}
        </button>
      </div>

      {/* Timeline */}
      {incidents.length > 0 && (
        <BehaviourTimeline incidents={incidents} />
      )}

      {/* Pattern Insights */}
      {incidents.length >= 5 && (
        <PatternInsights
          householdId={householdId}
          incidentCount={incidents.length}
        />
      )}

      {/* Playbook Detail View Modal */}
      {selectedPlaybook && (
        <PlaybookDetailView
          playbook={selectedPlaybook}
          onClose={() => setSelectedPlaybook(null)}
          onLogIncident={handleLogFromPlaybook}
        />
      )}

      {/* Incident Logger Modal */}
      {showLogger && (
        <IncidentLogger
          caregiverId={caregiverId}
          householdId={householdId}
          patientId={patientId}
          prefillType={loggerPrefill}
          onClose={() => { setShowLogger(false); setLoggerPrefill(undefined); }}
          onSaved={handleIncidentLogged}
        />
      )}
    </div>
  );
}
