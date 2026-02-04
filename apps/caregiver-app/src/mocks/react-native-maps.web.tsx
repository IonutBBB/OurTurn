// Web mock for react-native-maps
// This package only works on native iOS/Android, so we provide a simple web fallback

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = undefined;

interface MapViewProps {
  style?: object;
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  children?: React.ReactNode;
  [key: string]: unknown;
}

interface MarkerProps {
  coordinate?: { latitude: number; longitude: number };
  title?: string;
  description?: string;
  pinColor?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

interface CircleProps {
  center?: { latitude: number; longitude: number };
  radius?: number;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  [key: string]: unknown;
}

const MapView: React.FC<MapViewProps> = ({ style, region, children }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.icon}>🗺️</Text>
        <Text style={styles.title}>Map View</Text>
        {region && (
          <Text style={styles.coords}>
            {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
          </Text>
        )}
        <Text style={styles.hint}>Maps are only available on mobile devices</Text>
      </View>
      {/* Render children but hidden - preserves component tree */}
      <View style={styles.hidden}>{children}</View>
    </View>
  );
};

export const Marker: React.FC<MarkerProps> = ({ children }) => {
  return <View style={styles.hidden}>{children}</View>;
};

export const Circle: React.FC<CircleProps> = () => {
  return null;
};

export const Polygon = () => null;
export const Polyline = () => null;
export const Callout = ({ children }: { children?: React.ReactNode }) => (
  <View>{children}</View>
);
export const CalloutSubview = ({ children }: { children?: React.ReactNode }) => (
  <View>{children}</View>
);
export const Overlay = () => null;
export const Heatmap = () => null;
export const Geojson = () => null;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  coords: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  hidden: {
    display: 'none',
  },
});

export default MapView;
