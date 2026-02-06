import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/auth-store';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../src/theme';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { caregiver, household, logout } = useAuthStore();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [safetyAlerts, setSafetyAlerts] = useState(true);

  const handleLogout = async () => {
    Alert.alert(
      t('caregiverApp.settings.signOut'),
      '',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('caregiverApp.settings.signOut'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('caregiverApp.settings.deleteAccount'),
      t('caregiverApp.settings.deleteWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('caregiverApp.settings.deleteAccount'),
          style: 'destructive',
          onPress: () => {
            // Would call GDPR delete API
            Alert.alert('Account deletion requested. You will receive a confirmation email.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>{t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('caregiverApp.settings.title')}</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('caregiverApp.settings.account')}</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('caregiverApp.auth.email')}</Text>
              <Text style={styles.rowValue}>{caregiver?.email || '—'}</Text>
            </View>
            <View style={[styles.row, styles.rowBorder]}>
              <Text style={styles.rowLabel}>{t('caregiverApp.onboarding.yourName')}</Text>
              <Text style={styles.rowValue}>{caregiver?.name || '—'}</Text>
            </View>
          </View>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('caregiverApp.settings.subscription')}</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('caregiverApp.settings.subscription')}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {household?.subscription_status === 'plus'
                    ? t('subscription.plus')
                    : t('subscription.free')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('caregiverApp.settings.notifications')}</Text>
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <Text style={styles.rowLabel}>{t('caregiverApp.settings.pushNotifications')}</Text>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: COLORS.border, true: COLORS.brand400 }}
                thumbColor={pushEnabled ? COLORS.brand600 : COLORS.textMuted}
              />
            </View>
            <View style={[styles.switchRow, styles.rowBorder]}>
              <Text style={styles.rowLabel}>{t('caregiverApp.settings.emailNotifications')}</Text>
              <Switch
                value={emailEnabled}
                onValueChange={setEmailEnabled}
                trackColor={{ false: COLORS.border, true: COLORS.brand400 }}
                thumbColor={emailEnabled ? COLORS.brand600 : COLORS.textMuted}
              />
            </View>
            <View style={[styles.switchRow, styles.rowBorder]}>
              <Text style={styles.rowLabel}>{t('caregiverApp.settings.safetyAlerts')}</Text>
              <Switch
                value={safetyAlerts}
                onValueChange={setSafetyAlerts}
                trackColor={{ false: COLORS.border, true: COLORS.brand400 }}
                thumbColor={safetyAlerts ? COLORS.brand600 : COLORS.textMuted}
              />
            </View>
          </View>
        </View>

        {/* Care Code Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('caregiverApp.family.careCode')}</Text>
          <View style={styles.card}>
            <View style={styles.codeContainer}>
              {(household?.care_code || '------').split('').map((char, i) => (
                <Text key={i} style={[styles.codeChar, i === 2 && { marginLeft: 12 }]}>
                  {char}
                </Text>
              ))}
            </View>
            <Text style={styles.codeHelp}>{t('caregiverApp.family.careCodeHelp')}</Text>
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('caregiverApp.settings.privacy')}</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.actionRow}>
              <Text style={styles.rowLabel}>{t('caregiverApp.settings.exportData')}</Text>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionRow, styles.rowBorder]} onPress={handleDeleteAccount}>
              <Text style={[styles.rowLabel, { color: COLORS.danger }]}>
                {t('caregiverApp.settings.deleteAccount')}
              </Text>
              <Text style={[styles.rowArrow, { color: COLORS.danger }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('caregiverApp.settings.about')}</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('caregiverApp.settings.version')}</Text>
              <Text style={styles.rowValue}>1.0.0</Text>
            </View>
            <View style={[styles.row, styles.rowBorder]}>
              <Text style={styles.rowLabel}>{t('caregiverApp.settings.notMedicalDevice')}</Text>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>{t('caregiverApp.settings.signOut')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: COLORS.brand600,
    fontFamily: FONTS.bodyMedium,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rowLabel: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
    flex: 1,
  },
  rowValue: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
  },
  rowArrow: {
    fontSize: 20,
    color: COLORS.textMuted,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  badge: {
    backgroundColor: COLORS.brand100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.brand700,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  codeChar: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.brand700,
    letterSpacing: 2,
  },
  codeHelp: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  logoutButton: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.danger,
    alignItems: 'center',
    marginTop: 8,
    ...SHADOWS.sm,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.danger,
  },
});
