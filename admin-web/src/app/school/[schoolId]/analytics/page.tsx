'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';
import { use, useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  trips: {
    total: number;
    completed: number;
    inProgress: number;
    completionRate: number;
  };
  children: {
    total: number;
    active: number;
  };
  payments: {
    total: number;
    successful: number;
    successRate: number;
  };
  attendance: {
    missedPickups: number;
    rate: number;
  };
  performance: {
    onTimeTrips: number;
    tripCompletionRate: number;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

type DateRange = 'daily' | 'weekly' | 'monthly';

export default function CompanyAnalyticsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('weekly');

  useEffect(() => {
    fetchAnalytics();
  }, [companyId, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/company/${companyId}/analytics?range=${dateRange}`);
      if (response && typeof response === 'object') {
        setAnalytics(response as AnalyticsData);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load analytics');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !analytics) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || 'No analytics data available'}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const tripStatusData = [
    { name: 'Completed', value: analytics.trips.completed },
    { name: 'In Progress', value: analytics.trips.inProgress },
    { name: 'Pending', value: analytics.trips.total - analytics.trips.completed - analytics.trips.inProgress },
  ];

  const performanceData = [
    { name: 'Trip Completion', rate: analytics.trips.completionRate },
    { name: 'Payment Success', rate: analytics.payments.successRate },
    { name: 'Attendance Rate', rate: analytics.attendance.rate },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-500 mt-1">View company performance metrics and insights</p>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-slate-900 mb-4">Select Time Period</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setDateRange('daily')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                dateRange === 'daily'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <div className="text-center">
                <div className="text-lg">📅</div>
                <div className="mt-1">Daily</div>
                <div className="text-xs opacity-75">Last 24 hours</div>
              </div>
            </button>
            <button
              onClick={() => setDateRange('weekly')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                dateRange === 'weekly'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <div className="text-center">
                <div className="text-lg">📆</div>
                <div className="mt-1">Weekly</div>
                <div className="text-xs opacity-75">Last 7 days</div>
              </div>
            </button>
            <button
              onClick={() => setDateRange('monthly')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                dateRange === 'monthly'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <div className="text-center">
                <div className="text-lg">🗓️</div>
                <div className="mt-1">Monthly</div>
                <div className="text-xs opacity-75">Last 30 days</div>
              </div>
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            <strong>Showing:</strong> {dateRange === 'daily' ? 'Last 24 hours' : dateRange === 'weekly' ? 'Last 7 days' : 'Last 30 days (4 weeks)'} analytics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Trip Completion Rate</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {analytics.trips.completionRate.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {analytics.trips.completed} / {analytics.trips.total} trips
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Payment Success Rate</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {analytics.payments.successRate.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {analytics.payments.successful} / {analytics.payments.total} payments
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Missed Pickups</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {analytics.attendance.missedPickups}
            </p>
            <p className="text-xs text-slate-500 mt-2">{dateRange === 'daily' ? 'Last 24h' : dateRange === 'weekly' ? 'Last 7 days' : 'Last 30 days'}</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Attendance Rate</p>
            <p className="text-3xl font-bold text-teal-600 mt-2">
              {analytics.attendance.rate.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {analytics.children.total} children enrolled
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trip Status Distribution */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Trip Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tripStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tripStatusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Performance Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                <Bar dataKey="rate" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Activity Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-slate-600 font-semibold">Total Trips</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{analytics.trips.total}</p>
              <p className="text-xs text-slate-500 mt-1">
                {analytics.trips.inProgress} currently in progress
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-slate-600 font-semibold">Active Children</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{analytics.children.active}</p>
              <p className="text-xs text-slate-500 mt-1">
                {analytics.children.total} total enrolled
              </p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <p className="text-sm text-slate-600 font-semibold">On-Time Trips</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{analytics.performance.onTimeTrips}</p>
              <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
