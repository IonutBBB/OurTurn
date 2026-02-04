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

// Design system colors - 2026 Edition
const COLORS = {
  background: '#FAFBFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  brand50: '#ECFDF8',
  brand100: '#D1FAE9',
  brand400: '#2DD4BF',
  brand500: '#14B8A6',
  brand600: '#0A9488',
  brand700: '#0D7D73',
  danger: '#EF4444',
  dangerBg: '#FEF2F2',
};

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
  // For now, we'll create placeholder contacts until the full patient profile is implemented
  const emergencyContacts: EmergencyContact[] = patient?.emergency_number
    ? [
        {
          name: t('patientApp.help.emergency'),
          relationship: 'Primary Contact',
          phone: patient.emergency_number,
        },
      ]
    : [];

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

  const makePhoneCall = (phone: string) => {
    const phoneUrl = `tel:${phone}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          console.error('Phone calls not supported on this device');
        }
      })
      .catch((err) => console.error('Error opening phone:', err));
  };

  // Handle "Take Me Home" button
  const handleTakeMeHome = async () => {
    if (!patient?.home_latitude || !patient?.home_longitude) {
      // Home address not set - don't show error, just don't do anything
      console.log('Home address not configured');
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
      console.error('Error getting location:', error);
      // Still try to open maps even if location fails
      openMapsNavigation();
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const openMapsNavigation = () => {
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
      Linking.canOpenURL(googleMapsUrl)
        .then((supported) => {
          if (supported) {
            Linking.openURL(googleMapsUrl);
          } else if (fallbackUrl) {
            Linking.openURL(fallbackUrl);
          }
        })
        .catch(() => {
          if (fallbackUrl) {
            Linking.openURL(fallbackUrl);
          }
        });
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
      console.error('Failed to send Take Me Home alert:', error);
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
              accessibilityLabel={`Call ${contact.name}`}
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
            accessibilityHint="A confirmation will appear before calling"
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
              accessibilityHint="Opens navigation to your home address"
              accessibilityState={{
                disabled: isLoadingLocation,
                busy: isLoadingLocation,
              }}
            >
              {isLoadingLocation ? (
                <ActivityIndicator
                  color="#FFFFFF"
                  size="large"
                  accessibilityLabel="Getting your location"
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
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 36,
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    minHeight: 72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  contactIcon: {
    fontSize: 28,
    marginRight: 18,
    backgroundColor: COLORS.brand50,
    padding: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 21,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  contactRelation: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.danger,
    borderRadius: 20,
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
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  takeMeHomeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.brand600,
    borderRadius: 24,
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
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  takeMeHomeSubtext: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 120,
  },
});
