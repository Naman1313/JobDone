"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Splash() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    
    // Simulate splash screen delay and then redirect
    const timer = setTimeout(() => {
      if (!loading) {
        if (user) {
          router.push('/home');
        } else {
          router.push('/onboarding');
        }
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [loading, user, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-orange-500 overflow-hidden">
      <div 
        className={`transition-all duration-1000 transform flex flex-col items-center ${
          show ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10'
        }`}
      >
        <div className="w-24 h-24 bg-white rounded-2xl shadow-2xl flex items-center justify-center mb-6">
          <span className="text-5xl">🛠️</span>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight mb-2">JobDone</h1>
        <p className="text-orange-100 font-medium tracking-wide">Work. Trust. Done.</p>
        
        <div className="mt-16 flex space-x-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}
