'use client';

import { Settings, Plus, Users, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ClientDashboardPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b">
        <h1 className="text-xl font-bold text-foreground">Client Dashboard</h1>
        <button className="p-2 text-muted-foreground hover:bg-muted rounded-full">
          <Settings size={20} />
        </button>
      </header>

      <main className="p-4">
        {/* Post Job Call to Action */}
        <Card className="bg-gradient-to-br from-primary to-orange-500 border-none shadow-premium text-white mb-6">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-2">Need something fixed?</h2>
            <p className="text-white/80 mb-6">Post a job now and get applicants in minutes.</p>
            <Button className="w-full bg-white text-primary hover:bg-white/90 rounded-xl py-6 font-bold shadow-lg">
              <Plus className="mr-2" /> Post a New Job
            </Button>
          </CardContent>
        </Card>

        {/* Active Jobs */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Your Active Jobs</h3>
            <span className="text-sm text-primary font-semibold">View All</span>
          </div>

          <div className="space-y-4">
            {/* Job 1 */}
            <Card className="border-none shadow-sm bg-surface-container">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold">Full House Rewiring</h4>
                    <p className="text-xs text-muted-foreground">Posted 2 hours ago</p>
                  </div>
                  <Badge className="bg-success text-white border-none">Active</Badge>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex -space-x-2">
                    <Avatar className="w-8 h-8 border-2 border-white"><AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" /></Avatar>
                    <Avatar className="w-8 h-8 border-2 border-white"><AvatarImage src="https://randomuser.me/api/portraits/women/44.jpg" /></Avatar>
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-muted flex items-center justify-center text-[10px] font-bold">
                      +3
                    </div>
                  </div>
                  <span className="text-sm font-medium">5 Applicants</span>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 rounded-lg" variant="default">View Applicants</Button>
                </div>
              </CardContent>
            </Card>

            {/* Job 2 */}
            <Card className="border-none shadow-sm bg-surface-container">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold">Leaking Pipe Emergency</h4>
                    <p className="text-xs text-muted-foreground">Posted 10 mins ago</p>
                  </div>
                  <Badge className="bg-error text-white border-none"><AlertTriangle size={12} className="mr-1" /> Urgent</Badge>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium text-muted-foreground flex items-center">
                    <Clock size={16} className="mr-1" /> Waiting for applicants...
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 rounded-lg" variant="outline">Edit Job</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Hires */}
        <div>
          <h3 className="font-bold text-lg mb-4">Recent Hires</h3>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[120px] bg-surface-container p-3 rounded-2xl flex flex-col items-center text-center">
                <Avatar className="w-14 h-14 mb-2">
                  <AvatarImage src={`https://randomuser.me/api/portraits/men/${i + 20}.jpg`} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="font-semibold text-sm truncate w-full">Worker {i}</span>
                <span className="text-xs text-muted-foreground">Plumber</span>
                <Button variant="link" className="h-auto p-0 mt-2 text-xs">Rehire</Button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
