"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  User, 
  Settings, 
  LogOut, 
  Bookmark, 
  Bell, 
  MessageSquare, 
  Users, 
  ChevronRight,
  Shield
} from 'lucide-react';
import CompletionTracker from '@/components/profile/CompletionTracker';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      api.get('/api/users/me')
        .then(res => {
          if (res.data?.success) {
            setProfile(res.data.data.profile);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const avatarUrl = profile?.avatarUrl || `https://ui-avatars.com/api/?name=${profile?.firstName || 'User'}&background=FF5722&color=fff`;

  const menuItems = [
    { icon: <User size={22} className="text-gray-600" />, label: "Edit Profile", onClick: () => router.push('/profile/edit') },
    { icon: <Users size={22} className="text-gray-600" />, label: "My Network", onClick: () => router.push('/network') },
    { icon: <MessageSquare size={22} className="text-gray-600" />, label: "Messages", onClick: () => router.push('/chat') },
    { icon: <Bookmark size={22} className="text-gray-600" />, label: "Portfolio & Projects", onClick: () => router.push('/profile/projects') },
    { icon: <Bell size={22} className="text-gray-600" />, label: "Notifications", onClick: () => {} },
    { icon: <Bookmark size={22} className="text-gray-600" />, label: "Saved Library", onClick: () => router.push('/saved') },
    { icon: <Shield size={22} className="text-gray-600" />, label: "Privacy & Security", onClick: () => {} },
    { icon: <Settings size={22} className="text-gray-600" />, label: "Settings", onClick: () => {} },
  ];

  return (
    <div className="w-full min-h-screen pb-24 bg-gray-50">
      
      {/* Header Profile Card */}
      <div className="bg-white px-4 pt-10 pb-8 rounded-b-[2.5rem] shadow-sm mb-6 flex flex-col items-center">
        <div className="relative w-28 h-28 mb-4">
          <div className="w-full h-full rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100">
            {loading ? (
              <div className="w-full h-full bg-gray-200 animate-pulse" />
            ) : (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            )}
          </div>
          {!loading && profile?.isVerified && (
            <div className="absolute bottom-1 right-1 bg-blue-500 rounded-full p-1 border-2 border-white shadow-sm">
              <Shield size={14} className="text-white" />
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
          {loading ? (
            <div className="w-32 h-6 bg-gray-200 animate-pulse rounded mx-auto" />
          ) : (
            profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : 'My Account'
          )}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {loading ? (
            <div className="w-24 h-4 bg-gray-200 animate-pulse rounded mx-auto" />
          ) : (
            user?.phone || 'Loading...'
          )}
        </p>

        {/* Dashboard Quick Access */}
        <div 
          onClick={() => router.push('/profile/dashboard')}
          className="w-full bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-primary/10 transition-colors active:scale-[0.98]"
        >
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Professional Dashboard</h3>
            <p className="text-xs text-gray-500">12 profile views this week</p>
          </div>
          <ChevronRight size={20} className="text-primary" />
        </div>
      </div>

      {/* Completion Tracker */}
      <div className="px-4">
        <CompletionTracker />
      </div>

      {/* Menu List */}
      <div className="px-4 space-y-2">
        {menuItems.map((item, index) => (
          <div 
            key={index}
            onClick={item.onClick}
            className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                {item.icon}
              </div>
              <span className="font-semibold text-gray-800">{item.label}</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        ))}

        {/* Logout Button */}
        <div className="pt-6 pb-4">
          <button 
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 font-bold rounded-2xl border border-red-100 hover:bg-red-100 transition-colors active:scale-[0.98]"
          >
            <LogOut size={20} />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
