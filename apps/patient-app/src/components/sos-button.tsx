import { useState, useRef, useEffect } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/auth-store';
import { createLocationAlert } from '@ourturn/supabase';
import { queueAlert } from '../utils/offline-cache';
import { sendEmergencySMS } from '../utils/emergency-sms';
import { COLORS } from '../theme';
import { useReducedMotion } from '../hooks/use-reduced-motion';

export function SOSButton() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, patient, household } = useAuthStore();
  const [isTriggering, setIsTriggering] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const reduceMotion = useReducedMotion();

  // Subtle pulse animation (skip when reduced motion enabled)
  useEffect(() => {
    if (reduceMotion) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [reduceMotion]);

  const handleLongPress = async () => {
    if (isTriggering) return;
    setIsTriggering(true);

    // Strong haptic feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    const householdId = session?.householdId;
    if (!householdId) {
      setIsTriggering(false);
      return;
    }

    try {
      // Get current location
      let latitude = 0;
      let longitude = 0;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          latitude = location.coords.latitude;
          longitude = location.coords.longitude;
        }
      } catch {
        // Continue without location
      }

      // Check connectivity
      const netState = await NetInfo.fetch();

      if (netState.isConnected && netState.isInternetReachable) {
        // Online: send alert directly
        try {
          await createLocationAlert(householdId, {
            type: 'sos_triggered',
            latitude,
            longitude,
          });
        } catch {
          // Queue for later if direct send fails
          await queueAlert({
            householdId,
            type: 'sos_triggered',
            latitude,
            longitude,
            triggeredAt: new Date().toISOString(),
          });
        }
      } else {
        // Offline: send SMS fallback
        sendEmergencySMS({
          patientName: patient?.name,
          latitude,
          longitude,
          emergencyContacts: patient?.emergency_contacts || [],
          countryCode: household?.country || 'default',
        });

        // Also queue for when back online
        await queueAlert({
          householdId,
          type: 'sos_triggered',
          latitude,
          longitude,
          triggeredAt: new Date().toISOString(),
        });
      }

      // Navigate to confirmation screen
      router.push('/sos-confirmation');
    } catch {
      // Best effort — still navigate to confirmation
      router.push('/sos-confirmation');
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <Pressable
          onLongPress={handleLongPress}
          delayLongPress={2000}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          disabled={isTriggering}
          accessibilityRole="button"
          accessibilityLabel={t('patientApp.sos.button')}
          accessibilityHint={t('patientApp.sos.holdHint')}
        >
          <Text style={styles.icon}>🆘</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 999,
  },
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonPressed: {
    backgroundColor: '#8B2E25',
    transform: [{ scale: 0.95 }],
  },
  icon: {
    fontSize: 32,
  },
});
