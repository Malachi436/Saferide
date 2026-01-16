'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { use } from 'react';

interface Route {
  id: string;
  name: string;
  schoolId: string;
  busId?: string;
  shift?: string;
  bus?: {
    id: string;
    plateNumber: string;
    driver?: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
  };
  _count?: {
    children: number;
  };
}

interface Bus {
  id: string;
  plateNumber: string;
  capacity: number;
  driver?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

interface School {
  id: string;
  name: string;
}

export default function RoutesPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId: companyId } = use(params);
  
  // State
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    schoolId: '',
    busId: '',
    shift: 'MORNING' as 'MORNING' | 'AFTERNOON'
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Modal data - loaded fresh each time modal opens
  const [modalBuses, setModalBuses] = useState<Bus[]>([]);
  const [modalSchools, setModalSchools] = useState<School[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Load routes on mount
  useEffect(() => {
    if (companyId) {
      loadRoutes();
    }
  }, [companyId]);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data: any = await apiClient.get(`/admin/company/${companyId}/routes`);
      setRoutes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading routes:', err);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = async () => {
    setEditingRoute(null);
    setFormData({
      name: '',
      schoolId: '',
      busId: '',
      shift: 'MORNING'
    });
    setShowModal(true);
    await loadModalData();
  };

  const openEditModal = async (route: Route) => {
    setEditingRoute(route);
    setFormData({
      name: route.name,
      schoolId: route.schoolId,
      busId: route.busId || '',
      shift: (route.shift as 'MORNING' | 'AFTERNOON') || 'MORNING'
    });
    setShowModal(true);
    await loadModalData();
  };

  const loadModalData = async () => {
    setModalLoading(true);
    try {
      // Load buses and schools in parallel
      const [busesRes, schoolsRes] = await Promise.all([
        apiClient.get(`/buses/company/${companyId}`),
        apiClient.get(`/admin/company/${companyId}/schools`)
      ]);

      const buses = Array.isArray(busesRes) ? busesRes : [];
      const schools = Array.isArray(schoolsRes) ? schoolsRes : [];

      setModalBuses(buses);
      setModalSchools(schools);

      // Auto-select if only one school
      if (schools.length === 1 && !formData.schoolId) {
        setFormData(prev => ({ ...prev, schoolId: schools[0].id }));
      }

      console.log('Modal data loaded:', { buses: buses.length, schools: schools.length });
    } catch (err) {
      console.error('Error loading modal data:', err);
      setModalBuses([]);
      setModalSchools([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Please enter route name');
      return;
    }

    if (!formData.schoolId) {
      alert('Please select a school');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        busId: formData.busId || null,
        shift: formData.shift,
        schoolId: formData.schoolId,
      };

      if (editingRoute) {
        await apiClient.patch(`/routes/${editingRoute.id}`, payload);
        alert('✅ Route updated successfully!');
      } else {
        await apiClient.post('/routes', payload);
        alert('✅ Route created successfully!');
      }

      setShowModal(false);
      loadRoutes();
    } catch (err: any) {
      alert('❌ Error: ' + (err.response?.data?.message || 'Failed to save route'));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteRoute = async (routeId: string) => {
    if (!confirm('Are you sure? Children on this route will need to be reassigned.')) {
      return;
    }

    try {
      await apiClient.delete(`/routes/${routeId}`);
      alert('✅ Route deleted successfully');
      loadRoutes();
    } catch (err: any) {
      alert('❌ Error: ' + (err.response?.data?.message || 'Failed to delete route'));
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
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Routes Management</h1>
            <p className="text-slate-500 mt-1">Manage bus routes and assignments</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Create Route
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <p className="font-semibold text-blue-900 mb-1">How Routes Work</p>
              <p className="text-sm text-blue-800">
                <strong>Child → Route → Bus → Driver</strong>
                <br />
                Children are assigned to routes permanently. Each route is linked to a bus, which has a driver.
                When you change a bus's driver, all children on that bus's routes automatically follow.
              </p>
            </div>
          </div>
        </div>

        {/* Routes List */}
        {routes.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-500 text-lg mb-4">No routes created yet</p>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Create Your First Route
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {routes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{route.name}</h3>
                      {route.shift && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            route.shift === 'MORNING'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {route.shift === 'MORNING' ? '🌅 Morning' : '🌆 Afternoon'}
                        </span>
                      )}
                    </div>

                    {route.bus ? (
                      <div className="space-y-1 mb-3">
                        <p className="text-sm text-slate-600">
                          🚌 Bus: <strong>{route.bus.plateNumber}</strong>
                        </p>
                        {route.bus.driver && (
                          <p className="text-sm text-slate-600">
                            👨‍✈️ Driver:{' '}
                            <strong>
                              {route.bus.driver.user.firstName} {route.bus.driver.user.lastName}
                            </strong>
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-amber-600 mb-3">⚠️ No bus assigned</p>
                    )}

                    {route._count && (
                      <p className="text-sm text-slate-500">
                        👶 {route._count.children} children assigned
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(route)}
                      className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteRoute(route.id)}
                      className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">
                {editingRoute ? 'Edit Route' : 'Create Route'}
              </h2>

              {modalLoading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading data...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Route Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Route Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Morning East Route"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* School Selection */}
                  {modalSchools.length > 1 && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        School *
                      </label>
                      <select
                        value={formData.schoolId}
                        onChange={(e) => setFormData(prev => ({ ...prev, schoolId: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select a school...</option>
                        {modalSchools.map((school) => (
                          <option key={school.id} value={school.id}>
                            {school.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Bus Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Assign Bus (Optional)
                    </label>
                    {modalBuses.length === 0 ? (
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
                        ℹ️ No buses available yet. You can create the route and assign a bus later.
                      </div>
                    ) : (
                      <select
                        value={formData.busId}
                        onChange={(e) => setFormData(prev => ({ ...prev, busId: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">No bus assigned (assign later)</option>
                        {modalBuses.map((bus) => (
                          <option key={bus.id} value={bus.id}>
                            {bus.plateNumber}
                            {bus.driver ? ` - ${bus.driver.user.firstName} ${bus.driver.user.lastName}` : ' (No driver)'}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Shift Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Shift *
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, shift: 'MORNING' }))}
                        className={`flex-1 py-3 rounded-lg font-semibold transition ${
                          formData.shift === 'MORNING'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        🌅 Morning
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, shift: 'AFTERNOON' }))}
                        className={`flex-1 py-3 rounded-lg font-semibold transition ${
                          formData.shift === 'AFTERNOON'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        🌆 Afternoon
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? 'Saving...' : editingRoute ? 'Update Route' : 'Create Route'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
