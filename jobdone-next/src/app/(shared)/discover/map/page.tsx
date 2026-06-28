"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Search, Filter, Compass, Briefcase, Zap, User } from 'lucide-react';
import Link from 'next/link';

export default function NearbyMapPage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'jobs' | 'pros'>('all');
  const [selectedPin, setSelectedPin] = useState<number | null>(null);

  useEffect(() => {
    // Simulate radar scanning delay
    const timer = setTimeout(() => {
      setIsScanning(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Mock data for map pins
  const pins = [
    { id: 1, type: 'pro', name: 'Arjun S.', role: 'Electrician', distance: '1.2 km', x: 20, y: 30, color: 'bg-blue-500' },
    { id: 2, type: 'job', name: 'AC Repair Needed', role: 'Homeowner', distance: '0.8 km', x: 70, y: 40, color: 'bg-orange-500' },
    { id: 3, type: 'pro', name: 'Rahul V.', role: 'Plumber', distance: '3.5 km', x: 40, y: 70, color: 'bg-blue-500' },
    { id: 4, type: 'job', name: 'Office Setup', role: 'Tech Corp', distance: '5.1 km', x: 80, y: 80, color: 'bg-orange-500' },
    { id: 5, type: 'pro', name: 'Sneha M.', role: 'Developer', distance: '2.0 km', x: 30, y: 50, color: 'bg-blue-500' },
  ];

  const filteredPins = pins.filter(p => activeTab === 'all' || (activeTab === 'jobs' && p.type === 'job') || (activeTab === 'pros' && p.type === 'pro'));

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans overflow-hidden flex flex-col relative">
      {/* Header Overlay */}
      <div className="absolute top-0 w-full z-30 bg-gradient-to-b from-gray-900/90 to-transparent pt-6 pb-10 px-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2">
            <MapPin size={16} className="text-blue-400" />
            <span className="text-sm font-bold">New Delhi, India</span>
          </div>
          <button className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <Filter size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setActiveTab('all')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-white text-gray-900' : 'bg-gray-800/80 text-gray-400 hover:text-white'}`}>All</button>
          <button onClick={() => setActiveTab('pros')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'pros' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-gray-800/80 text-gray-400 hover:text-white'}`}>Professionals</button>
          <button onClick={() => setActiveTab('jobs')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'jobs' ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-gray-800/80 text-gray-400 hover:text-white'}`}>Jobs</button>
        </div>
      </div>

      {/* Map / Radar Area */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Radar Center Point (You) */}
        <div className="absolute z-20">
          <div className="relative flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full z-10 shadow-[0_0_20px_white]"></div>
            <div className="w-8 h-8 bg-white/20 rounded-full absolute animate-ping"></div>
            
            {/* Radar Sweep Animation */}
            {isScanning && (
              <div className="absolute w-64 h-64 border-2 border-blue-500/30 rounded-full flex items-center justify-center">
                <div className="w-full h-full rounded-full border-t-2 border-blue-400 animate-[spin_2s_linear_infinite] [mask-image:conic-gradient(transparent_270deg,black)]"></div>
              </div>
            )}
          </div>
        </div>

        {/* Map Pins */}
        {!isScanning && filteredPins.map((pin) => (
          <div 
            key={pin.id} 
            className="absolute z-10 transition-all duration-500 ease-out animate-[fade-in_0.5s_ease-out_forwards]"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            <div className="relative group cursor-pointer" onClick={() => setSelectedPin(pin.id)}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${selectedPin === pin.id ? 'ring-4 ring-white/30 scale-110' : ''} ${pin.color} transition-transform`}>
                {pin.type === 'pro' ? <User size={20} className="text-white" /> : <Briefcase size={20} className="text-white" />}
              </div>
              
              {/* Tooltip / Label */}
              <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-800/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-700 whitespace-nowrap transition-opacity ${selectedPin === pin.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <p className="text-xs font-bold text-white">{pin.name}</p>
                <p className="text-[10px] text-gray-400 font-bold">{pin.distance} away</p>
              </div>
            </div>
          </div>
        ))}
        
        {isScanning && (
          <div className="absolute bottom-32 text-blue-400 font-bold tracking-widest text-sm animate-pulse flex items-center gap-2">
            <Compass className="animate-spin" size={16} /> SCANNING AREA...
          </div>
        )}
      </div>

      {/* Selected Card Bottom Sheet */}
      <div className={`absolute bottom-0 w-full bg-gray-800 rounded-t-3xl border-t border-gray-700 p-5 transition-transform duration-300 z-40 ${selectedPin ? 'translate-y-0' : 'translate-y-full'}`}>
        {selectedPin && (
          <>
            <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-5"></div>
            {filteredPins.find(p => p.id === selectedPin)?.type === 'pro' ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <User size={30} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{filteredPins.find(p => p.id === selectedPin)?.name}</h3>
                  <p className="text-sm text-gray-400">{filteredPins.find(p => p.id === selectedPin)?.role}</p>
                  <p className="text-xs text-blue-400 font-bold mt-1">{filteredPins.find(p => p.id === selectedPin)?.distance} away</p>
                </div>
                <Link href={`/profile/mock-id`} className="bg-white text-gray-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
                  View Profile
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center">
                  <Briefcase size={30} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{filteredPins.find(p => p.id === selectedPin)?.name}</h3>
                  <p className="text-sm text-gray-400">{filteredPins.find(p => p.id === selectedPin)?.role}</p>
                  <p className="text-xs text-orange-400 font-bold mt-1">{filteredPins.find(p => p.id === selectedPin)?.distance} away • Urgent</p>
                </div>
                <button className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                  Apply Now
                </button>
              </div>
            )}
            
            <button 
              onClick={() => setSelectedPin(null)}
              className="w-full mt-6 py-3 rounded-xl border border-gray-600 text-gray-300 font-bold hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </>
        )}
      </div>

    </div>
  );
}
