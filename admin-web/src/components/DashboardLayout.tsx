'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('[DashboardLayout] Auth state:', { isLoading, isAuthenticated, user });
    if (!isLoading && !isAuthenticated) {
      console.log('[DashboardLayout] Not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, user]);

  if (isLoading) {
    console.log('[DashboardLayout] Still loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[DashboardLayout] Not authenticated');
    return null;
  }

  console.log('[DashboardLayout] Rendering dashboard for user:', user?.email);

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1 bg-slate-50 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}