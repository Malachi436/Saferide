'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';

interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<Company[]>('/admin/companies');
      setCompanies(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/company', formData);
      setFormData({ name: '', email: '', phone: '', address: '' });
      setShowForm(false);
      await fetchCompanies();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create company');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Companies</h1>
            <p className="text-slate-500 mt-1">Manage all registered companies</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            {showForm ? '✕ Cancel' : '+ Add Company'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreateCompany} className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Create New Company</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., SafeRide Transport"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+233 20 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Main Street, Accra"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition"
              >
                Create Company
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
            <p className="text-slate-600">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-500 mb-4">No companies registered yet.</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition">
              Create First Company
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">Company Name</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">Email</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">Phone</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">Created</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">{company.name}</td>
                    <td className="px-6 py-4 text-slate-700">{company.email}</td>
                    <td className="px-6 py-4 text-slate-700">{company.phone || '–'}</td>
                    <td className="px-6 py-4 text-slate-700">
                      {new Date(company.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                        View
                      </button>
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
