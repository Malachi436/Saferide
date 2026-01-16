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

  const navItems = isPlatformAdmin
    ? [
        { label: 'Overview', href: '/platform/overview' },
        { label: 'Schools', href: '/platform/schools' },
        { label: 'Analytics', href: '/platform/analytics' },
      ]
    : [
        { label: 'Overview', href: `/school/${companyId}/overview` },
        { label: 'Live Dashboard', href: `/school/${companyId}/live-dashboard` },
        { label: 'Students', href: `/school/${companyId}/children` },
        { label: 'Drivers', href: `/school/${companyId}/drivers` },
        { label: 'Buses', href: `/school/${companyId}/buses` },
        { label: 'Routes', href: `/school/${companyId}/routes` },
        { label: 'Scheduled Routes', href: `/school/${companyId}/scheduled-routes` },
        { label: 'Trips', href: `/school/${companyId}/trips` },
        { label: 'Payments (Hubtel)', href: `/school/${companyId}/payments` },
        { label: 'Reports', href: `/school/${companyId}/reports` },
      ];

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-2xl">
      <div className="p-6 border-b border-yellow-500/30">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg inline-block mb-2">
          <h1 className="text-2xl font-extrabold">SafeRide</h1>
        </div>
        <p className="text-yellow-400/80 text-sm font-semibold">Admin Dashboard</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg transition font-semibold ${
                isActive
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-yellow-400'
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
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 rounded-lg transition shadow-md"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
