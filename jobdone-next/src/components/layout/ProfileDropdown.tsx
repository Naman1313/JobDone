'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Bookmark, Bell, MessageSquare, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function ProfileDropdown() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      api.get('/api/users/me').then(res => {
        if (res.data?.success) {
          setProfile(res.data.data.profile);
        }
      }).catch(err => console.error(err));
    }
  }, [user]);

  const avatarUrl = profile?.avatarUrl || `https://ui-avatars.com/api/?name=${profile?.firstName || 'User'}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:opacity-80 transition-opacity">
          <Avatar className="w-full h-full">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{profile?.firstName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col">
            <span>{profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : 'My Account'}</span>
            <span className="text-xs text-muted-foreground font-normal">{user?.phone || 'Loading...'}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/profile/edit')} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Edit Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Users className="mr-2 h-4 w-4" />
          <span>My Network</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <MessageSquare className="mr-2 h-4 w-4" />
          <span>Messages</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Bookmark className="mr-2 h-4 w-4" />
          <span>Saved Jobs</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => logout()} className="text-red-500 focus:text-red-500 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
