'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';

export default function RoleSetupPage() {
  const router = useRouter();
  const { token, login, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'worker' | 'client' | null>(null);

  const handleConfirm = async () => {
    if (!selectedRole || !token) return;
    
    setIsLoading(true);
    
    try {
      // Backend expects 'WORKER' or 'CLIENT'
      const roleUpper = selectedRole.toUpperCase();
      const res = await api.post('/api/auth/set-role', { role: roleUpper });
      
      if (res.data.success) {
        const { accessToken, user: updatedUser } = res.data;
        login(accessToken, updatedUser.role, updatedUser);
        
        if (updatedUser.role === 'WORKER') {
          router.push('/worker/home');
        } else {
          router.push('/client/home');
        }
      }
    } catch (error) {
      console.error("Failed to set role", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      <div className="mt-8 mb-6 animate-in slide-in-from-top-4 fade-in">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Who are you?</h1>
        <p className="text-muted-foreground">Select how you want to use JobDone.</p>
      </div>

      <div className="space-y-4 flex-1 animate-in slide-in-from-bottom-8 fade-in delay-150">
        <Card 
          className={`cursor-pointer transition-all ${selectedRole === 'worker' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}
          onClick={() => setSelectedRole('worker')}
        >
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">👷‍♂️</span>
            </div>
            <CardTitle>I'm a Worker</CardTitle>
            <CardDescription>
              I want to showcase my skills, find jobs, and get hired by local clients.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${selectedRole === 'client' ? 'ring-2 ring-info bg-info/5' : 'hover:bg-muted/50'}`}
          onClick={() => setSelectedRole('client')}
        >
          <CardHeader>
            <div className="w-12 h-12 bg-info/10 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">🤝</span>
            </div>
            <CardTitle>I'm a Client</CardTitle>
            <CardDescription>
              I want to post jobs, hire verified professionals, and get work done.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="pb-8 pt-4 sticky bottom-0 bg-background/80 backdrop-blur-md">
        <Button 
          className="w-full py-6 text-lg rounded-2xl shadow-premium" 
          disabled={!selectedRole || isLoading}
          onClick={handleConfirm}
        >
          {isLoading ? "Setting up..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
