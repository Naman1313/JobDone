"use client";

import { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, MapPin, Phone, MessageCircle, ShieldAlert, Navigation } from 'lucide-react';
import { useActionMenu } from '@/providers/ActionMenuProvider';
import api from '@/lib/api';

export default function EmergencyOverlay() {
  const { isEmergencyOpen, setEmergencyOpen } = useActionMenu();
  
  // State: 'IDLE' -> 'COUNTDOWN' -> 'SEARCHING' -> 'ACCEPTED'
  const [stage, setStage] = useState<'IDLE' | 'COUNTDOWN' | 'SEARCHING' | 'ACCEPTED'>('IDLE');
  const [countdown, setCountdown] = useState(3);
  const [emergencyId, setEmergencyId] = useState<string | null>(null);
  const [responder, setResponder] = useState<any>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Stop everything on close
  const handleClose = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollRef.current) clearInterval(pollRef.current);
    setEmergencyOpen(false);
    
    // Reset state after animation
    setTimeout(() => {
      setStage('IDLE');
      setCountdown(3);
      setEmergencyId(null);
      setResponder(null);
    }, 300);
  };

  // 1. Hold to trigger
  const handleSOSPress = () => {
    setStage('COUNTDOWN');
    setCountdown(3);
    
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          triggerEmergency();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSOSRelease = () => {
    if (stage === 'COUNTDOWN') {
      if (timerRef.current) clearInterval(timerRef.current);
      setStage('IDLE');
      setCountdown(3);
    }
  };

  // 2. Trigger API Call
  const triggerEmergency = async () => {
    setStage('SEARCHING');
    try {
      // Mock Location for now
      const payload = {
        latitude: 40.7128,
        longitude: -74.0060,
        tradeNeeded: "Plumber" // Or dynamic based on a select
      };
      const res = await api.post('/api/emergency/sos', payload);
      if (res.data.success) {
        setEmergencyId(res.data.data.id);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to trigger SOS.');
      handleClose();
    }
  };

  // 3. Poll Status
  useEffect(() => {
    if (stage === 'SEARCHING' && emergencyId) {
      pollRef.current = setInterval(async () => {
        try {
          const res = await api.get(`/api/emergency/status?id=${emergencyId}`);
          if (res.data.success && res.data.data.status === 'ACCEPTED') {
            setResponder(res.data.data.responder);
            setStage('ACCEPTED');
            if (pollRef.current) clearInterval(pollRef.current);
          }
        } catch (e) {}
      }, 2000); // poll every 2 seconds
    }
    
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [stage, emergencyId]);


  if (!isEmergencyOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in">
      
      {/* Close */}
      <button onClick={handleClose} className="absolute top-6 right-6 text-white/50 hover:text-white p-2 bg-black/20 rounded-full transition-colors">
        <X size={24} />
      </button>

      {/* STAGE: IDLE or COUNTDOWN */}
      {(stage === 'IDLE' || stage === 'COUNTDOWN') && (
        <div className="flex flex-col items-center text-center px-6">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-8 animate-pulse">
            <ShieldAlert size={48} className="text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Emergency Help</h2>
          <p className="text-red-200 mb-12">Hold the button below to broadcast an SOS to all nearby professionals.</p>

          <button
            onPointerDown={handleSOSPress}
            onPointerUp={handleSOSRelease}
            onPointerLeave={handleSOSRelease}
            className={`relative w-48 h-48 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 select-none ${
              stage === 'COUNTDOWN' ? 'bg-red-700 scale-95 shadow-red-500/50' : 'bg-red-600 hover:bg-red-500 hover:scale-105 shadow-red-600/30'
            }`}
          >
            {/* Ripple Effects */}
            <div className="absolute inset-0 rounded-full border-4 border-red-500/30 animate-ping"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-5xl font-black text-white tracking-widest">
                {stage === 'COUNTDOWN' ? countdown : 'SOS'}
              </span>
              <span className="text-red-200 font-semibold uppercase tracking-widest text-xs mt-2">
                Hold to Trigger
              </span>
            </div>
          </button>
        </div>
      )}

      {/* STAGE: SEARCHING */}
      {stage === 'SEARCHING' && (
        <div className="flex flex-col items-center text-center px-6">
           <div className="relative w-48 h-48 flex items-center justify-center mb-10">
              {/* Radar Rings */}
              <div className="absolute inset-0 rounded-full border border-red-500/50 animate-ping" style={{ animationDuration: '2s' }}></div>
              <div className="absolute inset-4 rounded-full border border-red-500/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
              <div className="absolute inset-8 rounded-full border border-red-500/10 animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }}></div>
              <Navigation size={48} className="text-white animate-pulse" />
           </div>
           
           <h2 className="text-2xl font-bold text-white mb-2">Broadcasting SOS...</h2>
           <p className="text-red-200 animate-pulse">Alerting nearby professionals.</p>
        </div>
      )}

      {/* STAGE: ACCEPTED */}
      {stage === 'ACCEPTED' && responder && (
        <div className="flex flex-col items-center text-center px-6 w-full max-w-sm animate-in zoom-in-95 duration-500">
           <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.5)]">
              <ShieldAlert size={40} className="text-white" />
           </div>
           
           <h2 className="text-3xl font-bold text-white mb-2">Help is on the way!</h2>
           <p className="text-green-400 mb-8 font-medium">A professional has accepted your request.</p>

           {/* Responder Card */}
           <div className="bg-white rounded-3xl p-5 w-full flex flex-col shadow-2xl">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-4">
                 <img 
                    src={responder.profile?.avatarUrl || "https://randomuser.me/api/portraits/men/22.jpg"} 
                    alt="Responder" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                 />
                 <div className="text-left flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{responder.profile?.firstName} {responder.profile?.lastName}</h3>
                    <p className="text-primary font-semibold text-sm">Emergency Plumber</p>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-1"><MapPin size={12}/> 1.2 miles away</p>
                 </div>
              </div>
              
              <div className="flex gap-3">
                 <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                    <MessageCircle size={18} /> Chat
                 </button>
                 <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-500/20">
                    <Phone size={18} /> Call
                 </button>
              </div>
           </div>
           
           <button onClick={handleClose} className="mt-8 text-white/50 hover:text-white underline underline-offset-4">
             Cancel Request
           </button>
        </div>
      )}

    </div>
  );
}
