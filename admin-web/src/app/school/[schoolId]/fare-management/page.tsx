'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { use } from 'react';

interface FareHistory {
  id: string;
  oldFare: number;
  newFare: number;
  changedBy: string;
  reason?: string;
  createdAt: string;
}

export default function FareManagementPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const [currentFare, setCurrentFare] = useState<number>(0);
  const [currency, setCurrency] = useState('UGX');
  const [newFare, setNewFare] = useState('');
  const [reason, setReason] = useState('');
  const [history, setHistory] = useState<FareHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchFareData();
  }, [companyId]);

  const fetchFareData = async () => {
    try {
      setLoading(true);
      const fareData: any = await apiClient.get(`/admin/company/${companyId}/fare`);
      setCurrentFare(fareData.baseFare || 0);
      setCurrency(fareData.currency || 'UGX');

      const historyData: any = await apiClient.get(`/admin/company/${companyId}/fare/history`);
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (err) {
      console.error('Error loading fare data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFare = async () => {
    const fareValue = parseInt(newFare);
    if (!fareValue || fareValue <= 0) {
      alert('Please enter a valid fare amount');
      return;
    }

    try {
      setUpdating(true);
      await apiClient.patch(`/admin/company/${companyId}/fare`, {
        newFare: fareValue,
        reason,
      });

      alert(`Fare updated successfully! Parents have been notified.`);
      setNewFare('');
      setReason('');
      fetchFareData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update fare');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Fare Management</h1>
          <p className="text-slate-500 mt-1">Update bus fares and notify parents automatically</p>
        </div>

        {/* Current Fare */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-8 mb-6 text-white">
          <p className="text-blue-100 text-sm font-semibold">Current Fare</p>
          <p className="text-5xl font-bold mt-2">
            {currency} {currentFare.toLocaleString()}
          </p>
        </div>

        {/* Update Fare */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Update Fare</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                New Fare Amount ({currency})
              </label>
              <input
                type="number"
                value={newFare}
                onChange={(e) => setNewFare(e.target.value)}
                placeholder="Enter new fare"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Reason for Change (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Fuel price increase"
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={updateFare}
              disabled={updating}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {updating ? 'Updating...' : '💰 Update Fare & Notify Parents'}
            </button>
          </div>
        </div>

        {/* Fare History */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold mb-4">Fare Change History</h2>
          
          {history.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No fare changes yet</p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {currency} {item.oldFare.toLocaleString()} → {currency} {item.newFare.toLocaleString()}
                        <span className={`ml-2 text-sm ${item.newFare > item.oldFare ? 'text-red-600' : 'text-green-600'}`}>
                          {item.newFare > item.oldFare ? '+' : ''}{item.newFare - item.oldFare}
                        </span>
                      </p>
                      {item.reason && (
                        <p className="text-sm text-slate-600 mt-1">Reason: {item.reason}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
