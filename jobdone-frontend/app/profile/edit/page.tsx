"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/ui/PageShell';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/ui/MapPicker'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-surface-variant/30 animate-pulse flex items-center justify-center rounded-2xl"><span className="font-bold text-primary">Loading Map...</span></div>
});

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
  
  // Location states
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [address, setAddress] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [tempCoords, setTempCoords] = useState<[number, number]>([22.3039, 70.8022]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.address) {
        const city = data.address.city || data.address.town || data.address.village || data.address.county;
        const state = data.address.state;
        return `${city || ''}${city && state ? ', ' : ''}${state || 'Unknown Location'}`;
      }
    } catch (e) {
      console.warn("Reverse geocode failed", e);
    }
    return 'Custom Location';
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        const addr = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setAddress(addr);
      },
      () => alert('Could not get location. Please enable location access or pick on map.')
    );
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId') || 'mockUserId'; 
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/profile/${userId}`, {
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
          if (data.data.user?.location?.coordinates) {
            setLat(data.data.user.location.coordinates[1]);
            setLng(data.data.user.location.coordinates[0]);
            setTempCoords([data.data.user.location.coordinates[1], data.data.user.location.coordinates[0]]);
          }
          if (data.data.user?.address) {
            setAddress(data.data.user.address);
          }
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
      
      const payload = {
        ...formData,
        ...(lat !== 0 && lng !== 0 && { location: { type: 'Point', coordinates: [lng, lat] }, address })
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
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
    <>
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

            <div className="space-y-4 pt-4 border-t border-border-subtle/30">
              <label className="font-label-sm text-on-surface-variant block uppercase tracking-wider font-bold">Your Location</label>
              <div className="flex flex-col sm:flex-row gap-3">
                  <button
                      type="button"
                      onClick={getLocation}
                      className="flex-1 border-2 border-primary text-primary h-[48px] rounded-xl font-label-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                  >
                      📍 Update via GPS
                  </button>
                  <button
                      type="button"
                      onClick={() => setShowMapModal(true)}
                      className="flex-1 bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary transition-all h-[48px] rounded-xl font-bold border border-border-subtle/30 flex items-center justify-center gap-2"
                  >
                      🗺️ Pick on Map
                  </button>
              </div>
              
              {lat !== 0 && (
                  <div className="bg-surface-warm border border-border-subtle p-3 rounded-lg text-center mt-2">
                      <p className="text-status-gold font-label-sm font-bold">✓ Location Set</p>
                      <p className="text-xs text-on-surface-variant mt-1 truncate">{address}</p>
                  </div>
              )}
            </div>

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
    
    {showMapModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest w-full max-w-2xl h-[70vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-border-subtle/20 animate-in zoom-in-95 duration-200">
              
              <div className="p-5 border-b border-border-subtle/30 flex justify-between items-center bg-surface-variant/10">
                  <h3 className="font-bold text-lg text-on-surface tracking-tight">Pick Location</h3>
                  <button 
                      onClick={() => setShowMapModal(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant/50 text-on-surface hover:bg-error/10 hover:text-error transition-colors"
                  >
                      ✕
                  </button>
              </div>

              <div className="flex-grow p-4 relative z-0">
                  <MapPicker 
                      initialPosition={tempCoords} 
                      onSelect={(pos) => setTempCoords(pos)} 
                  />
              </div>

              <div className="p-5 border-t border-border-subtle/30 bg-surface-variant/10 flex justify-between items-center">
                  <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Selected Location</span>
                      <span className="text-sm font-mono text-primary font-bold">
                          {tempCoords[0].toFixed(4)}, {tempCoords[1].toFixed(4)}
                      </span>
                  </div>
                  <div className="flex gap-2">
                      <button
                          onClick={() => {
                              if (navigator.geolocation) {
                                  navigator.geolocation.getCurrentPosition(
                                      (pos) => setTempCoords([pos.coords.latitude, pos.coords.longitude]),
                                      () => alert("Could not get device location. Please enable location permissions.")
                                  );
                              }
                          }}
                          className="bg-surface-variant/40 text-on-surface-variant px-4 py-3 rounded-[14px] font-bold hover:bg-surface-variant/60 transition-colors hidden sm:block"
                      >
                          📍 Current GPS
                      </button>
                      <button 
                          onClick={async () => {
                              setLat(tempCoords[0]);
                              setLng(tempCoords[1]);
                              const addr = await reverseGeocode(tempCoords[0], tempCoords[1]);
                              setAddress(addr);
                              setShowMapModal(false);
                          }}
                          className="bg-primary text-on-primary px-6 py-3 rounded-[14px] font-bold shadow-md hover:bg-primary-container transition-colors active:scale-95 border border-white/10"
                      >
                          Confirm Location
                      </button>
                  </div>
              </div>
          </div>
      </div>
    )}
    </>
  );
}
