'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { use } from 'react';

interface School {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  company: {
    id: string;
    name: string;
  };
}

export default function SchoolsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    fetchSchools();
  }, [companyId]);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<School[]>(`/admin/company/${companyId}/schools`);
      setSchools(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load schools');
      console.error('Error loading schools:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      };

      if (editingSchool) {
        await apiClient.put(`/admin/school/${editingSchool.id}`, payload);
      } else {
        await apiClient.post(`/admin/school/${companyId}`, payload);
      }

      resetForm();
      await fetchSchools();
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${editingSchool ? 'update' : 'create'} school`);
    }
  };

  const handleEdit = (school: School) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      address: school.address || '',
      phone: school.phone || '',
      email: school.email || '',
      latitude: school.latitude?.toString() || '',
      longitude: school.longitude?.toString() || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (schoolId: string) => {
    if (!window.confirm('Are you sure you want to delete this school? This will also delete associated routes and children.')) {
      return;
    }

    try {
      await apiClient.delete(`/admin/school/${schoolId}`);
      await fetchSchools();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete school');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      latitude: '',
      longitude: '',
    });
    setEditingSchool(null);
    setShowForm(false);
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
            <h1 className="text-3xl font-bold text-slate-900">Schools Management</h1>
            <p className="text-slate-500 mt-1">Manage schools and their locations</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-semibold"
          >
            {showForm ? '✕ Cancel' : '+ Add School'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Total Schools</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{schools.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">With GPS Coordinates</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {schools.filter((s) => s.latitude && s.longitude).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Active Routes</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">–</p>
            <p className="text-xs text-slate-500 mt-2">Coming soon</p>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingSchool ? 'Edit School' : 'Add New School'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  School Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Springfield Elementary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="school@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+250 XXX XXX XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Main St, Kigali"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="-1.9403"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="29.8739"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-semibold"
              >
                {editingSchool ? 'Update School' : 'Create School'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-lg transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {schools.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-500">No schools found. Add your first school above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((school) => (
              <div
                key={school.id}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-slate-900">{school.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(school)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(school.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {school.address && (
                    <p className="text-sm text-slate-600">📍 {school.address}</p>
                  )}
                  {school.phone && (
                    <p className="text-sm text-slate-600">📱 {school.phone}</p>
                  )}
                  {school.email && (
                    <p className="text-sm text-slate-600">📧 {school.email}</p>
                  )}
                  {school.latitude && school.longitude && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-500 font-semibold mb-1">GPS Coordinates</p>
                      <p className="text-xs text-slate-600">
                        {school.latitude.toFixed(4)}, {school.longitude.toFixed(4)}
                      </p>
                      <div className="mt-2">
                        <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                          ✓ GPS Enabled
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
