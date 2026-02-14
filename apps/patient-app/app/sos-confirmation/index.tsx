import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../src/stores/auth-store';
import { getEmergencyNumber } from '@ourturn/shared';
import { COLORS, FONTS, RADIUS } from '../../src/theme';

export default function SOSConfirmationScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { patient, household } = useAuthStore();

  const emergencyContacts = patient?.emergency_contacts || [];
  const primaryCaregiver = emergencyContacts[0];
  const countryCode = household?.country || 'default';
  const emergencyInfo = getEmergencyNumber(countryCode);

  const handleCallCaregiver = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (primaryCaregiver?.phone) {
      Linking.openURL(`tel:${primaryCaregiver.phone}`);
    }
  };

  const handleCallEmergency = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Linking.openURL(`tel:${emergencyInfo.primary}`);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>✅</Text>
        <Text style={styles.title}>{t('patientApp.sos.helpOnTheWay')}</Text>
        <Text style={styles.subtitle}>{t('patientApp.sos.familyNotified')}</Text>

        <View style={styles.buttons}>
          {primaryCaregiver && (
            <TouchableOpacity
              style={styles.callCaregiverButton}
              onPress={handleCallCaregiver}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('patientApp.sos.callCaregiver', { name: primaryCaregiver.name })}
            >
              <Text style={styles.callIcon}>📞</Text>
              <View>
                <Text style={styles.callButtonText}>
                  {t('patientApp.sos.callCaregiver', { name: primaryCaregiver.name })}
                </Text>
                <Text style={styles.callButtonSubtext}>{primaryCaregiver.relationship}</Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={handleCallEmergency}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${t('patientApp.help.emergency')} ${emergencyInfo.primary}`}
          >
            <Text style={styles.callIcon}>🚨</Text>
            <Text style={styles.emergencyButtonText}>
              {t('patientApp.help.emergency')} ({emergencyInfo.primary})
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>{t('patientApp.sos.imOkay')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 72,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 22,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
  },
  buttons: {
    width: '100%',
    gap: 20,
  },
  callCaregiverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: COLORS.brand600,
    borderRadius: RADIUS['2xl'],
    padding: 24,
    minHeight: 80,
  },
  callIcon: {
    fontSize: 32,
  },
  callButtonText: {
    fontSize: 22,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textInverse,
  },
  callButtonSubtext: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textInverse,
    opacity: 0.8,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS['2xl'],
    padding: 24,
    minHeight: 80,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emergencyButtonText: {
    fontSize: 22,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textInverse,
  },
  backButton: {
    marginTop: 48,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  backButtonText: {
    fontSize: 22,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.brand600,
    textAlign: 'center',
  },
});
