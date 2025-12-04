'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { use } from 'react';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  pickupType: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  pickupDescription?: string;
  parent: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
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

interface PaymentStatus {
  childId: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}

export default function ChildrenPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const [children, setChildren] = useState<Child[]>([]);
  const [payments, setPayments] = useState<Map<string, PaymentStatus>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchData();
  }, [companyId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch schools
      const schoolsData = await apiClient.get(`/admin/company/${companyId}/schools`);
      setSchools(schoolsData || []);

      // Fetch children
      const childrenData = await apiClient.get(`/admin/company/${companyId}/children`);
      setChildren(childrenData || []);

      // Fetch payment status
      const paymentsData = await apiClient.get(`/admin/company/${companyId}/children/payments`);
      if (paymentsData && Array.isArray(paymentsData)) {
        const paymentsMap = new Map();
        paymentsData.forEach((payment: PaymentStatus) => {
          paymentsMap.set(payment.childId, payment);
        });
        setPayments(paymentsMap);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load children');
      console.error('Error loading children:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredChildren = children.filter((child) => {
    const matchesSearch =
      `${child.firstName} ${child.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.parent.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSchool = !selectedSchool || child.school.id === selectedSchool;
    return matchesSearch && matchesSchool;
  });

  const getPaymentStatus = (childId: string) => {
    return payments.get(childId) || {
      status: 'PENDING',
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
    };
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'OVERDUE':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
          <h1 className="text-3xl font-bold text-slate-900">Children Management</h1>
          <p className="text-slate-500 mt-1">Monitor children, payments, and driver assignments</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Total Children</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{children.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Pending Payments</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {Array.from(payments.values()).filter((p) => p.status === 'PENDING').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-semibold">Overdue Payments</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {Array.from(payments.values()).filter((p) => p.status === 'OVERDUE').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by child name or parent email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Filter by School</label>
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Schools</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredChildren.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-500">No children found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredChildren.map((child) => {
              const payment = getPaymentStatus(child.id);
              return (
                <div key={child.id} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Child Info */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">
                        {child.firstName} {child.lastName}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">📚 {child.school.name}</p>
                      <p className="text-sm text-slate-600">📅 {new Date(child.dateOfBirth).toLocaleDateString()}</p>
                    </div>

                    {/* Parent Info */}
                    <div>
                      <p className="text-sm text-slate-500 font-semibold mb-1">Parent</p>
                      <p className="font-semibold text-slate-900">
                        {child.parent.firstName} {child.parent.lastName}
                      </p>
                      <p className="text-sm text-slate-600">📧 {child.parent.email}</p>
                      <p className="text-sm text-slate-600">📱 {child.parent.phone || 'N/A'}</p>
                    </div>

                    {/* Payment Status */}
                    <div>
                      <p className="text-sm text-slate-500 font-semibold mb-1">Payment Status</p>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPaymentColor(payment.status)}`}>
                        {payment.status}
                      </div>
                      <p className="text-sm text-slate-600 mt-2">
                        💰 ${payment.paidAmount.toFixed(2)} / ${payment.totalAmount.toFixed(2)}
                      </p>
                      {payment.pendingAmount > 0 && (
                        <p className="text-sm text-red-600 font-semibold">
                          Pending: ${payment.pendingAmount.toFixed(2)}
                        </p>
                      )}
                    </div>

                    {/* Pickup & Driver Info */}
                    <div>
                      <p className="text-sm text-slate-500 font-semibold mb-1">Pickup Type</p>
                      <p className="font-semibold text-slate-900">{child.pickupType}</p>
                      {child.pickupDescription && (
                        <p className="text-sm text-slate-600">📍 {child.pickupDescription}</p>
                      )}
                      {child.tripAssignments && child.tripAssignments.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-slate-500 font-semibold">🚌 Driver</p>
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
