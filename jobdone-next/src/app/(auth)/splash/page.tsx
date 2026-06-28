'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SplashPage() {
  const router = useRouter();
  const { token, role, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    
    // Simulate splash animation time
    const timer = setTimeout(() => {
      if (token) {
        if (role === 'worker') router.push('/worker/home');
        else if (role === 'client') router.push('/client/home');
        else router.push('/profile/setup');
      } else {
        router.push('/onboarding');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [token, role, isLoading, router]);

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-black/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Logo */}
      <div className="z-10 flex flex-col items-center animate-in fade-in zoom-in duration-1000">
        <div className="w-24 h-24 bg-white rounded-3xl shadow-premium flex items-center justify-center mb-6">
          <span className="text-primary font-black text-5xl tracking-tighter">JD</span>
        </div>
        <h1 className="text-white text-4xl font-extrabold tracking-tight mb-2">JobDone</h1>
        <p className="text-white/80 font-medium text-lg">Social Hiring Platform</p>
      </div>
    </div>
  );
}
