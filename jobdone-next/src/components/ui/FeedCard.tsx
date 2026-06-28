import { CheckCircle, Heart, MessageSquare, Share, Bookmark, MapPin, Send } from 'lucide-react';

interface FeedCardProps {
  post: {
    _id: string;
    content: string;
    mediaUrls: string[];
    trade: string;
    likes: string[];
    createdAt: string;
    location?: string;
    authorId: {
      _id: string;
      name: string;
      profilePhoto: string;
      isVerified: boolean;
    };
  };
  onLike: (id: string) => void;
}

export default function FeedCard({ post, onLike }: FeedCardProps) {
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
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-1">
              {post.authorId?.name}
              {post.authorId?.isVerified && (
                <CheckCircle size={16} className="text-info fill-info/20" />
              )}
            </h3>
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
        
        {post.location && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-2 font-medium">
            <MapPin size={14} className="text-gray-400" />
            {post.location}
          </div>
        )}
      </div>

      {/* Media */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="w-full aspect-square bg-gray-50 relative overflow-hidden group">
          <img src={post.mediaUrls[0]} alt="Post media" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      )}

      {/* Actions */}
      <div className="p-2 flex items-center justify-between">
        <div className="flex space-x-1">
          <ActionBtn icon={<Heart size={22} className="text-gray-600 hover:fill-error hover:text-error transition-all" />} count={post.likes.length} onClick={() => onLike(post._id)} />
          <ActionBtn icon={<MessageSquare size={22} className="text-gray-600 hover:text-info transition-colors" />} count={5} />
          <ActionBtn icon={<Share size={22} className="text-gray-600 hover:text-gray-900 transition-colors" />} />
        </div>
        
        <div className="flex space-x-1 pr-2">
          <button className="h-10 px-4 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-hover transition-colors shadow-sm active:scale-95 flex items-center gap-2">
            <Send size={14} /> Message
          </button>
          <ActionBtn icon={<Bookmark size={22} className="text-gray-600 hover:fill-gray-900 transition-all" />} />
        </div>
      </div>
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
