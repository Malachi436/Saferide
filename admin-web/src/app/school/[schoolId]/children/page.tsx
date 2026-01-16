'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { use } from 'react';

interface Child {
  id: string;
  uniqueCode?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  pickupType: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  pickupDescription?: string;
  parentPhone?: string;
  allergies?: string;
  medicalConditions?: string;
  routeId?: string | null;
  route?: {
    id: string;
    name: string;
    bus?: {
      plateNumber: string;
    };
  } | null;
  parent?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  } | null;
  school: {
    id: string;
    name: string;
  };
  tripAssignments?: Array<{
    id: string;
    trip: {
      id: string;
      date: string;
      status: string;
      bus: {
        id: string;
        plateNumber: string;
        driver: {
          user: {
            firstName: string;
            lastName: string;
          };
        };
      };
    };
  }>;
}

export default function StudentsPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = use(params);
  const [children, setChildren] = useState<Child[]>([]);
  const [routes, setRoutes] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [assigningChildId, setAssigningChildId] = useState<string | null>(null);
  const [schoolCode, setSchoolCode] = useState('SCH');
  const [actualSchoolId, setActualSchoolId] = useState('');
  const [showOnboardForm, setShowOnboardForm] = useState(false);
  const [onboardData, setOnboardData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    grade: '',
    daysUntilNextPayment: 30,
  });

  useEffect(() => {
    fetchData();
  }, [schoolId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch routes
      const routesData = await apiClient.get(`/admin/company/${schoolId}/routes`);
      setRoutes(Array.isArray(routesData) ? routesData : []);

      // Fetch children (students)
      const childrenData = await apiClient.get(`/admin/company/${schoolId}/children`);
      setChildren(Array.isArray(childrenData) ? childrenData : []);

      // Get school info for code
      const companyData: any = await apiClient.get(`/admin/companies/${schoolId}`);
      if (companyData && companyData.schools && companyData.schools.length > 0) {
        const firstSchool = companyData.schools[0];
        setActualSchoolId(firstSchool.id);
        setSchoolCode(firstSchool.schoolCode || firstSchool.name.substring(0, 3).toUpperCase());
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load students');
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRoute = async (childId: string, routeId: string) => {
    try {
      await apiClient.patch(`/children/${childId}`, {
        routeId: routeId || null,
      });
      alert('✅ Route assigned successfully!');
      setAssigningChildId(null);
      fetchData(); // Refresh the data
    } catch (err: any) {
      alert('❌ Error: ' + (err.response?.data?.message || 'Failed to assign route'));
    }
  };

  const handleOnboardStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!actualSchoolId) {
      alert('❌ Error: School information not loaded. Please refresh the page.');
      return;
    }
    
    try {
      const response: any = await apiClient.post('/children/bulk-onboard', {
        companyId: schoolId,
        schoolId: actualSchoolId,
        children: [
          {
            firstName: onboardData.firstName.trim(),
            lastName: onboardData.lastName.trim(),
            dateOfBirth: onboardData.dateOfBirth,
            grade: onboardData.grade.trim(),
            pickupType: 'HOME',
            pickupDescription: 'To be set by parent',
            daysUntilNextPayment: parseInt(onboardData.daysUntilNextPayment.toString()),
          },
        ],
      });

      const newChild = response.created[0];
      const linkingCode = newChild.uniqueCode || `${schoolCode}-${newChild.id.substring(0, 8).toUpperCase()}`;
      
      alert(
        `✅ Student onboarded successfully!\n\n` +
        `Student ID: ${linkingCode}\n` +
        `Days until payment: ${onboardData.daysUntilNextPayment}\n\n` +
        `Share this code with the parent so they can:\n` +
        `1. Link their account\n` +
        `2. Set pickup location (GPS)\n` +
        `3. Add allergy & medical information`
      );
      
      setOnboardData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        grade: '',
        daysUntilNextPayment: 30,
      });
      setShowOnboardForm(false);
      await fetchData();
    } catch (err: any) {
      alert('❌ Error: ' + (err.response?.data?.message || 'Failed to onboard student'));
    }
  };

  const filteredChildren = children.filter((child) => {
    const matchesSearch =
      `${child.firstName} ${child.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (child.parent?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesSearch;
  });



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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Students</h1>
            <p className="text-slate-500 mt-1">Manage enrolled students and assignments</p>
          </div>
          <button
            onClick={() => setShowOnboardForm(!showOnboardForm)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            {showOnboardForm ? '✕ Cancel' : '+ Onboard Student'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Onboard Student Form */}
        {showOnboardForm && (
          <form onSubmit={handleOnboardStudent} className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Onboard New Student</h3>
            <p className="text-sm text-slate-600 mb-4">
              After onboarding, you'll receive a unique linking code to share with the parent.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">First Name *</label>
                <input
                  type="text"
                  required
                  value={onboardData.firstName}
                  onChange={(e) => setOnboardData({ ...onboardData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  required
                  value={onboardData.lastName}
                  onChange={(e) => setOnboardData({ ...onboardData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={onboardData.dateOfBirth}
                  onChange={(e) => setOnboardData({ ...onboardData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Grade *</label>
                <input
                  type="text"
                  required
                  value={onboardData.grade}
                  onChange={(e) => setOnboardData({ ...onboardData, grade: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 5th Grade"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Days Until Next Payment *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="365"
                  value={onboardData.daysUntilNextPayment}
                  onChange={(e) => setOnboardData({ ...onboardData, daysUntilNextPayment: parseInt(e.target.value) || 30 })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="30"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition"
              >
                Onboard Student
              </button>
              <button
                type="button"
                onClick={() => setShowOnboardForm(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold px-6 py-3 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Total Students</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{children.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">School Code</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{schoolCode}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Search Students</label>
            <input
              type="text"
              placeholder="Search by student name or parent email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {filteredChildren.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-500">No students found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredChildren.map((child) => {
              const studentId = child.uniqueCode || `${schoolCode}-${child.id.substring(0, 4)}`;
              return (
                <div key={child.id} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Student Info */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">
                        {child.firstName} {child.lastName}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">🆔 {studentId}</p>
                      <p className="text-sm text-slate-600">📚 {child.school.name}</p>
                      <p className="text-sm text-slate-600">📅 {new Date(child.dateOfBirth).toLocaleDateString()}</p>
                      {child.allergies && (
                        <p className="text-sm text-red-600 font-semibold mt-2">
                          ⚠️ Allergies: {child.allergies}
                        </p>
                      )}
                      {child.medicalConditions && (
                        <p className="text-sm text-orange-600 font-semibold mt-1">
                          🏥 Medical: {child.medicalConditions}
                        </p>
                      )}
                    </div>

                    {/* Parent Info */}
                    <div>
                      <p className="text-sm text-slate-500 font-semibold mb-1">Parent/Guardian</p>
                      {child.parent ? (
                        <>
                          <p className="font-semibold text-slate-900">
                            {child.parent.firstName} {child.parent.lastName}
                          </p>
                          <p className="text-sm text-slate-600">📧 {child.parent.email}</p>
                          <p className="text-sm text-slate-600">📱 {child.parent.phone || 'N/A'}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-slate-500 italic">Not linked yet</p>
                          {child.parentPhone && (
                            <p className="text-sm text-slate-600">📱 {child.parentPhone}</p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Route Assignment */}
                    <div>
                      <p className="text-sm text-slate-500 font-semibold mb-1">Assigned Bus & Route</p>
                      {child.route ? (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <p className="text-sm font-semibold text-blue-900">{child.route.name}</p>
                          {child.route.bus && (
                            <p className="text-xs text-blue-700">🚌 {child.route.bus.plateNumber}</p>
                          )}
                          <button
                            onClick={() => setAssigningChildId(child.id)}
                            className="mt-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Change Route
                          </button>
                        </div>
                      ) : assigningChildId === child.id ? (
                        <div className="space-y-2">
                          <select
                            onChange={(e) => handleAssignRoute(child.id, e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue=""
                          >
                            <option value="">Select route...</option>
                            {routes.map((route) => (
                              <option key={route.id} value={route.id}>
                                {route.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => setAssigningChildId(null)}
                            className="text-xs text-slate-600 hover:text-slate-800"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningChildId(child.id)}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-semibold transition"
                        >
                          + Assign Route
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pickup Info - Full Width Below */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500 font-semibold mb-1">Pickup Location</p>
                        <p className="font-semibold text-slate-900">{child.pickupType}</p>
                        {child.pickupDescription && (
                          <p className="text-sm text-slate-600">📍 {child.pickupDescription}</p>
                        )}
                      </div>
                      {child.tripAssignments && child.tripAssignments.length > 0 && (
                        <div>
                          <p className="text-sm text-slate-500 font-semibold mb-1">🚌 Current Trip Driver</p>
                          <p className="text-sm text-slate-900">
                            {child.tripAssignments[0].trip.bus.driver.user.firstName}{' '}
                            {child.tripAssignments[0].trip.bus.driver.user.lastName}
                          </p>
                          <p className="text-xs text-slate-600">
                            {child.tripAssignments[0].trip.bus.plateNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
