'use client';

import { useState, useCallback, useEffect } from 'react';
import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { createBrowserClient } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import type { LocationLog, SafeZone, LocationAlert, LocationAlertType } from '@ourturn/shared';
import { useToast } from '@/components/toast';

interface LocationClientProps {
  householdId: string;
  patientName: string;
  homeAddress?: string | null;
  homeLatitude?: number | null;
  homeLongitude?: number | null;
  latestLocation: LocationLog | null;
  locationHistory: LocationLog[];
  safeZones: SafeZone[];
  recentAlerts: LocationAlert[];
  caregiverId: string;
}

const ALERT_TYPE_LABEL_KEYS: Record<LocationAlertType, string> = {
  left_safe_zone: 'caregiverApp.location.alertTypes.left_safe_zone',
  inactive: 'caregiverApp.location.alertTypes.inactive',
  night_movement: 'caregiverApp.location.alertTypes.night_movement',
  take_me_home_tapped: 'caregiverApp.location.alertTypes.take_me_home_tapped',
  sos_triggered: 'caregiverApp.location.alertTypes.sos_triggered',
};

const ALERT_TYPE_ICONS: Record<LocationAlertType, string> = {
  left_safe_zone: '🚨',
  inactive: '⏳',
  night_movement: '🌙',
  take_me_home_tapped: '🏠',
  sos_triggered: '🆘',
};

// Default center (fallback if geolocation unavailable)
const DEFAULT_CENTER = { lat: 51.5074, lng: -0.1278 };

function formatTime(timestamp: string, locale: string = 'en'): string {
  return new Date(timestamp).toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
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

// Safe Zone Circle Component
function SafeZoneCircle({ zone }: { zone: SafeZone }) {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    const circle = new google.maps.Circle({
      strokeColor: '#4A7C59',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#4A7C59',
      fillOpacity: 0.15,
      map,
      center: { lat: zone.latitude, lng: zone.longitude },
      radius: zone.radius_meters,
    });

    return () => {
      circle.setMap(null);
    };
  }, [map, zone.latitude, zone.longitude, zone.radius_meters]);

  return null;
}

