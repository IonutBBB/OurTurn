'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import type { LocationAlert } from '@ourturn/shared';

const ALERT_TYPE_ICONS: Record<string, string> = {
  left_safe_zone: '🚶',
  inactive: '⏸️',
  night_movement: '🌙',
  take_me_home_tapped: '🏠',
  sos_triggered: '🆘',
};

interface CrisisStatusPanelProps {
  alerts: LocationAlert[];
  latestLocation: { latitude: number; longitude: number; timestamp: string; location_label: string } | null;
  patientName: string;
  caregiverId: string;
  onAcknowledge: (alertId: string) => void;
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

export function CrisisStatusPanel({
  alerts,
  latestLocation,
  patientName,
  caregiverId,
  onAcknowledge,
}: CrisisStatusPanelProps) {
  const { t } = useTranslation();
  const unacknowledged = alerts.filter((a) => !a.acknowledged);

  if (unacknowledged.length === 0) {
    // All Clear state
    return (
      <div className="bg-status-success-bg border border-status-success/20 rounded-[20px] p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-status-success/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="font-display font-bold text-status-success text-lg">
              {t('caregiverApp.crisis.status.allClear')}
            </h2>
            <p className="text-sm text-text-secondary">
              {t('caregiverApp.crisis.status.allClearDesc')}
            </p>
          </div>
        </div>
        {latestLocation && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <div className="text-text-secondary">
              <span className="font-medium">{t('caregiverApp.crisis.status.lastKnownLocation')}:</span>{' '}
              {latestLocation.location_label || `${latestLocation.latitude.toFixed(4)}, ${latestLocation.longitude.toFixed(4)}`}
              <span className="text-text-muted ml-2">
                {formatTime(latestLocation.timestamp)}
              </span>
            </div>
            <Link
              href="/location"
              className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
            >
              {t('caregiverApp.crisis.status.viewOnMap')}
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Active Alerts state
  return (
    <div className="bg-status-danger-bg border border-status-danger/20 rounded-[20px] p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🚨</span>
        <h2 className="font-display font-bold text-status-danger text-lg">
          {t('caregiverApp.crisis.status.activeAlerts')} ({unacknowledged.length})
        </h2>
      </div>
      <div className="space-y-2">
        {unacknowledged.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between bg-surface-card dark:bg-surface-elevated rounded-2xl p-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {ALERT_TYPE_ICONS[alert.type] || '⚠️'}
              </span>
              <div>
                <p className="font-medium text-text-primary">
                  {t(`caregiverApp.location.alertTypes.${alert.type}`)}
                </p>
                <p className="text-sm text-text-muted">
                  {formatTime(alert.triggered_at)}
                  {alert.location_label && ` — ${alert.location_label}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="btn-primary text-sm px-3 py-1"
            >
              {t('caregiverApp.location.acknowledge')}
            </button>
          </div>
        ))}
      </div>
      {latestLocation && (
        <div className="mt-3 flex items-center justify-between text-sm border-t border-status-danger/10 pt-3">
          <span className="text-text-secondary">
            {t('caregiverApp.crisis.status.lastKnownLocation')}:{' '}
            {latestLocation.location_label || `${latestLocation.latitude.toFixed(4)}, ${latestLocation.longitude.toFixed(4)}`}
          </span>
          <Link
            href="/location"
            className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
          >
            {t('caregiverApp.crisis.status.viewOnMap')}
          </Link>
        </div>
      )}
    </div>
  );
}
