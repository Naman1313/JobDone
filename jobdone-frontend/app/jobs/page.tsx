"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import WorkerCard from '@/components/ui/WorkerCard';
import dynamic from 'next/dynamic';
import { useChat } from '@/hooks/useChat';

const MapPicker = dynamic(() => import('@/components/ui/MapPicker'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-surface-variant/30 animate-pulse flex items-center justify-center rounded-2xl"><span className="font-bold text-primary">Loading Map...</span></div>
});

interface Job {
  _id: string;
  title: string;
  trade: string;
  budget: number;
  urgency: string;
  distance: number;
  createdAt: string;
  clientId: string;
}

export default function JobBoard() {
  const { user } = useAuth();
  const { startChat } = useChat();
  
  // States for Worker View (Job Board)
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [trade, setTrade] = useState('');
  const [radius, setRadius] = useState(5000); // 5km default
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Location States
  const [searchCoords, setSearchCoords] = useState<[number, number] | null>(null);
  const [searchAddress, setSearchAddress] = useState('Current Location');
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

  // States for Client View (Worker Directory)
  const [workers, setWorkers] = useState<any[]>([]);

  const fetchJobs = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString(),
        ...(trade && { trade })
      });
      
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/jobs?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.success) {
        setJobs(data.data);
      } else {
        setError(data.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius: (radius / 1000).toString(),
        ...(trade && { trade })
      });

      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/workers/nearby?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setWorkers(data.data);
      } else {
        setError(data.message || 'Failed to fetch workers');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  // Initialize location only once on mount
  useEffect(() => {
    if (user === undefined) return;
    
    // Only initialize if we haven't yet
    if (!searchCoords) {
      if (user?.location?.coordinates && user.location.coordinates.length === 2) {
        // user.location is [lng, lat]
        const lng = user.location.coordinates[0];
        const lat = user.location.coordinates[1];
        setSearchCoords([lat, lng]);
        setSearchAddress(user.address || 'Saved Location');
        setTempCoords([lat, lng]);
      } else {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              const address = await reverseGeocode(lat, lng);
              setSearchCoords([lat, lng]);
              setSearchAddress(address);
              setTempCoords([lat, lng]);
            },
            (err) => {
              console.warn("Geolocation blocked, no fallback", err);
              setSearchAddress("LOCATION NOT SET");
            }
          );
        } else {
          setSearchAddress("LOCATION NOT SET");
        }
      }
    }
  }, [user]);

  // Fetch jobs/workers whenever location, trade, or radius changes
  useEffect(() => {
    if (user === undefined || !searchCoords) return;

    if (user?.role === 'client') {
      fetchWorkers(searchCoords[0], searchCoords[1]);
    } else {
      fetchJobs(searchCoords[0], searchCoords[1]);
    }
  }, [searchCoords, trade, radius, user?.role]); 

  const handleApply = async (jobId: string) => {
    try {
      setActionLoading(jobId);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: "I am interested in this job." })
      });
      const data = await res.json();
      if(data.success) {
        alert("Successfully applied!");
      } else {
        alert("Failed: " + data.message);
      }
    } catch (err) {
      alert("Error applying to job");
    } finally {
      setActionLoading(null);
    }
  };

  const isClient = user?.role === 'client';

  return (
    <div className="w-full mx-auto min-h-screen bg-surface-warm font-sans selection:bg-primary selection:text-white flex flex-col pb-32">
      {/* Header */}
      <header className="w-full sticky top-0 z-40 bg-white/40 backdrop-blur-2xl saturate-150 flex items-center border-b border-white/60 shadow-[0_4px_30px_rgba(93,64,55,0.05)] transition-all min-h-[72px] py-3">
        <div className="w-full max-w-7xl px-4 md:px-8 mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-[20px] font-bold text-primary tracking-tight drop-shadow-sm leading-tight">
              {isClient ? 'Hire Workers' : 'Job Board'}
            </h1>
            <p className="font-label-sm text-xs text-on-surface-variant drop-shadow-sm font-medium mt-0.5">
              {isClient ? 'Workers near you' : 'Jobs matching your skills'}
            </p>
          </div>
          
          {isClient && (
            <Link href="/jobs/post">
              <button className="px-5 py-2 bg-primary text-on-primary rounded-full font-label-md font-bold shadow-[0_4px_12px_rgba(93,64,55,0.2)] border border-white/10 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center gap-1.5">
                <span className="text-lg leading-none">+</span> Post Job
              </button>
            </Link>
          )}
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-6 flex flex-col flex-grow">
        {/* Filter Bar */}
        <div className="bg-surface-container-lowest p-5 rounded-[24px] shadow-[0px_8px_24px_rgba(0,0,0,0.03)] border border-border-subtle/20 mb-8 flex flex-col space-y-4">
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Location Selector */}
            <div 
              className="flex-1 bg-surface-variant/30 border border-border-subtle/50 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-surface-variant/50 transition-colors"
              onClick={() => setShowMapModal(true)}
            >
              <div className="flex items-center gap-3">
                <span className="text-primary text-xl">📍</span>
                <div className="flex flex-col">
                  <span className="font-bold text-on-surface text-sm">{searchAddress}</span>
                  {searchCoords && searchCoords[0] !== undefined && (
                    <span className="text-[10px] font-mono text-on-surface-variant/80">
                      {searchCoords[0].toFixed(4)}, {searchCoords[1].toFixed(4)}
                    </span>
                  )}
                </div>
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">Change</span>
            </div>

            <select 
              className="flex-1 h-[60px] px-4 bg-surface-variant/30 border border-border-subtle/50 rounded-xl text-primary font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-colors cursor-pointer hover:bg-surface-variant/50 appearance-none"
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%235D4037%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
          >
            <option value="">All Trades</option>
            <option value="plumber">Plumber</option>
            <option value="electrician">Electrician</option>
            <option value="carpenter">Carpenter</option>
            <option value="painter">Painter</option>
          </select>
          </div>
          
          <div className="flex items-center space-x-4 bg-surface-variant/20 p-4 rounded-xl border border-border-subtle/30">
            <span className="font-label-md font-bold text-primary w-28 whitespace-nowrap">Radius: {radius / 1000}km</span>
            <input 
              type="range" 
              min="1000" max="50000" step="1000" 
              value={radius} 
              onChange={(e) => setRadius(Number(e.target.value))}
              className="flex-1 accent-primary h-2 bg-surface-variant/50 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Content Area */}
        <main className={`flex-grow grid gap-6 w-full pb-10 ${!searchCoords ? 'grid-cols-1' : isClient ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {!searchCoords ? (
            <div className="col-span-full text-center py-16 text-on-surface-variant bg-surface-container-lowest rounded-[24px] shadow-[0px_8px_24px_rgba(0,0,0,0.03)] border border-border-subtle/20 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl shadow-inner border border-primary/10">
                📍
              </div>
              <p className="font-bold text-xl text-on-surface mb-2 tracking-tight">Location Not Set</p>
              <p className="text-sm font-medium text-on-surface-variant max-w-xs mx-auto mb-5">Please set your location using the map or enable GPS to find {isClient ? 'workers' : 'jobs'} near you.</p>
              <button 
                onClick={() => setShowMapModal(true)}
                className="bg-primary text-on-primary px-6 py-3 rounded-[14px] font-bold shadow-[0_4px_12px_rgba(93,64,55,0.2)] hover:bg-primary-container transition-all active:scale-95 border border-white/10"
              >
                Set Location
              </button>
            </div>
          ) : loading ? (
            <div className="col-span-full text-center py-16 font-body-md text-primary font-bold animate-pulse">
              {isClient ? 'Finding workers near you...' : 'Finding jobs near you...'}
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-16 text-error font-body-md font-bold">{error}</div>
          ) : isClient ? (
            /* Client View: Worker Cards */
            workers.length === 0 ? (
              <div className="col-span-full text-center py-16 text-on-surface-variant bg-surface-container-lowest rounded-[24px] shadow-[0px_8px_24px_rgba(0,0,0,0.03)] border border-border-subtle/20 flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl shadow-inner border border-primary/10">
                  👷
                </div>
                <p className="font-bold text-xl text-on-surface mb-2 tracking-tight">No workers found in this area.</p>
                <p className="text-sm font-medium text-on-surface-variant max-w-xs mx-auto">Try increasing your search radius or selecting a different trade filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workers.map(worker => (
                  <WorkerCard
                    key={worker._id}
                    name={worker.userId?.name || 'Worker'}
                    trade={worker.trade}
                    photo={worker.userId?.profilePhoto}
                    rating={4.5}
                    trustScore={worker.userId?.trustTier === 'Gold' ? 85 : worker.userId?.trustTier === 'Platinum' ? 95 : 50}
                    distance={worker.distance || 0}
                    availability={worker.availability}
                    isVerified={worker.userId?.isVerified}
                    onBook={() => console.log('Book clicked')}
                    onMessage={() => startChat(worker.userId?._id)}
                  />
                ))}
              </div>
            )
          ) : (
            /* Worker View: Job Cards */
            jobs.length === 0 ? (
              <div className="col-span-full text-center py-16 text-on-surface-variant bg-surface-container-lowest rounded-[24px] shadow-[0px_8px_24px_rgba(0,0,0,0.03)] border border-border-subtle/20 flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl shadow-inner border border-primary/10">
                  🔍
                </div>
                <p className="font-bold text-xl text-on-surface mb-2 tracking-tight">No jobs found in this area.</p>
                <p className="text-sm font-medium text-on-surface-variant max-w-xs mx-auto">Try increasing your search radius or selecting a different trade filter.</p>
              </div>
            ) : (
              jobs.map(job => (
                <div key={job._id} className="bg-surface-container-lowest p-6 rounded-[24px] shadow-[0px_8px_24px_rgba(0,0,0,0.03)] border border-border-subtle/20 flex flex-col hover:shadow-[0px_12px_32px_rgba(93,64,55,0.08)] transition-all hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-headline-md text-[20px] leading-snug font-bold text-on-surface tracking-tight pr-2">{job.title}</h3>
                    {job.urgency === 'emergency' && (
                      <span className="bg-error/10 text-error font-label-sm font-bold px-2.5 py-1 rounded-md ml-2 flex-shrink-0 uppercase tracking-wider border border-error/20">
                        URGENT
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="bg-surface-variant/40 border border-border-subtle/50 text-primary font-label-sm font-bold px-3 py-1 rounded-full capitalize">
                      {job.trade}
                    </span>
                    <span className="bg-primary/5 text-primary/80 font-label-sm font-medium px-3 py-1 rounded-full border border-primary/10">
                      {Math.round(job.distance)}m away
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-auto pt-5 border-t border-border-subtle/40">
                    <div className="flex flex-col">
                      <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-0.5">Budget</span>
                      <div className="text-primary font-headline-md font-bold text-2xl">
                        ₹{job.budget}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {job.clientId !== user?._id && (
                        <button 
                          onClick={() => {
                            setActionLoading(`chat-${job._id}`);
                            startChat(job.clientId).finally(() => setActionLoading(null));
                          }}
                          disabled={actionLoading === `chat-${job._id}`}
                          className="bg-secondary/10 text-secondary font-bold px-4 py-3 rounded-[14px] shadow-sm transition-all hover:bg-secondary/20 active:scale-[0.97] border border-secondary/20 flex items-center justify-center disabled:opacity-50"
                          title="Message Host"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}
                      {user?.role === 'worker' && (
                        <button 
                          onClick={() => handleApply(job._id)}
                          disabled={actionLoading === job._id}
                          className="bg-primary text-on-primary font-label-lg font-bold px-7 py-3 rounded-[14px] shadow-[0_4px_12px_rgba(93,64,55,0.2)] transition-all hover:bg-primary-container active:scale-[0.97] border border-white/10 disabled:opacity-50"
                        >
                          {actionLoading === job._id ? 'Applying...' : 'Apply'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </main>
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
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Search Around</span>
                <span className="text-sm font-mono text-primary font-bold">
                  {tempCoords[0].toFixed(4)}, {tempCoords[1].toFixed(4)}
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={async () => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(async (pos) => {
                        const lat = pos.coords.latitude;
                        const lng = pos.coords.longitude;
                        setTempCoords([lat, lng]);
                      });
                    }
                  }}
                  className="bg-surface-variant/40 text-on-surface-variant px-4 py-3 rounded-[14px] font-bold hover:bg-surface-variant/60 transition-colors"
                >
                  🎯 Current
                </button>
                <button 
                  onClick={async () => {
                    const address = await reverseGeocode(tempCoords[0], tempCoords[1]);
                    setSearchAddress(address);
                    setSearchCoords(tempCoords);
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
    </div>
  );
}
