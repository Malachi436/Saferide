'use client';

import { DashboardLayout } from '@/components/DashboardLayout';

export default function CompaniesPage() {
  // Companies are deprecated - now using schools
  console.warn('Companies are no longer supported. Schools are now independent entities.');

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Companies</h1>
          <p className="text-slate-500 mt-1">Manage all registered companies</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Companies No Longer Supported</h2>
          <p className="mb-4">
            The company-centric model has been replaced with a school-centric model. 
            Each school now operates independently and manages its own fleet, drivers, and routes.
          </p>
          <p>
            Please use the <strong>Schools</strong> page to manage schools instead.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
