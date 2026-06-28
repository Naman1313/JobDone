"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Target, ChevronRight, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CompletionTracker() {
  const [data, setData] = useState<{ score: number, recommendations: string[] } | null>(null);
  const router = useRouter();

  useEffect(() => {
    api.get('/api/profile/completion')
      .then(res => {
        if (res.data?.success) {
          setData(res.data.data);
        }
      })
      .catch(console.error);
  }, []);

  if (!data) return null;
  if (data.score === 100) return null; // Don't show if complete

  const firstRec = data.recommendations[0];

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
          <Target size={16} className="text-primary" /> Profile Strength
        </h3>
        <span className="text-sm font-black text-gray-900">{data.score}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4 overflow-hidden">
        <div 
          className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${data.score}%` }}
        />
      </div>

      {firstRec && (
        <div 
          onClick={() => router.push('/profile/edit')}
          className="bg-blue-50 hover:bg-blue-100 transition-colors p-3 rounded-xl flex items-start gap-3 cursor-pointer"
        >
          <PlusCircle size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-blue-900 font-medium leading-tight mb-1">
              {firstRec}
            </p>
            <span className="text-xs text-blue-600 font-bold flex items-center gap-1">
              Add now <ChevronRight size={14} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
