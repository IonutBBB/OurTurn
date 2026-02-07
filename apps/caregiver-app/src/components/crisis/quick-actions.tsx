import { View, Text, StyleSheet, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { getEmergencyNumber } from '@ourturn/shared/constants/emergency-numbers';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../theme';

type Mode = 'in_person' | 'remote';

interface QuickActionsProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  country: string;
  patientName: string;
  primaryCaregiver: { name: string; email: string } | null;
  onStartDeEscalation: () => void;
  onAlertFamily: () => void;
  onLogEvent: () => void;
  isAlertingFamily: boolean;
}

interface ActionItem {
  icon: string;
  titleKey: string;
  descKey: string;
  onPress?: () => void;
  variant?: 'danger' | 'warning' | 'default';
  loading?: boolean;
}

export function QuickActions({
  mode,
  onModeChange,
  country,
  patientName,
  primaryCaregiver,
  onStartDeEscalation,
  onAlertFamily,
  onLogEvent,
  isAlertingFamily,
}: QuickActionsProps) {
  const { t } = useTranslation();
  const emergency = getEmergencyNumber(country);

  const inPersonActions: ActionItem[] = [
    {
      icon: '🧘',
      titleKey: 'caregiverApp.crisis.actions.startDeEscalation',
      descKey: 'caregiverApp.crisis.actions.startDeEscalationDesc',
      onPress: onStartDeEscalation,
    },
    {
      icon: '🚨',
      titleKey: 'caregiverApp.crisis.actions.callEmergency',
      descKey: 'caregiverApp.crisis.actions.callEmergencyDesc',
      onPress: () => Linking.openURL(`tel:${emergency.primary}`),
      variant: 'danger',
    },
    {
      icon: '📢',
      titleKey: 'caregiverApp.crisis.actions.alertFamily',
      descKey: 'caregiverApp.crisis.actions.alertFamilyDesc',
      onPress: onAlertFamily,
      variant: 'warning',
      loading: isAlertingFamily,
    },
    {
      icon: '📝',
      titleKey: 'caregiverApp.crisis.actions.logEvent',
      descKey: 'caregiverApp.crisis.actions.logEventDesc',
      onPress: onLogEvent,
    },
  ];

  const remoteActions: ActionItem[] = [
    {
      icon: '👤',
      titleKey: 'caregiverApp.crisis.actions.contactPrimary',
      descKey: 'caregiverApp.crisis.actions.contactPrimaryDesc',
      onPress: primaryCaregiver
        ? () => Linking.openURL(`mailto:${primaryCaregiver.email}`)
        : onAlertFamily,
    },
    {
      icon: '📍',
      titleKey: 'caregiverApp.crisis.actions.viewLocation',
      descKey: 'caregiverApp.crisis.actions.viewLocationDesc',
      onPress: () => router.push('/location'),
    },
    {
      icon: '🚨',
      titleKey: 'caregiverApp.crisis.actions.callEmergency',
      descKey: 'caregiverApp.crisis.actions.callEmergencyDesc',
      onPress: () => Linking.openURL(`tel:${emergency.primary}`),
      variant: 'danger',
    },
    {
      icon: '📢',
      titleKey: 'caregiverApp.crisis.actions.alertFamily',
      descKey: 'caregiverApp.crisis.actions.alertFamilyDesc',
      onPress: onAlertFamily,
      variant: 'warning',
      loading: isAlertingFamily,
    },
  ];

  const actions = mode === 'in_person' ? inPersonActions : remoteActions;

  const getVariantStyles = (variant?: string) => {
    if (variant === 'danger') {
      return {
        borderColor: COLORS.danger + '30',
      };
    }
    if (variant === 'warning') {
      return {
        borderColor: COLORS.amber + '30',
      };
    }
    return {
      borderColor: COLORS.border,
    };
  };

  return (
    <View style={styles.container}>
      {/* Mode Toggle */}
      <View style={styles.modeSection}>
        <Text style={styles.modeLabel}>
          {t('caregiverApp.crisis.actions.modeLabel')}
        </Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, mode === 'in_person' && styles.toggleActive]}
            onPress={() => onModeChange('in_person')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.toggleText,
                mode === 'in_person' && styles.toggleTextActive,
              ]}
            >
              {t('caregiverApp.crisis.actions.withThem')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, mode === 'remote' && styles.toggleActive]}
            onPress={() => onModeChange('remote')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.toggleText,
                mode === 'remote' && styles.toggleTextActive,
              ]}
            >
              {t('caregiverApp.crisis.actions.remote')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Actions Grid */}
      <View style={styles.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.titleKey}
            style={[styles.actionCard, getVariantStyles(action.variant)]}
            onPress={action.onPress}
            disabled={action.loading}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>{action.icon}</Text>
            </View>
            <Text style={styles.actionTitle}>{t(action.titleKey)}</Text>
            <Text style={styles.actionDesc}>
              {action.descKey.includes('{{name}}')
                ? t(action.descKey, { name: patientName })
                : t(action.descKey)}
            </Text>
            {action.loading && (
              <ActivityIndicator
                size="small"
                color={COLORS.brand500}
                style={styles.spinner}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  modeSection: {
    marginBottom: 16,
  },
  modeLabel: {
    fontSize: 13,
    fontFamily: FONTS.bodyMedium,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.border + '60',
    borderRadius: RADIUS.full,
    padding: 3,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: COLORS.brand500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontFamily: FONTS.bodyMedium,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: 'white',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.border + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    lineHeight: 17,
  },
  spinner: {
    marginTop: 6,
  },
});
