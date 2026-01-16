'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function PlatformOverviewPage() {
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'Companies',
      description: 'Manage all registered companies and their admins',
      href: '/platform/companies',
      color: 'bg-yellow-50 border-yellow-300',
      icon: '🏢',
    },
    {
      title: 'Schools',
      description: 'View and manage all schools across companies',
      href: '/platform/schools',
      color: 'bg-orange-50 border-orange-300',
      icon: '🎓',
    },
    {
      title: 'Analytics',
      description: 'System-wide analytics and reporting',
      href: '/platform/analytics',
      color: 'bg-green-50 border-green-300',
      icon: '📊',
    },
    {
      title: 'Users',
      description: 'Manage platform admins and company admins',
      href: '/platform/users',
      color: 'bg-red-50 border-red-300',
      icon: '👥',
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Platform Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome, {user?.firstName}! Manage the entire SafeRide platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div
                className={`${action.color} border-2 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all cursor-pointer`}
              >
                <div className="text-4xl mb-3">{action.icon}</div>
                <h3 className="font-bold text-lg text-slate-900">{action.title}</h3>
                <p className="text-slate-600 text-sm mt-2">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl border-2 border-yellow-300 p-8 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4">System Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="text-slate-600 text-sm font-semibold">Total Companies</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">–</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <p className="text-slate-600 text-sm font-semibold">Total Schools</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">–</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-slate-600 text-sm font-semibold">Active Routes</p>
              <p className="text-3xl font-bold text-green-600 mt-2">–</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <p className="text-slate-600 text-sm font-semibold">Registered Users</p>
              <p className="text-3xl font-bold text-red-600 mt-2">–</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
