'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user) {
        const role = user.role?.toUpperCase();
        console.log('[Home Page] User:', user);
        console.log('[Home Page] Role:', role);
        
        if (role === 'PLATFORM_ADMIN') {
          console.log('[Home Page] Redirecting to /platform/overview');
          router.push('/platform/overview');
        } else if (role === 'COMPANY_ADMIN') {
          if (user.companyId) {
            console.log('[Home Page] Redirecting to /school/' + user.companyId + '/overview');
            router.push(`/school/${user.companyId}/overview`);
          } else {
            console.error('[Home Page] School admin has no companyId!');
            alert('Error: School admin account is missing school ID');
          }
        } else {
          console.error('[Home Page] Unknown role:', role);
        }
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading...</p>
      </div>
    </div>
  );
}
