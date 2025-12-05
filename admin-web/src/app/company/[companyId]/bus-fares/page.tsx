'use client';

import { use, useState } from 'react';

export default function BusFaresPage({ params }: { params: Promise<{ companyId: string }> }) {
  use(params);
  const [dailyFare, setDailyFare] = useState('25.00');
  const [weeklyFare, setWeeklyFare] = useState('125.00');
  const [monthlyFare, setMonthlyFare] = useState('450.00');
  const [currency, setCurrency] = useState('GHS');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bus Fares Configuration</h1>
        <p className="mt-2 text-gray-600">Set the pricing for bus transportation services</p>
      </div>

      {/* Information Banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-blue-900">Fare Configuration</h3>
            <p className="mt-1 text-sm text-blue-700">
              These fares will be displayed to parents when they view payment options. You can adjust them based on your business needs.
            </p>
          </div>
        </div>
      </div>

      {/* Currency Selection */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Currency</h2>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="currency"
              value="GHS"
              checked={currency === 'GHS'}
              onChange={(e) => setCurrency(e.target.value)}
              className="mr-2"
            />
            <span className="text-gray-700">GHS (Ghanaian Cedi)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="currency"
              value="USD"
              checked={currency === 'USD'}
              onChange={(e) => setCurrency(e.target.value)}
              className="mr-2"
            />
            <span className="text-gray-700">USD (US Dollar)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="currency"
              value="EUR"
              checked={currency === 'EUR'}
              onChange={(e) => setCurrency(e.target.value)}
              className="mr-2"
            />
            <span className="text-gray-700">EUR (Euro)</span>
          </label>
        </div>
      </div>

      {/* Fare Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Daily Fare */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Daily Plan</h3>
              <p className="text-sm text-gray-500">Pay per trip, daily</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <div className="flex items-center">
              <span className="mr-2 text-gray-700 font-semibold">{currency}</span>
              <input
                type="number"
                value={dailyFare}
                onChange={(e) => setDailyFare(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="0.01"
              />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">Features:</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Pay as you go
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Real-time tracking
              </li>
            </ul>
          </div>
        </div>

        {/* Weekly Fare */}
        <div className="bg-white rounded-lg shadow p-6 border-2 border-orange-500 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Weekly Plan</h3>
              <p className="text-sm text-gray-500">Best for regular use</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <div className="flex items-center">
              <span className="mr-2 text-gray-700 font-semibold">{currency}</span>
              <input
                type="number"
                value={weeklyFare}
                onChange={(e) => setWeeklyFare(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                step="0.01"
              />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">Features:</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                5 school days covered
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Real-time tracking
              </li>
            </ul>
          </div>
        </div>

        {/* Monthly Fare */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Monthly Plan</h3>
              <p className="text-sm text-gray-500">Best value</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <div className="flex items-center">
              <span className="mr-2 text-gray-700 font-semibold">{currency}</span>
              <input
                type="number"
                value={monthlyFare}
                onChange={(e) => setMonthlyFare(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                step="0.01"
              />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">Features:</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                ~20 school days covered
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Real-time tracking
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Save Button (disabled for now) */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          className="px-6 py-3 bg-gray-200 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
          disabled
        >
          Save Changes (Coming Soon)
        </button>
      </div>

      {/* Additional Info */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-yellow-900">Implementation Pending</h3>
            <p className="mt-1 text-sm text-yellow-700">
              This interface is ready for client demonstration. The backend implementation and payment integration will be completed in the next phase of development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
