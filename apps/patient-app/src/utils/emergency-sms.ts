import { Linking, Platform } from 'react-native';
import type { EmergencyContact } from '@ourturn/shared';
import { getPrimaryEmergencyNumber } from '@ourturn/shared';

interface EmergencySMSOptions {
  patientName?: string;
  latitude: number;
  longitude: number;
  emergencyContacts: EmergencyContact[];
  countryCode: string;
}

/**
 * Open native SMS app with pre-filled emergency message.
 * Used as offline fallback when Supabase is unreachable.
 */
export function sendEmergencySMS(options: EmergencySMSOptions): void {
  const { patientName, latitude, longitude, emergencyContacts, countryCode } = options;

  const name = patientName || 'Your loved one';
  const hasLocation = latitude !== 0 || longitude !== 0;
  const mapsLink = hasLocation
    ? `https://maps.google.com/?q=${latitude},${longitude}`
    : '';

  const body = hasLocation
    ? `SOS from OurTurn Care: ${name} needs help. Location: ${mapsLink}`
    : `SOS from OurTurn Care: ${name} needs help. Location unavailable.`;

  // Try to send to first emergency contact, fallback to emergency number
  let phoneNumber = '';
  if (emergencyContacts.length > 0) {
    phoneNumber = emergencyContacts[0].phone;
  } else {
    phoneNumber = getPrimaryEmergencyNumber(countryCode);
  }

  const encodedBody = encodeURIComponent(body);

  // Platform-specific SMS URL
  const smsUrl = Platform.select({
    ios: `sms:${phoneNumber}&body=${encodedBody}`,
    android: `sms:${phoneNumber}?body=${encodedBody}`,
  });

  if (smsUrl) {
    Linking.openURL(smsUrl).catch(() => {
      // Best effort — SMS app may not be available
      if (__DEV__) console.error('Failed to open SMS app');
    });
  }
}
