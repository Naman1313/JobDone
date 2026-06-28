'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import api from '@/lib/api';
import { ArrowLeft } from 'lucide-react';

export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    trades: '', // Store as string for simplicity in UI, then parse to JSON array or leave as string
    skills: '',
    avatarUrl: ''
  });

  useEffect(() => {
    if (user?.id) {
      api.get('/api/users/me').then(res => {
        if (res.data?.success && res.data.data.profile) {
          const p = res.data.data.profile;
          setProfile({
            firstName: p.firstName || '',
            lastName: p.lastName || '',
            bio: p.bio || '',
            location: p.location || '',
            trades: p.trades || '',
            skills: p.skills || '',
            avatarUrl: p.avatarUrl || ''
          });
        }
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.put('/api/users/me', profile);
      if (res.data.success) {
        alert('Profile updated successfully!');
        if (user?.role === 'WORKER') {
          router.push('/worker/home');
        } else {
          router.push('/client/home');
        }
      }
    } catch (error: any) {
      console.error('Failed to update profile', error);
      alert('Failed to update profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="h-16 flex items-center px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b">
        <button onClick={() => router.back()} className="mr-4 p-2 text-muted-foreground hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-foreground">Edit Profile</h1>
      </header>

      <main className="p-4 w-full md:pb-8">
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="flex flex-col items-center mb-6 mt-4">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.firstName || 'User'}`} />
                  <AvatarFallback>{profile.firstName?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <Input 
                  name="avatarUrl"
                  placeholder="Avatar Image URL"
                  value={profile.avatarUrl}
                  onChange={handleChange}
                  className="text-center text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input name="firstName" value={profile.firstName} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input name="lastName" value={profile.lastName} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bio / Headline</Label>
                <Input name="bio" value={profile.bio} onChange={handleChange} placeholder="e.g. Master Electrician with 10 years experience" />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input name="location" value={profile.location} onChange={handleChange} placeholder="City, State" />
              </div>

              {user?.role === 'WORKER' && (
                <>
                  <div className="space-y-2">
                    <Label>Trade(s)</Label>
                    <Input name="trades" value={profile.trades} onChange={handleChange} placeholder="e.g. Plumber, Electrician" />
                  </div>
                  <div className="space-y-2">
                    <Label>Skills (comma separated)</Label>
                    <Input name="skills" value={profile.skills} onChange={handleChange} placeholder="e.g. Pipe fitting, Wiring, Welding" />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full py-6 rounded-xl text-lg font-bold mt-8" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