// Safe Zone Modal Component
function SafeZoneModal({
  isOpen,
  onClose,
  onSave,
  zone,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; latitude: number; longitude: number; radius_meters: number }) => void;
  zone?: SafeZone | null;
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(zone?.name || '');
  const [latitude, setLatitude] = useState(zone?.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(zone?.longitude?.toString() || '');
  const [radius, setRadius] = useState(zone?.radius_meters?.toString() || '200');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius_meters: parseInt(radius, 10),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="card-paper p-6 w-full max-w-md">
        <h2 className="text-xl font-display font-bold text-text-primary mb-4">
          {zone ? t('caregiverApp.location.editSafeZone') : t('caregiverApp.location.addSafeZone')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              {t('caregiverApp.location.name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('caregiverApp.location.zoneNamePlaceholder')}
              className="input-warm w-full"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t('caregiverApp.location.latitude')}
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="51.5074"
                className="input-warm w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t('caregiverApp.location.longitude')}
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="-0.1278"
                className="input-warm w-full"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              {t('caregiverApp.location.zoneRadius')}
            </label>
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              placeholder="200"
              min="50"
              max="5000"
              className="input-warm w-full"
              required
            />
            <p className="text-xs text-text-muted mt-1">
              {t('caregiverApp.location.radiusRecommendation')}
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {isLoading ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LocationClient({
  householdId,
  patientName,
  homeAddress,
  homeLatitude,
  homeLongitude,
  latestLocation,
  locationHistory,
  safeZones: initialSafeZones,
  recentAlerts: initialAlerts,
  caregiverId,
}: LocationClientProps) {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const supabase = createBrowserClient();
  const [safeZones, setSafeZones] = useState<SafeZone[]>(initialSafeZones);
  const [alerts, setAlerts] = useState<LocationAlert[]>(initialAlerts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<SafeZone | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHistoryPoint, setSelectedHistoryPoint] = useState<LocationLog | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationLog | null>(latestLocation);
  const [caregiverLocation, setCaregiverLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get caregiver's location via browser geolocation as fallback
  useEffect(() => {
    if (latestLocation || (homeLatitude && homeLongitude)) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCaregiverLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }, [latestLocation, homeLatitude, homeLongitude]);

  // Poll for location updates every 30 seconds
  useEffect(() => {
    const pollLocation = async () => {
      const { data } = await supabase
        .from('location_logs')
        .select('*')
        .eq('household_id', householdId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setCurrentLocation(data);
      }
    };

    const interval = setInterval(pollLocation, 30000);
    return () => clearInterval(interval);
  }, [householdId, supabase]);

  // Determine map center: patient location → home → caregiver's location → fallback
  const mapCenter = currentLocation
    ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
    : homeLatitude && homeLongitude
    ? { lat: homeLatitude, lng: homeLongitude }
    : caregiverLocation || DEFAULT_CENTER;

  // Handle creating/updating safe zone
  const handleSaveSafeZone = useCallback(
    async (data: { name: string; latitude: number; longitude: number; radius_meters: number }) => {
      setIsLoading(true);
      try {
        if (editingZone) {
          // Update existing zone
          const { data: updated, error } = await supabase
            .from('safe_zones')
            .update(data)
            .eq('id', editingZone.id)
            .select()
            .single();

          if (error) throw error;
          setSafeZones((prev) =>
            prev.map((z) => (z.id === editingZone.id ? updated : z))
          );
        } else {
          // Create new zone
          const { data: created, error } = await supabase
            .from('safe_zones')
            .insert({
              household_id: householdId,
              ...data,
              active: true,
            })
            .select()
            .single();

          if (error) throw error;
          setSafeZones((prev) => [...prev, created]);
        }
        setIsModalOpen(false);
        setEditingZone(null);
      } catch (err) {
        alert(t('caregiverApp.location.saveFailed'));
      } finally {
        setIsLoading(false);
      }
    },
    [editingZone, householdId, supabase]
  );

  // Handle deleting safe zone
  const handleDeleteSafeZone = useCallback(
    async (zoneId: string) => {
      if (!confirm(t('caregiverApp.location.deleteSafeZoneConfirm'))) return;

      try {
        const { error } = await supabase
          .from('safe_zones')
          .update({ active: false })
          .eq('id', zoneId);

        if (error) throw error;
        setSafeZones((prev) => prev.filter((z) => z.id !== zoneId));
      } catch (err) {
        alert(t('caregiverApp.location.deleteFailed'));
      }
    },
    [supabase]
  );

  // Handle acknowledging alert (also resolves any escalation)
  const handleAcknowledgeAlert = useCallback(
    async (alertId: string) => {
      try {
        const { error } = await supabase
          .from('location_alerts')
          .update({
            acknowledged: true,
            acknowledged_by: caregiverId,
            acknowledged_at: new Date().toISOString(),
          })
          .eq('id', alertId);

        if (error) throw error;

        // Also resolve any active escalation for this alert
        await supabase
          .from('alert_escalations')
          .update({
            resolved: true,
            resolved_at: new Date().toISOString(),
            resolved_by: caregiverId,
          })
          .eq('alert_id', alertId)
          .eq('resolved', false);

        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alertId
              ? { ...a, acknowledged: true, acknowledged_by: caregiverId }
              : a
          )
        );
      } catch (err) {
        showToast(t('common.error'), 'error');
      }
    },
    [caregiverId, supabase, showToast, t]
  );

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Show placeholder if no API key
  if (!apiKey) {
    return (
      <div>
        <h1 className="text-2xl font-bold font-display text-text-primary mb-6">{t('caregiverApp.location.title')}</h1>
        <div className="card-paper p-8 text-center">
          <span className="text-4xl mb-4 block">🗺️</span>
          <p className="text-text-muted mb-2">
            {t('caregiverApp.location.mapsApiMissing')}
          </p>
          <p className="text-sm text-text-muted" dangerouslySetInnerHTML={{ __html: t('caregiverApp.location.mapsApiInstructions') }} />
        </div>
      </div>
    );
  }

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <APIProvider apiKey={apiKey}>
      <div>
        <h1 className="text-2xl font-bold font-display text-text-primary mb-6">{t('caregiverApp.location.title')}</h1>

        {/* Alert Banner */}
        {unacknowledgedAlerts.length > 0 && (
          <div className="bg-status-danger-bg border border-status-danger/20 rounded-[20px] p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🚨</span>
              <h2 className="font-semibold text-status-danger">
                {t('caregiverApp.location.unacknowledgedAlerts', { count: unacknowledgedAlerts.length })}
              </h2>
            </div>
            <div className="space-y-2">
              {unacknowledgedAlerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between bg-surface-card dark:bg-surface-elevated rounded-2xl p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {ALERT_TYPE_ICONS[alert.type]}
                    </span>
                    <div>
                      <p className="font-medium text-text-primary">
                        {t(ALERT_TYPE_LABEL_KEYS[alert.type])}
                      </p>
                      <p className="text-sm text-text-muted">
                        {formatDateTime(alert.triggered_at)}
                        {alert.location_label && ` - ${alert.location_label}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                    className="btn-primary text-sm px-3 py-1"
                  >
                    {t('caregiverApp.location.acknowledge')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2 card-paper overflow-hidden">
            <div className="p-4 border-b border-surface-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-text-primary">
                    {t('caregiverApp.location.patientLocation', { name: patientName })}
                  </h2>
                  {currentLocation && (
                    <p className="text-sm text-text-muted">
                      {t('caregiverApp.dashboard.lastUpdate', { time: formatDateTime(currentLocation.timestamp) })}
                      {currentLocation.location_label && currentLocation.location_label !== 'unknown' && (
                        <> - {currentLocation.location_label}</>
                      )}
                    </p>
                  )}
                  {!currentLocation && (
                    <p className="text-sm text-text-muted">{t('caregiverApp.location.noLocationYet')}</p>
                  )}
                </div>
                {currentLocation && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-status-success rounded-full animate-pulse" />
                    <span className="text-text-secondary">{t('common.live')}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="h-[400px]">
              <Map
                defaultCenter={mapCenter}
                defaultZoom={15}
                gestureHandling="greedy"
                disableDefaultUI={false}
              >
                {/* Current location marker */}
                {currentLocation && (
                  <Marker
                    position={{
                      lat: currentLocation.latitude,
                      lng: currentLocation.longitude,
                    }}
                    title={t('caregiverApp.location.patientLocation', { name: patientName })}
                  />
                )}

                {/* Home marker */}
                {homeLatitude && homeLongitude && (
                  <Marker
                    position={{ lat: homeLatitude, lng: homeLongitude }}
                    title={t('caregiverApp.location.home')}
                    label="🏠"
                  />
                )}

                {/* Location history markers */}
                {locationHistory.map((loc) => (
                  <Marker
                    key={loc.id}
                    position={{ lat: loc.latitude, lng: loc.longitude }}
                    onClick={() => setSelectedHistoryPoint(loc)}
                    title={formatTime(loc.timestamp, i18n.language)}
                    opacity={selectedHistoryPoint?.id === loc.id ? 1 : 0.5}
                  />
                ))}

                {/* Safe zone circles are drawn via useEffect in SafeZoneCircle */}
              </Map>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Safe Zones Card */}
            <div className="card-paper p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-text-primary">{t('caregiverApp.location.safeZones')}</h2>
                <button
                  onClick={() => {
                    setEditingZone(null);
                    setIsModalOpen(true);
                  }}
                  className="btn-secondary text-sm px-3 py-1"
                >
                  {t('caregiverApp.location.addZone')}
                </button>
              </div>
              {safeZones.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">
                  {t('caregiverApp.location.noSafeZones')}
                  <br />
                  {t('caregiverApp.location.addZonesHint', { name: patientName })}
                </p>
              ) : (
                <div className="space-y-3">
                  {safeZones.map((zone) => (
                    <div
                      key={zone.id}
                      className="flex items-center justify-between p-3 card-inset rounded-2xl"
                    >
                      <div>
                        <p className="font-medium text-text-primary">{zone.name}</p>
                        <p className="text-xs text-text-muted">
                          {t('caregiverApp.location.radiusUnit', { radius: zone.radius_meters })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingZone(zone);
                            setIsModalOpen(true);
                          }}
                          className="text-text-muted hover:text-text-primary"
                          title={t('common.edit')}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteSafeZone(zone.id)}
                          className="text-text-muted hover:text-status-danger"
                          title={t('common.delete')}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Alerts Card */}
            <div className="card-paper p-4">
              <h2 className="font-semibold text-text-primary mb-4">
                {t('caregiverApp.location.recentAlerts24h')}
              </h2>
              {alerts.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">
                  {t('caregiverApp.location.noRecentAlerts')}
                </p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-2xl ${
                        alert.acknowledged ? 'card-inset' : 'bg-status-amber-bg'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">
                          {ALERT_TYPE_ICONS[alert.type]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary text-sm">
                            {t(ALERT_TYPE_LABEL_KEYS[alert.type])}
                          </p>
                          <p className="text-xs text-text-muted">
                            {formatDateTime(alert.triggered_at)}
                          </p>
                          {alert.location_label && (
                            <p className="text-xs text-text-secondary truncate">
                              {alert.location_label}
                            </p>
                          )}
                        </div>
                        {alert.acknowledged && (
                          <span className="text-xs text-status-success">✓</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location History Timeline */}
            <div className="card-paper p-4">
              <h2 className="font-semibold text-text-primary mb-4">
                {t('caregiverApp.location.todaysTimeline')}
              </h2>
              {locationHistory.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">
                  {t('caregiverApp.location.noLocationUpdates')}
                </p>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {locationHistory
                    .slice()
                    .reverse()
                    .slice(0, 10)
                    .map((loc) => (
                      <div
                        key={loc.id}
                        className={`flex items-center gap-3 p-2 rounded-2xl cursor-pointer ${
                          selectedHistoryPoint?.id === loc.id
                            ? 'bg-brand-50 dark:bg-brand-900/30'
                            : 'hover:bg-brand-50 dark:hover:bg-surface-elevated'
                        }`}
                        onClick={() => setSelectedHistoryPoint(loc)}
                      >
                        <span className="text-xs text-text-muted w-16">
                          {formatTime(loc.timestamp, i18n.language)}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-text-primary">
                            {loc.location_label !== 'unknown'
                              ? loc.location_label
                              : t('caregiverApp.location.locationUpdate')}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Home Address Info */}
        {homeAddress && (
          <div className="mt-6 card-paper p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏠</span>
              <div>
                <p className="font-medium text-text-primary">{t('caregiverApp.location.homeAddress')}</p>
                <p className="text-sm text-text-secondary">{homeAddress}</p>
              </div>
            </div>
          </div>
        )}

        {/* Safe Zone Modal */}
        <SafeZoneModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingZone(null);
          }}
          onSave={handleSaveSafeZone}
          zone={editingZone}
          isLoading={isLoading}
        />
      </div>
    </APIProvider>
  );
}
