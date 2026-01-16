'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

interface SchoolStats {
  totalBuses: number;
  activeBuses: number;
  totalDrivers: number;
  totalStudents: number;
  busesOnline: number;
  busesOffline: number;
  morningTrips: number;
  afternoonTrips: number;
}

export default function SchoolOverviewPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { user } = useAuth();
  const { schoolId } = use(params);
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [schoolId]);

  const fetchStats = async () => {
    try {
      const data = await apiClient.get(`/admin/stats/company/${schoolId}`);
      setStats(data as SchoolStats);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Students',
      description: 'Manage enrolled students',
      href: `/school/${schoolId}/children`,
      color: 'bg-yellow-50 border-yellow-300',
      icon: '👶',
      stat: stats?.totalStudents || 0,
    },
    {
      title: 'Drivers',
      description: 'Manage drivers and assignments',
      href: `/school/${schoolId}/drivers`,
      color: 'bg-orange-50 border-orange-300',
      icon: '👤',
      stat: stats?.totalDrivers || 0,
    },
    {
      title: 'Buses',
      description: 'Manage fleet vehicles',
      href: `/school/${schoolId}/buses`,
      color: 'bg-green-50 border-green-300',
      icon: '🚌',
      stat: stats?.totalBuses || 0,
    },
    {
      title: 'Live Dashboard',
      description: 'Monitor active trips',
      href: `/school/${schoolId}/live-dashboard`,
      color: 'bg-red-50 border-red-200',
      icon: '📡',
      stat: null,
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.firstName}!</h1>
          <p className="text-slate-500 mt-1">School Dashboard - Manage students, buses, and drivers</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border-2 border-slate-200 p-6 shadow-md">
                <p className="text-slate-600 text-sm font-semibold">Total Buses</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats?.totalBuses || 0}</p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-xl border-2 border-slate-200 p-6 shadow-md">
                <p className="text-slate-600 text-sm font-semibold">Active Buses</p>
                <p className="text-3xl font-bold text-yellow-500 mt-2">{stats?.activeBuses || 0}</p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-xl border-2 border-slate-200 p-6 shadow-md">
                <p className="text-slate-600 text-sm font-semibold">Drivers</p>
                <p className="text-3xl font-bold text-orange-500 mt-2">{stats?.totalDrivers || 0}</p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-xl border-2 border-slate-200 p-6 shadow-md">
                <p className="text-slate-600 text-sm font-semibold">Students</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.totalStudents || 0}</p>
              </div>
            </div>

            {/* Online/Offline Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border-2 border-green-200 p-6 shadow-md">
                <p className="text-slate-600 text-sm font-semibold">Buses Online</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats?.busesOnline || 0}</p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-xl border-2 border-red-200 p-6 shadow-md">
                <p className="text-slate-600 text-sm font-semibold">Buses Offline</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats?.busesOffline || 0}</p>
              </div>
            </div>

            {/* Today's Trips */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border-2 border-slate-200 p-6 shadow-md mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Today's Trip Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-600 text-sm font-semibold">Morning Trips</p>
                  <p className="text-2xl font-bold text-orange-500 mt-1">{stats?.morningTrips || 0}</p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm font-semibold">Afternoon Trips</p>
                  <p className="text-2xl font-bold text-blue-500 mt-1">{stats?.afternoonTrips || 0}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <div
                    className={`${action.color} border-2 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all cursor-pointer h-full`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-4xl">{action.icon}</div>
                      {action.stat !== null && (
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full shadow-md">
                          <p className="text-lg font-bold">{action.stat}</p>
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">{action.title}</h3>
                    <p className="text-slate-600 text-sm mt-2">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
