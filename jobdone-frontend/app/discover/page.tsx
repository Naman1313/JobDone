"use client";

import { useEffect, useState } from "react";
import PageShell from "../../components/ui/PageShell";
import WorkerCard from "../../components/ui/WorkerCard";
import { useAuth } from "@/context/AuthContext";

export default function DiscoverPage() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [tradeFilter, setTradeFilter] = useState("");
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    const fetchWithCoords = (lat: number, lng: number) => {
      let url = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/workers/nearby?lat=${lat}&lng=${lng}&radius=50`;
      if (tradeFilter) {
        url += `&trade=${tradeFilter}`;
      }

      const token = localStorage.getItem('token');
      fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setWorkers(data.data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    };

    if (user === undefined) return;

    if (user?.location?.coordinates && user.location.coordinates.length === 2) {
      const lng = user.location.coordinates[0];
      const lat = user.location.coordinates[1];
      fetchWithCoords(lat, lng);
    } else {
      setLocationError("LOCATION NOT SET");
      setLoading(false);
    }
  }, [tradeFilter, user]);

  return (
    <PageShell title="Discover Workers" showBackButton>
      <div className="p-4">
        {/* Filters and Toggle */}
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex space-x-2">
            <input 
              type="text" 
              placeholder="Filter by trade (e.g. Plumber)" 
              className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500"
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
            />
            <button 
              onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
              className="bg-orange-50 text-orange-500 px-4 py-2 rounded-xl font-bold border border-orange-100"
            >
              {viewMode === "list" ? "Map View" : "List View"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : locationError ? (
          <div className="flex flex-col items-center justify-center h-48 bg-surface-variant/20 rounded-[24px] border border-error/20 p-6 text-center shadow-inner">
            <span className="text-4xl mb-3">📍</span>
            <p className="font-label-lg text-error font-bold">{locationError}</p>
            <p className="font-body-sm text-on-surface-variant mt-2">Please go to Profile &gt; Edit Profile to set your location.</p>
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-4">
            {workers.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No workers found nearby.</p>
            ) : (
              workers.map(worker => (
                <WorkerCard
                  key={worker._id}
                  name={worker.userId?.name || 'Worker'}
                  trade={worker.trade}
                  photo={worker.userId?.profilePhoto || "https://ui-avatars.com/api/?name=Worker"}
                  rating={4.5}
                  trustScore={worker.userId?.trustTier === 'Gold' ? 85 : worker.userId?.trustTier === 'Platinum' ? 95 : 50}
                  distance={worker.distance || 0}
                  availability={worker.availability}
                  isVerified={worker.userId?.isVerified}
                  onBook={() => console.log('Book clicked')}
                />
              ))
            )}
          </div>
        ) : (
          <div className="bg-gray-100 rounded-2xl h-[60vh] flex items-center justify-center border border-gray-200 overflow-hidden relative">
            <div className="absolute inset-0 bg-blue-50 opacity-50 flex items-center justify-center">
              <p className="text-blue-400 font-medium">Google Maps Integration (Phase 4)</p>
            </div>
            
            {/* Dummy map markers for visual MVP */}
            {workers.map((worker, i) => (
              <div 
                key={worker._id}
                className="absolute flex flex-col items-center cursor-pointer transform hover:scale-110 transition-transform"
                style={{
                  top: `${20 + (i * 15 % 60)}%`,
                  left: `${20 + (i * 25 % 60)}%`
                }}
              >
                <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-lg mb-1 font-bold">
                  {worker.trade}
                </div>
                <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-md"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
