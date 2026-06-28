'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import WorkerCard from '@/components/ui/WorkerCard';
import PageShell from '@/components/ui/PageShell';
import BottomNav from '@/components/ui/BottomNav';

const TRADES = [
    'All', 'Plumber', 'Electrician', 'Carpenter', 'Painter',
    'Mason', 'AC Technician', 'Welder', 'Locksmith', 'Cleaner'
];

interface Worker {
    _id: string;
    userId: {
        _id: string;
        name: string;
        profilePhoto: string;
        trustScore: number;
        trustTier: string;
        isVerified: boolean;
    };
    trade: string;
    hourlyRate: number;
    availability: 'available' | 'busy' | 'offline';
    yearsExp: number;
    location: {
        coordinates: [number, number];
    };
}

export default function DiscoverPage() {
    const router = useRouter();
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrade, setSelectedTrade] = useState('All');
    const [radius, setRadius] = useState(10);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

    useEffect(() => {
        getUserLocation();
    }, []);

    useEffect(() => {
        if (userLocation) fetchWorkers();
    }, [userLocation, selectedTrade, radius]);

    const getUserLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            () => {
                setLocationError('Could not get location. Showing all workers.');
                // Default to Delhi if location denied
                setUserLocation({ lat: 28.6139, lng: 77.2090 });
            }
        );
    };

    const fetchWorkers = async () => {
        try {
            setLoading(true);
            const params: any = {
                lat: userLocation?.lat,
                lng: userLocation?.lng,
                radius,
            };
            if (selectedTrade !== 'All') params.trade = selectedTrade;

            const res = await api.get('/api/workers/nearby', { params });
            setWorkers(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getDistance = (worker: Worker): number => {
        if (!userLocation || !worker.location?.coordinates) return 0;
        const [lng, lat] = worker.location.coordinates;
        const R = 6371000;
        const dLat = ((lat - userLocation.lat) * Math.PI) / 180;
        const dLng = ((lng - userLocation.lng) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((userLocation.lat * Math.PI) / 180) *
            Math.cos((lat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    return (
        <div className="max-w-md mx-auto min-h-screen bg-gray-50">
            <PageShell title="Discover Workers" subtitle="Find skilled workers near you">
                {/* Search + View Toggle */}
                <div className="px-4 pt-4 pb-2 bg-white sticky top-16 z-10 shadow-sm">
                    {/* View Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-xl p-1 mb-3">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${viewMode === 'list' ? 'bg-white shadow text-orange-500' : 'text-gray-500'
                                }`}
                        >
                            📋 List
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${viewMode === 'map' ? 'bg-white shadow text-orange-500' : 'text-gray-500'
                                }`}
                        >
                            🗺️ Map
                        </button>
                    </div>

                    {/* Trade Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {TRADES.map(trade => (
                            <button
                                key={trade}
                                onClick={() => setSelectedTrade(trade)}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition ${selectedTrade === trade
                                        ? 'bg-orange-500 text-white border-orange-500'
                                        : 'bg-white text-gray-600 border-gray-200'
                                    }`}
                            >
                                {trade}
                            </button>
                        ))}
                    </div>

                    {/* Radius Slider */}
                    <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Search radius</span>
                            <span className="text-orange-500 font-medium">{radius} km</span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={50}
                            value={radius}
                            onChange={(e) => setRadius(parseInt(e.target.value))}
                            className="w-full accent-orange-500"
                        />
                    </div>
                </div>

                {/* Location Error */}
                {locationError && (
                    <div className="mx-4 mt-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2">
                        <p className="text-yellow-700 text-sm">⚠️ {locationError}</p>
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <div className="px-4 pt-4 space-y-3 pb-24">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="text-4xl mb-3">🔍</div>
                                <p className="text-gray-500">Finding workers near you...</p>
                            </div>
                        ) : workers.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-4xl mb-3">😕</div>
                                <p className="text-gray-600 font-medium">No workers found</p>
                                <p className="text-gray-400 text-sm mt-1">Try increasing the radius or changing the trade filter</p>
                                <button
                                    onClick={() => setRadius(prev => Math.min(prev + 10, 50))}
                                    className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-xl text-sm font-medium"
                                >
                                    Increase radius to {Math.min(radius + 10, 50)} km
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-gray-500">{workers.length} workers found within {radius} km</p>
                                {workers.map(worker => (
                                    <WorkerCard
                                        key={worker._id}
                                        photo={worker.userId?.profilePhoto}
                                        name={worker.userId?.name || 'Worker'}
                                        trade={worker.trade}
                                        rating={4.5}
                                        trustScore={worker.userId?.trustScore || 0}
                                        distance={getDistance(worker)}
                                        availability={worker.availability}
                                        onBook={() => router.push(`/profile/${worker.userId?._id}`)}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                )}

                {/* Map View */}
                {viewMode === 'map' && (
                    <div className="px-4 pt-4 pb-24">
                        <div className="bg-white rounded-2xl overflow-hidden shadow h-96 flex items-center justify-center border-2 border-dashed border-gray-200">
                            <div className="text-center">
                                <div className="text-5xl mb-3">🗺️</div>
                                <p className="text-gray-600 font-medium">Map View</p>
                                <p className="text-gray-400 text-sm mt-1">Google Maps integration coming in Phase 3 final step</p>
                                <p className="text-orange-500 text-sm mt-2 font-medium">{workers.length} workers in this area</p>
                            </div>
                        </div>

                        {/* Worker list below map */}
                        <div className="mt-4 space-y-3">
                            {workers.map(worker => (
                                <WorkerCard
                                    key={worker._id}
                                    photo={worker.userId?.profilePhoto}
                                    name={worker.userId?.name || 'Worker'}
                                    trade={worker.trade}
                                    trustScore={worker.userId?.trustScore || 0}
                                    distance={getDistance(worker)}
                                    availability={worker.availability}
                                    onBook={() => router.push(`/profile/${worker.userId?._id}`)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </PageShell>
            <BottomNav />
        </div>
    );
}