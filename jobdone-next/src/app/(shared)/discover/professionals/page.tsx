"use client";

import { useEffect, useState } from 'react';
import { ChevronLeft, SlidersHorizontal, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import WorkerCard from '@/components/ui/WorkerCard';

export default function ProfessionalDirectoryPage() {
  const router = useRouter();
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const res = await fetch('/api/discover/professionals');
        const data = await res.json();
        setProfessionals(data);
      } catch (error) {
        console.error("Failed to fetch professionals", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfessionals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 border-b border-gray-100 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-700">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Professionals</h1>
        </div>
        <button className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-700">
          <Search size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white px-4 py-3 flex gap-2 overflow-x-auto hide-scrollbar border-b border-gray-100 shadow-sm">
        {['All', 'Verified', 'Top Rated', 'Nearby', 'Available Now'].map((tab, i) => (
          <button 
            key={i} 
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              i === 0 ? 'bg-primary text-white shadow-sm' : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Directory List */}
      <main className="p-4 space-y-3">
        {loading ? (
          // Skeleton loaders
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))
        ) : professionals.length > 0 ? (
          professionals.map((prof) => (
            <WorkerCard 
              key={prof.id}
              userId={prof.userId}
              name={prof.user?.isVerified ? `${prof.firstName} ${prof.lastName} ✅` : `${prof.firstName || 'User'} ${prof.lastName || ''}`}
              photo={prof.avatarUrl}
              trade={prof.trades ? JSON.parse(prof.trades)[0] || 'Professional' : 'Professional'}
              trustScore={Math.round(prof.rating * 20) || 85}
              availability={Math.random() > 0.5 ? 'available' : 'busy'}
              onBook={() => router.push(`/chat?user=${prof.userId}`)}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-bold text-gray-900 mb-2">No professionals found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters or search criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
}
