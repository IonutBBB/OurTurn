import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import type { LocationAlert } from '@ourturn/shared';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../theme';

const ALERT_TYPE_ICONS: Record<string, string> = {
  left_safe_zone: '🚶',
  inactive: '⏸️',
  night_movement: '🌙',
  take_me_home_tapped: '🏠',
  sos_triggered: '🆘',
};

interface StatusPanelProps {
  alerts: LocationAlert[];
  latestLocation: {
    latitude: number;
    longitude: number;
    timestamp: string;
    location_label: string;
  } | null;
  patientName: string;
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

export function StatusPanel({
  alerts,
  latestLocation,
  patientName,
  onAcknowledge,
}: StatusPanelProps) {
  const { t } = useTranslation();
  const unacknowledged = alerts.filter((a) => !a.acknowledged);

  if (unacknowledged.length === 0) {
    return (
      <View style={styles.allClearCard}>
        <View style={styles.statusRow}>
          <View style={styles.statusIconContainer}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          <View style={styles.statusTextContainer}>
            <Text style={styles.allClearTitle}>
              {t('caregiverApp.crisis.status.allClear')}
            </Text>
            <Text style={styles.allClearDesc}>
              {t('caregiverApp.crisis.status.allClearDesc')}
            </Text>
          </View>
        </View>
        {latestLocation && (
          <View style={styles.locationRow}>
            <Text style={styles.locationText} numberOfLines={1}>
              <Text style={styles.locationLabel}>
                {t('caregiverApp.crisis.status.lastKnownLocation')}:{' '}
              </Text>
              {latestLocation.location_label ||
                `${latestLocation.latitude.toFixed(4)}, ${latestLocation.longitude.toFixed(4)}`}
              <Text style={styles.locationTime}>
                {'  '}{formatTime(latestLocation.timestamp)}
              </Text>
            </Text>
            <TouchableOpacity onPress={() => router.push('/location')}>
              <Text style={styles.viewMapLink}>
                {t('caregiverApp.crisis.status.viewOnMap')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <Text style={styles.alertEmoji}>🚨</Text>
        <Text style={styles.alertTitle}>
          {t('caregiverApp.crisis.status.activeAlerts')} ({unacknowledged.length})
        </Text>
      </View>
      {unacknowledged.map((alert) => (
        <View key={alert.id} style={styles.alertItem}>
          <View style={styles.alertItemLeft}>
            <Text style={styles.alertIcon}>
              {ALERT_TYPE_ICONS[alert.type] || '⚠️'}
            </Text>
            <View style={styles.alertItemText}>
              <Text style={styles.alertType}>{alert.type.replace(/_/g, ' ')}</Text>
              <Text style={styles.alertTime}>
                {formatTime(alert.triggered_at)}
                {alert.location_label ? ` — ${alert.location_label}` : ''}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.ackButton}
            onPress={() => onAcknowledge(alert.id)}
          >
            <Text style={styles.ackButtonText}>
              {t('caregiverApp.location.acknowledge')}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
      {latestLocation && (
        <View style={styles.alertLocationRow}>
          <Text style={styles.locationText} numberOfLines={1}>
            {t('caregiverApp.crisis.status.lastKnownLocation')}:{' '}
            {latestLocation.location_label ||
              `${latestLocation.latitude.toFixed(4)}, ${latestLocation.longitude.toFixed(4)}`}
          </Text>
          <TouchableOpacity onPress={() => router.push('/location')}>
            <Text style={styles.viewMapLink}>
              {t('caregiverApp.crisis.status.viewOnMap')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  allClearCard: {
    backgroundColor: COLORS.successBg,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
    ...SHADOWS.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.success + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 20,
    color: COLORS.success,
    fontWeight: '700',
  },
  statusTextContainer: {
    flex: 1,
  },
  allClearTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.success,
  },
  allClearDesc: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.success + '20',
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  locationLabel: {
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
  },
  locationTime: {
    color: COLORS.textMuted,
  },
  viewMapLink: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.brand600,
  },
  alertCard: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
    ...SHADOWS.sm,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  alertEmoji: {
    fontSize: 20,
  },
  alertTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.danger,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 12,
    marginBottom: 8,
  },
  alertItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  alertIcon: {
    fontSize: 18,
  },
  alertItemText: {
    flex: 1,
  },
  alertType: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  alertTime: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  ackButton: {
    backgroundColor: COLORS.brand600,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  ackButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
  },
  alertLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.danger + '15',
  },
});
