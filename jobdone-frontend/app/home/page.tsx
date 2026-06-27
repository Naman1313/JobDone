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
  authorId: {
    _id: string;
    name: string;
    profilePhoto: string;
    isVerified: boolean;
  };
}

export default function HomeFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
      <header className="bg-white p-4 sticky top-0 z-10 shadow-sm border-b flex justify-between items-center">
        <h1 className="text-2xl font-black text-orange-500 tracking-tight">JobDone</h1>
        <div className="flex space-x-3">
          <button className="p-2 bg-gray-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </header>

      {/* Stories / Trade Filters */}
      <div className="bg-white py-3 px-4 border-b flex space-x-4 overflow-x-auto hide-scrollbar">
        {['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Mechanic'].map(trade => (
          <div key={trade} className="flex flex-col items-center space-y-1 min-w-[60px]">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-400 to-orange-600 p-[2px]">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-xl">🛠️</span>
              </div>
            </div>
            <span className="text-[10px] font-medium text-gray-700">{trade}</span>
          </div>
        ))}
      </div>

      {/* Feed */}
      <main className="space-y-2 mt-2">
        {loading ? (
          <div className="text-center py-10 text-gray-400 animate-pulse">Loading feed...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 bg-white">
            <p className="text-gray-500">No posts yet. Be the first to share your work!</p>
          </div>
        ) : (
          posts.map(post => (
            <article key={post._id} className="bg-white border-y sm:border sm:rounded-xl">
              {/* Header */}
              <div className="flex items-center p-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                  {post.authorId?.profilePhoto ? (
                    <img src={post.authorId.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
                      {post.authorId?.name?.[0] || '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center">
                    {post.authorId?.name}
                    {post.authorId?.isVerified && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()} • {post.trade || 'Worker'}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="px-3 pb-2 text-sm text-gray-800">
                <p>{post.content}</p>
                {post.hashtags && post.hashtags.length > 0 && (
                  <p className="text-orange-500 mt-1">
                    {post.hashtags.map(tag => `#${tag}`).join(' ')}
                  </p>
                )}
              </div>

              {/* Media */}
              {post.mediaUrls && post.mediaUrls.length > 0 && (
                <div className="w-full bg-gray-100 aspect-square">
                  <img src={post.mediaUrls[0]} alt="Post media" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Actions */}
              <div className="p-3 flex items-center justify-between border-t border-gray-50">
                <div className="flex space-x-4">
                  <button onClick={() => handleLike(post._id)} className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm font-medium">{post.likes.length}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-orange-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                </div>
                <button className="text-gray-500 hover:text-orange-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
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