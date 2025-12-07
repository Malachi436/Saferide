'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl, { Map, Marker, LngLatLike } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// MapTiler Streets - Light/Day theme
const MAPTILER_API_KEY = 'WxKZoH3RuRCv70oW6hWr';
const ROSAGO_MAP_STYLE = `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_API_KEY}`;
// Default center: Accra, Ghana
const DEFAULT_CENTER: LngLatLike = [-0.186964, 5.603717];
const DEFAULT_ZOOM = 12;
const DEFAULT_PITCH = 45;
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

interface ROSAgoMapClientProps {
  busLocations: { [busId: string]: BusLocation };
  schools?: SchoolLocation[];
  selectedBusId?: string;
  onBusSelect?: (busId: string) => void;
  height?: string;
}

function createBusMarkerElement(plateNumber?: string, isSelected?: boolean): HTMLElement {
  const container = document.createElement('div');
  container.className = 'rosago-bus-marker';
  container.style.cssText = `
    position: relative;
    width: 40px;
    height: 40px;
    cursor: pointer;
  `;

  const pulse = document.createElement('div');
  pulse.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
    background: rgba(255, 152, 0, 0.3);
    border-radius: 50%;
    animation: pulse 1.5s ease-out infinite;
  `;
  container.appendChild(pulse);

  const iconContainer = document.createElement('div');
  iconContainer.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
    border: 3px solid ${isSelected ? '#FFD700' : '#FFFFFF'};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(255, 152, 0, 0.5);
    z-index: 10;
  `;

  const icon = document.createElement('span');
  icon.textContent = '🚌';
  icon.style.cssText = 'font-size: 18px;';
  iconContainer.appendChild(icon);
  container.appendChild(iconContainer);

  if (plateNumber) {
    const label = document.createElement('div');
    label.textContent = plateNumber;
    label.style.cssText = `
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: 4px;
      background: rgba(255, 152, 0, 0.95);
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

export function ROSAgoMapClient({
  busLocations,
  schools = [],
  selectedBusId,
  onBusSelect,
  height = '500px',
}: ROSAgoMapClientProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const busMarkers = useRef<{ [busId: string]: Marker }>({});
  const schoolMarkers = useRef<{ [schoolId: string]: Marker }>({});
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    console.log('[ROSAgoMap] Initializing map...');

    try {
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
        console.log('[ROSAgoMap] Map loaded successfully');
      });

      map.current.on('error', (e) => {
        console.error('[ROSAgoMap] Map error:', e);
      });

      // Force resize after mount
      setTimeout(() => {
        map.current?.resize();
        console.log('[ROSAgoMap] Map resized');
      }, 100);
    } catch (err) {
      console.error('[ROSAgoMap] Failed to create map:', err);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const currentBusIds = Object.keys(busLocations);

    Object.keys(busMarkers.current).forEach((busId) => {
      if (!currentBusIds.includes(busId)) {
        busMarkers.current[busId].remove();
        delete busMarkers.current[busId];
      }
    });

    currentBusIds.forEach((busId) => {
      const loc = busLocations[busId];
      const lngLat: LngLatLike = [loc.longitude, loc.latitude];
      const isSelected = busId === selectedBusId;

      if (busMarkers.current[busId]) {
        const marker = busMarkers.current[busId];
        const currentPos = marker.getLngLat();
        const targetPos = { lng: loc.longitude, lat: loc.latitude };
        animateMarker(marker, currentPos, targetPos);
      } else {
        const el = createBusMarkerElement(loc.plateNumber, isSelected);
        el.onclick = () => onBusSelect?.(busId);

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat(lngLat)
          .addTo(map.current!);

        busMarkers.current[busId] = marker;
      }
    });

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

  const animateMarker = useCallback(
    (marker: Marker, from: maplibregl.LngLat, to: { lng: number; lat: number }) => {
      const duration = 500;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
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
    <div className="relative w-full" style={{ height, minHeight: '400px' }}>
      <div
        ref={mapContainer}
        className="absolute inset-0 rounded-lg overflow-hidden"
        style={{ background: '#0d1117', width: '100%', height: '100%' }}
      />

      <div className="absolute top-4 left-4 z-10 space-y-2">
        <button
          onClick={resetCamera}
          className="bg-slate-800/90 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg transition flex items-center gap-2"
        >
          <span>🎯</span> Reset View
        </button>
      </div>

      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-slate-800/90 text-white px-3 py-2 rounded-lg text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          {Object.keys(busLocations).length} buses tracking
        </div>
      </div>

      {!mapLoaded && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-teal-400 font-medium">Loading ROSAgo Map...</p>
          </div>
        </div>
      )}

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
        .maplibregl-map {
          width: 100% !important;
          height: 100% !important;
        }
        .maplibregl-canvas-container {
          width: 100% !important;
          height: 100% !important;
        }
      ` }} />
    </div>
  );
}
