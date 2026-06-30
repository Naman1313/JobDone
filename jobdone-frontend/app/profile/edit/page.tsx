"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/ui/PageShell';
import { useAuth } from '@/context/AuthContext';

export default function EditProfile() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    trade: '',
    hourlyRate: '',
    availability: 'available',
    serviceRadius: '10'
  });
  const [isVerified, setIsVerified] = useState(true); // Default true to hide flash

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId') || 'mockUserId'; 
        
        const res = await fetch(`http://localhost:5000/api/profile/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success && data.data) {
          setIsVerified(data.data.user?.isVerified ?? true);
          setFormData({
            name: data.data.user?.name || '',
            trade: data.data.workerProfile?.trade || '',
            hourlyRate: data.data.workerProfile?.hourlyRate || '',
            availability: data.data.workerProfile?.availability || 'available',
            serviceRadius: data.data.workerProfile?.serviceRadius || '10'
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
        router.push('/profile/me');
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
    <PageShell title="Edit Profile" showBackButton backHref="/profile/me">
      {loading ? (
        <div className="p-8 text-center font-body-md text-on-surface-variant animate-pulse">Loading profile...</div>
      ) : (
        <>
          <div className="mx-0 sm:m-4 mt-4 flex justify-between items-center max-w-xl md:mx-auto w-full px-5 sm:px-0 mb-4">
            <h2 className="text-xl font-bold text-on-surface tracking-tight">Your Details</h2>
            <span className={`px-3.5 py-1.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${user?.role === 'client' ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
              {user?.role} Account
            </span>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5 bg-surface-container-lowest mx-0 sm:m-4 mt-0 rounded-none sm:rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] max-w-xl md:mx-auto w-full mb-32">
            <div>
              <label className="block font-label-lg text-on-surface mb-2">Full Name</label>
              <input 
                type="text" 
                name="name"
                required
                className="w-full h-14 px-4 bg-surface-warm border-none rounded-lg text-on-surface font-body-md outline-none focus:ring-2 focus:ring-primary transition-all"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {user?.role === 'worker' && (
              <>
                <div>
                  <label className="block font-label-lg text-on-surface mb-2">Trade</label>
                  <select 
                    name="trade"
                    required
                    className="w-full h-14 px-4 bg-surface-warm border-none rounded-lg text-on-surface font-body-md outline-none focus:ring-2 focus:ring-primary transition-all"
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
                  <label className="block font-label-lg text-on-surface mb-2">Hourly Rate (₹)</label>
                  <input 
                    type="number" 
                    name="hourlyRate"
                    className="w-full h-14 px-4 bg-surface-warm border-none rounded-lg text-on-surface font-body-md outline-none focus:ring-2 focus:ring-primary transition-all"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block font-label-lg text-on-surface mb-2">Status</label>
                  <select 
                    name="availability"
                    className="w-full h-14 px-4 bg-surface-warm border-none rounded-lg text-on-surface font-body-md outline-none focus:ring-2 focus:ring-primary transition-all"
                    value={formData.availability}
                    onChange={handleChange}
                  >
                    <option value="available">Available for work</option>
                    <option value="busy">Busy right now</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </>
            )}

            <button 
              type="submit" 
              disabled={saving}
              className={`w-full py-4 mt-4 rounded-xl font-label-lg text-[16px] text-on-primary shadow-sm transition-transform active:scale-95 ${
                saving ? 'bg-secondary cursor-not-allowed' : 'bg-primary hover:bg-primary-container'
              }`}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </>
      )}
    </PageShell>
  );
}
