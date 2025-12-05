'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { use } from 'react';

interface Driver {
  id: string;
  license: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  buses: Array<{
    id: string;
    plateNumber: string;
    capacity: number;
  }>;
  children?: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
  photoUrl?: string;
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  driverId?: string;
  school: { id: string; name: string };
}

export default function DriversPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingDriverId, setUploadingDriverId] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAssignChildren, setShowAssignChildren] = useState(false);
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>([]);
  const [assigningChildren, setAssigningChildren] = useState(false);

  useEffect(() => {
    fetchData();
  }, [companyId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const driversData = (await apiClient.get(`/admin/company/${companyId}/drivers`)) as Driver[];
      const childrenData = (await apiClient.get(`/admin/company/${companyId}/children`)) as Child[];
      setDrivers(driversData || []);
      setChildren(childrenData || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (driverId: string, file: File) => {
    try {
      setUploadingDriverId(driverId);
      const formData = new FormData();
      formData.append('photo', file);

      await apiClient.post(`/admin/driver/${driverId}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update the local state
      setDrivers(
        drivers.map((driver) =>
          driver.id === driverId
            ? { ...driver, photoUrl: URL.createObjectURL(file) }
            : driver
        )
      );

      alert('Photo uploaded successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingDriverId(null);
    }
  };

  const openDetails = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedDriver(null);
  };

  const openAssignChildren = () => {
    setSelectedChildrenIds((selectedDriver?.children || []).map((c) => c.id));
    setShowAssignChildren(true);
  };

  const closeAssignChildren = () => {
    setShowAssignChildren(false);
    setSelectedChildrenIds([]);
  };

  const handleAssignChildren = async () => {
    if (!selectedDriver) return;
    try {
      setAssigningChildren(true);
      await Promise.all(
        selectedChildrenIds.map((childId) =>
          apiClient.patch(`/children/${childId}`, { driverId: selectedDriver.id })
        )
      );
      // Mark unassigned children as unassigned
      const currentlyAssigned = (selectedDriver.children || []).map((c) => c.id);
      const childrenToUnassign = currentlyAssigned.filter(
        (id) => !selectedChildrenIds.includes(id)
      );
      await Promise.all(
        childrenToUnassign.map((childId) =>
          apiClient.patch(`/children/${childId}`, { driverId: null })
        )
      );
      await fetchData();
      closeAssignChildren();
      alert('Children assigned successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign children');
    } finally {
      setAssigningChildren(false);
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
          <h1 className="text-3xl font-bold text-slate-900">Drivers Management</h1>
          <p className="text-slate-500 mt-1">Manage drivers, assignments, and photos</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Total Drivers</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{drivers.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Drivers with Photo</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {drivers.filter((d) => d.photoUrl).length}
            </p>
          </div>
        </div>

        {drivers.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-500">No drivers found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.map((driver) => (
              <div key={driver.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition">
                <div className="aspect-video bg-slate-100 flex items-center justify-center relative">
                  {driver.photoUrl ? (
                    <img src={driver.photoUrl} alt={`${driver.user.firstName} ${driver.user.lastName}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <p className="text-slate-500 text-4xl">👤</p>
                      <p className="text-slate-500 text-sm mt-2">No photo</p>
                    </div>
                  )}
                  <label className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handlePhotoUpload(driver.id, e.target.files[0]);
                        }
                      }}
                      disabled={uploadingDriverId === driver.id}
                      className="hidden"
                    />
                    📷
                  </label>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-slate-900 text-lg">
                    {driver.user.firstName} {driver.user.lastName}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">🪪 License: {driver.license}</p>
                  <p className="text-sm text-slate-600">📧 {driver.user.email}</p>
                  <p className="text-sm text-slate-600">📱 {driver.user.phone || 'N/A'}</p>

                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-500 font-semibold mb-2">Assigned Buses: {driver.buses.length}</p>
                    {driver.buses.length > 0 ? (
                      <ul className="space-y-1">
                        {driver.buses.map((bus) => (
                          <li key={bus.id} className="text-sm text-slate-700">
                            🚌 {bus.plateNumber} (Cap: {bus.capacity})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">No buses assigned</p>
                    )}
                  </div>

                  <button
                    onClick={() => openDetails(driver)}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Details Modal */}
        {showDetails && selectedDriver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedDriver.user.firstName} {selectedDriver.user.lastName}
                </h2>
                <button
                  onClick={closeDetails}
                  className="text-slate-500 hover:text-slate-700 text-2xl font-light"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Photo Section */}
                {selectedDriver.photoUrl && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={selectedDriver.photoUrl}
                      alt={`${selectedDriver.user.firstName} ${selectedDriver.user.lastName}`}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {/* Driver Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 font-semibold mb-1">License Number</p>
                    <p className="font-semibold text-slate-900">{selectedDriver.license}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-semibold mb-1">Email</p>
                    <p className="font-semibold text-slate-900">{selectedDriver.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-semibold mb-1">Phone</p>
                    <p className="font-semibold text-slate-900">{selectedDriver.user.phone || 'N/A'}</p>
                  </div>
                </div>

                {/* Buses */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-bold text-slate-900 mb-3">Assigned Buses</h3>
                  {selectedDriver.buses.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDriver.buses.map((bus) => (
                        <div key={bus.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <p className="font-semibold text-slate-900">🚌 {bus.plateNumber}</p>
                          <p className="text-sm text-slate-600">Capacity: {bus.capacity} seats</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600">No buses assigned</p>
                  )}
                </div>

                {/* Children */}
                {selectedDriver.children && selectedDriver.children.length > 0 && (
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-bold text-slate-900 mb-3">Children Assigned ({selectedDriver.children.length})</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedDriver.children.map((child) => (
                        <div key={child.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <p className="font-semibold text-slate-900">👶 {child.firstName} {child.lastName}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-6">
                  <button
                    onClick={openAssignChildren}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition"
                  >
                    Assign Children to Route
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assign Children Modal */}
        {showAssignChildren && selectedDriver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">
                  Assign Children to {selectedDriver.user.firstName}
                </h2>
                <button
                  onClick={closeAssignChildren}
                  className="text-slate-500 hover:text-slate-700 text-2xl font-light"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                {children.length === 0 ? (
                  <p className="text-slate-600">No available children</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {children.map((child) => (
                      <label key={child.id} className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedChildrenIds.includes(child.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedChildrenIds([...selectedChildrenIds, child.id]);
                            } else {
                              setSelectedChildrenIds(
                                selectedChildrenIds.filter((id) => id !== child.id)
                              );
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                        />
                        <div className="ml-3">
                          <p className="font-semibold text-slate-900">
                            {child.firstName} {child.lastName}
                          </p>
                          <p className="text-sm text-slate-600">{child.school.name}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={closeAssignChildren}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold px-4 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignChildren}
                    disabled={assigningChildren}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold px-4 py-2 rounded-lg transition"
                  >
                    {assigningChildren ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
