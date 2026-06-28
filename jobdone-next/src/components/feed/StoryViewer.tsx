"use client";

import { useState, useEffect, useRef } from 'react';
import { X, Heart, MessageCircle, Send } from 'lucide-react';
import api from '@/lib/api';

interface StoryViewerProps {
  stories: any[]; // Array of user story groups
  initialUserIndex: number;
  onClose: () => void;
}

export default function StoryViewer({ stories, initialUserIndex, onClose }: StoryViewerProps) {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const STORY_DURATION = 5000; // 5 seconds per image story
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const activeUser = stories[currentUserIndex];
  const activeStory = activeUser?.stories[currentStoryIndex];

  useEffect(() => {
    // Record view in backend
    if (activeStory) {
      api.post(`/api/stories/${activeStory.id}/view`).catch(console.error);
    }
  }, [activeStory]);

  useEffect(() => {
    if (isPaused) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      return;
    }

    if (activeStory?.mediaType === 'VIDEO') {
      // For video, progress is handled by video onTimeUpdate
      return;
    }

    const intervalTime = 50; // Update every 50ms
    const step = (intervalTime / STORY_DURATION) * 100;

    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [currentUserIndex, currentStoryIndex, isPaused, activeStory]);

  const handleNext = () => {
    setProgress(0);
    if (currentStoryIndex < activeUser.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else if (currentUserIndex < stories.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose(); // End of all stories
    }
  };

  const handlePrev = () => {
    setProgress(0);
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(prev => prev - 1);
      setCurrentStoryIndex(stories[currentUserIndex - 1].stories.length - 1);
    }
  };

  const handleReact = async (emoji: string) => {
    if (!activeStory) return;
    try {
      await api.post(`/api/stories/${activeStory.id}/react`, { emoji });
      // Show mini animation here if desired
    } catch (e) {
      console.error(e);
    }
  };

  if (!activeUser || !activeStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between">
      
      {/* Background Media */}
      <div 
        className="absolute inset-0 z-0 flex items-center justify-center bg-black"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
      >
        {activeStory.mediaType === 'VIDEO' ? (
          <video 
            src={activeStory.mediaUrl} 
            autoPlay 
            className="w-full h-full object-cover"
            onEnded={handleNext}
            onTimeUpdate={(e) => {
              const target = e.target as HTMLVideoElement;
              setProgress((target.currentTime / target.duration) * 100);
            }}
          />
        ) : (
          <img src={activeStory.mediaUrl} alt="Story" className="w-full h-full object-cover" />
        )}

        {/* Tap targets for prev/next */}
        <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={(e) => { e.stopPropagation(); handlePrev(); }} />
        <div className="absolute inset-y-0 right-0 w-2/3 z-10" onClick={(e) => { e.stopPropagation(); handleNext(); }} />
      </div>

      {/* Top UI */}
      <div className="relative z-20 pt-4 px-2 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        {/* Progress Bars */}
        <div className="flex gap-1 mb-3">
          {activeUser.stories.map((s: any, idx: number) => (
            <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-75"
                style={{ 
                  width: idx === currentStoryIndex ? `${progress}%` : 
                         idx < currentStoryIndex ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>
        
        {/* User Info */}
        <div className="flex items-center justify-between pointer-events-auto px-2">
          <div className="flex items-center gap-2">
            <img 
              src={activeUser.author.profile?.avatarUrl || "https://randomuser.me/api/portraits/lego/1.jpg"} 
              className="w-8 h-8 rounded-full object-cover border border-white"
            />
            <span className="text-white font-semibold text-sm drop-shadow-md">
              {activeUser.author.profile?.firstName || 'User'}
            </span>
          </div>
          <button onClick={onClose} className="p-2 text-white">
            <X size={24} className="drop-shadow-md" />
          </button>
        </div>
      </div>

      {/* Bottom UI */}
      <div className="relative z-20 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-auto">
        <div className="flex items-center gap-4">
          <div className="flex-1 border border-white/40 rounded-full px-4 py-3 flex items-center bg-black/20 backdrop-blur-sm">
            <input 
              type="text" 
              placeholder="Reply..." 
              className="bg-transparent border-none text-white focus:ring-0 text-sm w-full outline-none placeholder:text-white/70"
            />
          </div>
          <button onClick={() => handleReact('❤️')} className="text-white hover:scale-110 transition-transform">
            <Heart size={28} />
          </button>
          <button onClick={() => handleReact('🔥')} className="text-white hover:scale-110 transition-transform">
            <span className="text-2xl">🔥</span>
          </button>
        </div>
      </div>

    </div>
  );
}
