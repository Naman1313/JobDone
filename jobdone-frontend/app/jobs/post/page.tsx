"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/ui/MapPicker'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-surface-variant/30 animate-pulse flex items-center justify-center rounded-2xl"><span className="font-bold text-primary">Loading Map...</span></div>
});

export default function PostJob() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    trade: '',
    description: '',
    budget: '',
    urgency: 'medium',
    expiryDays: '7',
  });
  const [location, setLocation] = useState({
    coordinates: [72.8777, 19.0760], // Default: Mumbai
    address: 'Mumbai, Maharashtra' // In a real app, use reverse geocoding API to get address
  });
  const [showMapModal, setShowMapModal] = useState(false);
  const [tempCoords, setTempCoords] = useState<[number, number]>([19.0760, 72.8777]);

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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const address = await reverseGeocode(lat, lng);
          setLocation({
            coordinates: [lng, lat],
            address: address
          });
          setTempCoords([lat, lng]);
        },
        (err) => {
          console.warn("Geolocation denied/failed. Using default location.", err);
        }
      );
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const payload = {
        ...formData,
        budget: Number(formData.budget),
        coordinates: location.coordinates,
        address: location.address,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (data.success) {
        alert("Job posted successfully!");
        router.push('/jobs');
      } else {
        alert("Error: " + (data.message || 'Failed to post job'));
      }
    } catch (err) {
      alert("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto min-h-screen bg-surface-warm font-sans selection:bg-primary selection:text-white flex flex-col pb-32">
      {/* Header */}
      <header className="w-full h-16 sticky top-0 z-40 bg-white/40 backdrop-blur-2xl saturate-150 flex items-center border-b border-white/60 shadow-[0_4px_30px_rgba(93,64,55,0.05)] transition-all px-4 md:px-8">
        <div className="w-full max-w-2xl mx-auto flex items-center h-full">
          <Link href="/jobs" className="mr-4 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex flex-col justify-center h-full">
            <h1 className="text-[20px] font-bold text-primary tracking-tight drop-shadow-sm leading-tight mt-1">Post a Job</h1>
            <p className="font-label-sm text-xs text-on-surface-variant drop-shadow-sm font-medium mt-0.5">Find a worker near you</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="w-full flex-grow flex flex-col">
        <div className="w-full max-w-2xl mx-auto md:mt-8 bg-surface-container-lowest md:rounded-[32px] md:shadow-[0px_8px_32px_rgba(0,0,0,0.04)] md:border border-border-subtle/20 flex flex-col p-6 sm:p-10 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <label className="font-label-sm text-on-surface-variant block uppercase tracking-wider font-bold">Job Title</label>
              <input 
                type="text" 
                name="title"
                required
                placeholder="e.g. Fix leaking pipe in kitchen"
                className="w-full border border-border-subtle/50 rounded-xl px-4 h-[56px] outline-none text-on-surface bg-surface-variant/30 font-body-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="font-label-sm text-on-surface-variant block uppercase tracking-wider font-bold">Trade Category</label>
              <select 
                name="trade"
                required
                className="w-full border border-border-subtle/50 rounded-xl px-4 h-[56px] outline-none text-primary bg-surface-variant/30 font-body-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all font-bold cursor-pointer hover:bg-surface-variant/50 appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%235D4037%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                value={formData.trade}
                onChange={handleChange}
              >
                <option value="">Select a trade...</option>
                <option value="plumber">Plumber</option>
                <option value="electrician">Electrician</option>
                <option value="carpenter">Carpenter</option>
                <option value="painter">Painter</option>
                <option value="mechanic">Mechanic</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-label-sm text-on-surface-variant block uppercase tracking-wider font-bold">Budget (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-lg">₹</span>
                <input 
                  type="number" 
                  name="budget"
                  required
                  min="0"
                  placeholder="1500"
                  className="w-full border border-border-subtle/50 rounded-xl pl-10 pr-4 h-[56px] outline-none text-on-surface bg-surface-variant/30 font-body-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all text-lg font-bold placeholder:text-on-surface-variant/50 placeholder:font-normal"
                  value={formData.budget}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="font-label-sm text-on-surface-variant block uppercase tracking-wider font-bold">Urgency</label>
              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                {['low', 'medium', 'high', 'emergency'].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, urgency: level })}
                    className={`flex-1 py-3 px-2 text-sm font-bold rounded-[14px] capitalize border transition-all ${
                      formData.urgency === level 
                        ? level === 'emergency' 
                          ? 'bg-error text-white border-error shadow-[0_4px_12px_rgba(220,38,38,0.3)]' 
                          : 'bg-primary text-on-primary border-primary shadow-[0_4px_12px_rgba(93,64,55,0.2)]' 
                        : 'bg-surface-variant/30 text-on-surface-variant border-border-subtle/50 hover:bg-surface-variant/60'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="font-label-sm text-on-surface-variant block uppercase tracking-wider font-bold">Job Description</label>
              <textarea 
                name="description"
                required
                rows={5}
                placeholder="Describe the issue in detail..."
                className="w-full border border-border-subtle/50 rounded-xl p-4 outline-none text-on-surface bg-surface-variant/30 font-body-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none placeholder:text-on-surface-variant/50"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Location Selection Area */}
            <div className="space-y-3 pt-2">
              <label className="font-label-sm text-on-surface-variant block uppercase tracking-wider font-bold">Work Location</label>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 bg-surface-variant/20 border border-border-subtle/40 rounded-xl p-4 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-primary">📍</span>
                    <span className="font-bold text-on-surface line-clamp-1">{location.address}</span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant font-mono pl-6 opacity-70">
                    {location.coordinates[1].toFixed(4)}, {location.coordinates[0].toFixed(4)}
                  </span>
                </div>
                
                <div className="flex flex-col gap-2 justify-center shrink-0">
                  <button 
                    type="button"
                    onClick={() => setShowMapModal(true)}
                    className="bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary transition-all px-4 py-2 rounded-lg font-bold text-sm border border-border-subtle/30"
                  >
                    🗺️ Pick on Map
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(async (pos) => {
                          const lat = pos.coords.latitude;
                          const lng = pos.coords.longitude;
                          const address = await reverseGeocode(lat, lng);
                          setLocation({ coordinates: [lng, lat], address });
                          setTempCoords([lat, lng]);
                        });
                      }
                    }}
                    className="bg-primary/10 text-primary hover:bg-primary/20 transition-all px-4 py-2 rounded-lg font-bold text-sm border border-primary/20"
                  >
                    🎯 Use Current
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-4 rounded-[16px] font-bold font-label-lg transition-all active:scale-[0.98] border border-white/10 ${
                  loading 
                    ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed' 
                    : 'bg-primary text-on-primary shadow-[0px_4px_12px_rgba(93,64,55,0.15)] hover:bg-primary-container'
                }`}
              >
                {loading ? 'Posting Job...' : 'Post Job'}
              </button>
            </div>
            
            
          </form>
        </div>
      </main>

      {/* Map Picker Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest w-full max-w-2xl h-[70vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-border-subtle/20 animate-in zoom-in-95 duration-200">
            
            <div className="p-5 border-b border-border-subtle/30 flex justify-between items-center bg-surface-variant/10">
              <h3 className="font-bold text-lg text-on-surface tracking-tight">Select Work Location</h3>
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
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Selected Coordinates</span>
                <span className="text-sm font-mono text-primary font-bold">
                  {tempCoords[0].toFixed(4)}, {tempCoords[1].toFixed(4)}
                </span>
              </div>
              <button 
                onClick={async () => {
                  const address = await reverseGeocode(tempCoords[0], tempCoords[1]);
                  setLocation({
                    coordinates: [tempCoords[1], tempCoords[0]], // Save as [lng, lat] for DB
                    address: address
                  });
                  setShowMapModal(false);
                }}
                className="bg-primary text-on-primary px-6 py-3 rounded-[14px] font-bold shadow-md hover:bg-primary-container transition-colors active:scale-95 border border-white/10"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
