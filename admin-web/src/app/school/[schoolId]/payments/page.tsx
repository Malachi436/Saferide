'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { use } from 'react';

export default function PaymentsPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = use(params);

  const handleHubtelRedirect = () => {
    // Phase 1: Simple redirect to Hubtel dashboard
    // Each school has its own Hubtel configuration
    // Future: Use schoolId to determine specific Hubtel account
    console.log('Redirecting for school:', schoolId);
    window.open('https://hubtel.com/dashboard', '_blank');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-500 mt-1">View payment transactions on Hubtel</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200 p-8">
          <div className="flex items-start gap-6">
            <div className="bg-orange-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl flex-shrink-0">
              💳
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Hubtel Payment Dashboard</h2>
              <p className="text-slate-700 mb-4">
                SafeRide does not hold money. All payments are processed directly through your school's Hubtel account.
              </p>
              <p className="text-slate-600 mb-6">
                Click below to view your payment transactions, configure payment settings, and access financial reports on the Hubtel platform.
              </p>
              <button
                onClick={handleHubtelRedirect}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition shadow-lg"
              >
                🔗 Open Hubtel Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-3">Why Hubtel?</h3>
          <ul className="space-y-3 text-slate-700">
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl flex-shrink-0">✓</span>
              <span><strong>Regulatory Compliant:</strong> All transactions are handled by a licensed payment processor</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl flex-shrink-0">✓</span>
              <span><strong>Direct to School:</strong> Payments go directly to your school's account</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl flex-shrink-0">✓</span>
              <span><strong>Real-time Reports:</strong> Access detailed transaction history and financial reports</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl flex-shrink-0">✓</span>
              <span><strong>Secure:</strong> Bank-level security and PCI compliance</span>
            </li>
          </ul>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> If you haven't set up your Hubtel account yet, please contact SafeRide support for assistance with configuration.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
