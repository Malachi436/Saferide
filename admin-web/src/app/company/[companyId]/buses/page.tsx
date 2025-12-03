'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { use } from 'react';

interface Bus {
  id: string;
  plateNumber: string;
  capacity: number;
  driverName?: string;
}

export default function BusesPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ plateNumber: '', capacity: 50 });

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<Bus[]>('/buses');
      setBuses(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load buses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/buses', {
        plateNumber: formData.plateNumber,
        capacity: parseInt(formData.capacity.toString()),
      });
      setFormData({ plateNumber: '', capacity: 50 });
      setShowForm(false);
      await fetchBuses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add bus');
    }
  };

  const handleDeleteBus = async (busId: string) => {
    if (!window.confirm('Are you sure you want to delete this bus?')) return;

    try {
      await apiClient.delete(`/buses/${busId}`);
      await fetchBuses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete bus');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Buses</h1>
            <p className="text-slate-500 mt-1">Manage buses and capacity</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
          >
            {showForm ? '✕ Cancel' : '+ Add Bus'}
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        {showForm && (
          <form onSubmit={handleAddBus} className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Plate Number</label>
                <input
                  type="text"
                  required
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., ABC-1234"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Capacity (1-100)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition font-semibold"
                >
                  Add Bus
                </button>
              </div>
            </div>
          </form>
        )}

        {buses.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-500">No buses yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buses.map((bus) => (
              <div key={bus.id} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{bus.plateNumber}</h3>
                    <p className="text-sm text-slate-600 mt-1">Capacity: <span className="font-semibold">{bus.capacity}</span></p>
                  </div>
                  <button
                    onClick={() => handleDeleteBus(bus.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>
                {bus.driverName && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
                    <p className="text-xs text-blue-700 font-semibold">Assigned Driver</p>
                    <p className="text-sm text-blue-900 mt-1">{bus.driverName}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
