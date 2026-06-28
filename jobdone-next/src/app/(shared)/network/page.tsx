"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { ArrowLeft, Users, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NetworkPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('connections'); // connections, suggestions

  useEffect(() => {
    api.get('/api/network')
      .then(res => {
        if (res.data?.success) setData(res.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleFollow = async (targetUserId: string) => {
    try {
      await api.post(`/api/users/${targetUserId}/follow`);
      // Optimistic update
      setData((prev: any) => ({
        ...prev,
        suggestions: prev.suggestions.filter((u: any) => u.id !== targetUserId),
        followingCount: prev.followingCount + 1
      }));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white px-4 py-4 sticky top-0 z-30 shadow-sm flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">My Network</h1>
      </header>

      {/* Tabs */}
      <div className="flex px-4 bg-white border-b border-gray-100">
        <button 
          onClick={() => setTab('connections')}
          className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${tab === 'connections' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
        >
          Connections
        </button>
        <button 
          onClick={() => setTab('suggestions')}
          className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${tab === 'suggestions' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
        >
          Suggestions
        </button>
      </div>

      <main className="p-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {tab === 'connections' && (
              <motion.div 
                key="connections"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {data?.mutuals?.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">No connections yet.</div>
                ) : (
                  data?.mutuals?.map((u: any) => (
                    <UserCard key={u.id} user={u} type="connection" />
                  ))
                )}
                
                <h3 className="font-bold text-gray-800 mt-6 mb-3">Following ({data?.followingCount})</h3>
                {data?.following?.map((u: any) => (
                  <UserCard key={u.id} user={u} type="following" />
                ))}
              </motion.div>
            )}

            {tab === 'suggestions' && (
              <motion.div 
                key="suggestions"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-2 gap-3"
              >
                {data?.suggestions?.length === 0 ? (
                  <div className="col-span-2 text-center py-10 text-gray-500">No suggestions right now.</div>
                ) : (
                  data?.suggestions?.map((u: any) => (
                    <SuggestionCard key={u.id} user={u} onFollow={() => handleFollow(u.id)} />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}

function UserCard({ user, type }: { user: any, type: string }) {
  const profile = user.profile || {};
  const avatar = profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.firstName || 'User'}&background=FF5722&color=fff`;

  return (
    <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <img src={avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
        <div>
          <h4 className="font-bold text-gray-900 text-sm">{profile.firstName} {profile.lastName}</h4>
          <p className="text-xs text-gray-500 line-clamp-1">{profile.bio || 'Member'}</p>
        </div>
      </div>
      <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200">
        <UserCheck size={16} className="text-gray-600" />
      </button>
    </div>
  );
}

function SuggestionCard({ user, onFollow }: { user: any, onFollow: () => void }) {
  const profile = user.profile || {};
  const avatar = profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.firstName || 'User'}&background=FF5722&color=fff`;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
      <img src={avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover mb-2" />
      <h4 className="font-bold text-gray-900 text-sm line-clamp-1 w-full">{profile.firstName} {profile.lastName}</h4>
      <p className="text-xs text-gray-500 line-clamp-1 mb-4 w-full">{profile.bio || 'Member'}</p>
      <button 
        onClick={onFollow}
        className="w-full py-2 bg-primary/10 text-primary font-bold text-sm rounded-full flex items-center justify-center gap-1 hover:bg-primary/20 transition-colors"
      >
        <UserPlus size={16} /> Follow
      </button>
    </div>
  );
}
