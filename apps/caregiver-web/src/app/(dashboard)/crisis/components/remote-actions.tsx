'use client';

import { useTranslation } from 'react-i18next';
import { getPrimaryEmergencyNumber } from '@ourturn/shared/constants/emergency-numbers';

interface LatestLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
  location_label: string;
}

interface RemoteActionsProps {
  patientName: string;
  latestLocation: LatestLocation | null;
  country: string;
  householdId: string;
  onAlertFamily: () => void;
  onSwitchToWith: () => void;
  onBack: () => void;
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

const REMOTE_ACTIONS: { key: string; emoji: string; isEmergency?: boolean }[] = [
  { key: 'location', emoji: '📍' },
  { key: 'alertFamily', emoji: '👤' },
  { key: 'emergency', emoji: '🚨', isEmergency: true },
];

export function RemoteActions({
  patientName,
  latestLocation,
  country,
  householdId,
  onAlertFamily,
  onSwitchToWith,
  onBack,
}: RemoteActionsProps) {
  const { t } = useTranslation();
  const emergencyNumber = getPrimaryEmergencyNumber(country);
  const locationRecent =
    latestLocation &&
    Date.now() - new Date(latestLocation.timestamp).getTime() < 30 * 60 * 1000;

  const handleAction = (key: string) => {
    switch (key) {
      case 'location':
        window.open('/location', '_self');
        break;
      case 'alertFamily':
        onAlertFamily();
        break;
      case 'emergency':
        window.open(`tel:${emergencyNumber}`, '_self');
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('caregiverApp.crisis.back')}
      </button>

      {/* Patient status card */}
      <div className="card-paper p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-lg font-bold text-brand-700 dark:text-brand-300">
            {patientName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-primary">{patientName}</p>
            {latestLocation ? (
              <div className="flex items-center gap-1.5 text-sm text-text-muted">
                <span
                  className={`w-2 h-2 rounded-full ${
                    locationRecent ? 'bg-status-success' : 'bg-text-muted'
                  }`}
                />
                {latestLocation.location_label ||
                  `${latestLocation.latitude.toFixed(4)}, ${latestLocation.longitude.toFixed(4)}`}
                <span className="text-text-muted">
                  · {formatTime(latestLocation.timestamp)}
                </span>
              </div>
            ) : (
              <p className="text-sm text-text-muted">
                {t('caregiverApp.crisis.remote.noLocation')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action list */}
      <div className="space-y-2">
        {REMOTE_ACTIONS.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={() => handleAction(action.key)}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-colors ${
              action.isEmergency
                ? 'bg-status-danger/10 border border-status-danger/20 hover:bg-status-danger/20'
                : 'card-paper hover:border-brand-300 dark:hover:border-brand-700'
            }`}
          >
            <span className="text-xl">{action.emoji}</span>
            <div>
              <p
                className={`text-sm font-medium ${
                  action.isEmergency ? 'text-status-danger' : 'text-text-primary'
                }`}
              >
                {t(`caregiverApp.crisis.remote.actions.${action.key}.label`)}
                {action.isEmergency && ` — ${emergencyNumber}`}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                {t(`caregiverApp.crisis.remote.actions.${action.key}.desc`)}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Cross-link to with-them mode */}
      <div className="card-paper p-4 text-center">
        <p className="text-sm text-text-muted mb-2">
          {t('caregiverApp.crisis.remote.switchPrompt', { name: patientName })}
        </p>
        <button
          type="button"
          onClick={onSwitchToWith}
          className="btn-secondary text-sm"
        >
          {t('caregiverApp.crisis.remote.switchButton')}
        </button>
      </div>
    </div>
  );
}
