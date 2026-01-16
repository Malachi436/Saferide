'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { use } from 'react';

export default function PaymentPlansPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId: _ } = use(params); // companyId will be used after Hubtle API integration

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Payment Plans</h1>
          <p className="text-slate-500 mt-1">Manage subscription plans and pricing</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-yellow-900">Coming Soon</h3>
              <p className="text-yellow-700 text-sm mt-1">
                Payment plans management will be available after Hubtle Payment API integration.
                You'll be able to create and manage subscription plans for parents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}