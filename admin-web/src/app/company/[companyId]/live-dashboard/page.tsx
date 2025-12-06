'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { ROSAgoMap } from '@/components/ROSAgoMap';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect, use, useMemo } from 'react';

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
  plateNumber?: string;
  driverName?: string;
}

interface School {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

export default function LiveDashboardPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const { token } = useAuth();
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [restLocations, setRestLocations] = useState<{ [busId: string]: Location }>({});
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);

  // Get bus IDs for socket subscription
  const busIds = useMemo(() => activeTrips.map((t) => t.bus.id), [activeTrips]);

  // Real-time socket connection
  const { connected, busLocations: socketLocations } = useSocket({
    token: token || undefined,
    companyId,
    busIds,
  });

  // Merge REST locations with socket locations (socket takes priority)
  const mergedLocations = useMemo(() => {
    const merged: { [busId: string]: Location } = { ...restLocations };
    
    // Override with socket locations
    Object.entries(socketLocations).forEach(([busId, loc]) => {
      const trip = activeTrips.find((t) => t.bus.id === busId);
      merged[busId] = {
        latitude: loc.latitude,
        longitude: loc.longitude,
        timestamp: loc.timestamp,
        plateNumber: trip?.bus.plateNumber,
        driverName: trip ? `${trip.bus.driver.user.firstName} ${trip.bus.driver.user.lastName}` : undefined,
      };
    });

    // Add plate numbers to REST locations
    Object.keys(merged).forEach((busId) => {
      const trip = activeTrips.find((t) => t.bus.id === busId);
      if (trip && !merged[busId].plateNumber) {
        merged[busId].plateNumber = trip.bus.plateNumber;
        merged[busId].driverName = `${trip.bus.driver.user.firstName} ${trip.bus.driver.user.lastName}`;
      }
    });

    return merged;
  }, [restLocations, socketLocations, activeTrips]);

  useEffect(() => {
    fetchActiveTrips();
    fetchSchools();
    
    // Fallback polling when socket is disconnected
    const interval = setInterval(() => {
      if (!connected) {
        fetchActiveTrips();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [companyId, connected]);

  const fetchSchools = async () => {
    try {
      const response = await apiClient.get(`/admin/company/${companyId}/schools`);
      const schoolsData = Array.isArray(response) ? response : [];
      setSchools(schoolsData);
    } catch (err) {
      console.log('Failed to load schools');
    }
  };

  const fetchActiveTrips = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/trips/company/${companyId}/active`);
      const trips = Array.isArray(response) ? response : [];
      setActiveTrips(trips);

      // Fetch latest location for each bus (REST fallback)
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
              plateNumber: trip.bus.plateNumber,
              driverName: `${trip.bus.driver.user.firstName} ${trip.bus.driver.user.lastName}`,
            };
          }
        } catch (err) {
          console.log(`No location for bus ${trip.bus.id}`);
        }
      }
      setRestLocations(locationsMap);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load active trips');
      console.error('Error loading trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedBus = selectedBusId ? activeTrips.find((t) => t.bus.id === selectedBusId)?.bus : null;

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Active Trips</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{activeTrips.length}</p>
            <p className="text-xs text-slate-500 mt-2">Currently in progress</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Buses Tracking</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {Object.keys(mergedLocations).length}
            </p>
            <p className="text-xs text-slate-500 mt-2">Live GPS signals</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Connection</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              <p className={`text-lg font-bold ${connected ? 'text-green-600' : 'text-red-600'}`}>
                {connected ? 'Live' : 'Polling'}
              </p>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {connected ? 'WebSocket connected' : 'REST fallback active'}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Last Update</p>
            <p className="text-xl font-bold text-slate-900 mt-2">
              {new Date().toLocaleTimeString()}
            </p>
            <p className="text-xs text-slate-500 mt-2">Auto-refresh</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <ROSAgoMap
                busLocations={mergedLocations}
                schools={schools.filter((s) => s.latitude && s.longitude).map((s) => ({
                  id: s.id,
                  name: s.name,
                  latitude: s.latitude!,
                  longitude: s.longitude!,
                }))}
                selectedBusId={selectedBusId || undefined}
                onBusSelect={(busId) => setSelectedBusId(busId)}
                height="500px"
              />
            </div>
          </div>

          {/* Trips List */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col" style={{ maxHeight: '500px' }}>
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
                    const loc = mergedLocations[trip.bus.id];
                    const isSelected = trip.bus.id === selectedBusId;
                    return (
                      <div
                        key={trip.id}
                        className={`p-4 hover:bg-slate-50 cursor-pointer transition ${
                          isSelected ? 'bg-teal-50 border-l-4 border-teal-500' : ''
                        }`}
                        onClick={() => setSelectedBusId(isSelected ? null : trip.bus.id)}
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
                onClick={() => setSelectedBusId(null)}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {mergedLocations[selectedBus.id] && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 font-semibold">Latitude</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {mergedLocations[selectedBus.id].latitude.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-semibold">Longitude</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {mergedLocations[selectedBus.id].longitude.toFixed(6)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-600 font-semibold">Last Update</p>
                  <p className="text-sm text-slate-900 mt-1">
                    {new Date(mergedLocations[selectedBus.id].timestamp).toLocaleString()}
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
