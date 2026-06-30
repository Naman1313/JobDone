"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import io from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import Avatar from "@/components/ui/Avatar";

export default function ChatPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?._id) return; // Wait for user to load

    // 1. Fetch History and Meta
    const fetchChatData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch Metadata
        const metaRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/conversations/${conversationId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const metaData = await metaRes.json();
        if (metaData.success && user) {
           const partner = metaData.data.participants.find((p: any) => p._id !== user._id) || metaData.data.participants[0];
           setOtherUser(partner);
        }

        // Fetch Messages
        const msgRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/conversations/${conversationId}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const msgData = await msgRes.json();
        if (msgData.success) {
          setMessages(msgData.data);
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchChatData();

    // 2. Setup Socket
    socketRef.current = io(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}`);
    
    socketRef.current.on("connect", () => {
      setIsConnected(true);
      socketRef.current.emit("join_chat", conversationId);
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
    });
    
    socketRef.current.on("receive_message", (message: any) => {
      setMessages(prev => [...prev, message]);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [conversationId, user?._id]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || !user || !socketRef.current?.connected) return;

    socketRef.current.emit("send_message", {
      conversationId,
      senderId: user._id, // Will use real user id from context
      content: trimmedInput
    });

    setInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-surface-warm font-sans selection:bg-primary selection:text-white">
      {/* Header */}
      <div className="bg-white/40 backdrop-blur-2xl saturate-150 px-4 py-3 flex items-center gap-4 border-b border-white/60 shadow-[0_4px_30px_rgba(93,64,55,0.05)] sticky top-0 z-40 h-16">
        <button onClick={() => router.back()} className="text-on-surface hover:text-primary transition-colors p-2 -ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {otherUser && (
          <Avatar name={otherUser.name} photoUrl={otherUser.profilePhoto} isVerified={otherUser.isVerified} size="md" />
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-on-surface leading-tight text-lg">{otherUser?.name || 'Loading...'}</h2>
            {otherUser?.role && (
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${otherUser.role === 'client' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                {otherUser.role}
              </span>
            )}
          </div>
          <p className={`text-[11px] font-bold uppercase tracking-wider ${isConnected ? 'text-status-success' : 'text-on-surface-variant'}`}>
            {isConnected ? 'Online' : 'Connecting...'}
          </p>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
        <div className="text-center text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/50 my-6 bg-surface-variant/20 inline-block px-3 py-1 rounded-full mx-auto flex w-fit">
          Conversation Started
        </div>
        
        {messages.map((msg, i) => {
          const isMine = msg.senderId === user?._id;
          return (
            <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
              <div className={`max-w-[75%] rounded-3xl px-5 py-3 shadow-sm flex flex-col ${
                isMine 
                  ? 'bg-primary text-on-primary rounded-tr-sm shadow-[0_4px_12px_rgba(93,64,55,0.2)] border border-white/10' 
                  : 'bg-surface-container-lowest text-on-surface border border-border-subtle/40 rounded-tl-sm'
              }`}>
                <p className="text-[15px] leading-relaxed">{msg.content}</p>
                <p className={`text-[9px] font-bold tracking-wider mt-1.5 text-right uppercase ${isMine ? 'text-on-primary/70' : 'text-on-surface-variant/50'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="bg-surface-container-lowest p-4 border-t border-border-subtle/30 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        <form onSubmit={sendMessage} className="flex items-center gap-3 max-w-3xl mx-auto">
          <button type="button" className="text-on-surface-variant hover:text-primary transition-colors p-2 bg-surface-variant/30 rounded-full active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-surface-variant/30 rounded-full px-5 py-3.5 outline-none focus:ring-2 focus:ring-primary/50 text-on-surface placeholder-on-surface-variant/50 border border-border-subtle/50 font-body-md transition-all"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || !isConnected}
            className="bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(93,64,55,0.2)] disabled:opacity-40 disabled:shadow-none transition-all active:scale-90 border border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
