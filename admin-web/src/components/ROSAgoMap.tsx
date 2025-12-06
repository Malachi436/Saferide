'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl, { Map, Marker, LngLatLike } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// ROSAgo 3D Map Style - Dark Blue/Teal Theme
const ROSAGO_MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  name: 'ROSAgo Dark 3D',
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19,
      paint: {
        'raster-saturation': -0.3,
        'raster-brightness-min': 0.1,
        'raster-brightness-max': 0.7,
        'raster-contrast': 0.1,
      },
    },
  ],
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
};

// Default center: Accra, Ghana
const DEFAULT_CENTER: LngLatLike = [-0.186964, 5.603717];
const DEFAULT_ZOOM = 12;
const DEFAULT_PITCH = 45; // 3D tilt
const DEFAULT_BEARING = -17.6;

interface BusLocation {
  busId?: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  plateNumber?: string;
  driverName?: string;
  timestamp?: string;
}

interface SchoolLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface ROSAgoMapProps {
  busLocations: { [busId: string]: BusLocation };
  schools?: SchoolLocation[];
  selectedBusId?: string;
  onBusSelect?: (busId: string) => void;
  height?: string;
}

// Create custom bus marker element
function createBusMarkerElement(plateNumber?: string, isSelected?: boolean): HTMLElement {
  const container = document.createElement('div');
  container.className = 'rosago-bus-marker';
  container.style.cssText = `
    position: relative;
    width: 40px;
    height: 40px;
    cursor: pointer;
  `;

  // Pulsing ring
  const pulse = document.createElement('div');
  pulse.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
    background: rgba(0, 188, 212, 0.3);
    border-radius: 50%;
    animation: pulse 2s ease-out infinite;
  `;
  container.appendChild(pulse);

  // Bus icon container
  const iconContainer = document.createElement('div');
  iconContainer.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #00BCD4 0%, #00838F 100%);
    border: 3px solid ${isSelected ? '#FFD700' : '#FFFFFF'};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10;
  `;

  // Bus emoji/icon
  const icon = document.createElement('span');
  icon.textContent = '🚌';
  icon.style.cssText = 'font-size: 18px;';
  iconContainer.appendChild(icon);
  container.appendChild(iconContainer);

  // Plate number label
  if (plateNumber) {
    const label = document.createElement('div');
    label.textContent = plateNumber;
    label.style.cssText = `
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: 4px;
      background: rgba(28, 45, 59, 0.9);
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
      white-space: nowrap;
      z-index: 10;
    `;
    container.appendChild(label);
  }

  return container;
}

// Create school marker element
function createSchoolMarkerElement(name: string): HTMLElement {
  const container = document.createElement('div');
  container.style.cssText = `
    position: relative;
    width: 32px;
    height: 32px;
    cursor: pointer;
  `;

  const iconContainer = document.createElement('div');
  iconContainer.style.cssText = `
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #546E7A 0%, #37474F 100%);
    border: 2px solid #FFFFFF;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  `;

  const icon = document.createElement('span');
  icon.textContent = '🏫';
  icon.style.cssText = 'font-size: 16px;';
  iconContainer.appendChild(icon);
  container.appendChild(iconContainer);

  // Name label
  const label = document.createElement('div');
  label.textContent = name;
  label.style.cssText = `
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 4px;
    background: rgba(55, 71, 79, 0.9);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 9px;
    font-weight: 500;
    white-space: nowrap;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
  `;
  container.appendChild(label);

  return container;
}

