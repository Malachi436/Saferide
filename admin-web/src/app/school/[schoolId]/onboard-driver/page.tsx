'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { use } from 'react';

interface Bus {
  id: string;
  plateNumber: string;
  capacity: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  license: string;
  plateNumber: string;
  photo?: File;
}

export default function OnboardDriverPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    license: '',
    plateNumber: '',
  });

  useEffect(() => {
    fetchBuses();
  }, [companyId]);

  const fetchBuses = async () => {
    try {
      const data = await apiClient.get(`/buses/company/${companyId}`);
      setBuses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error loading buses:', err);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Step 1: Create the driver user account
      const driverResponse = await apiClient.post('/auth/signup', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: `${formData.firstName.toLowerCase()}@${Math.random().toString(36).substring(7)}`,
        role: 'DRIVER',
        phone: formData.phone,
        companyId,
      });

      const driverId = (driverResponse as any).id;

      // Step 2: Create driver profile with license
      await apiClient.post('/drivers', {
        userId: driverId,
        license: formData.license,
      });

      // Step 3: Find or create bus and assign driver
      if (formData.plateNumber) {
        let bus = buses.find((b) => b.plateNumber === formData.plateNumber);

        if (!bus) {
          // Create new bus if it doesn't exist
          const busResponse: any = await apiClient.post('/buses', {
            plateNumber: formData.plateNumber,
            capacity: 50,
            driverId,
          });
          bus = busResponse;
        } else {
          // Assign existing bus to driver
          await apiClient.patch(`/buses/${bus.id}`, {
            driverId,
          });
        }
      }

      // Step 4: Upload photo if provided
      if (formData.photo) {
        const photoFormData = new FormData();
        photoFormData.append('photo', formData.photo);

        await apiClient.post(`/admin/driver/${driverId}/photo`, photoFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      setSuccess(
        `✅ Driver ${formData.firstName} ${formData.lastName} onboarded successfully! Temporary password sent to their email.`
      );
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        license: '',
        plateNumber: '',
      });
      setPhotoPreview(null);
      await fetchBuses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to onboard driver');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Onboard Driver</h1>
          <p className="text-slate-500 mt-1">Add a new driver to your company</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-8">
          {/* Driver Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Driver Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">License Number *</label>
                <input
                  type="text"
                  name="license"
                  required
                  value={formData.license}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="DL123456"
                />
              </div>
            </div>
          </div>

          {/* Bus Assignment */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Bus Assignment (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Bus Plate Number</label>
                <div className="flex gap-2">
                  <select
                    name="plateNumber"
                    value={formData.plateNumber}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select existing bus or add new --</option>
                    {buses.map((bus) => (
                      <option key={bus.id} value={bus.plateNumber}>
                        {bus.plateNumber} (Cap: {bus.capacity})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-slate-600 mt-2">Or type new plate number to create a bus</p>
                {formData.plateNumber && !buses.find((b) => b.plateNumber === formData.plateNumber) && (
                  <p className="text-xs text-blue-600 mt-1">✓ Will create new bus: {formData.plateNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Driver Photo */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Driver Photo (Optional)</h2>
            <div className="flex gap-6">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-600 mt-2">Supported: JPG, PNG, GIF (Max 5MB)</p>
              </div>
              {photoPreview && (
                <div className="flex flex-col items-center">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Preview</p>
                  <img src={photoPreview} alt="Driver preview" className="w-32 h-32 object-cover rounded-lg border border-slate-300" />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      setFormData({ ...formData, photo: undefined });
                    }}
                    className="text-sm text-red-600 hover:text-red-700 mt-2"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-8 py-3 rounded-lg transition"
            >
              {loading ? 'Onboarding...' : '✓ Onboard Driver'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  license: '',
                  plateNumber: '',
                });
                setPhotoPreview(null);
              }}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-8 py-3 rounded-lg transition"
            >
              Clear
            </button>
          </div>

          <p className="text-xs text-slate-600 mt-6">
            * Required fields. A temporary password will be automatically generated and sent to the driver's email.
          </p>
        </form>
      </div>
    </DashboardLayout>
  );
}
