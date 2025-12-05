'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect, use } from 'react';

interface Bus {
  id: string;
  plateNumber: string;
  driver: { id: string; user: { firstName: string; lastName: string } };
}

interface Trip {
  id: string;
  bus: Bus;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  startTime: string;
}

interface Location {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export default function LiveDashboardPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [locations, setLocations] = useState<{ [busId: string]: Location }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchActiveTrips();
    const interval = setInterval(() => {
      fetchActiveTrips();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [companyId]);

  const fetchActiveTrips = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/trips/company/${companyId}/active`);
      const trips = Array.isArray(response) ? response : [];
      setActiveTrips(trips);

      // Fetch latest location for each bus
      const locationsMap: { [key: string]: Location } = {};
      for (const trip of trips) {
        try {
          const locationResponse = await apiClient.get(
            `/gps/location/${trip.bus.id}`
          ) as { latitude: number; longitude: number };
          if (locationResponse) {
            locationsMap[trip.bus.id] = {
              latitude: locationResponse.latitude,
              longitude: locationResponse.longitude,
              timestamp: new Date().toISOString(),
            };
          }
        } catch (err) {
          console.log(`No location for bus ${trip.bus.id}`);
        }
      }
      setLocations(locationsMap);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load active trips');
      console.error('Error loading trips:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Live Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Monitor active routes and moving vehicles in real-time
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Active Trips</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{activeTrips.length}</p>
            <p className="text-xs text-slate-500 mt-2">Currently in progress</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Buses Moving</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {Object.keys(locations).length}
            </p>
            <p className="text-xs text-slate-500 mt-2">Tracked locations</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Last Update</p>
            <p className="text-xl font-bold text-slate-900 mt-2">
              {new Date().toLocaleTimeString()}
            </p>
            <p className="text-xs text-slate-500 mt-2">Auto-refresh every 10s</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Placeholder */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 h-96 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-slate-500 text-lg font-semibold mb-2">📍 Live Map View</p>
                  <p className="text-slate-400 text-sm">
                    Integration with mapping service coming soon
                  </p>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg inline-block">
                    <p className="text-sm text-slate-600">
                      <strong>Active Trips Coordinates:</strong>
                    </p>
                    {activeTrips.length === 0 ? (
                      <p className="text-xs text-slate-500 mt-2">No active trips</p>
                    ) : (
                      <ul className="text-xs text-slate-600 mt-2 space-y-1">
                        {activeTrips.map((trip) => {
                          const loc = locations[trip.bus.id];
                          return (
                            <li key={trip.id}>
                              {trip.bus.plateNumber}:{' '}
                              {loc
                                ? `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`
                                : 'No location'}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trips List */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
            <div className="border-b border-slate-200 p-4">
              <h3 className="font-bold text-slate-900">Active Routes</h3>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading && activeTrips.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  <p>Loading...</p>
                </div>
              ) : activeTrips.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  <p>No active trips</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {activeTrips.map((trip) => {
                    const loc = locations[trip.bus.id];
                    return (
                      <div
                        key={trip.id}
                        className="p-4 hover:bg-slate-50 cursor-pointer transition"
                        onClick={() => setSelectedBus(trip.bus)}
                      >
                        <p className="font-semibold text-slate-900 text-sm">
                          🚌 {trip.bus.plateNumber}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          Driver: {trip.bus.driver.user.firstName}{' '}
                          {trip.bus.driver.user.lastName}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              loc ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                            }`}
                          ></span>
                          <p className="text-xs text-slate-500">
                            {loc
                              ? `📍 ${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`
                              : 'No GPS'}
                          </p>
                        </div>
                        <div className="mt-2">
                          <span
                            className={`inline-block text-xs font-semibold px-2 py-1 rounded ${
                              trip.status === 'IN_PROGRESS'
                                ? 'bg-green-100 text-green-800'
                                : trip.status === 'SCHEDULED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {trip.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Bus Details */}
        {selectedBus && (
          <div className="mt-6 bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Bus {selectedBus.plateNumber}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Driver: {selectedBus.driver.user.firstName}{' '}
                  {selectedBus.driver.user.lastName}
                </p>
              </div>
              <button
                onClick={() => setSelectedBus(null)}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {locations[selectedBus.id] && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 font-semibold">Latitude</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {locations[selectedBus.id].latitude.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-semibold">Longitude</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {locations[selectedBus.id].longitude.toFixed(6)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-600 font-semibold">Last Update</p>
                  <p className="text-sm text-slate-900 mt-1">
                    {new Date(locations[selectedBus.id].timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
