'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { use } from 'react';

export default function CompanyAnalyticsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  use(params);

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 mt-1">View company performance metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Route Performance</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">–</p>
            <p className="text-xs text-slate-500 mt-2">Coming soon</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Trip Success Rate</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">–</p>
            <p className="text-xs text-slate-500 mt-2">Coming soon</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Missed Pickups</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">–</p>
            <p className="text-xs text-slate-500 mt-2">Coming soon</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Fleet Utilization</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">–</p>
            <p className="text-xs text-slate-500 mt-2">Coming soon</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <p className="text-slate-500">Detailed analytics coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
