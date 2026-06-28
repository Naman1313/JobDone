"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Briefcase, MessageCircle, Plus, Share2, BriefcaseBusiness, AlertTriangle, Sparkles, User, Bell } from 'lucide-react';
import { useActionMenu } from '@/providers/ActionMenuProvider';

export default function DesktopSidebar() {
  const pathname = usePathname();
  const { setShareWorkOpen, setPostJobOpen, setEmergencyOpen, setAskAiOpen } = useActionMenu();

  // Hide on auth, splash, onboarding
  if (pathname === '/splash' || pathname === '/onboarding' || pathname === '/auth' || pathname.startsWith('/profile/setup')) {
    return null;
  }

  return (
    <div className="hidden md:flex flex-col w-64 lg:w-72 fixed h-screen bg-background border-r border-gray-100 p-6 pt-8 pb-10 shadow-sm z-40">
      
      {/* Brand */}
      <div className="mb-10 px-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Job<span className="text-primary">Done</span>
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        <NavItem href="/home" icon={<Home size={24} />} label="Home" isActive={pathname === '/home'} />
        <NavItem href="/discover" icon={<Compass size={24} />} label="Discover" isActive={pathname === '/discover'} />
        <NavItem href="/jobs" icon={<Briefcase size={24} />} label="Jobs" isActive={pathname === '/jobs'} />
        <NavItem href="/chat" icon={<MessageCircle size={24} />} label="Messaging" isActive={pathname === '/chat'} />
        <NavItem href="/notifications" icon={<Bell size={24} />} label="Notifications" isActive={pathname === '/notifications'} />
        <NavItem href="/profile" icon={<User size={24} />} label="Profile" isActive={pathname === '/profile' || pathname === '/profile/edit'} />
      </nav>

      {/* Quick Actions (Desktop version of FAB) */}
      <div className="mt-8 pt-8 border-t border-gray-100 space-y-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-4">Quick Actions</p>
        <button 
          onClick={() => setShareWorkOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-primary text-white font-bold rounded-xl shadow-premium hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Share2 size={20} />
          <span>Share Work</span>
        </button>

        <button 
          onClick={() => setPostJobOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-md hover:bg-gray-800 transition-all"
        >
          <BriefcaseBusiness size={20} />
          <span>Post a Job</span>
        </button>

        <button 
          onClick={() => setEmergencyOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-error/10 text-error font-bold rounded-xl hover:bg-error/20 transition-all"
        >
          <AlertTriangle size={20} />
          <span>Emergency Support</span>
        </button>

        <button 
          onClick={() => setAskAiOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-info/10 text-info font-bold rounded-xl hover:bg-info/20 transition-all"
        >
          <Sparkles size={20} />
          <span>Ask AI Assistant</span>
        </button>
      </div>
      
    </div>
  );
}

function NavItem({ href, icon, label, isActive }: { href: string, icon: React.ReactNode, label: string, isActive: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
        isActive 
          ? 'bg-gray-100/80 text-gray-900 font-bold' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
      }`}
    >
      <div className={`transition-transform duration-200 ${isActive ? 'scale-110 text-primary' : 'group-hover:scale-110 group-hover:text-gray-800'}`}>
        {icon}
      </div>
      <span className="text-lg tracking-wide">{label}</span>
    </Link>
  );
}
