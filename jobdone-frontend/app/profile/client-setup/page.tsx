'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/ui/MapPicker'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-surface-variant/30 animate-pulse flex items-center justify-center rounded-2xl"><span className="font-bold text-primary">Loading Map...</span></div>
});

export default function ClientSetupPage() {
    const { user, updateUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    
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
            () => setError('Could not get location. Please enable location access or pick on map.')
        );
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');

            // Update user name and location on backend
            const locationData = {
                type: 'Point',
                coordinates: [lng, lat]
            };
            
            await api.put(`/api/profile/${user?._id}`, { 
                name,
                location: locationData,
                address
            });

            // Update user name in frontend context
            updateUser({ 
                name,
                location: locationData as any,
                address 
            });

            router.push('/home');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-warm p-4 font-sans selection:bg-primary selection:text-white flex items-center justify-center">
            <div className="max-w-md w-full bg-surface-container-lowest rounded-[32px] p-8 shadow-[0px_8px_32px_rgba(0,0,0,0.04)] border border-border-subtle/20">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Complete Setup</h1>
                    <p className="text-on-surface-variant font-body-md mt-2">Just one last step to start hiring.</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="font-label-sm text-on-surface-variant block uppercase tracking-wider font-bold">Your full name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Ramesh Kumar"
                            className="w-full border border-border-subtle/50 rounded-xl px-4 h-[56px] outline-none text-on-surface bg-surface-variant/30 font-body-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                        />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border-subtle/30">
                        <label className="font-label-sm text-on-surface-variant block uppercase tracking-wider font-bold">Your Location</label>
                        <p className="text-on-surface-variant font-body-sm text-sm">We use this to find workers near you.</p>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={getLocation}
                                className="flex-1 border-2 border-primary text-primary h-[56px] rounded-xl font-label-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                            >
                                📍 Use GPS
                            </button>
                            <button
                                onClick={() => setShowMapModal(true)}
                                className="flex-1 bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary transition-all h-[56px] rounded-xl font-bold border border-border-subtle/30 flex items-center justify-center gap-2"
                            >
                                🗺️ Pick on Map
                            </button>
                        </div>
                        
                        {lat !== 0 && (
                            <div className="bg-surface-warm border border-border-subtle p-3 rounded-lg text-center mt-2">
                                <p className="text-status-gold font-label-sm font-bold">✓ Location locked</p>
                                <p className="text-xs text-on-surface-variant mt-1 truncate">{address}</p>
                            </div>
                        )}
                    </div>

                    {error && <p className="text-error text-sm font-medium text-center">{error}</p>}

                    <button
                        onClick={handleSubmit}
                        disabled={!name.trim() || lat === 0 || loading}
                        className="w-full bg-primary text-on-primary h-[56px] rounded-[16px] font-label-lg font-bold disabled:bg-surface-variant disabled:text-on-surface-variant disabled:cursor-not-allowed hover:bg-primary-container transition-all active:scale-[0.98] shadow-[0px_4px_12px_rgba(93,64,55,0.15)] disabled:shadow-none border border-white/10 mt-6"
                    >
                        {loading ? 'Saving...' : 'Get Started'}
                    </button>
                </div>
            </div>

            {/* Map Picker Modal */}
            {showMapModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="bg-surface-container-lowest w-full max-w-2xl h-[70vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-border-subtle/20 animate-in zoom-in-95 duration-200">
                    
                    <div className="p-5 border-b border-border-subtle/30 flex justify-between items-center bg-surface-variant/10">
                      <h3 className="font-bold text-lg text-on-surface tracking-tight">Select Search Location</h3>
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
            )}
        </div>
    );
}
