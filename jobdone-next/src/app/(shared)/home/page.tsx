"use client";

import { useState, useEffect } from 'react';
import { Search, Mic, MapPin, Sparkles, Plus, Loader2 } from 'lucide-react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import FeedCard from '@/components/ui/FeedCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import StoryUploader from '@/components/feed/StoryUploader';
import StoryViewer from '@/components/feed/StoryViewer';
import SearchOverlay from '@/components/feed/SearchOverlay';
import EmergencyFeed from '@/components/feed/EmergencyFeed';
import api from '@/lib/api';
import { useActionMenu } from '@/providers/ActionMenuProvider';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

const FILTERS = ["All", "Following", "Nearby", "Trending", "AI Picks"];
export default function HomeFeed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabQuery = searchParams.get('tab') || 'All';
  const [activeFilter, setActiveFilter] = useState(activeTabQuery);

  // Sync state with URL when it changes
  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveFilter(searchParams.get('tab') as string);
    }
  }, [searchParams]);

  // Live Location for Nearby
  const [liveCoords, setLiveCoords] = useState<{lat: number | null, lon: number | null}>({ lat: null, lon: null });
  const [liveLocationName, setLiveLocationName] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (activeFilter === 'Nearby' && liveCoords.lat === null && !locationError) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            setLiveCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
              const data = await res.json();
              const locName = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.state || "Your Location";
              setLiveLocationName(locName);
            } catch(e) {
              console.error(e);
            }
          },
          (err) => setLocationError("Please allow location access to see accurate distances.")
        );
      } else {
        setLocationError("Geolocation is not supported by this browser.");
      }
    }
  }, [activeFilter, liveCoords.lat, locationError]);

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    router.push(`/home?tab=${filter}`, { scroll: false });
  };

  const queryClient = useQueryClient();
  const { ref: loadMoreRef, inView } = useInView();

  // Stories State
  const [stories, setStories] = useState<any[]>([]);
  const [showUploader, setShowUploader] = useState(false);
  const [viewerState, setViewerState] = useState<{ isOpen: boolean; initialIndex: number }>({ isOpen: false, initialIndex: 0 });

  // Search State
  const [showSearch, setShowSearch] = useState(false);
  const [initialSearchQuery, setInitialSearchQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [userLocation, setUserLocation] = useState<string>("");
  const [isLocating, setIsLocating] = useState(false);

  const { setAskAiOpen } = useActionMenu();

  const findUserLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('geolocation' in navigator)) {
      alert("Location is not supported in this browser.");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const locationName = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.state || "your area";
          setUserLocation(locationName);
        } catch (error) {
          console.error("Geocoding failed", error);
          alert("Could not fetch location name.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          alert("Please allow location access to use this feature.");
        } else {
          alert("Failed to get location.");
        }
      },
      { timeout: 10000 }
    );
  };

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
      // Avoid console.error to prevent Next.js dev overlay from popping up on expected errors (like Brave blocking it)
      if (event.error !== 'no-speech') {
        alert(`Voice search error: ${event.error}. Please check your microphone permissions.`);
      }
      setIsRecording(false);
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['posts', activeFilter, liveCoords.lat, liveCoords.lon],
    queryFn: async ({ pageParam = '' }) => {
      let url = `/api/posts/feed?filter=${activeFilter}`;
      if (pageParam) url += `&cursor=${pageParam}`;
      if (liveCoords.lat !== null && liveCoords.lon !== null) {
        url += `&lat=${liveCoords.lat}&lon=${liveCoords.lon}`;
      }
      const res = await api.get(url);
      if (!res.data?.success) throw new Error("Failed to fetch");
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    initialPageParam: '',
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Fetch stories independently
  useEffect(() => {
    api.get('/api/stories').then(res => {
      if (res.data?.success) setStories(res.data.data);
    }).catch(console.error);
  }, []);

  const posts = data?.pages.flatMap((page) => page.data) || [];
  const loading = status === 'pending';
  const displayPosts = posts;

  const getEmptyStateMessage = () => {
    switch(activeFilter) {
      case 'Following': return "You aren't following anyone yet or they haven't posted.";
      case 'Nearby': return "No professionals have posted near you recently.";
      case 'By Trade': return "No posts found for your trade.";
      case 'Trending': return "Nothing trending at this moment.";
      case 'AI Picks': return "Our AI is gathering data to recommend the best posts for you.";
      default: return "No posts found in this category yet.";
    }
  };

  const handleLike = async (postId: string) => {
    // Optimistic UI update via react-query cache
    queryClient.setQueryData(['posts', activeFilter], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          data: page.data.map((post: any) => {
            if (post._id === postId) {
              const isLiked = post.likes.includes("me");
              return {
                ...post,
                likes: isLiked ? post.likes.filter((id: string) => id !== "me") : [...post.likes, "me"]
              };
            }
            return post;
          })
        }))
      };
    });

    try {
      await api.post(`/api/posts/${postId}/like`);
    } catch (e) {
      console.error("Failed to toggle like", e);
      // In a real app we'd revert the optimistic update here
    }
  };

  return (
    <div className="w-full min-h-screen pb-24 md:pb-0 bg-background relative">
      
      {/* 1. App Bar & Search */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl pt-4 pb-2 px-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Job<span className="text-primary">Done</span>
          </h1>
        </div>

        <div className="bg-gray-100 rounded-2xl p-1 flex items-center shadow-inner cursor-text" onClick={() => setShowSearch(true)}>
          <div className="flex-1 flex items-center px-3 gap-2">
            <Search size={18} className="text-gray-400" />
            <div className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 text-gray-400 pointer-events-none truncate">
              {userLocation ? `Find professionals in ${userLocation}...` : "Find professionals..."}
            </div>
          </div>
          <div className="flex items-center gap-1 pr-1">
            <button 
              onClick={findUserLocation}
              disabled={isLocating}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isLocating ? 'text-primary' : userLocation ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {isLocating ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={18} />}
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
            onClick={() => handleFilterClick(filter)}
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
        <EmergencyFeed />
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : displayPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                <Search size={48} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No posts found</h3>
              <p className="text-sm text-gray-500 mb-6">{getEmptyStateMessage()}</p>
              <button 
                onClick={() => handleFilterClick("All")}
                className="px-6 py-3 bg-primary text-white font-bold rounded-full shadow-premium hover:bg-primary-hover active:scale-95 transition-all"
              >
                View All Posts
              </button>
            </div>
        ) : (
          <>
            {locationError && activeFilter === 'Nearby' && (
              <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-2xl mb-4 text-sm font-medium flex items-center justify-between shadow-sm">
                <span>{locationError}</span>
                <button onClick={() => setLocationError(null)} className="text-orange-800 opacity-70 hover:opacity-100">✕</button>
              </div>
            )}
            {displayPosts.map(post => (
              <FeedCard key={post._id} post={post} onLike={handleLike} activeTab={activeFilter} userLiveLocationName={liveLocationName} />
            ))}
            
            {/* Infinite Scroll Trigger */}
            <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
              {isFetchingNextPage ? (
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              ) : hasNextPage ? (
                <span className="text-sm text-gray-400">Scroll for more</span>
              ) : (
                <span className="text-sm text-gray-400">You're all caught up!</span>
              )}
            </div>
          </>
        )}
      </main>

    </div>
  );
}
