'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { use } from 'react';

interface LocationRequest {
  id: string;
  status: string;
  createdAt: string;
  oldLatitude?: number;
  oldLongitude?: number;
  oldAddress?: string;
  newLatitude: number;
  newLongitude: number;
  newAddress?: string;
  reason?: string;
  child: {
    firstName: string;
    lastName: string;
    parent: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export default function LocationRequestsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const [requests, setRequests] = useState<LocationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<LocationRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [companyId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data: any = await apiClient.get(`/children/company/${companyId}/location-change/pending`);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const reviewRequest = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      setReviewing(true);
      await apiClient.patch(`/children/location-change/${requestId}/review`, {
        status,
        reviewNotes,
      });

      alert(`Request ${status.toLowerCase()} successfully!`);
      setSelectedRequest(null);
      setReviewNotes('');
      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to review request');
    } finally {
      setReviewing(false);
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
      <div className="max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Location Change Requests</h1>
          <p className="text-slate-500 mt-1">Review and approve parent location change requests</p>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-500">No pending location change requests</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {request.child.firstName} {request.child.lastName}
                    </h3>
                    <p className="text-sm text-slate-600">
                      Parent: {request.child.parent.firstName} {request.child.parent.lastName}
                    </p>
                    <p className="text-sm text-slate-600">📧 {request.child.parent.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {request.status}
                    </span>
                    <p className="text-sm text-slate-500 mt-2">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Old Location */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-red-700 mb-2">❌ Old Location</p>
                    {request.oldAddress && <p className="text-sm text-slate-700">{request.oldAddress}</p>}
                    {request.oldLatitude && request.oldLongitude && (
                      <p className="text-xs text-slate-500 mt-1">
                        📍 {request.oldLatitude.toFixed(6)}, {request.oldLongitude.toFixed(6)}
                      </p>
                    )}
                  </div>

                  {/* New Location */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-green-700 mb-2">✅ New Location</p>
                    {request.newAddress && <p className="text-sm text-slate-700">{request.newAddress}</p>}
                    <p className="text-xs text-slate-500 mt-1">
                      📍 {request.newLatitude.toFixed(6)}, {request.newLongitude.toFixed(6)}
                    </p>
                  </div>
                </div>

                {request.reason && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-blue-700 mb-1">Reason:</p>
                    <p className="text-sm text-slate-700">{request.reason}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Review Request
                  </button>
                  <a
                    href={`https://www.google.com/maps?q=${request.newLatitude},${request.newLongitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300"
                  >
                    🗺️ View on Map
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-lg w-full">
              <h2 className="text-2xl font-bold mb-4">Review Location Change</h2>
              <p className="text-slate-600 mb-4">
                {selectedRequest.child.firstName} {selectedRequest.child.lastName}
              </p>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Review Notes (optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about this review..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => reviewRequest(selectedRequest.id, 'REJECTED')}
                  disabled={reviewing}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  ❌ Reject
                </button>
                <button
                  onClick={() => reviewRequest(selectedRequest.id, 'APPROVED')}
                  disabled={reviewing}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  ✅ Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
