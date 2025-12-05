'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { use } from 'react';

export default function CompanyOverviewPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { user } = useAuth();
  const { companyId } = use(params);

  const quickActions = [
    {
      title: 'Live Dashboard',
      description: 'Monitor active routes and vehicle locations in real-time',
      href: `/company/${companyId}/live-dashboard`,
      color: 'bg-red-50 border-red-200',
      icon: '🗺️',
    },
    {
      title: 'Scheduled Routes',
      description: 'Manage recurring routes and generate daily trips',
      href: `/company/${companyId}/scheduled-routes`,
      color: 'bg-blue-50 border-blue-200',
      icon: '📅',
    },
    {
      title: 'Auto Generate Routes',
      description: 'Create routes based on child density and bus capacity',
      href: `/company/${companyId}/auto-generate-routes`,
      color: 'bg-teal-50 border-teal-200',
      icon: '🚏',
    },
    {
      title: 'Buses',
      description: 'Manage buses and capacity',
      href: `/company/${companyId}/buses`,
      color: 'bg-green-50 border-green-200',
      icon: '🚌',
    },
    {
      title: 'Drivers',
      description: 'Manage drivers and assignments',
      href: `/company/${companyId}/drivers`,
      color: 'bg-orange-50 border-orange-200',
      icon: '👤',
    },
    {
      title: 'Payment Plans',
      description: 'Configure payment plans for parents',
      href: `/company/${companyId}/payment-plans`,
      color: 'bg-purple-50 border-purple-200',
      icon: '💳',
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.firstName}!</h1>
          <p className="text-slate-500 mt-1">Manage your company's routes, buses, and drivers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div
                className={`${action.color} border rounded-lg p-6 hover:shadow-lg transition cursor-pointer`}
              >
                <div className="text-4xl mb-3">{action.icon}</div>
                <h3 className="font-bold text-lg text-slate-900">{action.title}</h3>
                <p className="text-slate-600 text-sm mt-2">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Active Routes</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">–</p>
            <p className="text-xs text-slate-500 mt-2">Coming soon</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Buses</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">–</p>
            <p className="text-xs text-slate-500 mt-2">Coming soon</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Drivers</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">–</p>
            <p className="text-xs text-slate-500 mt-2">Coming soon</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
