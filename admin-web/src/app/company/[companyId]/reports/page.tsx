'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';
import { useState } from 'react';
import { use } from 'react';

type ReportType = 'attendance' | 'payments' | 'driver-performance';
type DateRange = 'daily' | 'weekly' | 'monthly';

export default function ReportsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('weekly');

  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert('No data available to export');
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle values with commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReport = async (type: ReportType) => {
    try {
      setLoading(true);
      setError('');

      const endpoint = `/admin/company/${companyId}/reports/${type}?range=${dateRange}`;
      const response = await apiClient.get(endpoint);
      const data = Array.isArray(response) ? response : [];

      if (data.length === 0) {
        alert('No data available for this report');
        return;
      }

      // Download as CSV
      const filenames = {
        attendance: 'attendance_report',
        payments: 'payment_report',
        'driver-performance': 'driver_performance_report',
      };

      downloadCSV(data, `${filenames[type]}_${dateRange}`);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate report');
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    {
      type: 'attendance' as ReportType,
      title: 'Attendance Report',
      description: 'Export attendance records for all children',
      icon: '📋',
      color: 'bg-blue-50 border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      fields: ['Date', 'Child Name', 'Parent Name', 'School', 'Status', 'Bus Plate', 'Route'],
    },
    {
      type: 'payments' as ReportType,
      title: 'Payment Report',
      description: 'Export all payment transactions and statuses',
      icon: '💰',
      color: 'bg-green-50 border-green-200',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      fields: ['Date', 'Parent Name', 'Amount', 'Currency', 'Status', 'Hubtle Reference'],
    },
    {
      type: 'driver-performance' as ReportType,
      title: 'Driver Performance Report',
      description: 'Export driver statistics and performance metrics',
      icon: '🚗',
      color: 'bg-orange-50 border-orange-200',
      buttonColor: 'bg-orange-600 hover:bg-orange-700',
      fields: ['Driver Name', 'Total Trips', 'Completed', 'Completion Rate', 'On-Time Rate'],
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500 mt-1">Generate and export reports in CSV format</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">About Reports</h3>
              <p className="text-blue-700 text-sm mt-1">
                Click on any report card below to generate and download a CSV file. 
                Select a date range to filter the data period (maximum 4 weeks).
              </p>
            </div>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-slate-900 mb-4">Select Date Range</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setDateRange('daily')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                dateRange === 'daily'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <div className="text-center">
                <div className="text-lg">📅</div>
                <div className="mt-1">Daily</div>
                <div className="text-xs opacity-75">Last 24 hours</div>
              </div>
            </button>
            <button
              onClick={() => setDateRange('weekly')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                dateRange === 'weekly'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <div className="text-center">
                <div className="text-lg">📆</div>
                <div className="mt-1">Weekly</div>
                <div className="text-xs opacity-75">Last 7 days</div>
              </div>
            </button>
            <button
              onClick={() => setDateRange('monthly')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                dateRange === 'monthly'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <div className="text-center">
                <div className="text-lg">🗓️</div>
                <div className="mt-1">Monthly</div>
                <div className="text-xs opacity-75">Last 30 days</div>
              </div>
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            <strong>Selected:</strong> {dateRange === 'daily' ? 'Last 24 hours' : dateRange === 'weekly' ? 'Last 7 days' : 'Last 30 days (4 weeks)'}
          </p>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div
              key={report.type}
              className={`${report.color} border rounded-lg p-6 hover:shadow-lg transition`}
            >
              <div className="text-5xl mb-4">{report.icon}</div>
              
              <h3 className="font-bold text-lg text-slate-900 mb-2">{report.title}</h3>
              <p className="text-slate-600 text-sm mb-4">{report.description}</p>

              <div className="mb-4">
                <p className="text-xs text-slate-500 font-semibold mb-2">Includes:</p>
                <div className="flex flex-wrap gap-1">
                  {report.fields.map((field) => (
                    <span
                      key={field}
                      className="inline-block bg-white px-2 py-1 rounded text-xs text-slate-700"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => generateReport(report.type)}
                disabled={loading}
                className={`w-full ${report.buttonColor} text-white font-semibold px-4 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>📥</span>
                    <span>Download CSV</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* CSV Format Info */}
        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-lg p-6">
          <h3 className="font-bold text-slate-900 mb-3">CSV Format Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-slate-700 mb-1">File Format</p>
              <p className="text-slate-600">Comma-Separated Values (.csv)</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-1">Encoding</p>
              <p className="text-slate-600">UTF-8</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-1">Compatible With</p>
              <p className="text-slate-600">Excel, Google Sheets, Numbers</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-1">Record Limit</p>
              <p className="text-slate-600">1,000 most recent records</p>
            </div>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="mt-6 bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="font-bold text-slate-900 mb-3">💡 Tips</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Open CSV files in Excel or Google Sheets for analysis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Use filters and pivot tables for deeper insights</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Reports are generated in real-time from live data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>File names include the generation date for easy tracking</span>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
