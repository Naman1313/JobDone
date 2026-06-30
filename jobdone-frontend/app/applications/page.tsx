"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';

interface Job {
  _id: string;
  title: string;
  trade: string;
  budget: number;
  status: string;
  selectedWorker?: string;
  clientId: {
    _id: string;
    name: string;
    profilePhoto: string;
  };
  createdAt: string;
}

export default function MyApplications() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user === undefined) return;
    if (user && user.role !== 'worker') {
      router.push('/home');
      return;
    }

    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/jobs/worker/applications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
          setJobs(data.data);
        } else {
          setError(data.message || 'Failed to fetch applications');
        }
      } catch (err) {
        setError('Network error. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user, router]);

  // Determine the display status for an application
  const getApplicationStatus = (job: Job) => {
    if (job.status === 'open') {
      return {
        label: 'Pending Review',
        colors: 'bg-surface-variant text-on-surface-variant border-border-subtle',
        icon: '⏳'
      };
    } else if (job.status === 'filled') {
      if (job.selectedWorker === user?._id) {
        return {
          label: 'Hired!',
          colors: 'bg-primary/10 text-primary border-primary/20 shadow-sm',
          icon: '🎉'
        };
      } else {
        return {
          label: 'Not Selected',
          colors: 'bg-error/10 text-error border-error/20',
          icon: '✕'
        };
      }
    }
    return {
      label: 'Closed',
      colors: 'bg-surface-variant text-on-surface-variant border-border-subtle',
      icon: '🔒'
    };
  };

  return (
    <div className="w-full mx-auto min-h-screen bg-surface-warm font-sans selection:bg-primary selection:text-white flex flex-col pb-32">
      {/* Header */}
      <header className="w-full h-16 sticky top-0 z-40 bg-white/40 backdrop-blur-2xl saturate-150 flex items-center border-b border-white/60 shadow-[0_4px_30px_rgba(93,64,55,0.05)] transition-all px-4 md:px-8">
        <div className="w-full max-w-2xl mx-auto flex items-center h-full">
          <Link href="/profile/me" className="mr-4 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex flex-col justify-center h-full">
            <h1 className="text-[20px] font-bold text-primary tracking-tight drop-shadow-sm leading-tight mt-1">My Applications</h1>
            <p className="font-label-sm text-xs text-on-surface-variant drop-shadow-sm font-medium mt-0.5">Track your job applications</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full flex-grow flex flex-col mt-4">
        <div className="w-full max-w-2xl mx-auto px-4 md:px-0 flex flex-col space-y-4">
          
          {loading ? (
            <div className="text-center py-16 font-body-md text-primary font-bold animate-pulse">Loading your applications...</div>
          ) : error ? (
            <div className="text-center py-16 text-error font-body-md font-bold">{error}</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant bg-surface-container-lowest rounded-[32px] shadow-[0px_8px_24px_rgba(0,0,0,0.03)] border border-border-subtle/20 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl shadow-inner border border-primary/10">
                📄
              </div>
              <p className="font-bold text-xl text-on-surface mb-2 tracking-tight">No applications yet.</p>
              <p className="text-sm font-medium text-on-surface-variant mb-6">Go to the Job Board to find work.</p>
              <Link href="/jobs">
                <button className="px-6 py-3 bg-primary text-on-primary rounded-[16px] font-label-md font-bold shadow-[0_4px_12px_rgba(93,64,55,0.2)] border border-white/10 hover:bg-primary-container active:scale-[0.98] transition-all">
                  Browse Jobs
                </button>
              </Link>
            </div>
          ) : (
            jobs.map(job => {
              const statusInfo = getApplicationStatus(job);
              return (
                <div key={job._id} className="bg-surface-container-lowest p-6 rounded-[24px] shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-border-subtle/20 flex flex-col hover:shadow-md transition-all">
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        name={job.clientId?.name || 'Client'} 
                        photoUrl={job.clientId?.profilePhoto} 
                        size="md" 
                      />
                      <div>
                        <h3 className="font-headline-md text-lg leading-snug font-bold text-on-surface tracking-tight">{job.title}</h3>
                        <p className="text-xs font-medium text-on-surface-variant">Posted by {job.clientId?.name || 'Unknown'}</p>
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${statusInfo.colors}`}>
                      <span className="text-xs">{statusInfo.icon}</span>
                      <span className="font-bold text-xs uppercase tracking-wider">{statusInfo.label}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-surface-variant/40 border border-border-subtle/50 text-primary font-label-sm font-bold px-3 py-1 rounded-full capitalize">
                      {job.trade}
                    </span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-border-subtle/30 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-0.5">Budget</span>
                      <div className="text-primary font-bold text-lg">
                        ₹{job.budget}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-on-surface-variant/70">
                      Applied: {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
