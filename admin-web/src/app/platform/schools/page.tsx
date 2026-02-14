'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface School {
  id: string;
  name: string;
  address: string;
  schoolCode: string;
  phone?: string;
  email?: string;
  baseFare: number;
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    schoolCode: '',
    phone: '',
    email: '',
    adminEmail: '',
    adminPassword: '',
    adminFirstName: '',
    adminLastName: '',
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<School[]>('/admin/schools');
      setSchools(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchool = async () => {
    if (!schoolToDelete) return;
    
    try {
      setIsDeleting(true);
      await apiClient.delete(`/admin/school/${schoolToDelete.id}`);
      setSchoolToDelete(null);
      await fetchSchools();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete school');
    } finally {
      setIsDeleting(false);
    }
  };
  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/school', {
        name: formData.name,
        address: formData.address,
        schoolCode: formData.schoolCode.trim().toUpperCase(),
        phone: formData.phone,
        email: formData.email,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
      });
      setFormData({ name: '', address: '', schoolCode: '', phone: '', email: '', adminEmail: '', adminPassword: '', adminFirstName: '', adminLastName: '' });
      setShowForm(false);
      await fetchSchools();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create school');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Schools</h1>
            <p className="text-slate-500 mt-1">Manage schools in the system</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition"
          >
            {showForm ? 'Cancel' : 'Add School'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreateSchool} className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add New School</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">School Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Greenfield Academy"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">School Code *</label>
                <input
                  type="text"
                  required
                  value={formData.schoolCode}
                  onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., GFA"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 123 School Lane, Accra"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., +233 20 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">School Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., info@greenfield.edu.gh"
                />
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-4 mt-6">School Admin Credentials</h3>
            <p className="text-sm text-slate-500 mb-4">Create login credentials for the school administrator</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Admin First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.adminFirstName}
                  onChange={(e) => setFormData({ ...formData, adminFirstName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., John"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.adminLastName}
                  onChange={(e) => setFormData({ ...formData, adminLastName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Email *</label>
                <input
                  type="email"
                  required
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., admin@greenfield.edu.gh"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition"
              >
                Create School
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="mt-2 text-slate-500">Loading schools...</p>
          </div>
        ) : schools.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <p className="text-slate-500">No schools found. Add a school to get started.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">School Code</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {schools.map((school) => (
                  <tr key={school.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{school.schoolCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{school.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{school.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{school.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{school.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSchoolToDelete(school)}
                        className="text-red-600 hover:text-red-800 font-medium transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {schoolToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Delete</h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete <strong>{schoolToDelete.name}</strong> ({schoolToDelete.schoolCode})? 
                This action cannot be undone and will remove all associated data including routes, children, and trips.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setSchoolToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSchool}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete School'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
