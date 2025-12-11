'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

interface CompanyStats {
  totalSchools: number;
  totalUsers: number;
  totalDrivers: number;
  totalChildren: number;
  totalBuses: number;
  totalRoutes: number;
  totalTrips: number;
}

export default function CompanyOverviewPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { user } = useAuth();
  const { companyId } = use(params);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [companyId]);

  const fetchStats = async () => {
    try {
      const data = await apiClient.get(`/admin/stats/company/${companyId}`);
      setStats(data as CompanyStats);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Schools',
      description: 'Manage schools and locations',
      href: `/company/${companyId}/schools`,
      color: 'bg-purple-50 border-purple-200',
      icon: '🏫',
      stat: stats?.totalSchools || 0,
    },
    {
      title: 'Scheduled Routes',
      description: 'Manage recurring routes and generate daily trips',
      href: `/company/${companyId}/scheduled-routes`,
      color: 'bg-blue-50 border-blue-200',
      icon: '📅',
      stat: stats?.totalRoutes || 0,
    },
    {
      title: 'Buses',
      description: 'Manage buses and capacity',
      href: `/company/${companyId}/buses`,
      color: 'bg-green-50 border-green-200',
      icon: '🚌',
      stat: stats?.totalBuses || 0,
    },
    {
      title: 'Drivers',
      description: 'Manage drivers and assignments',
      href: `/company/${companyId}/drivers`,
      color: 'bg-orange-50 border-orange-200',
      icon: '👤',
      stat: stats?.totalDrivers || 0,
    },
    {
      title: 'Children',
      description: 'View enrolled children and parents',
      href: `/company/${companyId}/children`,
      color: 'bg-pink-50 border-pink-200',
      icon: '👶',
      stat: stats?.totalChildren || 0,
    },
    {
      title: 'Trips',
      description: 'View and manage all trips',
      href: `/company/${companyId}/trips`,
      color: 'bg-teal-50 border-teal-200',
      icon: '🗺️',
      stat: stats?.totalTrips || 0,
    },
    {
      title: 'Analytics',
      description: 'View performance metrics and insights',
      href: `/company/${companyId}/analytics`,
      color: 'bg-indigo-50 border-indigo-200',
      icon: '📊',
      stat: null,
    },
    {
      title: 'Live Dashboard',
      description: 'Monitor active trips in real-time',
      href: `/company/${companyId}/live-dashboard`,
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
          <p className="text-slate-500 mt-1">Manage your company's routes, buses, and drivers</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-slate-600 text-sm font-semibold">Active Routes</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.totalRoutes || 0}</p>
                <p className="text-xs text-slate-500 mt-2">Scheduled routes</p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-slate-600 text-sm font-semibold">Buses</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats?.totalBuses || 0}</p>
                <p className="text-xs text-slate-500 mt-2">Fleet vehicles</p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-slate-600 text-sm font-semibold">Drivers</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats?.totalDrivers || 0}</p>
                <p className="text-xs text-slate-500 mt-2">Active drivers</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <div
                    className={`${action.color} border rounded-lg p-6 hover:shadow-lg transition cursor-pointer h-full`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-4xl">{action.icon}</div>
                      {action.stat !== null && (
                        <div className="bg-white px-3 py-1 rounded-full">
                          <p className="text-lg font-bold text-slate-900">{action.stat}</p>
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
