import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
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
import { supabase } from '@ourturn/supabase';
import type { LocationLog, SafeZone, LocationAlert, LocationAlertType } from '@ourturn/shared';
import { createThemedStyles, useColors, FONTS, RADIUS, SHADOWS, SPACING } from '../../src/theme';

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

const ALERT_TYPE_I18N_KEYS: Record<LocationAlertType, string> = {
  left_safe_zone: 'caregiverApp.location.alertTypeLeftSafeZone',
  inactive: 'caregiverApp.location.alertTypeInactive',
  night_movement: 'caregiverApp.location.alertTypeNightMovement',
  take_me_home_tapped: 'caregiverApp.location.alertTypeTakeMeHomeTapped',
  sos_triggered: 'caregiverApp.location.alertTypeSosTriggered',
};

const ALERT_TYPE_ICONS: Record<LocationAlertType, string> = {
  left_safe_zone: '🚨',
  inactive: '⏳',
  night_movement: '🌙',
  take_me_home_tapped: '🏠',
  sos_triggered: '🆘',
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
  const styles = useStyles();
  const colors = useColors();

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
      Alert.alert(t('common.errorTitle'), t('caregiverApp.location.fillAllFields'));
      return;
    }

    const lat = parseFloat(zoneLatitude);
    const lng = parseFloat(zoneLongitude);
    const rad = parseInt(zoneRadius, 10);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      Alert.alert(t('common.errorTitle'), t('caregiverApp.location.invalidLatitude'));
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      Alert.alert(t('common.errorTitle'), t('caregiverApp.location.invalidLongitude'));
      return;
    }

    if (isNaN(rad) || rad <= 0) {
      Alert.alert(t('common.errorTitle'), t('caregiverApp.location.invalidRadius'));
      return;
    }

    setIsSaving(true);
    try {
      const zoneData = {
        name: zoneName,
        latitude: lat,
        longitude: lng,
        radius_meters: rad,
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
      Alert.alert(t('common.errorTitle'), t('caregiverApp.location.failedToSaveSafeZone'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSafeZone = (zone: SafeZone) => {
    Alert.alert(
      t('caregiverApp.location.deleteSafeZone'),
      t('caregiverApp.location.deleteSafeZoneConfirm', { name: zone.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
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
              Alert.alert(t('common.errorTitle'), t('caregiverApp.location.failedToDeleteSafeZone'));
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

  // Fallback map component for when react-native-maps is not available
  const MapPlaceholder = ({ region, children }: { region: any; children?: React.ReactNode }) => (
    <View style={[styles.map, styles.mapPlaceholder]}>
      <Text style={styles.mapPlaceholderIcon}>🗺️</Text>
      <Text style={styles.mapPlaceholderTitle}>{t('caregiverApp.location.mapView')}</Text>
      {region && (
        <Text style={styles.mapPlaceholderCoords}>
          {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
        </Text>
      )}
      <Text style={styles.mapPlaceholderHint}>
        {t('caregiverApp.location.mapRequiresBuild')}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand600} />
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
            <Text style={styles.emptyText}>{t('caregiverApp.location.completeOnboarding')}</Text>
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
            tintColor={colors.brand600}
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
                {t(unacknowledgedAlerts.length > 1 ? 'caregiverApp.location.unacknowledgedAlertsPlural' : 'caregiverApp.location.unacknowledgedAlerts', { count: unacknowledgedAlerts.length })}
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
                      {t(ALERT_TYPE_I18N_KEYS[alert.type])}
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
                  <Text style={styles.ackButtonText}>{t('caregiverApp.location.acknowledge')}</Text>
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
                {t('caregiverApp.location.patientLocation', { name: patient?.name || t('caregiverApp.location.patient') })}
              </Text>
              {latestLocation ? (
                <Text style={styles.mapSubtitle}>
                  {t('caregiverApp.location.updated', { time: formatDateTime(latestLocation.timestamp) })}
                </Text>
              ) : (
                <Text style={styles.mapSubtitle}>{t('caregiverApp.location.noLocationData')}</Text>
              )}
            </View>
            {latestLocation && (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>{t('caregiverApp.location.live')}</Text>
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
                    title={t('caregiverApp.location.patientLocation', { name: patient?.name || t('caregiverApp.location.patient') })}
                    description={latestLocation.location_label}
                    pinColor={colors.brand600}
                  />
                )}

                {/* Home marker */}
                {patient?.home_latitude && patient?.home_longitude && Marker && (
                  <Marker
                    coordinate={{
                      latitude: patient.home_latitude,
                      longitude: patient.home_longitude,
                    }}
                    title={t('caregiverApp.location.home')}
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
                    strokeColor={colors.brand600}
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
            <Text style={styles.cardTitle}>{t('caregiverApp.location.safeZones')}</Text>
            <TouchableOpacity
              onPress={handleOpenAddModal}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>{t('caregiverApp.location.add')}</Text>
            </TouchableOpacity>
          </View>
          {safeZones.length === 0 ? (
            <Text style={styles.emptyZoneText}>
              {t('caregiverApp.location.noSafeZonesYet', { name: patient?.name || t('caregiverApp.location.patient') })}
            </Text>
          ) : (
            <View style={styles.zonesList}>
              {safeZones.map((zone) => (
                <View key={zone.id} style={styles.zoneItem}>
                  <View>
                    <Text style={styles.zoneName}>{zone.name}</Text>
                    <Text style={styles.zoneRadius}>
                      {t('caregiverApp.location.radiusMeters', { radius: zone.radius_meters })}
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
          <Text style={styles.cardTitle}>{t('caregiverApp.location.recentAlerts24h')}</Text>
          {recentAlerts.length === 0 ? (
            <Text style={styles.emptyAlertText}>
              {t('caregiverApp.location.noRecentAlerts')}
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
                      {t(ALERT_TYPE_I18N_KEYS[alert.type])}
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
              {editingZone ? t('caregiverApp.location.editSafeZone') : t('caregiverApp.location.addSafeZone')}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('caregiverApp.location.name')}</Text>
              <TextInput
                style={styles.input}
                value={zoneName}
                onChangeText={setZoneName}
                placeholder={t('caregiverApp.location.nameExample')}
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>{t('caregiverApp.location.latitude')}</Text>
                <TextInput
                  style={styles.input}
                  value={zoneLatitude}
                  onChangeText={setZoneLatitude}
                  placeholder="51.5074"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>{t('caregiverApp.location.longitude')}</Text>
                <TextInput
                  style={styles.input}
                  value={zoneLongitude}
                  onChangeText={setZoneLongitude}
                  placeholder="-0.1278"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('caregiverApp.location.zoneRadius')}</Text>
              <TextInput
                style={styles.input}
                value={zoneRadius}
                onChangeText={setZoneRadius}
                placeholder="200"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
              />
              <Text style={styles.inputHint}>
                {t('caregiverApp.location.radiusHint')}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveSafeZone}
                style={styles.saveButton}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={colors.textInverse} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const useStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 20,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    padding: 40,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: colors.textMuted,
  },
  alertBanner: {
    backgroundColor: colors.dangerBg,
    borderRadius: RADIUS.xl,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.danger,
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
    color: colors.danger,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
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
    color: colors.textPrimary,
  },
  alertTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
  ackButton: {
    backgroundColor: colors.brand600,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ackButtonText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: colors.textInverse,
  },
  mapCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderBottomColor: colors.border,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
  },
  mapSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
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
    backgroundColor: colors.success,
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    color: colors.textSecondary,
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
    backgroundColor: colors.border,
  },
  mapPlaceholderIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  mapPlaceholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  mapPlaceholderCoords: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  mapPlaceholderHint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  homeMarker: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    padding: 8,
    borderWidth: 2,
    borderColor: colors.brand600,
  },
  homeMarkerEmoji: {
    fontSize: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textMuted,
  },
  addButton: {
    backgroundColor: colors.brand50,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    ...SHADOWS.sm,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: colors.brand700,
  },
  emptyZoneText: {
    fontSize: 14,
    color: colors.textMuted,
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
    backgroundColor: colors.background,
    borderRadius: RADIUS.md,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand200,
  },
  zoneName: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: colors.textPrimary,
  },
  zoneRadius: {
    fontSize: 12,
    color: colors.textMuted,
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
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  alertsList: {
    gap: 8,
  },
  recentAlertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: RADIUS.md,
    padding: 12,
  },
  recentAlertUnack: {
    backgroundColor: colors.amberBg,
    borderLeftWidth: 3,
    borderLeftColor: colors.amber,
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
    color: colors.textPrimary,
  },
  recentAlertTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
  ackCheck: {
    fontSize: 14,
    color: colors.success,
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
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
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
    color: colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.brand200,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
    backgroundColor: colors.card,
  },
  inputHint: {
    fontSize: 12,
    color: colors.textMuted,
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
    borderColor: colors.border,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.brand600,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textInverse,
  },
}));
