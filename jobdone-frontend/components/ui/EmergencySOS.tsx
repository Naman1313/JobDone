"use client";

import { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function EmergencySOS() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Hide SOS button on marketing, auth, and onboarding routes, and for non-clients
  const hiddenRoutes = ['/', '/splash', '/onboarding', '/auth'];
  if (hiddenRoutes.includes(pathname) || pathname.startsWith('/profile/setup') || user?.role !== 'client') {
    return null;
  }

  const startSOS = () => {
    setActive(true);
    setProgress(0);
    
    let currentProgress = 0;
    timerRef.current = setInterval(() => {
      currentProgress += 2; // 2% every 60ms = ~3 seconds total
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        triggerSOS();
      }
    }, 60);
  };

  const cancelSOS = () => {
    setActive(false);
    setProgress(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const triggerSOS = async () => {
    cancelSOS(); // Reset UI
    if (!user) {
        alert("Please login to use SOS");
        return;
    }
    
    try {
      // In a real app we would fetch actual GPS coordinates here
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/emergency/sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          location: { lat: 28.7041, lng: 77.1025 }
        })
      });
      alert("🚨 EMERGENCY SOS SENT! Nearby workers and admins have been alerted.");
    } catch (err) {
      console.error("SOS failed", err);
      alert("Failed to send SOS. Please call emergency services directly.");
    }
  };

  return (
    <div className="fixed bottom-32 right-6 z-50 pointer-events-none">
      <button
        onMouseDown={startSOS}
        onMouseUp={cancelSOS}
        onMouseLeave={cancelSOS}
        onTouchStart={startSOS}
        onTouchEnd={cancelSOS}
        className="pointer-events-auto w-[64px] h-[64px] bg-[#ba1a1a] rounded-full shadow-[0px_8px_24px_rgba(186,26,26,0.4)] flex items-center justify-center text-white font-headline-md font-bold text-[16px] relative overflow-hidden active:scale-90 transition-all duration-300 border-[3px] border-white/20 hover:shadow-[0px_12px_32px_rgba(186,26,26,0.6)]"
      >
        <div 
            className="absolute bottom-0 left-0 w-full bg-white/20 transition-all duration-75 ease-linear"
            style={{ height: `${progress}%` }}
        />
        <span className="relative z-10 tracking-widest text-[14px]">SOS</span>
      </button>
      
      {active && (
        <div className="absolute bottom-[72px] right-0 w-[160px] bg-surface-container-highest text-on-surface font-label-sm px-4 py-3 rounded-2xl text-center shadow-[0px_8px_24px_rgba(0,0,0,0.12)] border border-border-subtle backdrop-blur-md origin-bottom-right animate-in fade-in zoom-in duration-200">
          Hold to trigger emergency alert...
        </div>
      )}
    </div>
  );
}
