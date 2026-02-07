'use client';

import { useTranslation } from 'react-i18next';
import type { CaregiverWellbeingLog, BehaviourIncident } from '@ourturn/shared';
import { WellnessTrends } from '../components/wellness-trends';
import { BehaviourTrends } from '../components/behaviour-trends';
import { WeeklyDigest } from '../components/weekly-digest';

interface InsightsTabProps {
  caregiverId: string;
  caregiverName: string;
  householdId: string;
  patientName: string;
  wellbeingLogs: CaregiverWellbeingLog[];
  behaviourIncidents: BehaviourIncident[];
}

export function InsightsTab({
  caregiverId,
  caregiverName,
  householdId,
  patientName,
  wellbeingLogs,
  behaviourIncidents,
}: InsightsTabProps) {
  const { t } = useTranslation();

  const trend = wellbeingLogs.map((l) => ({
    date: l.date,
    energy: l.energy_level,
    stress: l.stress_level,
    sleep: l.sleep_quality_rating,
  }));

  return (
    <div className="space-y-6">
      {/* Wellness Trends */}
      <WellnessTrends trend={trend} />

      {/* Behaviour Trends */}
      {behaviourIncidents.length >= 5 && (
        <BehaviourTrends incidents={behaviourIncidents} />
      )}

      {/* Weekly Digest */}
      <WeeklyDigest
        trend={trend}
        incidentCount={behaviourIncidents.length}
      />
    </div>
  );
}