export function ROSAgoMap({
  busLocations,
  schools = [],
  selectedBusId,
  onBusSelect,
  height = '500px',
}: ROSAgoMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const busMarkers = useRef<{ [busId: string]: Marker }>({});
  const schoolMarkers = useRef<{ [schoolId: string]: Marker }>({});
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: ROSAGO_MAP_STYLE,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: DEFAULT_PITCH,
      bearing: DEFAULT_BEARING,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
      console.log('[ROSAgoMap] Map loaded');
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update bus markers when locations change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const currentBusIds = Object.keys(busLocations);

    // Remove markers for buses no longer in locations
    Object.keys(busMarkers.current).forEach((busId) => {
      if (!currentBusIds.includes(busId)) {
        busMarkers.current[busId].remove();
        delete busMarkers.current[busId];
      }
    });

    // Add or update markers for current buses
    currentBusIds.forEach((busId) => {
      const loc = busLocations[busId];
      const lngLat: LngLatLike = [loc.longitude, loc.latitude];
      const isSelected = busId === selectedBusId;

      if (busMarkers.current[busId]) {
        // Animate marker to new position (smooth transition)
        const marker = busMarkers.current[busId];
        const currentPos = marker.getLngLat();
        const targetPos = { lng: loc.longitude, lat: loc.latitude };

        // Simple interpolation for smooth movement
        animateMarker(marker, currentPos, targetPos);

        // Update marker element if selection changed
        const el = createBusMarkerElement(loc.plateNumber, isSelected);
        el.onclick = () => onBusSelect?.(busId);
        marker.getElement().replaceWith(el);
      } else {
        // Create new marker
        const el = createBusMarkerElement(loc.plateNumber, isSelected);
        el.onclick = () => onBusSelect?.(busId);

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat(lngLat)
          .addTo(map.current!);

        busMarkers.current[busId] = marker;
      }
    });

    // Center on selected bus
    if (selectedBusId && busLocations[selectedBusId]) {
      const loc = busLocations[selectedBusId];
      map.current.flyTo({
        center: [loc.longitude, loc.latitude],
        zoom: 15,
        pitch: 50,
        duration: 1000,
      });
    }
  }, [busLocations, selectedBusId, mapLoaded, onBusSelect]);

  // Add school markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    schools.forEach((school) => {
      if (!schoolMarkers.current[school.id]) {
        const el = createSchoolMarkerElement(school.name);
        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([school.longitude, school.latitude])
          .addTo(map.current!);
        schoolMarkers.current[school.id] = marker;
      }
    });
  }, [schools, mapLoaded]);

  // Animate marker movement (smooth interpolation)
  const animateMarker = useCallback(
    (marker: Marker, from: maplibregl.LngLat, to: { lng: number; lat: number }) => {
      const duration = 500; // ms
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);

        const lng = from.lng + (to.lng - from.lng) * eased;
        const lat = from.lat + (to.lat - from.lat) * eased;

        marker.setLngLat([lng, lat]);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    },
    []
  );

  // Reset camera to show all buses
  const resetCamera = useCallback(() => {
    if (!map.current) return;

    const locations = Object.values(busLocations);
    if (locations.length === 0) {
      map.current.flyTo({
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        pitch: DEFAULT_PITCH,
        bearing: DEFAULT_BEARING,
        duration: 1000,
      });
      return;
    }

    // Fit bounds to all markers
    const bounds = new maplibregl.LngLatBounds();
    locations.forEach((loc) => {
      bounds.extend([loc.longitude, loc.latitude]);
    });

    map.current.fitBounds(bounds, {
      padding: 80,
      maxZoom: 14,
      pitch: DEFAULT_PITCH,
      bearing: DEFAULT_BEARING,
      duration: 1000,
    });
  }, [busLocations]);

  return (
    <div className="relative" style={{ height }}>
      {/* Map Container */}
      <div
        ref={mapContainer}
        className="absolute inset-0 rounded-lg overflow-hidden"
        style={{ background: '#1C2D3B' }}
      />

      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <button
          onClick={resetCamera}
          className="bg-slate-800/90 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg transition flex items-center gap-2"
        >
          <span>🎯</span> Reset View
        </button>
      </div>

      {/* Connection Status */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-slate-800/90 text-white px-3 py-2 rounded-lg text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          {Object.keys(busLocations).length} buses tracking
        </div>
      </div>

      {/* Loading Overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-teal-400 font-medium">Loading ROSAgo Map...</p>
          </div>
        </div>
      )}

      {/* CSS for pulsing animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
        .maplibregl-canvas {
          filter: hue-rotate(-10deg) saturate(0.8);
        }
      ` }} />
    </div>
  );
}
