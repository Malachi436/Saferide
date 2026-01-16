'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect, useRef } from 'react';
import { use } from 'react';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  uniqueCode?: string;
  grade?: string;
  isClaimed: boolean;
  parentPhone?: string;
  daysUntilPayment?: number;
  routeId?: string;
  route?: {
    id: string;
    name: string;
    shift?: string;
    bus?: {
      plateNumber: string;
    };
  };
  school: {
    id: string;
    name: string;
  };
}

interface GroupedParent {
  phone: string;
  children: Child[];
  uniqueCode?: string;
}

export default function ChildrenManagementPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const [children, setChildren] = useState<Child[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [viewMode, setViewMode] = useState<'individual' | 'byParent'>('byParent');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Bulk add state
  const [bulkChildren, setBulkChildren] = useState<{
    firstName: string;
    lastName: string;
    grade: string;
    parentPhone: string;
    daysUntilPayment: string;
    routeId: string;
  }[]>([{ firstName: '', lastName: '', grade: '', parentPhone: '', daysUntilPayment: '', routeId: '' }]);

  useEffect(() => {
    fetchChildren();
    fetchSchools();
    fetchRoutes();
  }, [companyId]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get(`/admin/company/${companyId}/children`);
      setChildren(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading children:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const data = await apiClient.get(`/admin/company/${companyId}/schools`);
      setSchools(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading schools:', err);
    }
  };

  const fetchRoutes = async () => {
    try {
      const data: any = await apiClient.get(`/admin/company/${companyId}/routes`);
      setRoutes(Array.isArray(data) ? data : []);
    } catch (err) {
      // Routes API not implemented yet - this is expected
      // Set empty routes array and continue
      setRoutes([]);
      console.log('Routes API not yet implemented - using empty routes list');
    }
  };

  // Group children by parent phone
  const groupedByParent = (): GroupedParent[] => {
    const groups = new Map<string, GroupedParent>();
    
    children.forEach(child => {
      const phone = child.parentPhone || 'no-phone';
      if (!groups.has(phone)) {
        groups.set(phone, {
          phone,
          children: [],
          uniqueCode: child.uniqueCode, // Use first child's code as family code
        });
      }
      groups.get(phone)!.children.push(child);
    });
    
    return Array.from(groups.values()).filter(g => g.phone !== 'no-phone');
  };

  const generateFamilyCode = async (parentPhone: string) => {
    try {
      const response: any = await apiClient.post('/children/generate-code', {});
      const { uniqueCode } = response;
      
      // Get all children for this parent
      const parentChildren = children.filter(c => c.parentPhone === parentPhone);
      
      // Assign code to all children
      await Promise.all(
        parentChildren.map(child =>
          apiClient.patch(`/children/${child.id}`, { uniqueCode })
        )
      );
      
      alert(`Family code ${uniqueCode} generated for ${parentChildren.length} children!\nShare this code with parent: ${parentPhone}`);
      fetchChildren();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate family code');
    }
  };

  const handleBulkAdd = async () => {
    if (!selectedSchool) {
      alert('Please select a school');
      return;
    }

    const validChildren = bulkChildren.filter(
      c => c.firstName && c.lastName && c.parentPhone
    );

    if (validChildren.length === 0) {
      alert('Please add at least one valid child');
      return;
    }

    try {
      setUploading(true);
      await apiClient.post('/children/bulk-onboard', {
        companyId,
        schoolId: selectedSchool,
        children: validChildren,
      });
      
      alert(`Successfully onboarded ${validChildren.length} children!`);
      setShowBulkModal(false);
      setBulkChildren([{ firstName: '', lastName: '', grade: '', parentPhone: '', daysUntilPayment: '', routeId: '' }]);
      fetchChildren();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to onboard children');
    } finally {
      setUploading(false);
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedSchool) {
      alert('Please select a school first');
      return;
    }

    try {
      setUploading(true);
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header
      const dataLines = lines.slice(1);
      
      const parsedChildren = dataLines.map(line => {
        const [firstName, lastName, grade, parentPhone, daysUntilPayment, routeCode] = line.split(',').map(s => s.trim());
        
        // Find route by code or name
        const route = routes.find(r => 
          r.name.toLowerCase().includes(routeCode?.toLowerCase() || '') ||
          r.id === routeCode
        );
        
        return { 
          firstName, 
          lastName, 
          grade, 
          parentPhone, 
          daysUntilPayment: parseInt(daysUntilPayment) || 0,
          routeId: route?.id || null
        };
      });

      await apiClient.post('/children/bulk-onboard', {
        companyId,
        schoolId: selectedSchool,
        children: parsedChildren,
      });
      
      alert(`Successfully onboarded ${parsedChildren.length} children from CSV!`);
      setShowCsvModal(false);
      fetchChildren();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload CSV');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadCsvTemplate = () => {
    const csv = `First Name,Last Name,Grade,Parent Phone,Days Until Payment,Route Code
John,Doe,Grade 1,0241234567,30,R1-MORNING
Jane,Doe,Grade 3,0241234567,30,R1-MORNING
Mike,Smith,Grade 2,0245678901,15,R2-AFTERNOON
`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'children-onboarding-template.csv';
    a.click();
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

  const parentGroups = groupedByParent();

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Children Onboarding</h1>
            <p className="text-slate-500 mt-1">Bulk onboard children with transport systems</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCsvModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
            >
              📤 Import CSV
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              + Bulk Add Children
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setViewMode('byParent')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                viewMode === 'byParent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              👨‍👩‍👧‍👦 By Parent (Family Codes)
            </button>
            <button
              onClick={() => setViewMode('individual')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                viewMode === 'individual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              👶 Individual Children
            </button>
          </div>
        </div>

        {/* By Parent View */}
        {viewMode === 'byParent' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold mb-4">Family Codes - One Code Per Parent</h2>
            <p className="text-slate-600 mb-6">
              Generate one unique code per parent phone number. When they claim it, all their children are onboarded automatically.
            </p>
            
            <div className="space-y-4">
              {parentGroups.map((parent, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-lg">📞 {parent.phone}</p>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">
                        {parent.children.length} {parent.children.length === 1 ? 'child' : 'children'} •
                        {parent.children.filter(c => c.isClaimed).length} claimed,
                        {parent.children.filter(c => !c.isClaimed).length} unclaimed
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {parent.children.map(child => (
                          <div key={child.id} className={`px-3 py-2 rounded text-sm ${
                            child.isClaimed ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
                          }`}>
                            <div className="flex items-center gap-2">
                              {child.isClaimed ? '✅' : '⏳'}
                              <span className="font-semibold">{child.firstName} {child.lastName}</span>
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                              {child.grade || 'No grade'}
                              {child.daysUntilPayment !== undefined && (
                                <span className="ml-2">• {child.daysUntilPayment}d until payment</span>
                              )}
                              {child.route && (
                                <div className="mt-1 text-xs text-blue-600">
                                  🚌 {child.route.name}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="ml-4">
                      {parent.uniqueCode ? (
                        <div className="bg-green-50 border-2 border-green-200 px-6 py-3 rounded-lg text-center">
                          <p className="text-xs text-green-600 mb-1">Family Code</p>
                          <p className="font-mono font-bold text-xl text-green-700">{parent.uniqueCode}</p>
                          <p className="text-xs text-green-600 mt-1">✓ Generated</p>
                          <p className="text-xs text-slate-500 mt-2">Share with parent</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => generateFamilyCode(parent.phone)}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 whitespace-nowrap"
                        >
                          Generate Family Code
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Individual View */}
        {viewMode === 'individual' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold mb-4">All Children</h2>
            <div className="space-y-3">
              {children.map((child) => (
                <div key={child.id} className="flex items-center justify-between border-b pb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{child.firstName} {child.lastName}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        child.isClaimed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {child.isClaimed ? '✅ Claimed' : '⏳ Unclaimed'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {child.school.name} • {child.grade || 'No grade'}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                      {child.parentPhone && (
                        <span>📞 {child.parentPhone}</span>
                      )}
                      {child.daysUntilPayment !== undefined && (
                        <span className={child.daysUntilPayment <= 7 ? 'text-red-600 font-semibold' : ''}>
                          💳 {child.daysUntilPayment} days until payment
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    {child.uniqueCode ? (
                      <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
                        <span className="font-mono font-bold text-green-700">{child.uniqueCode}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">No code</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bulk Add Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Bulk Add Children</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select School *</label>
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                >
                  <option value="">Choose a school...</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 mb-6">
                {bulkChildren.map((child, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-2">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={child.firstName}
                      onChange={(e) => {
                        const newChildren = [...bulkChildren];
                        newChildren[idx].firstName = e.target.value;
                        setBulkChildren(newChildren);
                      }}
                      className="px-3 py-2 border border-slate-300 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={child.lastName}
                      onChange={(e) => {
                        const newChildren = [...bulkChildren];
                        newChildren[idx].lastName = e.target.value;
                        setBulkChildren(newChildren);
                      }}
                      className="px-3 py-2 border border-slate-300 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Grade"
                      value={child.grade}
                      onChange={(e) => {
                        const newChildren = [...bulkChildren];
                        newChildren[idx].grade = e.target.value;
                        setBulkChildren(newChildren);
                      }}
                      className="px-3 py-2 border border-slate-300 rounded"
                    />
                    <input
                      type="tel"
                      placeholder="Parent Phone"
                      value={child.parentPhone}
                      onChange={(e) => {
                        const newChildren = [...bulkChildren];
                        newChildren[idx].parentPhone = e.target.value;
                        setBulkChildren(newChildren);
                      }}
                      className="px-3 py-2 border border-slate-300 rounded"
                    />
                    <input
                      type="number"
                      placeholder="Days Until Payment"
                      value={child.daysUntilPayment}
                      onChange={(e) => {
                        const newChildren = [...bulkChildren];
                        newChildren[idx].daysUntilPayment = e.target.value;
                        setBulkChildren(newChildren);
                      }}
                      className="px-3 py-2 border border-slate-300 rounded"
                    />
                    <select
                      value={child.routeId}
                      onChange={(e) => {
                        const newChildren = [...bulkChildren];
                        newChildren[idx].routeId = e.target.value;
                        setBulkChildren(newChildren);
                      }}
                      className="px-3 py-2 border border-slate-300 rounded"
                    >
                      <option value="">No Route</option>
                      {routes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.name} {route.shift ? `(${route.shift})` : ''} {route.bus?.plateNumber ? `- ${route.bus.plateNumber}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setBulkChildren([...bulkChildren, { firstName: '', lastName: '', grade: '', parentPhone: '', daysUntilPayment: '', routeId: '' }])}
                className="mb-6 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200"
              >
                + Add Row
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAdd}
                  disabled={uploading}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Onboard Children'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CSV Upload Modal */}
        {showCsvModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-lg w-full">
              <h2 className="text-2xl font-bold mb-4">Import from CSV</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select School *</label>
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                >
                  <option value="">Choose a school...</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 mb-2">CSV Format:</p>
                <code className="text-xs bg-white px-2 py-1 rounded">
                  First Name, Last Name, Grade, Parent Phone, Days Until Payment
                </code>
                <button
                  onClick={downloadCsvTemplate}
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  ⬇️ Download Template
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="mb-6 w-full px-4 py-3 border border-slate-300 rounded-lg"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCsvModal(false)}
                  className="flex-1 bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
