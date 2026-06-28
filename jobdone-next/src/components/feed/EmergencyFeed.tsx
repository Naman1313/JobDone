"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle, MapPin, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function EmergencyFeed() {
  const { user } = useAuth();
  const [emergencies, setEmergencies] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role !== 'WORKER') return;
    
    // Poll for active emergencies every 10 seconds
    const fetchEmergencies = async () => {
      try {
        const res = await api.get('/api/emergency/active');
        if (res.data?.success) {
          setEmergencies(res.data.data);
        }
      } catch (err) {}
    };

    fetchEmergencies();
    const interval = setInterval(fetchEmergencies, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleAccept = async (emergencyId: string) => {
    try {
      const res = await api.post('/api/emergency/accept', { emergencyId });
      if (res.data?.success) {
        alert('You have accepted this emergency request!');
        setEmergencies(prev => prev.filter(e => e.id !== emergencyId));
      } else {
        alert(res.data?.message || 'Failed to accept');
      }
    } catch (err) {
      alert('This emergency is no longer available.');
      setEmergencies(prev => prev.filter(e => e.id !== emergencyId));
    }
  };

  if (emergencies.length === 0 || user?.role !== 'WORKER') return null;

  return (
    <div className="px-4 mb-4 space-y-3">
      <h3 className="font-bold text-red-600 flex items-center gap-1">
        <AlertTriangle size={18} /> Active Emergencies Nearby
      </h3>
      {emergencies.map((emergency) => (
        <div key={emergency.id} className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex flex-col shadow-sm">
          <div className="flex items-center gap-3 mb-3">
             <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-sm">
               <img 
                 src={emergency.requester?.profile?.avatarUrl || "https://randomuser.me/api/portraits/lego/1.jpg"} 
                 alt="Requester"
                 className="w-full h-full object-cover"
               />
             </div>
             <div>
               <h4 className="font-bold text-gray-900">{emergency.requester?.profile?.firstName || "Someone"} needs help!</h4>
               <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
                 <MapPin size={12} /> {Math.abs(emergency.latitude).toFixed(4)}, {Math.abs(emergency.longitude).toFixed(4)}
               </p>
             </div>
          </div>
          <button 
            onClick={() => handleAccept(emergency.id)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} /> Accept Request
          </button>
        </div>
      ))}
    </div>
  );
}
