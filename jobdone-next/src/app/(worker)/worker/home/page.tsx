'use client';

import { Settings, Share, Edit, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

export default function WorkerProfilePage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Profile Header */}
      <header className="h-16 flex items-center justify-between px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b">
        <h1 className="text-xl font-bold text-foreground">Worker Profile</h1>
        <div className="flex gap-2 text-muted-foreground">
          <button className="p-2 hover:bg-muted rounded-full"><Edit size={20} /></button>
          <button className="p-2 hover:bg-muted rounded-full"><Share size={20} /></button>
          <button className="p-2 hover:bg-muted rounded-full"><Settings size={20} /></button>
        </div>
      </header>

      <main className="p-4">
        {/* User Info */}
        <div className="flex flex-col items-center mt-4 mb-6">
          <div className="relative mb-4">
            <Avatar className="w-28 h-28 border-4 border-white shadow-lg">
              <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" />
              <AvatarFallback>MC</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 bg-success text-white p-1 rounded-full border-2 border-white">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Michael Chen</h2>
          <p className="text-primary font-semibold mb-1">Master Electrician</p>
          <p className="text-sm text-muted-foreground text-center px-6">
            15+ years of experience in residential and commercial electrical systems. Licensed and insured.
          </p>
          
          <div className="flex gap-4 mt-4 w-full px-4">
            <div className="flex-1 bg-surface-container rounded-2xl p-3 text-center">
              <div className="text-xl font-bold">4.9</div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </div>
            <div className="flex-1 bg-surface-container rounded-2xl p-3 text-center">
              <div className="text-xl font-bold">124</div>
              <div className="text-xs text-muted-foreground">Jobs Done</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-8">
          <Button className="flex-1 py-6 rounded-xl shadow-premium">Manage Availability</Button>
          <Button variant="outline" className="flex-1 py-6 rounded-xl">View Analytics</Button>
        </div>

        {/* Portfolio */}
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-3">Portfolio</h3>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-muted rounded-xl overflow-hidden cursor-pointer group">
                <img 
                  src={`https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=200&auto=format&fit=crop&sig=${i}`} 
                  alt="Work" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Certificates */}
        <div>
          <h3 className="font-bold text-lg mb-3">Certificates & Licenses</h3>
          <div className="space-y-3">
            <Card className="shadow-none bg-surface-container border-none">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined">workspace_premium</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm">State Electrical Contractor License</h4>
                  <p className="text-xs text-muted-foreground">Issued Jan 2020 • Valid</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-none bg-surface-container border-none">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined">verified</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm">OSHA 30 Certification</h4>
                  <p className="text-xs text-muted-foreground">Issued Mar 2019 • Valid</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </main>
    </div>
  );
}
