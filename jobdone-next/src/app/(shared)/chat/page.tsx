'use client';

import { useState } from 'react';
import { Search, Edit, MoreVertical, Phone, Video } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CHATS = [
  { id: 1, name: 'Rajesh Sharma', role: 'Plumber', lastMsg: 'I will arrive at 10 AM tomorrow.', time: '10:42 AM', unread: 2, avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 2, name: 'Amit Kumar', role: 'Electrician', lastMsg: 'The wiring is completed. Please check.', time: 'Yesterday', unread: 0, avatar: 'https://randomuser.me/api/portraits/men/44.jpg' },
  { id: 3, name: 'Suresh Masonry', role: 'Mason', lastMsg: 'Thanks for the payment!', time: 'Mon', unread: 0, avatar: 'https://randomuser.me/api/portraits/men/22.jpg' },
];

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState<number | null>(null);

  if (activeChat) {
    const chat = CHATS.find(c => c.id === activeChat);
    return (
      <div className="flex flex-col h-screen bg-background pb-20">
        <header className="h-16 flex items-center justify-between px-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveChat(null)} className="p-2 hover:bg-muted rounded-full">
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
            <Avatar className="w-10 h-10">
              <AvatarImage src={chat?.avatar} />
              <AvatarFallback>{chat?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-sm leading-tight">{chat?.name}</h2>
              <p className="text-xs text-muted-foreground">{chat?.role}</p>
            </div>
          </div>
          <div className="flex gap-2 text-primary">
            <button className="p-2 hover:bg-muted rounded-full"><Phone size={20} /></button>
            <button className="p-2 hover:bg-muted rounded-full"><Video size={20} /></button>
            <button className="p-2 hover:bg-muted rounded-full"><MoreVertical size={20} /></button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-center">
            <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">Today</span>
          </div>
          <div className="flex justify-end">
            <div className="bg-primary text-white p-3 rounded-2xl rounded-tr-sm max-w-[80%]">
              Hello, are you available for a plumbing job today?
              <div className="text-[10px] text-white/70 text-right mt-1">10:30 AM</div>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-muted text-foreground p-3 rounded-2xl rounded-tl-sm max-w-[80%]">
              Yes, I am available. Can you share the location?
              <div className="text-[10px] text-muted-foreground text-right mt-1">10:35 AM</div>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-muted text-foreground p-3 rounded-2xl rounded-tl-sm max-w-[80%]">
              {chat?.lastMsg}
              <div className="text-[10px] text-muted-foreground text-right mt-1">10:42 AM</div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-white border-t flex gap-2 items-center">
          <button className="p-2 text-primary bg-primary/10 rounded-full"><span className="material-symbols-outlined">add</span></button>
          <Input className="flex-1 rounded-full border-none bg-muted focus-visible:ring-0" placeholder="Type a message..." />
          <button className="p-3 bg-primary text-white rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] ml-1">send</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="h-16 flex items-center justify-between px-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-xl font-bold text-foreground">Messages</h1>
        <div className="flex gap-2">
          <button className="p-2 text-primary hover:bg-muted rounded-full">
            <Search size={22} />
          </button>
          <button className="p-2 text-primary hover:bg-muted rounded-full">
            <Edit size={22} />
          </button>
        </div>
      </header>
      
      <main className="p-4 space-y-1">
        {CHATS.map((chat) => (
          <div 
            key={chat.id} 
            className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-2xl cursor-pointer transition-colors active:scale-95"
            onClick={() => setActiveChat(chat.id)}
          >
            <Avatar className="w-14 h-14 border border-outline/20">
              <AvatarImage src={chat.avatar} />
              <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-semibold text-foreground truncate">{chat.name}</h3>
                <span className={`text-xs ${chat.unread > 0 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{chat.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className={`text-sm truncate ${chat.unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {chat.lastMsg}
                </p>
                {chat.unread > 0 && (
                  <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-2">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
