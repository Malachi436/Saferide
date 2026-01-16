'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { use } from 'react';

interface Trip {
  id: string;
  status: string;
  startTime?: string;
  endTime?: string;
  date?: string;
  scheduledTime?: string;
  busId: string;
  driverId: string;
  bus: {
    id: string;
    plateNumber: string;
    driver: {
      id: string;
      user: {
        firstName: string;
        lastName: string;
      };
    };
  };
  route: {
    id: string;
    name: string;
  };
  attendances: Array<{
    id: string;
    status: string;
    child: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
  createdAt: string;
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

export default function TripsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [todayTrips, setTodayTrips] = useState<Trip[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [selectedBusId, setSelectedBusId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'today'>('today');

  useEffect(() => {
    fetchTrips();
  }, [companyId]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const [allTrips, active, busesData, driversData] = await Promise.all([
        apiClient.get(`/admin/company/${companyId}/trips`),
        apiClient.get(`/admin/company/${companyId}/trips/active`),
        apiClient.get(`/buses/company/${companyId}`),
        apiClient.get(`/admin/company/${companyId}/drivers`),
      ]);
      setTrips((allTrips as Trip[]) || []);
      setActiveTrips((active as Trip[]) || []);
      setBuses((busesData as Bus[]) || []);
      setDrivers((driversData as Driver[]) || []);
      
      // Filter today's trips
      const today = new Date().toISOString().split('T')[0];
      const todayTripsData = ((allTrips as Trip[]) || []).filter(trip => {
        const tripDate = trip.date || trip.createdAt;
        return tripDate && tripDate.startsWith(today);
      });
      setTodayTrips(todayTripsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load trips');
      console.error('Error loading trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const filteredTrips = (viewMode === 'today' ? todayTrips : trips).filter((trip) => {
    if (filterStatus === 'all') return true;
    return trip.status === filterStatus;
  });

  const openDetails = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedTrip(null);
  };

  const openEditModal = (trip: Trip) => {
    setEditingTrip(trip);
    setSelectedBusId(trip.busId);
    setSelectedDriverId(trip.driverId || trip.bus.driver.id);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingTrip(null);
    setSelectedBusId('');
    setSelectedDriverId('');
  };

  const handleSaveOverride = async () => {
    if (!editingTrip) return;

    try {
      setSubmitting(true);
      await apiClient.patch(`/trips/${editingTrip.id}`, {
        busId: selectedBusId,
        driverId: selectedDriverId,
      });
      alert('✅ Trip updated successfully!');
      closeEditModal();
      fetchTrips(); // Refresh data
    } catch (err: any) {
      alert('❌ Error: ' + (err.response?.data?.message || 'Failed to update trip'));
    } finally {
      setSubmitting(false);
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
          <h1 className="text-3xl font-bold text-slate-900">Trip Management</h1>
          <p className="text-slate-500 mt-1">View and manage all trips</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Active Trips</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{activeTrips.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Total Trips</p>
            <p className="text-3xl font-bold text-slate-600 mt-2">{trips.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {trips.filter((t) => t.status === 'COMPLETED').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Scheduled</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {trips.filter((t) => t.status === 'SCHEDULED').length}
            </p>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode('today')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                viewMode === 'today'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📅 Today's Trips ({todayTrips.length})
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                viewMode === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📋 All Trips ({trips.length})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Trips
            </button>
            <button
              onClick={() => setFilterStatus('IN_PROGRESS')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === 'IN_PROGRESS'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilterStatus('COMPLETED')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === 'COMPLETED'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilterStatus('SCHEDULED')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === 'SCHEDULED'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Scheduled
            </button>
          </div>
        </div>

        {/* Trips List */}
        {filteredTrips.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-500">No trips found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 cursor-pointer" onClick={() => openDetails(trip)}>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-slate-900">
                        {trip.bus.plateNumber}
                      </h3>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          trip.status
                        )}`}
                      >
                        {trip.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      🚌 Driver: {trip.bus.driver.user.firstName} {trip.bus.driver.user.lastName}
                    </p>
                    <p className="text-sm text-slate-600">🗺️ Route: {trip.route.name}</p>
                    <p className="text-sm text-slate-600">
                      📅 Date: {new Date(trip.date || trip.createdAt).toLocaleDateString()}
                    </p>
                    {trip.scheduledTime && (
                      <p className="text-sm text-slate-600">
                        ⏰ Scheduled: {trip.scheduledTime}
                      </p>
                    )}
                    {trip.startTime && (
                      <p className="text-sm text-slate-600">
                        ⏰ Started: {new Date(trip.startTime).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 font-semibold mb-1">Children</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {trip.attendances.length}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Picked up:{' '}
                      {trip.attendances.filter((a) => a.status === 'PICKED_UP' || a.status === 'DROPPED').length}
                    </p>
                    {(trip.status === 'SCHEDULED' || trip.status === 'PENDING') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(trip);
                        }}
                        className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                      >
                        ✏️ Edit Trip
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trip Details Modal */}
        {showDetails && selectedTrip && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Trip Details - {selectedTrip.bus.plateNumber}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {new Date(selectedTrip.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={closeDetails}
                  className="text-slate-500 hover:text-slate-700 text-2xl font-light"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Trip Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 font-semibold mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        selectedTrip.status
                      )}`}
                    >
                      {selectedTrip.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-semibold mb-1">Bus</p>
                    <p className="font-semibold text-slate-900">
                      {selectedTrip.bus.plateNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-semibold mb-1">Driver</p>
                    <p className="font-semibold text-slate-900">
                      {selectedTrip.bus.driver.user.firstName}{' '}
                      {selectedTrip.bus.driver.user.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-semibold mb-1">Route</p>
                    <p className="font-semibold text-slate-900">{selectedTrip.route.name}</p>
                  </div>
                </div>

                {/* Children List */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-bold text-slate-900 mb-3">
                    Children Assigned ({selectedTrip.attendances.length})
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedTrip.attendances.map((attendance) => (
                      <div
                        key={attendance.id}
                        className="bg-slate-50 p-4 rounded-lg border border-slate-200"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {attendance.child.firstName} {attendance.child.lastName}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {attendance.status === 'PICKED_UP' || attendance.status === 'DROPPED' ? (
                              <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                                ✓ {attendance.status === 'DROPPED' ? 'Dropped Off' : 'Picked Up'}
                              </span>
                            ) : attendance.status === 'MISSED' ? (
                              <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">
                                ✗ Missed
                              </span>
                            ) : (
                              <span className="inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-1 rounded">
                                ⏳ Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                {selectedTrip.startTime && (
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-bold text-slate-900 mb-3">Timeline</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-green-600 text-xl">✓</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Trip Started</p>
                          <p className="text-xs text-slate-600">
                            {new Date(selectedTrip.startTime).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {selectedTrip.endTime && (
                        <div className="flex items-center gap-3">
                          <span className="text-blue-600 text-xl">✓</span>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">Trip Ended</p>
                            <p className="text-xs text-slate-600">
                              {new Date(selectedTrip.endTime).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Trip Modal */}
        {showEditModal && editingTrip && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 rounded-t-lg">
                <h2 className="text-2xl font-bold text-white">
                  ✏️ Override Trip Assignment
                </h2>
                <p className="text-orange-100 text-sm mt-1">
                  {editingTrip.route.name} - {new Date(editingTrip.date || editingTrip.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Current Assignment */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">ℹ️ Current Assignment</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-blue-700">Bus</p>
                      <p className="font-semibold text-blue-900">{editingTrip.bus.plateNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700">Driver</p>
                      <p className="font-semibold text-blue-900">
                        {editingTrip.bus.driver.user.firstName} {editingTrip.bus.driver.user.lastName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* New Assignment */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    🚌 Select New Bus *
                  </label>
                  <select
                    value={selectedBusId}
                    onChange={(e) => setSelectedBusId(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Choose a bus...</option>
                    {buses.map((bus) => (
                      <option key={bus.id} value={bus.id}>
                        {bus.plateNumber}
                        {bus.driver && ` - ${bus.driver.user.firstName} ${bus.driver.user.lastName}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    👨‍✈️ Select New Driver *
                  </label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Choose a driver...</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.user.firstName} {driver.user.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Note:</strong> This change applies to THIS TRIP ONLY. The scheduled route template will remain unchanged.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 rounded-b-lg flex gap-3">
                <button
                  onClick={closeEditModal}
                  className="flex-1 bg-slate-200 text-slate-700 px-4 py-3 rounded-lg font-semibold hover:bg-slate-300 transition"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveOverride}
                  className="flex-1 bg-orange-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50"
                  disabled={submitting || !selectedBusId || !selectedDriverId}
                >
                  {submitting ? 'Saving...' : '💾 Save Override'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
