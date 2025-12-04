'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';

interface School {  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  company: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface Company {
  id: string;
  name: string;
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    companyId: '',
  });

  useEffect(() => {
    fetchSchools();
    fetchCompanies();
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

  const fetchCompanies = async () => {
    try {
      const data = await apiClient.get<Company[]>('/admin/companies');
      setCompanies(data || []);
    } catch (err: any) {
      console.error('Failed to load companies:', err);
    }
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(`/admin/school/${formData.companyId}`, {
        name: formData.name,
        address: formData.address,
      });
      setFormData({ name: '', address: '', companyId: '' });
      setShowForm(false);
      await fetchSchools();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create school');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Schools</h1>
            <p className="text-slate-500 mt-1">View all schools across all companies</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            {showForm ? '✕ Cancel' : '+ Add School'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Company *</label>
                <select
                  required
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="School address"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2 rounded-lg transition"
              >
                Create School
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold px-6 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading schools...</p>
          </div>
        ) : schools.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-500">No schools found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">School Name</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">Company</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">Address</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">Location</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {schools.map((school) => (
                  <tr key={school.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">{school.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded font-semibold">
                        {school.company.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 text-sm">{school.address || '–'}</td>
                    <td className="px-6 py-4 text-slate-700 text-sm">
                      {school.latitude && school.longitude
                        ? `${school.latitude.toFixed(4)}, ${school.longitude.toFixed(4)}`
                        : '–'}
                    </td>
                    <td className="px-6 py-4 text-slate-700 text-sm">
                      {new Date(school.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
