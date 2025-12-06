'use client';

import dynamic from 'next/dynamic';

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

// Dynamically import the map component to avoid SSR issues with MapLibre
const ROSAgoMapDynamic = dynamic<ROSAgoMapProps>(
  () => import('./ROSAgoMapClient').then((mod) => mod.ROSAgoMapClient),
  {
    ssr: false,
    loading: () => (
      <div 
        className="flex items-center justify-center rounded-lg"
        style={{ height: '500px', background: '#1C2D3B' }}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-teal-400 font-medium">Loading ROSAgo Map...</p>
        </div>
      </div>
    ),
  }
);

export function ROSAgoMap(props: ROSAgoMapProps) {
  return <ROSAgoMapDynamic {...props} />;
}
