"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Splash() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    
    // Simulate splash screen delay and then redirect
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (user) {
          router.push('/home');
        } else {
          router.push('/onboarding');
        }
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isLoading, user, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary overflow-hidden">
      <div 
        className={`transition-all duration-1000 transform flex flex-col items-center ${
          show ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10'
        }`}
      >
        <div className="w-24 h-24 bg-surface-container-lowest rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex items-center justify-center mb-6">
          <span className="text-5xl">🛠️</span>
        </div>
        <h1 className="text-4xl font-headline-lg text-on-primary tracking-tight mb-2 font-bold">JobDone</h1>
        <p className="text-surface-warm font-label-lg tracking-wide">Work. Trust. Done.</p>
        
        <div className="mt-16 flex space-x-2">
          <div className="w-3 h-3 bg-surface-container-lowest rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-surface-container-lowest rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-surface-container-lowest rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}
