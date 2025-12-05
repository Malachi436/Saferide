'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { use } from 'react';

interface School {
  id: string;
  name: string;
  address: string;
}

interface GenerationResult {
  message: string;
  summary: {
    totalChildren: number;
    routesCreated: number;
    avgChildrenPerRoute: number;
    busCapacityUsed: number;
  };
  routes: Array<{
    route: {
      id: string;
      name: string;
      schoolId: string;
      stops: Array<{ id: string; name: string; latitude: number; longitude: number; order: number }>;
    };
    childrenCount: number;
    children: Array<{
      id: string;
      firstName: string;
      lastName: string;
      pickupType: string;
      pickupLatitude: number;
      pickupLongitude: number;
      pickupDescription: string;
      parent: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
      };
    }>;  
  }>;
}

export default function AutoGenerateRoutesPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<School[]>(`/admin/company/${companyId}/schools`);
      setSchools(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (schoolId: string, schoolName: string) => {
    if (!window.confirm(`Generate routes for ${schoolName}?`)) return;

    try {
      setGenerating(true);
      const data = await apiClient.post<GenerationResult>(`/routes/auto-generate/${schoolId}`, {});
      setResult(data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate routes');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Auto Generate Routes</h1>
          <p className="text-slate-500 mt-1">Create routes based on child density and bus capacity</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        {!result ? (
          <div className="space-y-4">
            {schools.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <p className="text-slate-500">No schools found</p>
              </div>
            ) : (
              schools.map((school) => (
                <div key={school.id} className="bg-white rounded-lg border border-slate-200 p-6 flex items-center justify-between hover:shadow-md transition">
                  <div>
                    <h3 className="font-semibold text-slate-900">{school.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{school.address}</p>
                  </div>
                  <button
                    onClick={() => handleGenerate(school.id, school.name)}
                    disabled={generating}
                    className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition"
                  >
                    {generating ? 'Generating...' : 'Generate Routes'}
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
              <h2 className="text-lg font-bold text-teal-900 mb-4">Generation Results</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded p-4 border border-teal-100">
                  <p className="text-xs text-slate-600 font-semibold">Routes Created</p>
                  <p className="text-2xl font-bold text-teal-700 mt-1">{result.summary.routesCreated}</p>
                </div>
                <div className="bg-white rounded p-4 border border-teal-100">
                  <p className="text-xs text-slate-600 font-semibold">Total Children</p>
                  <p className="text-2xl font-bold text-teal-700 mt-1">{result.summary.totalChildren}</p>
                </div>
                <div className="bg-white rounded p-4 border border-teal-100">
                  <p className="text-xs text-slate-600 font-semibold">Avg per Route</p>
                  <p className="text-2xl font-bold text-teal-700 mt-1">{result.summary.avgChildrenPerRoute.toFixed(1)}</p>
                </div>
                <div className="bg-white rounded p-4 border border-teal-100">
                  <p className="text-xs text-slate-600 font-semibold">Bus Capacity</p>
                  <p className="text-2xl font-bold text-teal-700 mt-1">{result.summary.busCapacityUsed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                <h3 className="font-semibold text-slate-900">Generated Routes</h3>
              </div>
              <div className="divide-y divide-slate-200">
                {result.routes.map((routeData) => (
                  <div key={routeData.route.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg">{routeData.route.name}</h4>
                        <p className="text-sm text-slate-600 mt-1">👶 {routeData.childrenCount} children assigned</p>
                      </div>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {routeData.route.stops.length} stops
                      </span>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div className="text-sm font-semibold text-slate-700 mb-2">Assigned Children:</div>
                      {routeData.children.map((child) => (
                        <div key={child.id} className="bg-slate-50 rounded p-3 border border-slate-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {child.firstName} {child.lastName}
                              </p>
                              <p className="text-xs text-slate-600 mt-1">
                                👨‍👩‍👧 Parent: {child.parent.firstName} {child.parent.lastName}
                              </p>
                              <p className="text-xs text-slate-600">
                                📧 {child.parent.email}
                              </p>
                              <p className="text-xs text-slate-600">
                                📱 {child.parent.phone || 'N/A'}
                              </p>
                            </div>
                            <div className="text-xs text-slate-600 text-right">
                              <p className="font-semibold">Pickup: {child.pickupType}</p>
                              {child.pickupDescription && (
                                <p className="mt-1">{child.pickupDescription}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-lg transition"
            >
              Generate More Routes
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
