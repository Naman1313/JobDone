"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/ui/MapPicker'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-surface-variant/30 animate-pulse flex items-center justify-center rounded-2xl"><span className="font-bold text-primary">Loading Map...</span></div>
});

export default function ProfileDashboard() {
  const router = useRouter();
  const { logout, user, updateUser } = useAuth();
  const [isVerified, setIsVerified] = useState(true);

    const [locationName, setLocationName] = useState<string>('LOCATION NOT SET');
    const [coordinates, setCoordinates] = useState<string>('');
    const [showMapModal, setShowMapModal] = useState(false);
    const [tempCoords, setTempCoords] = useState<[number, number]>([22.3039, 70.8022]);
    const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

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
        if (user?.address) {
            setLocationName(user.address);
        } else {
            setLocationName('LOCATION NOT SET');
        }
        
        if (user?.location?.coordinates && user.location.coordinates.length === 2) {
            // MongoDB coordinates are [lng, lat]
            const lat = user.location.coordinates[1];
            const lng = user.location.coordinates[0];
            setCoordinates(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            setTempCoords([lat, lng]);
        } else {
            setCoordinates('');
        }
    }, [user]);

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
                }
            } catch (err) {
                console.error("Error fetching profile", err);
            }
        };
        fetchProfile();
    }, []);

    return (
        <div className="w-full mx-auto min-h-screen bg-surface-warm font-sans selection:bg-primary selection:text-white flex flex-col pb-32">
            <header className="w-full h-16 sticky top-0 z-40 bg-white/40 backdrop-blur-2xl saturate-150 flex items-center border-b border-white/60 shadow-[0_4px_30px_rgba(93,64,55,0.05)] transition-all px-4 md:px-8">
                <div className="w-full max-w-2xl mx-auto flex items-center h-full">
                <div className="flex flex-col justify-center h-full">
                    <h1 className="text-[20px] font-bold text-primary tracking-tight drop-shadow-sm leading-tight mt-1">Profile</h1>
                </div>
                </div>
            </header>

            <main className="w-full flex-grow flex flex-col mt-4">
                <div className="w-full max-w-2xl mx-auto px-4 md:px-0">
                    
                    <div className="bg-surface-container-lowest p-6 rounded-[32px] shadow-[0px_4px_20px_rgba(0,0,0,0.04)] mb-6 flex flex-col items-center border border-border-subtle/20 relative">
                        <div className={`absolute top-6 right-6 px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider mb-4 shadow-sm border ${user?.role === 'client' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                            {user?.role}
                        </div>

                        <Avatar 
                          name={user?.name || 'User'} 
                          photoUrl={user?.profilePhoto} 
                          isVerified={isVerified} 
                          size="xl" 
                          className="mb-4"
                        />

                        <h2 className="text-[22px] font-bold text-on-surface mb-1 tracking-tight">{user?.name || 'User'}</h2>
                        <p className="font-label-sm text-on-surface-variant mb-4">{user?.phone || 'No phone number'}</p>
                        
                        <div className="flex flex-col items-center gap-2 mb-6 w-full max-w-xs">
                            <div className="flex items-center gap-3 bg-surface-variant/20 px-5 py-3 rounded-2xl border border-border-subtle/30 w-full justify-center shadow-sm">
                                <span className="text-primary text-xl">📍</span>
                                <div className="flex flex-col text-left">
                                    <span className="font-bold text-sm text-on-surface line-clamp-1">{locationName}</span>
                                    {coordinates && <span className="text-[11px] text-on-surface-variant font-mono tracking-tight">{coordinates}</span>}
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowMapModal(true)}
                                className="text-[12px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-4 py-1.5 rounded-full transition-colors w-full border border-primary/10"
                            >
                                Change Location
                            </button>
                        </div>
                        
                        {!isVerified && user?.role === 'worker' && (
                        <div className="w-full bg-status-gold/10 border border-status-gold/30 p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-status-gold/20 transition-colors shadow-sm" onClick={() => router.push('/profile/verify')}>
                            <div>
                                <p className="font-bold text-status-gold tracking-tight">Verify Identity</p>
                                <p className="text-[11px] font-bold text-status-gold/70 mt-0.5">GET THE GOLD TICK</p>
                            </div>
                            <span className="text-status-gold font-bold bg-white/50 w-8 h-8 rounded-full flex items-center justify-center shadow-sm">➤</span>
                        </div>
                    )}
                </div>

                <div className="bg-surface-container-lowest rounded-[32px] shadow-[0px_4px_20px_rgba(0,0,0,0.04)] overflow-hidden border border-border-subtle/20 mb-8">
                    
                    {/* Worker Specific Options */}
                    {user?.role === 'worker' && (
                        <>
                            {!isVerified && (
                                <Link href="/profile/verify" className="w-full px-6 py-5 flex items-center justify-between hover:bg-status-gold/10 transition-colors border-b border-border-subtle/20 group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-status-gold/10 flex items-center justify-center text-status-gold group-hover:bg-status-gold/20 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="font-bold text-on-surface">Verify Identity</span>
                                    </div>
                                    <span className="text-status-gold font-bold text-xs uppercase tracking-wider">Required</span>
                                </Link>
                            )}
                            <button className="w-full px-6 py-5 flex items-center justify-between hover:bg-surface-variant/30 transition-colors border-b border-border-subtle/20 group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-surface-variant/50 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="font-bold text-on-surface">Wallet & Earnings</span>
                                </div>
                                <span className="text-on-surface-variant font-bold">➤</span>
                            </button>
                            <Link href="/applications" className="w-full px-6 py-5 flex items-center justify-between hover:bg-surface-variant/30 transition-colors border-b border-border-subtle/20 group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-surface-variant/50 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="font-bold text-on-surface">My Applications</span>
                                </div>
                                <span className="text-on-surface-variant font-bold">➤</span>
                            </Link>
                        </>
                    )}

                    {/* Client Specific Options */}
                    {user?.role === 'client' && (
                        <>
                            <Link href="/jobs/manage" className="w-full px-6 py-5 flex items-center justify-between hover:bg-surface-variant/30 transition-colors border-b border-border-subtle/20 group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-surface-variant/50 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="font-bold text-on-surface">My Posted Jobs</span>
                                </div>
                                <span className="text-on-surface-variant font-bold">➤</span>
                            </Link>
                            <button className="w-full px-6 py-5 flex items-center justify-between hover:bg-surface-variant/30 transition-colors border-b border-border-subtle/20 group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-surface-variant/50 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="font-bold text-on-surface">Payment Methods</span>
                                </div>
                                <span className="text-on-surface-variant font-bold">➤</span>
                            </button>
                        </>
                    )}

                    {/* Common Options */}
                    <button className="w-full px-6 py-5 flex items-center justify-between hover:bg-surface-variant/30 transition-colors border-b border-border-subtle/20 group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-surface-variant/50 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="font-bold text-on-surface">Change Theme</span>
                        </div>
                        <span className="text-on-surface-variant font-bold text-xs uppercase tracking-wider">Light</span>
                    </button>

                    <Link href="/profile/edit" className="w-full px-6 py-5 flex items-center justify-between hover:bg-surface-variant/30 transition-colors border-b border-border-subtle/20 group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-surface-variant/50 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </div>
                            <span className="font-bold text-on-surface">Edit Profile</span>
                        </div>
                        <span className="text-on-surface-variant font-bold">➤</span>
                    </Link>

                    <button className="w-full px-6 py-5 flex items-center justify-between hover:bg-surface-variant/30 transition-colors border-b border-border-subtle/20 group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-surface-variant/50 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.079-2.153l1.524-1.525A5.978 5.978 0 0116 10zm-1.071-3.265l-1.524 1.525a3.997 3.997 0 00-2.153-.079l-1.525-1.524a5.978 5.978 0 015.202.078zm-6.264-1.403a3.997 3.997 0 00-2.153.079L7.988 3.886a5.978 5.978 0 015.202-.078l-1.525 1.524zM5.522 6.068L7.046 7.593a3.997 3.997 0 00-.079 2.153L5.443 11.27A5.978 5.978 0 014 10c0-1.428.497-2.74 1.332-3.755zM6.58 13.924l1.524-1.525a3.997 3.997 0 002.153.079l1.525 1.524a5.978 5.978 0 01-5.202-.078zm6.264 1.403l-1.525-1.524a3.997 3.997 0 002.153-.079l1.524 1.525a5.978 5.978 0 01-5.202.078zM10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="font-bold text-on-surface">Help & Support</span>
                        </div>
                        <span className="text-on-surface-variant font-bold">➤</span>
                    </button>

                    <button className="w-full px-6 py-5 flex items-center justify-between hover:bg-surface-variant/30 transition-colors border-b border-border-subtle/20 group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-surface-variant/50 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="font-bold text-on-surface">Settings</span>
                        </div>
                        <span className="text-on-surface-variant font-bold">➤</span>
                    </button>

                    <button onClick={logout} className="w-full px-6 py-5 flex items-center justify-between hover:bg-error/10 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-error group-hover:bg-error/20 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="font-bold text-error tracking-tight">Log Out</span>
                        </div>
                    </button>
                    
                </div>
            </div>
        </main>
        
        {showMapModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-surface-container-lowest w-full max-w-2xl h-[70vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-border-subtle/20 animate-in zoom-in-95 duration-200">
                    
                    <div className="p-5 border-b border-border-subtle/30 flex justify-between items-center bg-surface-variant/10">
                        <h3 className="font-bold text-lg text-on-surface tracking-tight">Update Profile Location</h3>
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
                                disabled={isUpdatingLocation}
                                onClick={async () => {
                                    setIsUpdatingLocation(true);
                                    const lat = tempCoords[0];
                                    const lng = tempCoords[1];
                                    const addr = await reverseGeocode(lat, lng);
                                    
                                    try {
                                        const token = localStorage.getItem('token');
                                        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/profile/${user?._id}`, {
                                            method: 'PUT',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${token}`
                                            },
                                            body: JSON.stringify({
                                                location: { type: 'Point', coordinates: [lng, lat] },
                                                address: addr
                                            })
                                        });
                                        
                                        const data = await res.json();
                                        if (data.success) {
                                            updateUser({
                                                location: { type: 'Point', coordinates: [lng, lat] },
                                                address: addr
                                            });
                                            setShowMapModal(false);
                                        } else {
                                            alert("Failed to save location");
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        alert("Network error");
                                    } finally {
                                        setIsUpdatingLocation(false);
                                    }
                                }}
                                className="bg-primary text-on-primary px-6 py-3 rounded-[14px] font-bold shadow-md hover:bg-primary-container transition-colors active:scale-95 border border-white/10 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isUpdatingLocation ? 'Saving...' : 'Confirm Location'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
