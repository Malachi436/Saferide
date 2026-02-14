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

export default function DriversPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = use(params);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingDriverId, setUploadingDriverId] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    license: '',
    password: '',
  });

  useEffect(() => {
    fetchDrivers();
  }, [schoolId]);

  const fetchDrivers = async () => {
    if (!schoolId || schoolId === 'undefined') return;
    try {
      setLoading(true);
      const data = await apiClient.get(`/admin/school/${schoolId}/drivers`);
      setDrivers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load drivers');
      console.error('Error loading drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create user and driver
      await apiClient.post('/school/drivers', {
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        license: formData.license.trim(),
      });

      alert(`✅ Driver ${formData.firstName} ${formData.lastName} added successfully!`);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        license: '',
        password: '',
      });
      setShowAddForm(false);
      await fetchDrivers();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add driver';
      alert(`❌ Error: ${errorMessage}`);
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

  const handleDeleteDriver = async (driver: Driver) => {
    if (!confirm(`Are you sure you want to delete driver ${driver.user.firstName} ${driver.user.lastName}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await apiClient.delete(`/drivers/${driver.id}`);
      alert('✅ Driver deleted successfully');
      fetchDrivers();
    } catch (err: any) {
      alert(`❌ Error: ${err.response?.data?.message || 'Failed to delete driver'}`);
    }
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedDriver(null);
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
            <h1 className="text-3xl font-bold text-slate-900">Drivers</h1>
            <p className="text-slate-500 mt-1">Manage school drivers and assignments</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-semibold"
          >
            {showAddForm ? '✕ Cancel' : '+ Add Driver'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Add Driver Form */}
        {showAddForm && (
          <form onSubmit={handleAddDriver} className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add New Driver</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Kwame"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mensah"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="kwame@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0241234567"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  License Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.license}
                  onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="DL-001-2023"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-semibold"
              >
                Create Driver
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-lg transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
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
                  <button
                    onClick={() => handleDeleteDriver(driver)}
                    className="w-full mt-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-4 py-2 rounded-lg transition"
                  >
                    Delete Driver
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
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
