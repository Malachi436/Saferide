'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { use } from 'react';

interface ScheduledRoute {
  id: string;
  routeId: string;
  driverId: string;
  busId: string;
  scheduledTime: string;
  recurringDays: string[];
  status: string;
  autoAssignChildren: boolean;
  effectiveFrom?: string;
  effectiveUntil?: string;
  route: {
    name: string;
    school: {
      name: string;
    };
  };
  driver: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  bus: {
    plateNumber: string;
  };
}

interface Route {
  id: string;
  name: string;
  schoolId: string;
  busId?: string;
  shift?: string;
}

interface Bus {
  id: string;
  plateNumber: string;
  driver?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

interface Driver {
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export default function ScheduledRoutesPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId: companyId } = use(params);
  
  const [scheduledRoutes, setScheduledRoutes] = useState<ScheduledRoute[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledRoute | null>(null);
  
  const [formData, setFormData] = useState({
    routeId: '',
    driverId: '',
    busId: '',
    scheduledTime: '07:00',
    recurringDays: [] as string[],
    effectiveFrom: '',
    effectiveUntil: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [scheduledRes, routesRes, busesRes, driversRes] = await Promise.all([
        apiClient.get(`/scheduled-routes/company/${companyId}`),
        apiClient.get(`/admin/company/${companyId}/routes`),
        apiClient.get(`/buses/company/${companyId}`),
        apiClient.get(`/admin/company/${companyId}/drivers`),
      ]);
      
      setScheduledRoutes(Array.isArray(scheduledRes) ? scheduledRes : []);
      setRoutes(Array.isArray(routesRes) ? routesRes : []);
      setBuses(Array.isArray(busesRes) ? busesRes : []);
      setDrivers(Array.isArray(driversRes) ? driversRes : []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingSchedule(null);
    setFormData({
      routeId: '',
      driverId: '',
      busId: '',
      scheduledTime: '07:00',
      recurringDays: [],
      effectiveFrom: '',
      effectiveUntil: '',
    });
    setShowModal(true);
  };

  const openEditModal = (schedule: ScheduledRoute) => {
    setEditingSchedule(schedule);
    setFormData({
      routeId: schedule.routeId,
      driverId: schedule.driverId,
      busId: schedule.busId,
      scheduledTime: schedule.scheduledTime,
      recurringDays: schedule.recurringDays,
      effectiveFrom: schedule.effectiveFrom?.split('T')[0] || '',
      effectiveUntil: schedule.effectiveUntil?.split('T')[0] || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.routeId || !formData.driverId || !formData.busId) {
      alert('Please fill all required fields');
      return;
    }

    if (formData.recurringDays.length === 0) {
      alert('Please select at least one day');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        routeId: formData.routeId,
        driverId: formData.driverId,
        busId: formData.busId,
        scheduledTime: formData.scheduledTime,
        recurringDays: formData.recurringDays,
        effectiveFrom: formData.effectiveFrom || undefined,
        effectiveUntil: formData.effectiveUntil || undefined,
      };

      if (editingSchedule) {
        await apiClient.put(`/scheduled-routes/${editingSchedule.id}`, payload);
        alert('✅ Schedule updated successfully!');
      } else {
        await apiClient.post('/scheduled-routes', payload);
        alert('✅ Schedule created successfully! Trips will be generated daily at 2 AM.');
      }

      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert('❌ Error: ' + (err.response?.data?.message || 'Failed to save schedule'));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(day)
        ? prev.recurringDays.filter(d => d !== day)
        : [...prev.recurringDays, day]
    }));
  };

  const suspend = async (id: string) => {
    if (!confirm('Suspend this schedule? No trips will be generated until reactivated.')) {
      return;
    }

    try {
      await apiClient.put(`/scheduled-routes/${id}/suspend`, {});
      alert('✅ Schedule suspended');
      loadData();
    } catch (err: any) {
      alert('❌ Error: ' + (err.response?.data?.message || 'Failed to suspend'));
    }
  };

  const activate = async (id: string) => {
    try {
      await apiClient.put(`/scheduled-routes/${id}/activate`, {});
      alert('✅ Schedule activated');
      loadData();
    } catch (err: any) {
      alert('❌ Error: ' + (err.response?.data?.message || 'Failed to activate'));
    }
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm('Delete this schedule permanently?')) {
      return;
    }

    try {
      await apiClient.delete(`/scheduled-routes/${id}`);
      alert('✅ Schedule deleted');
      loadData();
    } catch (err: any) {
      alert('❌ Error: ' + (err.response?.data?.message || 'Failed to delete'));
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Scheduled Routes</h1>
            <p className="text-slate-500 mt-1">Recurring route schedules for automatic trip generation</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Create Schedule
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <p className="font-semibold text-blue-900 mb-1">How Scheduled Routes Work</p>
              <p className="text-sm text-blue-800">
                Scheduled routes define <strong>when and how often</strong> a route runs. Trips are automatically generated daily at 2 AM based on active schedules. Each trip includes attendance records for all children on the route.
              </p>
            </div>
          </div>
        </div>

        {scheduledRoutes.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-500 text-lg mb-4">No scheduled routes yet</p>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Create Your First Schedule
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {scheduledRoutes.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{schedule.route.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          schedule.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : schedule.status === 'SUSPENDED'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {schedule.status}
                      </span>
                    </div>

                    <div className="space-y-1 mb-3 text-sm text-slate-600">
                      <p>🚌 Bus: <strong>{schedule.bus.plateNumber}</strong></p>
                      <p>👨‍✈️ Driver: <strong>{schedule.driver.user.firstName} {schedule.driver.user.lastName}</strong></p>
                      <p>🕐 Time: <strong>{schedule.scheduledTime}</strong></p>
                      <p>📅 Days: <strong>{schedule.recurringDays.join(', ')}</strong></p>
                      {schedule.effectiveFrom && (
                        <p>📆 From: <strong>{new Date(schedule.effectiveFrom).toLocaleDateString()}</strong></p>
                      )}
                      {schedule.effectiveUntil && (
                        <p>📆 Until: <strong>{new Date(schedule.effectiveUntil).toLocaleDateString()}</strong></p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(schedule)}
                      className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200 transition"
                    >
                      Edit
                    </button>
                    {schedule.status === 'ACTIVE' ? (
                      <button
                        onClick={() => suspend(schedule.id)}
                        className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg font-semibold hover:bg-amber-200 transition"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => activate(schedule.id)}
                        className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-200 transition"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => deleteSchedule(schedule.id)}
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

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">
                {editingSchedule ? 'Edit Schedule' : 'Create Schedule'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Route *
                  </label>
                  <select
                    value={formData.routeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, routeId: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select route...</option>
                    {routes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Driver *
                    </label>
                    <select
                      value={formData.driverId}
                      onChange={(e) => setFormData(prev => ({ ...prev, driverId: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select driver...</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.user.firstName} {driver.user.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Bus *
                    </label>
                    <select
                      value={formData.busId}
                      onChange={(e) => setFormData(prev => ({ ...prev, busId: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select bus...</option>
                      {buses.map((bus) => (
                        <option key={bus.id} value={bus.id}>
                          {bus.plateNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Scheduled Time *
                  </label>
                  <input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Recurring Days *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`py-2 px-3 rounded-lg text-sm font-semibold transition ${
                          formData.recurringDays.includes(day)
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Effective From (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.effectiveFrom}
                      onChange={(e) => setFormData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Effective Until (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.effectiveUntil}
                      onChange={(e) => setFormData(prev => ({ ...prev, effectiveUntil: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

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
                    {submitting ? 'Saving...' : editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
