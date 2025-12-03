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
  routesCreated: number;
  totalChildren: number;
  avgChildrenPerRoute: number;
  busCapacity: number;
  routes: Array<{
    name: string;
    childrenCount: number;
    stopsCount: number;
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
      const data = await apiClient.get<School[]>('/schools');
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
                  <p className="text-2xl font-bold text-teal-700 mt-1">{result.routesCreated}</p>
                </div>
                <div className="bg-white rounded p-4 border border-teal-100">
                  <p className="text-xs text-slate-600 font-semibold">Total Children</p>
                  <p className="text-2xl font-bold text-teal-700 mt-1">{result.totalChildren}</p>
                </div>
                <div className="bg-white rounded p-4 border border-teal-100">
                  <p className="text-xs text-slate-600 font-semibold">Avg per Route</p>
                  <p className="text-2xl font-bold text-teal-700 mt-1">{result.avgChildrenPerRoute.toFixed(1)}</p>
                </div>
                <div className="bg-white rounded p-4 border border-teal-100">
                  <p className="text-xs text-slate-600 font-semibold">Bus Capacity</p>
                  <p className="text-2xl font-bold text-teal-700 mt-1">{result.busCapacity}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                <h3 className="font-semibold text-slate-900">Generated Routes</h3>
              </div>
              <div className="space-y-3 p-6">
                {result.routes.map((route, idx) => (
                  <div key={idx} className="border border-slate-200 rounded p-4 hover:bg-slate-50 transition">
                    <h4 className="font-semibold text-slate-900">{route.name}</h4>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                      <p className="text-slate-600">👶 Children: <span className="font-semibold">{route.childrenCount}</span></p>
                      <p className="text-slate-600">📍 Stops: <span className="font-semibold">{route.stopsCount}</span></p>
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
