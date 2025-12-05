'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api-client';
import { use, useEffect, useState } from 'react';

interface PaymentPlan {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  description?: string;
  features?: string[];
  isActive: boolean;
  createdAt: string;
}

export default function PaymentPlansPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { user } = useAuth();
  const { companyId } = use(params);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    frequency: 'weekly',
    description: '',
    features: [] as string[],
  });
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    fetchPaymentPlans();
  }, [companyId]);

  const fetchPaymentPlans = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<PaymentPlan[]>(`/payment-plans/company/${companyId}`);
      setPaymentPlans(data || []);
    } catch (err: any) {
      console.error('[PaymentPlans] Error:', err);
      setError(err.response?.data?.message || 'Failed to load payment plans');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput],
      });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.put(`/payment-plans/${editingId}`, formData);
      } else {
        await apiClient.post(`/payment-plans/company/${companyId}`, formData);
      }
      await fetchPaymentPlans();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save payment plan');
    }
  };

  const handleEdit = (plan: PaymentPlan) => {
    setEditingId(plan.id);
    setFormData({
      name: plan.name,
      amount: plan.amount,
      frequency: plan.frequency,
      description: plan.description || '',
      features: plan.features || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment plan?')) return;

    try {
      await apiClient.delete(`/payment-plans/${id}`);
      await fetchPaymentPlans();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete payment plan');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      amount: 0,
      frequency: 'weekly',
      description: '',
      features: [],
    });
    setShowForm(false);
    setFeatureInput('');
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Payment Plans</h1>
            <p className="text-slate-500 mt-1">Manage payment plans for your parents</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            + New Plan
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Payment Plan Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {editingId ? 'Edit Payment Plan' : 'Create New Payment Plan'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Daily, Weekly, Monthly"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Amount (GHS) *
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Frequency *
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Best value option"
                  />
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Features
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a feature and press Enter"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg font-semibold transition"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="text-blue-700 hover:text-blue-900 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  {editingId ? 'Update Plan' : 'Create Plan'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Payment Plans List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-slate-500 mt-4">Loading payment plans...</p>
          </div>
        ) : paymentPlans.length === 0 ? (
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-600 text-lg">No payment plans created yet</p>
            <p className="text-slate-500 mt-2">Create your first payment plan to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentPlans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-lg border-2 p-6 transition ${
                  plan.isActive
                    ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-white'
                    : 'border-slate-200 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-slate-500 text-sm capitalize">{plan.frequency}</p>
                  </div>
                  {!plan.isActive && (
                    <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-4xl font-bold text-blue-600">GHS {plan.amount}</p>
                  {plan.description && (
                    <p className="text-slate-600 text-sm mt-2">{plan.description}</p>
                  )}
                </div>

                {plan.features && plan.features.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Features:</p>
                    <ul className="space-y-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="text-sm text-slate-600">
                          ✓ {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2 rounded-lg transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
