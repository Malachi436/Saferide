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

interface CompanyDetail extends Company {
  users: Array<{ id: string; name: string; email: string; role: string }>;
  schools: Array<{ id: string; name: string }>;
  buses?: Array<{ id: string; licensePlate: string }>;
  drivers?: Array<{ id: string; name: string }>;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetail | null>(null);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetail | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
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

  const fetchCompanyDetails = async (companyId: string) => {
    try {
      setDetailsLoading(true);
      const data = await apiClient.get<CompanyDetail>(`/admin/companies/${companyId}`);
      setCompanyDetails(data);
      setSelectedCompany(data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load company details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedCompany(null);
    setCompanyDetails(null);
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }
    try {
      await apiClient.delete(`/admin/company/${companyId}`);
      closeDetails();
      await fetchCompanies();
      alert('Company deleted successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete company');
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/company', formData);
      setFormData({ name: '', email: '', phone: '', address: '', adminName: '', adminEmail: '', adminPassword: '' });
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

              <div className="md:col-span-2 border-t border-slate-200 pt-4 mt-4">
                <h4 className="font-semibold text-slate-900 mb-4">Company Admin Account</h4>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Name *</label>
                <input
                  type="text"
                  required
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Email *</label>
                <input
                  type="email"
                  required
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="admin@company.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Password *</label>
                <input
                  type="password"
                  required
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Create a secure password"
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
                      <div className="flex gap-3">
                        <button 
                          onClick={() => fetchCompanyDetails(company.id)}
                          className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this company?')) {
                              handleDeleteCompany(company.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700 font-semibold text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedCompany && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">{selectedCompany.name}</h2>
                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this company?')) {
                        handleDeleteCompany(selectedCompany.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-700 font-semibold text-sm px-3 py-1 border border-red-200 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                  <button
                    onClick={closeDetails}
                    className="text-slate-500 hover:text-slate-700 text-2xl font-light"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {detailsLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading details...</p>
                </div>
              ) : companyDetails ? (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Email</p>
                      <p className="font-semibold text-slate-900">{companyDetails.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Phone</p>
                      <p className="font-semibold text-slate-900">{companyDetails.phone || '–'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-slate-500 mb-1">Created</p>
                      <p className="font-semibold text-slate-900">{new Date(companyDetails.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-bold text-slate-900 mb-4">Company Admin</h3>
                    {companyDetails.users && companyDetails.users.find(u => u.role === 'COMPANY_ADMIN') ? (
                      <div className="bg-slate-50 p-4 rounded-lg">
                        {companyDetails.users.map(user => (
                          user.role === 'COMPANY_ADMIN' && (
                            <div key={user.id}>
                              <p className="font-semibold text-slate-900">{user.name}</p>
                              <p className="text-sm text-slate-600">{user.email}</p>
                            </div>
                          )
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">No admin assigned</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Schools</p>
                      <p className="text-2xl font-bold text-blue-600">{companyDetails.schools?.length || 0}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Buses</p>
                      <p className="text-2xl font-bold text-green-600">{companyDetails.buses?.length || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Drivers</p>
                      <p className="text-2xl font-bold text-purple-600">{companyDetails.drivers?.length || 0}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Users</p>
                      <p className="text-2xl font-bold text-orange-600">{companyDetails.users?.length || 0}</p>
                    </div>
                  </div>

                  {companyDetails.schools && companyDetails.schools.length > 0 && (
                    <div className="border-t border-slate-200 pt-6">
                      <h3 className="font-bold text-slate-900 mb-3">Schools</h3>
                      <ul className="space-y-2">
                        {companyDetails.schools.map(school => (
                          <li key={school.id} className="text-slate-700 flex items-center">
                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                            {school.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
