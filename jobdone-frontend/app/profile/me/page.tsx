"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/ui/PageShell';

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    trade: '',
    hourlyRate: '',
    availability: 'available',
    serviceRadius: '10'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        // We use a mock user ID for now since we don't have the full auth context populated
        // In a real app, this would be `/api/profile/me` or use the auth context ID
        const userId = localStorage.getItem('userId') || 'mockUserId'; 
        
        const res = await fetch(`http://localhost:5000/api/profile/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success && data.data) {
          setFormData({
            name: data.data.name || '',
            trade: data.data.trade || '',
            hourlyRate: data.data.hourlyRate || '',
            availability: data.data.availability || 'available',
            serviceRadius: data.data.serviceRadius || '10'
          });
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId') || 'mockUserId';
      
      const res = await fetch(`http://localhost:5000/api/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (data.success) {
        alert("Profile updated successfully!");
        router.push('/home');
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="Edit Profile" showBackButton backHref="/home">
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading profile...</div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 space-y-5 bg-white m-4 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              name="name"
              required
              className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Trade</label>
            <select 
              name="trade"
              required
              className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500"
              value={formData.trade}
              onChange={handleChange}
            >
              <option value="">Select a trade...</option>
              <option value="plumber">Plumber</option>
              <option value="electrician">Electrician</option>
              <option value="carpenter">Carpenter</option>
              <option value="painter">Painter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Hourly Rate (₹)</label>
            <input 
              type="number" 
              name="hourlyRate"
              className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500"
              value={formData.hourlyRate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
            <select 
              name="availability"
              className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500"
              value={formData.availability}
              onChange={handleChange}
            >
              <option value="available">Available for work</option>
              <option value="busy">Busy right now</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-md transition-transform active:scale-95 ${
              saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      )}
    </PageShell>
  );
}
