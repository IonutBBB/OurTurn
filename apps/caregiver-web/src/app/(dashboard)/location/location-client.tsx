'use client';

import { useState, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { createBrowserClient } from '@/lib/supabase';
import type { LocationLog, SafeZone, LocationAlert, LocationAlertType } from '@memoguard/shared';

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

// Default center (London) if no location available
const DEFAULT_CENTER = { lat: 51.5074, lng: -0.1278 };

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

// Safe Zone Circle Component
function SafeZoneCircle({ zone }: { zone: SafeZone }) {
  const map = useMap();

  // Draw circle using Google Maps Circle
  if (map && typeof google !== 'undefined') {
    const circle = new google.maps.Circle({
      strokeColor: '#0D9488',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#0D9488',
      fillOpacity: 0.15,
      map,
      center: { lat: zone.latitude, lng: zone.longitude },
      radius: zone.radius_meters,
    });

    // Cleanup on unmount
    return () => {
      circle.setMap(null);
    };
  }

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
      <div className="bg-surface-card rounded-xl border border-surface-border p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          {zone ? 'Edit Safe Zone' : 'Add Safe Zone'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Home, Doctor's Office"
              className="w-full px-4 py-2 border border-surface-border rounded-lg bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="51.5074"
                className="w-full px-4 py-2 border border-surface-border rounded-lg bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="-0.1278"
                className="w-full px-4 py-2 border border-surface-border rounded-lg bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Radius (meters)
            </label>
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              placeholder="200"
              min="50"
              max="5000"
              className="w-full px-4 py-2 border border-surface-border rounded-lg bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
            <p className="text-xs text-text-muted mt-1">
              Recommended: 100-500 meters for typical locations
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-surface-border rounded-lg text-text-secondary hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
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
  const supabase = createBrowserClient();
  const [safeZones, setSafeZones] = useState<SafeZone[]>(initialSafeZones);
  const [alerts, setAlerts] = useState<LocationAlert[]>(initialAlerts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<SafeZone | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHistoryPoint, setSelectedHistoryPoint] = useState<LocationLog | null>(null);

  // Determine map center
  const mapCenter = latestLocation
    ? { lat: latestLocation.latitude, lng: latestLocation.longitude }
    : homeLatitude && homeLongitude
    ? { lat: homeLatitude, lng: homeLongitude }
    : DEFAULT_CENTER;

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
        console.error('Failed to save safe zone:', err);
        alert('Failed to save safe zone. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [editingZone, householdId, supabase]
  );

  // Handle deleting safe zone
  const handleDeleteSafeZone = useCallback(
    async (zoneId: string) => {
      if (!confirm('Are you sure you want to delete this safe zone?')) return;

      try {
        const { error } = await supabase
          .from('safe_zones')
          .update({ active: false })
          .eq('id', zoneId);

        if (error) throw error;
        setSafeZones((prev) => prev.filter((z) => z.id !== zoneId));
      } catch (err) {
        console.error('Failed to delete safe zone:', err);
        alert('Failed to delete safe zone. Please try again.');
      }
    },
    [supabase]
  );

  // Handle acknowledging alert
  const handleAcknowledgeAlert = useCallback(
    async (alertId: string) => {
      try {
        const { error } = await supabase
          .from('location_alerts')
          .update({
            acknowledged: true,
            acknowledged_by: caregiverId,
          })
          .eq('id', alertId);

        if (error) throw error;
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alertId
              ? { ...a, acknowledged: true, acknowledged_by: caregiverId }
              : a
          )
        );
      } catch (err) {
        console.error('Failed to acknowledge alert:', err);
      }
    },
    [caregiverId, supabase]
  );

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Show placeholder if no API key
  if (!apiKey) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-6">Location & Safety</h1>
        <div className="bg-surface-card rounded-xl border border-surface-border p-8 text-center">
          <span className="text-4xl mb-4 block">🗺️</span>
          <p className="text-text-muted mb-2">
            Google Maps API key not configured.
          </p>
          <p className="text-sm text-text-muted">
            Add <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your environment variables.
          </p>
        </div>
      </div>
    );
  }

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <APIProvider apiKey={apiKey}>
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-6">Location & Safety</h1>

        {/* Alert Banner */}
        {unacknowledgedAlerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🚨</span>
              <h2 className="font-semibold text-red-800">
                {unacknowledgedAlerts.length} Unacknowledged Alert
                {unacknowledgedAlerts.length > 1 ? 's' : ''}
              </h2>
            </div>
            <div className="space-y-2">
              {unacknowledgedAlerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between bg-white rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {ALERT_TYPE_ICONS[alert.type]}
                    </span>
                    <div>
                      <p className="font-medium text-text-primary">
                        {ALERT_TYPE_LABELS[alert.type]}
                      </p>
                      <p className="text-sm text-text-muted">
                        {formatDateTime(alert.triggered_at)}
                        {alert.location_label && ` - ${alert.location_label}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                    className="px-3 py-1 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700"
                  >
                    Acknowledge
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2 bg-surface-card rounded-xl border border-surface-border overflow-hidden">
            <div className="p-4 border-b border-surface-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-text-primary">
                    {patientName}&apos;s Location
                  </h2>
                  {latestLocation && (
                    <p className="text-sm text-text-muted">
                      Last updated: {formatDateTime(latestLocation.timestamp)}
                      {latestLocation.location_label && latestLocation.location_label !== 'unknown' && (
                        <> - {latestLocation.location_label}</>
                      )}
                    </p>
                  )}
                  {!latestLocation && (
                    <p className="text-sm text-text-muted">No location data yet</p>
                  )}
                </div>
                {latestLocation && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-text-secondary">Live</span>
                  </div>
                )}
              </div>
            </div>
            <div className="h-[400px]">
              <Map
                defaultCenter={mapCenter}
                defaultZoom={15}
                mapId="memoguard-location-map"
                gestureHandling="greedy"
                disableDefaultUI={false}
              >
                {/* Current location marker */}
                {latestLocation && (
                  <AdvancedMarker
                    position={{
                      lat: latestLocation.latitude,
                      lng: latestLocation.longitude,
                    }}
                    title={`${patientName}'s current location`}
                  >
                    <Pin
                      background="#0D9488"
                      borderColor="#0F766E"
                      glyphColor="#FFFFFF"
                    />
                  </AdvancedMarker>
                )}

                {/* Home marker */}
                {homeLatitude && homeLongitude && (
                  <AdvancedMarker
                    position={{ lat: homeLatitude, lng: homeLongitude }}
                    title="Home"
                  >
                    <div className="bg-white rounded-full p-2 shadow-lg border-2 border-brand-600">
                      <span className="text-lg">🏠</span>
                    </div>
                  </AdvancedMarker>
                )}

                {/* Location history markers */}
                {locationHistory.map((loc, index) => (
                  <AdvancedMarker
                    key={loc.id}
                    position={{ lat: loc.latitude, lng: loc.longitude }}
                    onClick={() => setSelectedHistoryPoint(loc)}
                  >
                    <div
                      className={`w-3 h-3 rounded-full border-2 border-white shadow ${
                        selectedHistoryPoint?.id === loc.id
                          ? 'bg-brand-600'
                          : 'bg-brand-300'
                      }`}
                      title={formatTime(loc.timestamp)}
                    />
                  </AdvancedMarker>
                ))}

                {/* Safe zone circles are drawn via useEffect in SafeZoneCircle */}
              </Map>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Safe Zones Card */}
            <div className="bg-surface-card rounded-xl border border-surface-border p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-text-primary">Safe Zones</h2>
                <button
                  onClick={() => {
                    setEditingZone(null);
                    setIsModalOpen(true);
                  }}
                  className="text-sm px-3 py-1 bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100"
                >
                  + Add Zone
                </button>
              </div>
              {safeZones.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">
                  No safe zones configured yet.
                  <br />
                  Add zones to get alerts when {patientName} leaves.
                </p>
              ) : (
                <div className="space-y-3">
                  {safeZones.map((zone) => (
                    <div
                      key={zone.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-text-primary">{zone.name}</p>
                        <p className="text-xs text-text-muted">
                          {zone.radius_meters}m radius
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingZone(zone);
                            setIsModalOpen(true);
                          }}
                          className="text-text-muted hover:text-text-primary"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteSafeZone(zone.id)}
                          className="text-text-muted hover:text-red-600"
                          title="Delete"
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
            <div className="bg-surface-card rounded-xl border border-surface-border p-4">
              <h2 className="font-semibold text-text-primary mb-4">
                Recent Alerts (24h)
              </h2>
              {alerts.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">
                  No alerts in the last 24 hours. All is well!
                </p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg ${
                        alert.acknowledged ? 'bg-gray-50' : 'bg-amber-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">
                          {ALERT_TYPE_ICONS[alert.type]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary text-sm">
                            {ALERT_TYPE_LABELS[alert.type]}
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
                          <span className="text-xs text-green-600">✓</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location History Timeline */}
            <div className="bg-surface-card rounded-xl border border-surface-border p-4">
              <h2 className="font-semibold text-text-primary mb-4">
                Today&apos;s Timeline
              </h2>
              {locationHistory.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">
                  No location updates recorded today.
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
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                          selectedHistoryPoint?.id === loc.id
                            ? 'bg-brand-50'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedHistoryPoint(loc)}
                      >
                        <span className="text-xs text-text-muted w-16">
                          {formatTime(loc.timestamp)}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-text-primary">
                            {loc.location_label !== 'unknown'
                              ? loc.location_label
                              : 'Location update'}
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
          <div className="mt-6 bg-surface-card rounded-xl border border-surface-border p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏠</span>
              <div>
                <p className="font-medium text-text-primary">Home Address</p>
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
