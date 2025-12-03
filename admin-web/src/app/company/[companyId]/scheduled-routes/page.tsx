'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { use } from 'react';

interface ScheduledRoute {
  id: string;
  routeName: string;
  driverName: string;
  busPlate: string;
  departureTime: string;
  days: string;
  status: string;
}

export default function ScheduledRoutesPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const [routes, setRoutes] = useState<ScheduledRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScheduledRoutes();
  }, []);

  const fetchScheduledRoutes = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<ScheduledRoute[]>('/scheduled-routes');
      setRoutes(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load scheduled routes');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (routeId: string, currentStatus: string) => {
    const endpoint =
      currentStatus === 'ACTIVE'
        ? `/scheduled-routes/${routeId}/suspend`
        : `/scheduled-routes/${routeId}/activate`;

    try {
      await apiClient.put(endpoint, {});
      await fetchScheduledRoutes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleGenerateTodayTrips = async () => {
    try {
      const result = await apiClient.post('/trips/generate-today', {});
      alert(`Success! Generated trips for today`);
      await fetchScheduledRoutes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate trips');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Scheduled Routes</h1>
            <p className="text-slate-500 mt-1">Manage recurring routes and generate daily trips</p>
          </div>
          <button
            onClick={handleGenerateTodayTrips}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            📅 Generate Today's Trips
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        {routes.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-500">No scheduled routes yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Route Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Driver</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Bus</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Days</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr key={route.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{route.routeName}</td>
                    <td className="px-6 py-4 text-slate-600">{route.driverName}</td>
                    <td className="px-6 py-4 text-slate-600">{route.busPlate}</td>
                    <td className="px-6 py-4 text-slate-600">{route.departureTime}</td>
                    <td className="px-6 py-4 text-slate-600">{route.days}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          route.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {route.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(route.id, route.status)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition ${
                          route.status === 'ACTIVE'
                            ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                            : 'bg-green-100 hover:bg-green-200 text-green-800'
                        }`}
                      >
                        {route.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
