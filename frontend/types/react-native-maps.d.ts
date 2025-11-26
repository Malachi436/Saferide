declare module "react-native-maps" {
  import { ComponentType, ReactNode } from "react";
  import { ViewProps } from "react-native";

  export const PROVIDER_GOOGLE: string;
  export const PROVIDER_DEFAULT: string;

  export interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }

  export interface MapViewProps extends ViewProps {
    provider?: string;
    region?: Region;
    initialRegion?: Region;
    onPress?: (event: any) => void;
    onLongPress?: (event: any) => void;
    onRegionChange?: (region: Region) => void;
    onRegionChangeComplete?: (region: Region) => void;
    showsUserLocation?: boolean;
    followsUserLocation?: boolean;
    showsMyLocationButton?: boolean;
    showsPointsOfInterest?: boolean;
    showsCompass?: boolean;
    zoomEnabled?: boolean;
    rotateEnabled?: boolean;
    scrollEnabled?: boolean;
    pitchEnabled?: boolean;
    toolbarEnabled?: boolean;
    moveOnMarkerPress?: boolean;
    showsScale?: boolean;
    showsBuildings?: boolean;
    showsTraffic?: boolean;
    showsIndoors?: boolean;
    showsIndoorLevelPicker?: boolean;
    mapType?: string;
    region?: Region;
    liteMode?: boolean;
    maxDelta?: number;
    minDelta?: number;
    legalLabelInsets?: any;
    compassOffset?: { x: number; y: number };
    tintColor?: string;
    onUserLocationChange?: (event: any) => void;
    zoomTapEnabled?: boolean;
    zoomControlEnabled?: boolean;
    onPoiClick?: (event: any) => void;
    onMarkerPress?: (event: any) => void;
    onCalloutPress?: (event: any) => void;
    onPanDrag?: (event: any) => void;
    onDoublePress?: (event: any) => void;
    onMarkerSelect?: (event: any) => void;
    onMarkerDeselect?: (event: any) => void;
    clustering?: boolean;
    clusterColor?: string;
    clusterTextColor?: string;
    clusterBorderColor?: string;
    clusterBorderWidth?: number;
    clusterSize?: number;
    clusterFontFamily?: string;
    clusterFontSize?: number;
    clusterFontWeight?: string;
    clusterFontStyle?: any;
    clusterTextShadowColor?: string;
    clusterTextShadowOffset?: { width: number; height: number };
    clusterTextShadowRadius?: number;
    clusterTextTransform?: string;
    clusterTextDecorationLine?: string;
    clusterTextDecorationStyle?: string;
    clusterTextDecorationColor?: string;
    clusterTextAlign?: string;
    clusterTextAlignVertical?: string;
    clusterIncludeFontPadding?: boolean;
    clusterTextBreakStrategy?: string;
    children?: ReactNode;
  }

  // MapView is the default export
  const MapView: React.ComponentType<MapViewProps>;
  export default MapView;

  export interface MarkerProps extends ViewProps {
    identifier?: string;
    reuseIdentifier?: string;
    title?: string;
    description?: string;
    image?: any;
    icon?: any;
    opacity?: number;
    pinColor?: string;
    coordinate: { latitude: number; longitude: number };
    centerOffset?: { x: number; y: number };
    calloutOffset?: { x: number; y: number };
    anchor?: { x: number; y: number };
    calloutAnchor?: { x: number; y: number };
    flat?: boolean;
    draggable?: boolean;
    tracksViewChanges?: boolean;
    tracksInfoWindowChanges?: boolean;
    stopPropagation?: boolean;
    onPress?: (event: any) => void;
    onSelect?: (event: any) => void;
    onDeselect?: (event: any) => void;
    onCalloutPress?: (event: any) => void;
    onDragStart?: (event: any) => void;
    onDrag?: (event: any) => void;
    onDragEnd?: (event: any) => void;
  }

  export class Marker extends React.Component<MarkerProps> {}
}