'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { use } from 'react';

interface Bus {
  id: string;
  plateNumber: string;
  capacity: number;
  driverId?: string | null;
  driver?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  } | null;
}

interface Driver {
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  grade?: string;
  routeId?: string;
  route?: {
    id: string;
    name: string;
  };
}

interface Route {
  id: string;
  name: string;
  busId?: string;
}

export default function BusesPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = use(params);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ plateNumber: '', capacity: 50 });
  const [assigningBusId, setAssigningBusId] = useState<string | null>(null);
  const [viewingBusId, setViewingBusId] = useState<string | null>(null);
  const [busChildren, setBusChildren] = useState<Child[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);

  useEffect(() => {
    fetchBuses();
    fetchDrivers();
    fetchRoutes();
  }, [schoolId]);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<Bus[]>(`/buses/company/${schoolId}`);
      setBuses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load buses');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const data = await apiClient.get<Driver[]>(`/admin/company/${schoolId}/drivers`);
      setDrivers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error loading drivers:', err);
    }
  };

  const fetchRoutes = async () => {
    try {
      const data: any = await apiClient.get(`/admin/company/${schoolId}/routes`);
      setRoutes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error loading routes:', err);
    }
  };

  const fetchBusChildren = async (busId: string) => {
    try {
      setLoadingChildren(true);
      // Get all children for this company
      const allChildren: any = await apiClient.get(`/admin/company/${schoolId}/children`);
      
      // Filter children whose route is assigned to this bus
      const children = Array.isArray(allChildren) ? allChildren.filter((child: any) => {
        return child.route && child.route.busId === busId;
      }) : [];
      
      setBusChildren(children);
    } catch (err: any) {
      console.error('Error loading children:', err);
      setBusChildren([]);
    } finally {
      setLoadingChildren(false);
    }
  };

  const handleViewChildren = (busId: string) => {
    setViewingBusId(busId);
    fetchBusChildren(busId);
  };

  const handleReassignChild = async (childId: string, newRouteId: string) => {
    try {
      await apiClient.patch(`/children/${childId}`, {
        routeId: newRouteId || null,
      });
      alert('✅ Child reassigned successfully!');
      // Refresh the children list
      if (viewingBusId) {
        fetchBusChildren(viewingBusId);
      }
    } catch (err: any) {
      alert('❌ Error: ' + (err.response?.data?.message || 'Failed to reassign child'));
    }
  };

  const handleAddBus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/buses', {
        plateNumber: formData.plateNumber.trim().toUpperCase(),
        capacity: parseInt(formData.capacity.toString()),
        companyId: schoolId,  // Add company ownership
        driverId: null,
      });
      alert(`✅ Bus ${formData.plateNumber.toUpperCase()} added successfully!`);
      setFormData({ plateNumber: '', capacity: 50 });
      setShowForm(false);
      await fetchBuses();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add bus';
      if (errorMessage.includes('already exists') || errorMessage.includes('Unique constraint')) {
        alert(`❌ Error: A bus with plate number "${formData.plateNumber.toUpperCase()}" already exists. Please use a different plate number.`);
      } else {
        alert(`❌ Error: ${errorMessage}`);
      }
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

  const handleAssignDriver = async (busId: string, driverId: string) => {
    try {
      await apiClient.patch(`/buses/${busId}`, { driverId });
      alert('✅ Driver assigned successfully!');
      setAssigningBusId(null);
      await fetchBuses();
    } catch (err: any) {
      alert(`❌ Error: ${err.response?.data?.message || 'Failed to assign driver'}`);
    }
  };

  const handleUnassignDriver = async (busId: string) => {
    if (!window.confirm('Remove driver from this bus?')) return;
    
    try {
      await apiClient.patch(`/buses/${busId}`, { driverId: null });
      alert('✅ Driver unassigned successfully!');
      await fetchBuses();
    } catch (err: any) {
      alert(`❌ Error: ${err.response?.data?.message || 'Failed to unassign driver'}`);
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

                {/* Driver Assignment */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  {bus.driver ? (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-xs text-blue-700 font-semibold mb-1">Assigned Driver</p>
                      <p className="text-sm text-blue-900 font-semibold">
                        {bus.driver.user.firstName} {bus.driver.user.lastName}
                      </p>
                      <button
                        onClick={() => handleUnassignDriver(bus.id)}
                        className="mt-2 text-xs text-red-600 hover:text-red-800 font-semibold"
                      >
                        ✕ Unassign
                      </button>
                    </div>
                  ) : assigningBusId === bus.id ? (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">Select Driver</label>
                      <select
                        onChange={(e) => handleAssignDriver(bus.id, e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue=""
                      >
                        <option value="" disabled>Choose a driver...</option>
                        {drivers.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.user.firstName} {driver.user.lastName}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setAssigningBusId(null)}
                        className="text-xs text-slate-600 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAssigningBusId(bus.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm font-semibold"
                    >
                      + Assign Driver
                    </button>
                  )}
                </div>

                {/* View Children Button */}
                <div className="mt-3">
                  <button
                    onClick={() => handleViewChildren(bus.id)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition text-sm font-semibold"
                  >
                    👦 View Students
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Children Modal */}
        {viewingBusId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Students on Bus {buses.find(b => b.id === viewingBusId)?.plateNumber}
                </h2>
                <button
                  onClick={() => setViewingBusId(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {loadingChildren ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : busChildren.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">No students assigned to this bus yet</p>
                  <p className="text-sm text-slate-400 mt-2">Students are assigned via routes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 mb-4">
                    Total: <strong>{busChildren.length}</strong> {busChildren.length === 1 ? 'student' : 'students'}
                  </p>
                  
                  <div className="space-y-3">
                    {busChildren.map((child) => (
                      <div key={child.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">
                              {child.firstName} {child.lastName}
                            </h3>
                            {child.grade && (
                              <p className="text-sm text-slate-600 mt-1">
                                Grade: {child.grade}
                              </p>
                            )}
                            {child.route && (
                              <p className="text-sm text-blue-600 mt-1">
                                Route: <strong>{child.route.name}</strong>
                              </p>
                            )}
                          </div>
                          
                          <div className="ml-4">
                            <select
                              onChange={(e) => handleReassignChild(child.id, e.target.value)}
                              className="px-3 py-1 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              defaultValue={child.routeId || ''}
                            >
                              <option value="">No route</option>
                              {routes.map((route) => (
                                <option key={route.id} value={route.id}>
                                  {route.name}
                                </option>
                              ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-1 text-center">
                              Reassign
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setViewingBusId(null)}
                  className="w-full bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
