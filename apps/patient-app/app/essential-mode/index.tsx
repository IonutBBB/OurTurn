import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../src/stores/auth-store';
import { useComplexity } from '../../src/hooks/use-complexity';
import { getEmergencyNumber } from '@ourturn/shared';
import { SOSButton } from '../../src/components/sos-button';
import { COLORS, FONTS, RADIUS } from '../../src/theme';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function EssentialModeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { patient, household } = useAuthStore();
  const complexity = useComplexity();

  // If complexity changes away from essential, navigate back to tabs
  useEffect(() => {
    if (complexity !== 'essential') {
      router.replace('/(tabs)/today');
    }
  }, [complexity, router]);

  const emergencyContacts = patient?.emergency_contacts || [];
  const primaryContact = emergencyContacts[0];
  const countryCode = household?.country || 'default';
  const emergencyInfo = getEmergencyNumber(countryCode);

  const handleCallHelp = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (primaryContact?.phone) {
      Linking.openURL(`tel:${primaryContact.phone}`);
    } else {
      Linking.openURL(`tel:${emergencyInfo.primary}`);
    }
  };

  const handleMusic = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Open default music app or a calming music URL
    Linking.openURL('music://').catch(() => {
      // Fallback — try YouTube Music or Spotify
      Linking.openURL('https://music.youtube.com').catch(() => {});
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting}>
          {patient?.name ? `${patient.name}` : t('common.appName')}
        </Text>

        <TouchableOpacity
          style={styles.musicButton}
          onPress={handleMusic}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('patientApp.essential.music')}
        >
          <Text style={styles.buttonIcon}>🎵</Text>
          <Text style={styles.buttonText}>{t('patientApp.essential.music')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.helpButton}
          onPress={handleCallHelp}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('patientApp.essential.callHelp')}
        >
          <Text style={styles.buttonIcon}>📞</Text>
          <Text style={styles.helpButtonText}>{t('patientApp.essential.callHelp')}</Text>
          {primaryContact && (
            <Text style={styles.helpSubtext}>{primaryContact.name}</Text>
          )}
        </TouchableOpacity>
      </View>
      <SOSButton />
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
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
    gap: 24,
  },
  greeting: {
    fontSize: 36,
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  musicButton: {
    flex: 1,
    maxHeight: 240,
    backgroundColor: COLORS.brand100,
    borderRadius: RADIUS['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderWidth: 2,
    borderColor: COLORS.brand300,
  },
  helpButton: {
    flex: 1,
    maxHeight: 240,
    backgroundColor: COLORS.successBg,
    borderRadius: RADIUS['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  buttonIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 28,
    fontFamily: FONTS.display,
    color: COLORS.brand700,
  },
  helpButtonText: {
    fontSize: 28,
    fontFamily: FONTS.display,
    color: COLORS.success,
  },
  helpSubtext: {
    fontSize: 22,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
});
