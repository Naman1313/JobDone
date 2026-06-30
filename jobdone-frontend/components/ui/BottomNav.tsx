"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hide BottomNav on marketing, auth, onboarding, and chat conversation routes
  const hiddenRoutes = ['/', '/splash', '/onboarding', '/auth'];
  if (hiddenRoutes.includes(pathname) || pathname.startsWith('/profile/setup') || pathname.startsWith('/profile/client-setup') || pathname.startsWith('/chat/')) {
    return null;
  }

  const tabs = [
    {
      name: 'Home',
      href: '/home',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Jobs',
      href: '/jobs',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Post',
      href: '/posts/create',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    {
      name: 'Profile',
      href: '/profile/me',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-6 w-full md:max-w-2xl mx-auto pointer-events-none">
      <nav className="pointer-events-auto flex justify-around items-center h-[72px] px-2 bg-white/40 backdrop-blur-md saturate-[1.2] shadow-[0_8px_32px_rgba(93,64,55,0.15)] border border-white/60 rounded-[36px] transition-all hover:bg-white/50">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          
          return (
            <Link 
              key={tab.name} 
              href={tab.href}
              className="relative flex flex-col items-center justify-center h-full w-[72px] transition-all duration-300 active:scale-95 group"
            >
              {isActive && (
                <div className="absolute inset-0 m-auto w-15 h-14 bg-primary/20 backdrop-blur-md rounded-xl -z-10 shadow-sm border border-primary/20" />
              )}
              
              <div className={`transition-transform duration-300 ${isActive ? '-translate-y-0.5 text-primary drop-shadow-md' : 'text-on-surface font-medium group-hover:text-primary group-hover:-translate-y-1 drop-shadow-sm'}`}>
                {tab.icon}
              </div>
              
              <span className={`font-label-sm text-[10px] mt-1 transition-colors duration-300 ${
                isActive 
                  ? 'text-primary font-bold drop-shadow-sm' 
                  : 'text-on-surface font-semibold group-hover:text-primary drop-shadow-sm'
              }`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
