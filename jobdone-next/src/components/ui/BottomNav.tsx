"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, Compass, Briefcase, MessageCircle, Plus, Share2, BriefcaseBusiness, AlertTriangle, Sparkles, Upload } from 'lucide-react';
import { useActionMenu } from '@/providers/ActionMenuProvider';

export default function BottomNav() {
  const pathname = usePathname();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const { setShareWorkOpen, setPostJobOpen, setEmergencyOpen, setAskAiOpen } = useActionMenu();

  // Hide on auth, splash, onboarding
  if (pathname === '/splash' || pathname === '/onboarding' || pathname === '/auth' || pathname.startsWith('/profile/setup')) {
    return null;
  }

  const toggleFab = () => setIsFabOpen(!isFabOpen);

  const handleAction = (actionFn: (isOpen: boolean) => void) => {
    setIsFabOpen(false); // close FAB
    actionFn(true); // open target modal
  };

  return (
    <>
      {/* FAB Backdrop */}
      {isFabOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsFabOpen(false)}
        />
      )}

      {/* FAB Menu */}
      <div className={`fixed bottom-24 left-0 right-0 flex justify-center z-50 transition-all duration-300 ease-out ${isFabOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-white rounded-3xl shadow-premium-hover p-4 flex gap-4 items-center">
          <FabAction icon={<Share2 size={20} />} label="Share Work" onClick={() => handleAction(setShareWorkOpen)} />
          <FabAction icon={<BriefcaseBusiness size={20} />} label="Post Job" onClick={() => handleAction(setPostJobOpen)} />
          <FabAction icon={<AlertTriangle size={20} className="text-error" />} label="Emergency" onClick={() => handleAction(setEmergencyOpen)} />
          <FabAction icon={<Sparkles size={20} className="text-info" />} label="Ask AI" onClick={() => handleAction(setAskAiOpen)} />
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 w-full max-w-md mx-auto bg-white/80 backdrop-blur-md border-t border-gray-100 z-50 pb-safe">
        <div className="flex justify-around items-center h-16 px-2 relative">
          <NavItem href="/home" icon={<Home size={24} />} label="Home" isActive={pathname === '/home'} />
          <NavItem href="/discover" icon={<Compass size={24} />} label="Discover" isActive={pathname === '/discover'} />
          
          {/* Center FAB Trigger */}
          <div className="flex flex-col items-center justify-center -mt-8 relative z-10">
            <button 
              onClick={toggleFab}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-premium transition-transform duration-300 ${isFabOpen ? 'bg-gray-900 rotate-45' : 'bg-primary hover:bg-primary-hover hover:scale-105 active:scale-95'}`}
            >
              <Plus size={28} />
            </button>
          </div>

          <NavItem href="/jobs" icon={<Briefcase size={24} />} label="Jobs" isActive={pathname === '/jobs'} />
          <NavItem href="/chat" icon={<MessageCircle size={24} />} label="Chat" isActive={pathname === '/chat'} />
        </div>
      </div>
    </>
  );
}

function NavItem({ href, icon, label, isActive }: { href: string, icon: React.ReactNode, label: string, isActive: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors ${
        isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}>
        {label}
      </span>
    </Link>
  );
}

function FabAction({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group">
      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 group-hover:bg-gray-100 group-hover:scale-105 transition-all">
        {icon}
      </div>
      <span className="text-[10px] font-medium text-gray-600">{label}</span>
    </button>
  );
}
