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

// Design system colors
const COLORS = {
  background: '#FAFAF8',
  card: '#FFFFFF',
  border: '#E7E5E4',
  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  textMuted: '#A8A29E',
  brand600: '#0D9488',
  brand700: '#0F766E',
  danger: '#DC2626',
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
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    minHeight: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contactIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  contactRelation: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    padding: 16,
    minHeight: 64,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  emergencyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  takeMeHomeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.brand600,
    borderRadius: 16,
    padding: 24,
    minHeight: 100,
    shadowColor: COLORS.brand600,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  takeMeHomeIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  takeMeHomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  takeMeHomeSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
});
