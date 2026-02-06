import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../src/stores/auth-store';
import { queueAlert } from '../../src/utils/offline-cache';
import { createLocationAlert } from '@memoguard/supabase';
import { getEmergencyNumber } from '@memoguard/shared';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../src/theme';

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export default function HelpScreen() {
  const { t } = useTranslation();
  const { patient, household, session } = useAuthStore();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Get emergency contacts from patient data
  const emergencyContacts: EmergencyContact[] = (patient?.emergency_contacts as EmergencyContact[]) || [];

  // Get country-specific emergency number
  const countryCode = household?.country || 'default';
  const emergencyInfo = getEmergencyNumber(countryCode);

  // Handle calling a contact
  const handleCallContact = async (phone: string, isEmergency: boolean = false) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isEmergency) {
      // Show confirmation for emergency call
      Alert.alert(
        t('patientApp.help.confirmEmergency'),
        '',
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('patientApp.help.emergency'),
            style: 'destructive',
            onPress: () => makePhoneCall(phone),
          },
        ],
        { cancelable: true }
      );
    } else {
      // Direct call for family contacts
      makePhoneCall(phone);
    }
  };

  const makePhoneCall = async (phone: string) => {
    const phoneUrl = `tel:${phone}`;
    try {
      const supported = await Linking.canOpenURL(phoneUrl);
      if (supported) {
        await Linking.openURL(phoneUrl);
      }
    } catch (err) {
      if (__DEV__) console.error('Error opening phone:', err);
    }
  };

  // Handle "Take Me Home" button
  const handleTakeMeHome = async () => {
    if (!patient?.home_latitude || !patient?.home_longitude) {
      // Home address not set - don't show error, just don't do anything
      return;
    }

    setIsLoadingLocation(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Request location permission if needed
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // If permission denied, still open maps with just the destination
        openMapsNavigation();
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const currentLat = location.coords.latitude;
      const currentLng = location.coords.longitude;

      // Send silent alert to caregivers (in background)
      sendTakeMeHomeAlert(currentLat, currentLng);

      // Open maps navigation
      openMapsNavigation();
    } catch (error) {
      if (__DEV__) console.error('Error getting location:', error);
      // Still try to open maps even if location fails
      openMapsNavigation();
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const openMapsNavigation = async () => {
    if (!patient?.home_latitude || !patient?.home_longitude) return;

    const homeLat = patient.home_latitude;
    const homeLng = patient.home_longitude;

    // Platform-specific URLs for Google Maps walking directions
    const googleMapsUrl = Platform.select({
      ios: `comgooglemaps://?daddr=${homeLat},${homeLng}&directionsmode=walking`,
      android: `google.navigation:q=${homeLat},${homeLng}&mode=w`,
    });

    // Fallback URLs
    const fallbackUrl = Platform.select({
      ios: `maps://app?daddr=${homeLat},${homeLng}&dirflg=w`,
      android: `https://www.google.com/maps/dir/?api=1&destination=${homeLat},${homeLng}&travelmode=walking`,
    });

    if (googleMapsUrl) {
      try {
        const supported = await Linking.canOpenURL(googleMapsUrl);
        if (supported) {
          await Linking.openURL(googleMapsUrl);
        } else if (fallbackUrl) {
          await Linking.openURL(fallbackUrl);
        }
      } catch {
        if (fallbackUrl) {
          await Linking.openURL(fallbackUrl);
        }
      }
    }
  };

  const sendTakeMeHomeAlert = async (latitude: number, longitude: number) => {
    const householdId = session?.householdId;
    if (!householdId) return;

    try {
      await createLocationAlert(householdId, {
        type: 'take_me_home_tapped',
        latitude,
        longitude,
      });
    } catch (error) {
      if (__DEV__) console.error('Failed to send Take Me Home alert:', error);
      // Queue for later sync if offline
      await queueAlert({
        householdId,
        type: 'take_me_home_tapped',
        latitude,
        longitude,
        triggeredAt: new Date().toISOString(),
      });
    }
  };

  const hasHomeAddress = patient?.home_latitude && patient?.home_longitude;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text
          style={styles.title}
          accessibilityRole="header"
          accessibilityLabel={t('patientApp.help.title')}
        >
          {t('patientApp.help.title')} 💙
        </Text>

        {/* Call Someone Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('patientApp.help.callSomeone')}</Text>

          {/* Emergency contacts */}
          {emergencyContacts.map((contact, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactButton}
              activeOpacity={0.7}
              onPress={() => handleCallContact(contact.phone)}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.callContact', { name: contact.name })}
            >
              <Text style={styles.contactIcon}>📞</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactRelation}>{contact.relationship}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Emergency services button */}
          <TouchableOpacity
            style={styles.emergencyButton}
            activeOpacity={0.7}
            onPress={() => handleCallContact(emergencyInfo.primary, true)}
            accessibilityRole="button"
            accessibilityLabel={`${t('patientApp.help.emergency')} ${emergencyInfo.primary}`}
            accessibilityHint={t('a11y.emergencyCallConfirmHint')}
          >
            <Text style={styles.emergencyIcon} importantForAccessibility="no">🚨</Text>
            <Text style={styles.emergencyText}>
              {t('patientApp.help.emergency')} ({emergencyInfo.primary})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Get Home Safely Section - Only show if home address is set */}
        {hasHomeAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('patientApp.help.getHomeSafely')}</Text>

            <TouchableOpacity
              style={styles.takeMeHomeButton}
              activeOpacity={0.8}
              onPress={handleTakeMeHome}
              disabled={isLoadingLocation}
              accessibilityRole="button"
              accessibilityLabel={`${t('patientApp.help.takeMeHome')}. ${t('patientApp.help.takeMeHomeDesc')}`}
              accessibilityHint={t('a11y.takeMeHomeHint')}
              accessibilityState={{
                disabled: isLoadingLocation,
                busy: isLoadingLocation,
              }}
            >
              {isLoadingLocation ? (
                <ActivityIndicator
                  color={COLORS.textInverse}
                  size="large"
                  accessibilityLabel={t('a11y.gettingLocation')}
                />
              ) : (
                <>
                  <Text style={styles.takeMeHomeIcon} importantForAccessibility="no">🏠</Text>
                  <Text style={styles.takeMeHomeText}>
                    {t('patientApp.help.takeMeHome').toUpperCase()}
                  </Text>
                  <Text style={styles.takeMeHomeSubtext}>
                    {t('patientApp.help.takeMeHomeDesc')}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom padding for tab bar */}
        <View style={styles.bottomPadding} />
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
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    marginBottom: 36,
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textSecondary,
    marginBottom: 18,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS['2xl'],
    padding: 20,
    marginBottom: 14,
    minHeight: 72,
    ...SHADOWS.sm,
  },
  contactIcon: {
    fontSize: 28,
    marginRight: 18,
    backgroundColor: COLORS.brand50,
    padding: 12,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 21,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  contactRelation: {
    fontSize: 20,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    marginTop: 4,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS['2xl'],
    padding: 20,
    minHeight: 72,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  emergencyIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  emergencyText: {
    fontSize: 21,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textInverse,
    letterSpacing: 0.3,
  },
  takeMeHomeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.brand600,
    borderRadius: RADIUS['2xl'],
    padding: 28,
    minHeight: 140,
    shadowColor: COLORS.brand600,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  takeMeHomeIcon: {
    fontSize: 52,
    marginBottom: 14,
  },
  takeMeHomeText: {
    fontSize: 26,
    fontFamily: FONTS.display,
    color: COLORS.textInverse,
    letterSpacing: 1.5,
  },
  takeMeHomeSubtext: {
    fontSize: 20,
    color: COLORS.textInverse,
    opacity: 0.9,
    marginTop: 10,
    textAlign: 'center',
    fontFamily: FONTS.bodyMedium,
  },
  bottomPadding: {
    height: 120,
  },
});
