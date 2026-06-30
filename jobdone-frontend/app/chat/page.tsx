"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PageShell from "../../components/ui/PageShell";
import Avatar from "@/components/ui/Avatar";

export default function InboxPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/conversations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setConversations(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  if (loading) return (
    <PageShell title="Messages">
      <div className="p-10 flex justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </PageShell>
  );

  return (
    <PageShell title="Messages">
      <div className="p-4 bg-surface-warm min-h-screen">
        {conversations.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="text-5xl mb-4 opacity-50">💬</div>
            <p className="text-on-surface-variant font-bold text-lg">No messages yet</p>
            <p className="text-on-surface-variant/70 text-sm mt-2">Start a conversation from the Social Feed or Job Board!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map(conv => {
              // Get the other participant
              const otherUser = conv.participants.find((p: any) => p._id !== user?._id) || conv.participants[0];
              
              return (
                <div 
                  key={conv._id} 
                  onClick={() => router.push(`/chat/${conv._id}`)}
                  className="bg-surface-container-lowest p-5 rounded-[24px] shadow-[0px_8px_24px_rgba(0,0,0,0.03)] border border-border-subtle/20 flex items-center gap-4 cursor-pointer hover:bg-surface-variant/30 hover:border-primary/30 transition-all active:scale-95"
                >
                  <Avatar 
                    name={otherUser?.name || 'User'} 
                    photoUrl={otherUser?.profilePhoto} 
                    isVerified={otherUser?.isVerified}
                    size="lg"
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-on-surface text-lg">{otherUser?.name || 'User'}</h3>
                      <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wider">
                        {new Date(conv.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-on-surface-variant/80 truncate">{conv.lastMessage || 'Tap to view conversation'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
