"use client";

import { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { Search, MapPin, Briefcase } from 'lucide-react';
import JobCard from '@/components/ui/JobCard';
import SkeletonCard from '@/components/ui/SkeletonCard';

const CATEGORIES = ["All Jobs", "Construction", "Electrical", "Plumbing", "Warehouse", "Delivery"];

const fetchJobs = async ({ pageParam = 1 }) => {
  // Mock API call
  await new Promise(res => setTimeout(res, 800));
  
  const mockJobs = Array.from({ length: 5 }).map((_, i) => ({
    _id: `job-${pageParam}-${i}`,
    title: `Expert Needed for Project ${pageParam}-${i}`,
    trade: "Construction",
    budget: 150 + i * 10,
    distance: 2500 + i * 100,
    urgency: i % 2 === 0 ? 'medium' : 'emergency',
  }));

  return {
    data: mockJobs,
    nextPage: pageParam < 5 ? pageParam + 1 : undefined,
  };
};

export default function JobsPage() {
  const [activeCategory, setActiveCategory] = useState("All Jobs");
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['jobs', activeCategory],
    queryFn: fetchJobs,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24 bg-background">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md pt-4 pb-3 px-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">
          Job<span className="text-primary">Feed</span>
        </h1>
        
        {/* Categories (Smart Filters) */}
        <div className="flex space-x-2 overflow-x-auto hide-scrollbar pb-1">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat 
                  ? 'bg-primary text-white shadow-md scale-105' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Feed List */}
      <main className="px-4 py-4 space-y-4">
        {status === 'pending' ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : status === 'error' ? (
          <div className="text-center text-error py-10">Error loading jobs!</div>
        ) : (
          <>
            {data.pages.map((group, i) => (
              <div key={i} className="space-y-4">
                {group.data.map((job: any) => (
                  <JobCard key={job._id} {...job} onApply={() => console.log('Applied to', job._id)} />
                ))}
              </div>
            ))}
            
            {/* Infinite Scroll Trigger */}
            <div ref={ref} className="py-4 text-center">
              {isFetchingNextPage ? (
                <div className="flex flex-col gap-4">
                  <SkeletonCard />
                </div>
              ) : hasNextPage ? (
                <span className="text-sm text-gray-400">Loading more jobs...</span>
              ) : (
                <span className="text-sm font-medium text-gray-500">You&apos;ve reached the end!</span>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
