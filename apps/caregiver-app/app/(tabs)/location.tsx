import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../src/stores/auth-store';
import { supabase } from '@memoguard/supabase';
import type { LocationLog, SafeZone, LocationAlert, LocationAlertType } from '@memoguard/shared';

// Conditionally import react-native-maps (not available in Expo Go)
let MapView: any = null;
let Marker: any = null;
let Circle: any = null;
let PROVIDER_GOOGLE: any = null;
let mapsAvailable = false;

try {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Circle = maps.Circle;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  mapsAvailable = true;
} catch (e) {
  // Maps not available (e.g., in Expo Go)
  mapsAvailable = false;
}

// Fallback map component for when react-native-maps is not available
const MapPlaceholder = ({ region, children }: { region: any; children?: React.ReactNode }) => (
  <View style={[styles.map, styles.mapPlaceholder]}>
    <Text style={styles.mapPlaceholderIcon}>🗺️</Text>
    <Text style={styles.mapPlaceholderTitle}>Map View</Text>
    {region && (
      <Text style={styles.mapPlaceholderCoords}>
        {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
      </Text>
    )}
    <Text style={styles.mapPlaceholderHint}>
      Maps require a development build.{'\n'}
      Use EAS Build to enable maps.
    </Text>
  </View>
);

import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../../src/theme';

const ALERT_TYPE_LABELS: Record<LocationAlertType, string> = {
  left_safe_zone: 'Left Safe Zone',
  inactive: 'Inactive',
  night_movement: 'Night Movement',
  take_me_home_tapped: 'Take Me Home Tapped',
};

const ALERT_TYPE_ICONS: Record<LocationAlertType, string> = {
  left_safe_zone: '🚨',
  inactive: '⏳',
  night_movement: '🌙',
  take_me_home_tapped: '🏠',
};

// Default region (London)
const DEFAULT_REGION = {
  latitude: 51.5074,
  longitude: -0.1278,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDateTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function LocationScreen() {
  const { t } = useTranslation();
  const { household, patient, caregiver } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [latestLocation, setLatestLocation] = useState<LocationLog | null>(null);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<LocationAlert[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<SafeZone | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Safe zone form state
  const [zoneName, setZoneName] = useState('');
  const [zoneLatitude, setZoneLatitude] = useState('');
  const [zoneLongitude, setZoneLongitude] = useState('');
  const [zoneRadius, setZoneRadius] = useState('200');

  const fetchData = useCallback(async () => {
    if (!household?.id) return;

    try {
      // Get latest location
      const { data: location } = await supabase
        .from('location_logs')
        .select('*')
        .eq('household_id', household.id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      setLatestLocation(location);

      // Get safe zones
      const { data: zones } = await supabase
        .from('safe_zones')
        .select('*')
        .eq('household_id', household.id)
        .eq('active', true)
        .order('created_at', { ascending: true });

      setSafeZones(zones || []);

      // Get recent alerts (last 24 hours)
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);
      const { data: alerts } = await supabase
        .from('location_alerts')
        .select('*')
        .eq('household_id', household.id)
        .gte('triggered_at', yesterday.toISOString())
        .order('triggered_at', { ascending: false });

      setRecentAlerts(alerts || []);
    } catch (err) {
      if (__DEV__) console.error('Failed to fetch location data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [household?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleOpenAddModal = () => {
    setEditingZone(null);
    setZoneName('');
    setZoneLatitude(latestLocation?.latitude.toString() || '');
    setZoneLongitude(latestLocation?.longitude.toString() || '');
    setZoneRadius('200');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (zone: SafeZone) => {
    setEditingZone(zone);
    setZoneName(zone.name);
    setZoneLatitude(zone.latitude.toString());
    setZoneLongitude(zone.longitude.toString());
    setZoneRadius(zone.radius_meters.toString());
    setIsModalOpen(true);
  };

  const handleSaveSafeZone = async () => {
    if (!household?.id || !zoneName || !zoneLatitude || !zoneLongitude) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSaving(true);
    try {
      const zoneData = {
        name: zoneName,
        latitude: parseFloat(zoneLatitude),
        longitude: parseFloat(zoneLongitude),
        radius_meters: parseInt(zoneRadius, 10),
      };

      if (editingZone) {
        const { data, error } = await supabase
          .from('safe_zones')
          .update(zoneData)
          .eq('id', editingZone.id)
          .select()
          .single();

        if (error) throw error;
        setSafeZones((prev) =>
          prev.map((z) => (z.id === editingZone.id ? data : z))
        );
      } else {
        const { data, error } = await supabase
          .from('safe_zones')
          .insert({
            household_id: household.id,
            ...zoneData,
            active: true,
          })
          .select()
          .single();

        if (error) throw error;
        setSafeZones((prev) => [...prev, data]);
      }

      setIsModalOpen(false);
    } catch (err) {
      if (__DEV__) console.error('Failed to save safe zone:', err);
      Alert.alert('Error', 'Failed to save safe zone');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSafeZone = (zone: SafeZone) => {
    Alert.alert(
      'Delete Safe Zone',
      `Are you sure you want to delete "${zone.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('safe_zones')
                .update({ active: false })
                .eq('id', zone.id);

              if (error) throw error;
              setSafeZones((prev) => prev.filter((z) => z.id !== zone.id));
            } catch (err) {
              if (__DEV__) console.error('Failed to delete safe zone:', err);
              Alert.alert('Error', 'Failed to delete safe zone');
            }
          },
        },
      ]
    );
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    if (!caregiver?.id) return;

    try {
      const { error } = await supabase
        .from('location_alerts')
        .update({
          acknowledged: true,
          acknowledged_by: caregiver.id,
        })
        .eq('id', alertId);

      if (error) throw error;
      setRecentAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? { ...a, acknowledged: true, acknowledged_by: caregiver.id }
            : a
        )
      );
    } catch (err) {
      if (__DEV__) console.error('Failed to acknowledge alert:', err);
    }
  };

  const mapRegion = latestLocation
    ? {
        latitude: latestLocation.latitude,
        longitude: latestLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : patient?.home_latitude && patient?.home_longitude
    ? {
        latitude: patient.home_latitude,
        longitude: patient.home_longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : DEFAULT_REGION;

  const unacknowledgedAlerts = recentAlerts.filter((a) => !a.acknowledged);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.brand600} />
        </View>
      </SafeAreaView>
    );
  }

  if (!household) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('caregiverApp.location.title')}</Text>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Please complete onboarding first.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.brand600}
          />
        }
      >
        <Text style={styles.title}>{t('caregiverApp.location.title')}</Text>

        {/* Alert Banner */}
        {unacknowledgedAlerts.length > 0 && (
          <View style={styles.alertBanner}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertIcon}>🚨</Text>
              <Text style={styles.alertTitle}>
                {unacknowledgedAlerts.length} Unacknowledged Alert
                {unacknowledgedAlerts.length > 1 ? 's' : ''}
              </Text>
            </View>
            {unacknowledgedAlerts.slice(0, 2).map((alert) => (
              <View key={alert.id} style={styles.alertItem}>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertTypeIcon}>
                    {ALERT_TYPE_ICONS[alert.type]}
                  </Text>
                  <View style={styles.alertText}>
                    <Text style={styles.alertTypeName}>
                      {ALERT_TYPE_LABELS[alert.type]}
                    </Text>
                    <Text style={styles.alertTime}>
                      {formatDateTime(alert.triggered_at)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleAcknowledgeAlert(alert.id)}
                  style={styles.ackButton}
                >
                  <Text style={styles.ackButtonText}>Acknowledge</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Map */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <View>
              <Text style={styles.mapTitle}>
                {patient?.name || 'Patient'}&apos;s Location
              </Text>
              {latestLocation ? (
                <Text style={styles.mapSubtitle}>
                  Updated: {formatDateTime(latestLocation.timestamp)}
                </Text>
              ) : (
                <Text style={styles.mapSubtitle}>No location data yet</Text>
              )}
            </View>
            {latestLocation && (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            )}
          </View>
          <View style={styles.mapContainer}>
            {mapsAvailable && MapView ? (
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                region={mapRegion}
                showsUserLocation={false}
                showsCompass={true}
              >
                {/* Current location marker */}
                {latestLocation && Marker && (
                  <Marker
                    coordinate={{
                      latitude: latestLocation.latitude,
                      longitude: latestLocation.longitude,
                    }}
                    title={`${patient?.name || 'Patient'}'s location`}
                    description={latestLocation.location_label}
                    pinColor={COLORS.brand600}
                  />
                )}

                {/* Home marker */}
                {patient?.home_latitude && patient?.home_longitude && Marker && (
                  <Marker
                    coordinate={{
                      latitude: patient.home_latitude,
                      longitude: patient.home_longitude,
                    }}
                    title="Home"
                  >
                    <View style={styles.homeMarker}>
                      <Text style={styles.homeMarkerEmoji}>🏠</Text>
                    </View>
                  </Marker>
                )}

                {/* Safe zone circles */}
                {safeZones.map((zone) => Circle && (
                  <Circle
                    key={zone.id}
                    center={{
                      latitude: zone.latitude,
                      longitude: zone.longitude,
                    }}
                    radius={zone.radius_meters}
                    strokeColor={COLORS.brand600}
                    strokeWidth={2}
                    fillColor="rgba(184, 90, 47, 0.15)"
                  />
                ))}
              </MapView>
            ) : (
              <MapPlaceholder region={mapRegion} />
            )}
          </View>
        </View>

        {/* Safe Zones */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Safe Zones</Text>
            <TouchableOpacity
              onPress={handleOpenAddModal}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          {safeZones.length === 0 ? (
            <Text style={styles.emptyZoneText}>
              No safe zones configured yet.{'\n'}
              Add zones to get alerts when {patient?.name || 'patient'} leaves.
            </Text>
          ) : (
            <View style={styles.zonesList}>
              {safeZones.map((zone) => (
                <View key={zone.id} style={styles.zoneItem}>
                  <View>
                    <Text style={styles.zoneName}>{zone.name}</Text>
                    <Text style={styles.zoneRadius}>
                      {zone.radius_meters}m radius
                    </Text>
                  </View>
                  <View style={styles.zoneActions}>
                    <TouchableOpacity
                      onPress={() => handleOpenEditModal(zone)}
                      style={styles.zoneActionButton}
                    >
                      <Text>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteSafeZone(zone)}
                      style={styles.zoneActionButton}
                    >
                      <Text>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Recent Alerts */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Alerts (24h)</Text>
          {recentAlerts.length === 0 ? (
            <Text style={styles.emptyAlertText}>
              No alerts in the last 24 hours. All is well!
            </Text>
          ) : (
            <View style={styles.alertsList}>
              {recentAlerts.slice(0, 5).map((alert) => (
                <View
                  key={alert.id}
                  style={[
                    styles.recentAlertItem,
                    !alert.acknowledged && styles.recentAlertUnack,
                  ]}
                >
                  <Text style={styles.recentAlertIcon}>
                    {ALERT_TYPE_ICONS[alert.type]}
                  </Text>
                  <View style={styles.recentAlertInfo}>
                    <Text style={styles.recentAlertType}>
                      {ALERT_TYPE_LABELS[alert.type]}
                    </Text>
                    <Text style={styles.recentAlertTime}>
                      {formatDateTime(alert.triggered_at)}
                    </Text>
                  </View>
                  {alert.acknowledged && (
                    <Text style={styles.ackCheck}>✓</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Safe Zone Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingZone ? 'Edit Safe Zone' : 'Add Safe Zone'}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={zoneName}
                onChangeText={setZoneName}
                placeholder="e.g., Home, Doctor's Office"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Latitude</Text>
                <TextInput
                  style={styles.input}
                  value={zoneLatitude}
                  onChangeText={setZoneLatitude}
                  placeholder="51.5074"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Longitude</Text>
                <TextInput
                  style={styles.input}
                  value={zoneLongitude}
                  onChangeText={setZoneLongitude}
                  placeholder="-0.1278"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Radius (meters)</Text>
              <TextInput
                style={styles.input}
                value={zoneRadius}
                onChangeText={setZoneRadius}
                placeholder="200"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
              />
              <Text style={styles.inputHint}>
                Recommended: 100-500 meters for typical locations
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveSafeZone}
                style={styles.saveButton}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={COLORS.textInverse} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 20,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  alertBanner: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADIUS.xl,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.danger,
    ...SHADOWS.sm,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.danger,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 8,
  },
  alertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertTypeIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  alertText: {
    flex: 1,
  },
  alertTypeName: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textPrimary,
  },
  alertTime: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  ackButton: {
    backgroundColor: COLORS.brand600,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ackButtonText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textInverse,
  },
  mapCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
  },
  mapSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  mapContainer: {
    height: 250,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.border,
  },
  mapPlaceholderIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  mapPlaceholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  mapPlaceholderCoords: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  mapPlaceholderHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  homeMarker: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 8,
    borderWidth: 2,
    borderColor: COLORS.brand600,
  },
  homeMarkerEmoji: {
    fontSize: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },
  addButton: {
    backgroundColor: COLORS.brand50,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    ...SHADOWS.sm,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: COLORS.brand700,
  },
  emptyZoneText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  zonesList: {
    gap: 8,
  },
  zoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.brand200,
  },
  zoneName: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textPrimary,
  },
  zoneRadius: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  zoneActions: {
    flexDirection: 'row',
    gap: 8,
  },
  zoneActionButton: {
    padding: 4,
  },
  emptyAlertText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  alertsList: {
    gap: 8,
  },
  recentAlertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 12,
  },
  recentAlertUnack: {
    backgroundColor: COLORS.amberBg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.amber,
  },
  recentAlertIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  recentAlertInfo: {
    flex: 1,
  },
  recentAlertType: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textPrimary,
  },
  recentAlertTime: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  ackCheck: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputHalf: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.brand200,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.card,
  },
  inputHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.brand600,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },
});
