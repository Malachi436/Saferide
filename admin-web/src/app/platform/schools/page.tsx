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

interface SchoolDetails extends School {
  students?: number;
  drivers?: number;
  buses?: number;
  routes?: number;
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
  const [createNewCompany, setCreateNewCompany] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    companyId: '',
    schoolCode: '',
    // New company fields
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
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
      if (createNewCompany) {
        // Create new company with school
        await apiClient.post('/admin/company', {
          name: formData.companyName,
          email: formData.companyEmail,
          phone: formData.companyPhone,
          address: formData.address,
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          adminPassword: formData.adminPassword,
          // Immediately create first school
          schoolName: formData.name,
          schoolCode: formData.schoolCode.trim().toUpperCase(),
        });
      } else {
        // Add school to existing company
        await apiClient.post(`/admin/school/${formData.companyId}`, {
          name: formData.name,
          address: formData.address,
          schoolCode: formData.schoolCode.trim().toUpperCase(),
        });
      }
      setFormData({ name: '', address: '', companyId: '', schoolCode: '', companyName: '', companyEmail: '', companyPhone: '', adminName: '', adminEmail: '', adminPassword: '' });
      setShowForm(false);
      setCreateNewCompany(false);
      await fetchSchools();
      await fetchCompanies();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create school');
    }
  };

  const fetchSchoolDetails = async (schoolId: string, companyId: string) => {
    try {
      setDetailsLoading(true);
      // Fetch school stats
      const [children, drivers, buses, routes] = await Promise.all([
        apiClient.get(`/admin/company/${companyId}/children`).catch(() => []),
        apiClient.get(`/admin/company/${companyId}/drivers`).catch(() => []),
        apiClient.get(`/buses/company/${companyId}`).catch(() => []),
        apiClient.get(`/admin/company/${companyId}/routes`).catch(() => []),
      ]);
      
      const school = schools.find(s => s.id === schoolId);
      if (school) {
        setSelectedSchool({
          ...school,
          students: Array.isArray(children) ? children.length : 0,
          drivers: Array.isArray(drivers) ? drivers.length : 0,
          buses: Array.isArray(buses) ? buses.length : 0,
          routes: Array.isArray(routes) ? routes.length : 0,
        });
      }
    } catch (err: any) {
      console.error('Failed to load school details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedSchool(null);
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
            
            {/* Toggle: New Company or Existing Company */}
            <div className="mb-6 flex gap-4">
              <button
                type="button"
                onClick={() => setCreateNewCompany(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                  !createNewCompany
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Add to Existing Company
              </button>
              <button
                type="button"
                onClick={() => setCreateNewCompany(true)}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                  createNewCompany
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Create New Company
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {createNewCompany ? (
                <>
                  {/* New Company Form */}
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-slate-900 mb-3 border-b pb-2">Company Details</h4>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., SafeRide Ghana"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Company Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.companyEmail}
                      onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Company Phone</label>
                    <input
                      type="tel"
                      value={formData.companyPhone}
                      onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="+233 20 123 4567"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-slate-900 mb-3 mt-4 border-b pb-2">Company Admin Account</h4>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.adminName}
                      onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-slate-900 mb-3 mt-4 border-b pb-2">First School Details</h4>
                  </div>
                </>
              ) : (
                <>
                  {/* Existing Company Selector */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Select Company *</label>
                    <select
                      required
                      value={formData.companyId}
                      onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Choose a company...</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              
              {/* School Details (common for both modes) */}
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
                  onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., GFA (3-4 chars)"
                  maxLength={4}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">School Address</label>
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
                  <tr 
                    key={school.id} 
                    onClick={() => fetchSchoolDetails(school.id, school.company.id)}
                    className="hover:bg-teal-50 transition cursor-pointer"
                  >
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

        {/* School Details Modal */}
        {selectedSchool && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedSchool.name}</h2>
                  <p className="text-slate-600 mt-1">
                    <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded font-semibold">
                      {selectedSchool.company.name}
                    </span>
                  </p>
                </div>
                <button
                  onClick={closeDetails}
                  className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {detailsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                </div>
              ) : (
                <>
                  {/* School Info */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">School Information</h3>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-semibold">Address:</span>
                        <span className="text-slate-900">{selectedSchool.address || '–'}</span>
                      </div>
                      {selectedSchool.latitude && selectedSchool.longitude && (
                        <div className="flex justify-between">
                          <span className="text-slate-600 font-semibold">Coordinates:</span>
                          <span className="text-slate-900">
                            {selectedSchool.latitude.toFixed(4)}, {selectedSchool.longitude.toFixed(4)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-semibold">Created:</span>
                        <span className="text-slate-900">
                          {new Date(selectedSchool.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600">{selectedSchool.students || 0}</p>
                        <p className="text-sm text-slate-600 font-semibold mt-1">Students</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">{selectedSchool.drivers || 0}</p>
                        <p className="text-sm text-slate-600 font-semibold mt-1">Drivers</p>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-orange-600">{selectedSchool.buses || 0}</p>
                        <p className="text-sm text-slate-600 font-semibold mt-1">Buses</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-purple-600">{selectedSchool.routes || 0}</p>
                        <p className="text-sm text-slate-600 font-semibold mt-1">Routes</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-200 flex gap-3">
                    <button
                      onClick={() => window.location.href = `/school/${selectedSchool.company.id}/overview`}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg transition font-semibold"
                    >
                      View School Dashboard →
                    </button>
                    <button
                      onClick={closeDetails}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-900 px-6 py-3 rounded-lg transition font-semibold"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
