"use client";

import { useState, useEffect } from 'react';
import { Search, Mic, MapPin, Sparkles, Plus } from 'lucide-react';
import FeedCard from '@/components/ui/FeedCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import StoryUploader from '@/components/feed/StoryUploader';
import StoryViewer from '@/components/feed/StoryViewer';
import SearchOverlay from '@/components/feed/SearchOverlay';
import api from '@/lib/api';
import { useActionMenu } from '@/providers/ActionMenuProvider';

// Mock Fallback Data to ensure the beautiful UI always renders
const MOCK_POSTS = [
  {
    _id: "p1",
    content: "Just finished completely rewiring a beautiful 3-bedroom smart home in Downtown. Integrating the new automated lighting system was a fantastic challenge! 💡🏠",
    mediaUrls: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop"],
    trade: "Master Electrician",
    likes: ["user1", "user2", "user3", "user4"],
    createdAt: new Date().toISOString(),
    location: "Downtown District",
    authorId: {
      _id: "u1",
      name: "Michael Chen",
      profilePhoto: "https://randomuser.me/api/portraits/men/32.jpg",
      isVerified: true,
    }
  },
  {
    _id: "p2",
    content: "Emergency call out to fix a massive pipe burst in a commercial kitchen. Had it patched and fully replaced in under 2 hours. Love the rush! 🔧💧",
    mediaUrls: ["https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2070&auto=format&fit=crop"],
    trade: "Commercial Plumber",
    likes: ["user5"],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    location: "Westside Business Park",
    authorId: {
      _id: "u2",
      name: "Sarah Jenkins",
      profilePhoto: "https://randomuser.me/api/portraits/women/44.jpg",
      isVerified: true,
    }
  }
];

const FILTERS = ["All", "Following", "Nearby", "By Trade", "Trending", "AI Picks"];

export default function HomeFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  // Stories State
  const [stories, setStories] = useState<any[]>([]);
  const [showUploader, setShowUploader] = useState(false);
  const [viewerState, setViewerState] = useState<{ isOpen: boolean; initialIndex: number }>({ isOpen: false, initialIndex: 0 });

  // Search State
  const [showSearch, setShowSearch] = useState(false);
  const [initialSearchQuery, setInitialSearchQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const { setAskAiOpen } = useActionMenu();

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice search is not supported in this browser.");
      return;
    }
    
    setIsRecording(true);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInitialSearchQuery(transcript);
      setShowSearch(true);
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const postsRes = await api.get('/api/posts/feed').catch(() => null);
        if (postsRes?.data?.success && postsRes.data.data.length > 0) {
          setPosts(postsRes.data.data);
        } else {
          setPosts(MOCK_POSTS);
        }

        const storiesRes = await api.get('/api/stories').catch(() => null);
        if (storiesRes?.data?.success) {
          setStories(storiesRes.data.data);
        }
      } catch (err) {
        console.warn("Failed to fetch from backend, using mock data.");
        setPosts(MOCK_POSTS);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchData();
  }, [activeFilter]);

  const handleLike = (postId: string) => {
    setPosts(posts.map(p => {
      if (p._id === postId) {
        const isLiked = p.likes.includes("me");
        return {
          ...p,
          likes: isLiked ? p.likes.filter((id: string) => id !== "me") : [...p.likes, "me"]
        };
      }
      return p;
    }));
  };

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24 bg-background relative">
      
      {/* 1. App Bar & Search */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl pt-4 pb-2 px-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Job<span className="text-primary">Done</span>
          </h1>
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:opacity-80">
            <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="Me" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="bg-gray-100 rounded-2xl p-1 flex items-center shadow-inner cursor-text" onClick={() => setShowSearch(true)}>
          <div className="flex-1 flex items-center px-3 gap-2">
            <Search size={18} className="text-gray-400" />
            <div className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 text-gray-400 pointer-events-none">
              Find professionals...
            </div>
          </div>
          <div className="flex items-center gap-1 pr-1">
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
              <MapPin size={18} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); startVoiceSearch(); }} 
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isRecording ? 'text-red-500 bg-red-100 animate-pulse' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Mic size={18} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setAskAiOpen(true); }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-info bg-info/10 hover:bg-info/20 transition-colors"
            >
              <Sparkles size={16} />
            </button>
          </div>
        </div>
      </header>

      {showSearch && (
        <SearchOverlay 
          onClose={() => { setShowSearch(false); setInitialSearchQuery(""); }} 
          initialQuery={initialSearchQuery} 
        />
      )}

      {/* 2. Stories */}
      <div className="py-4 pl-4 border-b border-gray-50 flex space-x-4 overflow-x-auto hide-scrollbar">
        {/* Add Story */}
        <div 
          onClick={() => setShowUploader(true)}
          className="flex flex-col items-center space-y-1 min-w-[72px] flex-shrink-0 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 relative hover:bg-gray-100 transition-colors">
            <Plus size={24} />
          </div>
          <span className="text-xs font-medium text-gray-500">Add Story</span>
        </div>
        
        {/* Real Stories */}
        {stories.map((userStoryGroup, index) => (
          <div 
            key={userStoryGroup.author.id} 
            onClick={() => setViewerState({ isOpen: true, initialIndex: index })}
            className="flex flex-col items-center space-y-1 min-w-[72px] flex-shrink-0 cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-orange-400 p-[2px] group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center border-2 border-white overflow-hidden">
                <img 
                  src={userStoryGroup.author.profile?.avatarUrl || `https://randomuser.me/api/portraits/women/${index + 10}.jpg`} 
                  alt="Story" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
            <span className="text-xs font-medium text-gray-800 truncate w-full text-center">
              {userStoryGroup.author.profile?.firstName || 'User'}
            </span>
          </div>
        ))}
      </div>

      {showUploader && (
        <StoryUploader 
          onClose={() => setShowUploader(false)} 
          onSuccess={(newStory) => {
            setShowUploader(false);
            // Re-fetch stories or update state optimistically
            api.get('/api/stories').then(res => {
              if (res.data?.success) setStories(res.data.data);
            });
          }} 
        />
      )}

      {viewerState.isOpen && (
        <StoryViewer 
          stories={stories}
          initialUserIndex={viewerState.initialIndex}
          onClose={() => setViewerState({ isOpen: false, initialIndex: 0 })}
        />
      )}

      {/* 3. Smart Filters */}
      <div className="py-3 px-4 flex space-x-2 overflow-x-auto hide-scrollbar sticky top-[120px] z-20 bg-background/95 backdrop-blur-sm">
        {FILTERS.map(filter => (
          <button 
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
              activeFilter === filter 
                ? 'bg-gray-900 text-white shadow-md scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* 4. Feed */}
      <main className="px-4 py-2 mt-2">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <Search size={48} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No posts found</h3>
            <p className="text-sm text-gray-500 mb-6">There are no professional updates in this category yet.</p>
            <button className="px-6 py-3 bg-primary text-white font-bold rounded-full shadow-premium hover:bg-primary-hover active:scale-95 transition-all">
              Discover Professionals
            </button>
          </div>
        ) : (
          posts.map(post => (
            <FeedCard key={post._id} post={post} onLike={handleLike} />
          ))
        )}
      </main>

    </div>
  );
}
