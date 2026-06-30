"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Post {
  _id: string;
  content: string;
  mediaUrls: string[];
  trade: string;
  hashtags: string[];
  likes: string[];
  createdAt: string;
  isJobPost?: boolean;
  jobId?: {
    _id: string;
    title: string;
    budget: number;
    urgency: string;
    location: {
      address: string;
    };
  };
  authorId: {
    _id: string;
    name: string;
    profilePhoto: string;
    isVerified: boolean;
    role?: string;
  };
}

const TRADES = ['All', 'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Mechanic'];

import Avatar from '@/components/ui/Avatar';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/context/AuthContext';

export default function HomeFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTrade, setActiveTrade] = useState('All');
  const { startChat } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/posts/feed', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setPosts(data.data);
        }
      } catch (err) {
        console.error("Error fetching feed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const handleLike = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Optimistic update
      setPosts(posts.map(p => {
        if (p._id === postId) {
          const userId = "placeholder_user_id"; // Ideally from auth context
          const isLiked = p.likes.includes(userId);
          return {
            ...p,
            likes: isLiked ? p.likes.filter(id => id !== userId) : [...p.likes, userId]
          };
        }
        return p;
      }));
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: "I saw this on the social feed and am interested!" })
      });
      const data = await res.json();
      if(data.success) {
        alert("Successfully applied!");
      } else {
        alert("Failed: " + data.message);
      }
    } catch (err) {
      alert("Error applying to job");
    }
  };

  const filteredPosts = activeTrade === 'All' ? posts : posts.filter(p => p.trade === activeTrade);

  return (
    <div className="w-full mx-auto min-h-screen bg-surface-warm pb-6 font-sans selection:bg-primary selection:text-white">
      
      {/* Top Header */}
      <header className="w-full h-16 sticky top-0 z-40 bg-white/40 backdrop-blur-2xl saturate-150 flex justify-center items-center border-b border-white/60 shadow-[0_4px_30px_rgba(93,64,55,0.05)] transition-all">
        <div className="w-full max-w-7xl px-4 md:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary tracking-tight drop-shadow-sm">JobDone<span className="text-status-gold">.</span></h1>
            <div className="flex space-x-3">
              <button className="text-on-surface hover:text-primary hover:bg-white/50 p-2.5 rounded-full transition-all active:scale-95 shadow-sm border border-transparent hover:border-white/60">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
              </button>
              <Link href="/chat" className="text-on-surface hover:text-primary hover:bg-white/50 p-2.5 rounded-full transition-all active:scale-95 shadow-sm border border-transparent hover:border-white/60 relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-white"></span>
              </Link>
            </div>
        </div>
      </header>

      {/* Stories / Trade Filters */}
      <div className="w-full max-w-7xl mx-auto flex gap-3 overflow-x-auto no-scrollbar py-4 px-4 md:px-8 mb-2">
        {TRADES.map(trade => (
          <button 
            key={trade} 
            onClick={() => setActiveTrade(trade)}
            className={`font-label-md px-5 py-2.5 rounded-full shrink-0 whitespace-nowrap transition-all border ${
                activeTrade === trade 
                    ? 'bg-primary text-on-primary border-primary shadow-[0px_4px_12px_rgba(93,64,55,0.2)]'
                    : 'bg-surface-container-lowest text-on-surface-variant border-border-subtle hover:border-primary/30 hover:bg-surface-variant/20'
            }`}
          >
            {trade}
          </button>
        ))}
      </div>

      {/* Feed */}
      <main className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full px-4 md:px-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="text-on-surface-variant font-body-md animate-pulse">Loading feed...</div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-surface-container-lowest rounded-3xl border border-border-subtle/30 shadow-sm">
            <p className="font-body-lg text-on-surface-variant">No posts found.</p>
            <p className="font-body-sm text-on-surface-variant/70 mt-1">Be the first to share your work in this category!</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <article key={post._id} className="bg-surface-container-lowest rounded-[24px] p-5 shadow-[0px_8px_24px_rgba(0,0,0,0.03)] border border-border-subtle/20 flex flex-col gap-4 relative overflow-hidden transition-all hover:shadow-[0px_12px_32px_rgba(0,0,0,0.05)] h-fit">
              
              {/* Header */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar 
                      name={post.authorId?.name || 'User'} 
                      photoUrl={post.authorId?.profilePhoto} 
                      isVerified={post.authorId?.isVerified} 
                      size="md" 
                      className="shrink-0"
                  />
                  <div className="flex-grow">
                    <h3 className="font-label-lg font-bold text-on-surface flex items-center gap-2">
                      {post.authorId?.name}
                      {post.authorId?.role && (
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${post.authorId.role === 'client' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                          {post.authorId.role}
                        </span>
                      )}
                    </h3>
                    <p className="font-body-sm text-on-surface-variant mt-0.5">
                      {post.trade || 'Worker'} • {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Message Button */}
                {post.authorId._id !== user?._id && (
                  <button 
                    onClick={() => startChat(post.authorId._id)} 
                    className="p-2.5 bg-surface-variant/30 text-on-surface hover:text-primary hover:bg-primary/10 rounded-full transition-all active:scale-95 group shadow-sm border border-border-subtle/50 hover:border-primary/20 flex-shrink-0"
                    title="Message User"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="font-body-md text-on-surface leading-relaxed">
                <p>{post.content}</p>
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {post.hashtags.map(tag => (
                        <span key={tag} className="text-primary font-medium">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Job Details Card (If it's a job post) */}
              {post.isJobPost && post.jobId && (
                <div className="mt-3 p-4 bg-surface-variant/20 border border-border-subtle/40 rounded-[20px] flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant/70 mb-0.5">Budget</span>
                      <span className="text-xl font-bold text-primary">₹{post.jobId.budget}</span>
                    </div>
                    {post.jobId.urgency === 'emergency' && (
                      <span className="bg-error/10 text-error font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border border-error/20">
                        URGENT
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant font-medium">
                    <span className="text-primary">📍</span>
                    <span className="line-clamp-1">{post.jobId.location?.address || 'Location unknown'}</span>
                  </div>
                  {user?.role === 'worker' && (
                    <button 
                      onClick={() => handleApply(post.jobId!._id)}
                      className="w-full mt-1 bg-primary text-on-primary py-3 rounded-xl font-bold shadow-sm hover:bg-primary-container hover:shadow-md transition-all active:scale-95 border border-white/10"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              )}

              {/* Media */}
              {!post.isJobPost && post.mediaUrls && post.mediaUrls.length > 0 && (
                <div className="w-full h-48 sm:h-56 rounded-2xl overflow-hidden bg-surface-variant relative group mt-2">
                  <img 
                    src={post.mediaUrls[0]} 
                    alt="Post media" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-border-subtle/50 mt-auto">
                <div className="flex gap-6 pl-1">
                  <button onClick={() => handleLike(post._id)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors active:scale-90">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-all ${post.likes.includes("placeholder_user_id") ? "text-error fill-error" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={post.likes.includes("placeholder_user_id") ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="font-label-md font-medium">{post.likes.length}</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-primary transition-colors active:scale-95 group">
                  <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span className="font-bold text-[13px]">Comment</span>
                </button>
                </div>
                <button className="text-on-surface-variant hover:text-primary p-2 hover:bg-surface-variant/30 rounded-full transition-colors active:scale-90">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </article>
          ))
        )}
      </main>
    </div>
  );
}