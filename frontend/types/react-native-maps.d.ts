declare module 'react-native-maps' {
  import * as React from 'react';
  import { ViewProps } from 'react-native';
  
  export const PROVIDER_GOOGLE: string;
  export const PROVIDER_DEFAULT: string;
  
  export interface MarkerProps extends ViewProps {
    children?: React.ReactNode;
    coordinate: { latitude: number; longitude: number };
    title?: string;
    description?: string;
    onPress?: () => void;
  }
  
  export const Marker: React.ComponentType<MarkerProps>;
  
  export interface MapViewProps extends ViewProps {
    children?: React.ReactNode;
    initialRegion?: {
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    };
    region?: {
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    };
    onRegionChange?: (region: any) => void;
    onRegionChangeComplete?: (region: any) => void;
    showsUserLocation?: boolean;
    followsUserLocation?: boolean;
    showsMyLocationButton?: boolean;
    showsCompass?: boolean;
    showsPointsOfInterest?: boolean;
    showsBuildings?: boolean;
    showsTraffic?: boolean;
    showsIndoors?: boolean;
    showsIndoorLevelPicker?: boolean;
    mapType?: 'standard' | 'satellite' | 'hybrid' | 'terrain' | 'none';
    userLocationAnnotationTitle?: string;
    userLocationPriority?: 'balanced' | 'high' | 'low' | 'passive';
    userLocationUpdateInterval?: number;
    userInterfaceStyle?: 'light' | 'dark';
    legalLabelInsets?: { top: number; left: number; bottom: number; right: number };
    onUserLocationChange?: (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => void;
    onPress?: (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => void;
    onLongPress?: (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => void;
    onMarkerPress?: (event: { nativeEvent: { action: string; id: string } }) => void;
    provider?: string;
  }
  
  export const MapView: React.ComponentType<MapViewProps>;
  
  export interface PolylineProps extends ViewProps {
    coordinates: Array<{ latitude: number; longitude: number }>;
    strokeColor?: string;
    strokeWidth?: number;
    lineCap?: 'butt' | 'round' | 'square';
    lineJoin?: 'miter' | 'round' | 'bevel';
    miterLimit?: number;
    geodesic?: boolean;
    lineDashPhase?: number;
    lineDashPattern?: number[];
  }
  
  export const Polyline: React.ComponentType<PolylineProps>;
  
  export default MapView;
}