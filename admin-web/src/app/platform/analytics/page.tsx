'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';

interface PlatformStats {
  totalCompanies: number;
  totalSchools: number;
  totalUsers: number;
  totalDrivers: number;
  totalChildren: number;
  totalBuses: number;
  totalRoutes: number;
  totalTrips: number;
}

export default function PlatformAnalyticsPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<PlatformStats>('/admin/stats');
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Platform Analytics</h1>
          <p className="text-slate-500 mt-1">System-wide performance and insights</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading analytics...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-slate-600 text-sm font-semibold">Total Companies</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.totalCompanies || 0}</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-slate-600 text-sm font-semibold">Total Schools</p>
                <p className="text-3xl font-bold text-teal-600 mt-2">{stats?.totalSchools || 0}</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-slate-600 text-sm font-semibold">Total Users</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats?.totalUsers || 0}</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-slate-600 text-sm font-semibold">Total Drivers</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats?.totalDrivers || 0}</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-slate-600 text-sm font-semibold">Total Children</p>
                <p className="text-3xl font-bold text-pink-600 mt-2">{stats?.totalChildren || 0}</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-slate-600 text-sm font-semibold">Total Buses</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats?.totalBuses || 0}</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-slate-600 text-sm font-semibold">Total Routes</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{stats?.totalRoutes || 0}</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-slate-600 text-sm font-semibold">Total Trips</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.totalTrips || 0}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-200 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">System Health</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Active Companies</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.totalCompanies || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Fleet Size</p>
                  <p className="text-2xl font-bold text-blue-600">{stats?.totalBuses || 0} buses</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Routes</p>
                  <p className="text-2xl font-bold text-purple-600">{stats?.totalRoutes || 0}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
