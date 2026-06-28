import { useState, useEffect } from 'react';
import { CheckCircle, Heart, MessageSquare, Share, Bookmark, MapPin, Send, Loader2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface FeedCardProps {
  post: {
    _id: string;
    content: string;
    mediaUrls: string[];
    trade: string;
    likes: string[];
    createdAt: string;
    location?: string;
    distanceKm?: number;
    authorId: {
      _id: string;
      name: string;
      profilePhoto: string;
      isVerified: boolean;
      isFollowing?: boolean;
    };
  };
  onLike: (id: string) => void;
  activeTab?: string;
  userLiveLocationName?: string | null;
}

export default function FeedCard({ post, onLike, activeTab, userLiveLocationName }: FeedCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isFollowing, setIsFollowing] = useState(post.authorId?.isFollowing || false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsFollowing(post.authorId?.isFollowing || false);
  }, [post.authorId?.isFollowing]);

  const handleFollow = async () => {
    setIsFollowLoading(true);
    // Optimistic UI update
    setIsFollowing(!isFollowing);
    
    try {
      await api.post(`/api/users/${post.authorId._id}/follow`);
      // Invalidate ALL post queries so the follow state is updated globally across all tabs
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (e) {
      console.error("Failed to toggle follow", e);
      setIsFollowing(!isFollowing); // Revert on failure
    } finally {
      setIsFollowLoading(false);
    }
  };

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setIsLoadingComments(true);
      try {
        const res = await api.get(`/api/posts/${post._id}/comment`);
        if (res.data.success) {
          setComments(res.data.data);
        }
      } catch (e) {
        console.error("Failed to load comments", e);
      } finally {
        setIsLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    
    setIsPostingComment(true);
    try {
      const res = await api.post(`/api/posts/${post._id}/comment`, { content: commentInput });
      if (res.data.success) {
        setComments([res.data.data, ...comments]);
        setCommentInput("");
      }
    } catch (e) {
      console.error("Failed to post comment", e);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${post.authorId?.name}`,
          text: post.content,
          url: window.location.href, // or specific post URL
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (e) {
      console.error("Error sharing", e);
    }
  };

  const handleMessage = () => {
    // Navigate to chat (can pass user ID via query params in real app)
    router.push('/chat');
  };

  const handleBookmark = async () => {
    setIsBookmarked(!isBookmarked);
    try {
      await api.post(`/api/posts/${post._id}/save`);
    } catch (e) {
      // Revert if API fails or doesn't exist yet
      console.error("Failed to save post", e);
    }
  };

  return (
    <article className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden mb-6 transition-shadow hover:shadow-premium-hover">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-50 flex-shrink-0">
            {post.authorId?.profilePhoto ? (
              <img src={post.authorId.profilePhoto} alt={post.authorId.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-lg">
                {post.authorId?.name?.[0] || '?'}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-1">
                {post.authorId?.name}
                {post.authorId?.isVerified && (
                  <CheckCircle size={16} className="text-info fill-info/20" />
                )}
              </h3>
              {post.authorId?._id !== 'me' && (
                <button 
                  onClick={handleFollow}
                  disabled={isFollowLoading}
                  className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${
                    isFollowing 
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {isFollowing ? 'Following' : '+ Follow'}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 font-medium tracking-wide">
              {post.trade || 'Professional'} • {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3 text-sm text-gray-800 leading-relaxed">
        <p>{post.content}</p>
        
        {post.location && post.location !== "Unknown" && activeTab !== 'Nearby' && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-2 font-medium">
            <MapPin size={14} className="text-gray-400" />
            {post.location}
          </div>
        )}

        {/* Map and Location below it for Nearby Tab */}
        {activeTab === 'Nearby' && post.location && post.location !== "Unknown" && (
          <div className="mt-4 border-t border-gray-100 pt-3">
            {userLiveLocationName && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                <span className="text-lg">📍</span>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-400">Your Live Location</span>
                  <span className="font-bold text-gray-800">{userLiveLocationName}</span>
                </div>
              </div>
            )}
            <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm relative group w-full h-48 bg-gray-50 mb-2">
              <iframe 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                loading="lazy" 
                allowFullScreen 
                referrerPolicy="no-referrer-when-downgrade" 
                src={`https://maps.google.com/maps?q=${encodeURIComponent(post.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              ></iframe>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-600 font-medium px-1">
                <MapPin size={14} className="text-primary" />
                {post.location}
              </div>
              {post.distanceKm !== undefined && (
                <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full font-bold">
                  🚗 {post.distanceKm} km away
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Media */}
      {post.mediaUrls && post.mediaUrls.length > 0 && typeof post.mediaUrls[0] === 'string' && post.mediaUrls[0].trim() !== '' && !post.mediaUrls[0].includes('undefined') && (
        <div className="w-full aspect-square bg-gray-50 relative overflow-hidden group">
          <img src={post.mediaUrls[0]} alt="Post media" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      )}

      {/* Actions */}
      <div className="p-2 flex items-center justify-between">
        <div className="flex space-x-1">
          <ActionBtn 
            icon={<Heart size={22} className={`transition-all ${post.likes.includes("me") ? "fill-error text-error" : "text-gray-600 hover:fill-error/20 hover:text-error"}`} />} 
            count={post.likes.length} 
            onClick={() => onLike(post._id)} 
          />
          <ActionBtn 
            icon={<MessageSquare size={22} className={`transition-colors ${showComments ? 'text-info' : 'text-gray-600 hover:text-info'}`} />} 
            count={post.commentsCount || comments.length} 
            onClick={toggleComments}
          />
          <ActionBtn 
            icon={<Share size={22} className="text-gray-600 hover:text-gray-900 transition-colors" />} 
            onClick={handleShare}
          />
        </div>
        
        <div className="flex space-x-1 pr-2">
          <button 
            onClick={handleMessage}
            className="h-10 px-4 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-hover transition-colors shadow-sm active:scale-95 flex items-center gap-2"
          >
            <Send size={14} /> Message
          </button>
          <ActionBtn 
            icon={<Bookmark size={22} className={`transition-all ${isBookmarked ? 'fill-gray-900 text-gray-900' : 'text-gray-600 hover:fill-gray-900'}`} />} 
            onClick={handleBookmark}
          />
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-gray-50 border-t border-gray-100 p-4 pb-4 animate-in slide-in-from-top-4 fade-in duration-300">
          <form onSubmit={postComment} className="flex gap-2 mb-4">
            <input 
              type="text" 
              placeholder="Add a comment..." 
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <button 
              type="submit" 
              disabled={isPostingComment || !commentInput.trim()}
              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 hover:bg-primary-hover transition-colors"
            >
              {isPostingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="-ml-0.5" />}
            </button>
          </form>

          {isLoadingComments ? (
            <div className="flex justify-center py-4"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
          ) : comments.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-2">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((c: any) => (
                <div key={c._id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
                    {c.author?.profilePhoto ? (
                      <img src={c.author.profilePhoto} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500"><User size={16} /></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="bg-white px-3 py-2 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm inline-block">
                      <p className="font-bold text-xs text-gray-900">{c.author?.name}</p>
                      <p className="text-sm text-gray-800 mt-0.5">{c.content}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 ml-1">{new Date(c.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function ActionBtn({ icon, count, onClick }: { icon: React.ReactNode, count?: number, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="h-10 px-3 rounded-full flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors active:scale-95"
    >
      {icon}
      {count !== undefined && <span className="text-xs font-medium text-gray-600">{count}</span>}
    </button>
  );
}
