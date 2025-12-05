'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const companyId = user?.companyId;

  if (!user) return null;

  const isPlatformAdmin = user.role?.toUpperCase() === 'PLATFORM_ADMIN';
  const isCompanyAdmin = user.role?.toUpperCase() === 'COMPANY_ADMIN';

  const navItems = isPlatformAdmin
    ? [
        { label: 'Overview', href: '/platform/overview' },
        { label: 'Companies', href: '/platform/companies' },
        { label: 'Schools', href: '/platform/schools' },
        { label: 'Analytics', href: '/platform/analytics' },
      ]
    : [
        { label: 'Overview', href: `/company/${companyId}/overview` },
        { label: 'Live Dashboard', href: `/company/${companyId}/live-dashboard` },
        { label: 'Scheduled Routes', href: `/company/${companyId}/scheduled-routes` },
        { label: 'Payment Plans', href: `/company/${companyId}/payment-plans` },
        { label: 'Children', href: `/company/${companyId}/children` },
        { label: 'Buses', href: `/company/${companyId}/buses` },
        { label: 'Drivers', href: `/company/${companyId}/drivers` },
        { label: 'Onboard Driver', href: `/company/${companyId}/onboard-driver` },
        { label: 'Bus Fares', href: `/company/${companyId}/bus-fares` },
        { label: 'Analytics', href: `/company/${companyId}/analytics` },
      ];

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">ROSAgo</h1>
        <p className="text-slate-400 text-sm mt-1">Admin Dashboard</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg transition ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="mb-4 text-sm">
          <p className="text-slate-400">Logged in as:</p>
          <p className="text-white font-semibold">{user.firstName} {user.lastName}</p>
          <p className="text-slate-400 text-xs">{user.email}</p>
        </div>
        <button
          onClick={logout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
