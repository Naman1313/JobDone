"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';

interface Applicant {
  workerId: {
    _id: string;
    name: string;
    profilePhoto: string;
    isVerified: boolean;
    trustScore: number;
  };
  message: string;
  appliedAt: string;
  _id: string;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  trade: string;
  budget: number;
  urgency: string;
  status: string;
  applicants: Applicant[];
  createdAt: string;
}

export default function ManageJobs() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [hiringJobId, setHiringJobId] = useState<string | null>(null);

  useEffect(() => {
    if (user === undefined) return;
    if (user && user.role !== 'client') {
      router.push('/home');
      return;
    }

    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/jobs/client`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
          setJobs(data.data);
        } else {
          setError(data.message || 'Failed to fetch jobs');
        }
      } catch (err) {
        setError('Network error. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user, router]);

  const toggleExpand = (jobId: string) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
    } else {
      setExpandedJobId(jobId);
    }
  };

  const handleHire = async (jobId: string, workerId: string) => {
    try {
      setHiringJobId(jobId);
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/jobs/${jobId}/hire/${workerId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        alert("Worker hired successfully!");
        // Update local state to reflect the hired status
        setJobs(jobs.map(job => 
          job._id === jobId 
            ? { ...job, status: 'filled', selectedWorker: workerId }
            : job
        ));
      } else {
        alert("Failed to hire worker: " + data.message);
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setHiringJobId(null);
    }
  };

  return (
    <div className="w-full mx-auto min-h-screen bg-surface-warm font-sans selection:bg-primary selection:text-white flex flex-col pb-32">
      {/* Header */}
      <header className="w-full h-16 sticky top-0 z-40 bg-white/40 backdrop-blur-2xl saturate-150 flex items-center border-b border-white/60 shadow-[0_4px_30px_rgba(93,64,55,0.05)] transition-all px-4 md:px-8">
        <div className="w-full max-w-3xl mx-auto flex items-center h-full">
          <Link href="/profile/me" className="mr-4 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex flex-col justify-center h-full">
            <h1 className="text-[20px] font-bold text-primary tracking-tight drop-shadow-sm leading-tight mt-1">My Posted Jobs</h1>
            <p className="font-label-sm text-xs text-on-surface-variant drop-shadow-sm font-medium mt-0.5">Manage jobs and applicants</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full flex-grow flex flex-col mt-4">
        <div className="w-full max-w-3xl mx-auto px-4 md:px-0 flex flex-col space-y-6">
          
          {loading ? (
            <div className="text-center py-16 font-body-md text-primary font-bold animate-pulse">Loading your jobs...</div>
          ) : error ? (
            <div className="text-center py-16 text-error font-body-md font-bold">{error}</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant bg-surface-container-lowest rounded-[32px] shadow-[0px_8px_24px_rgba(0,0,0,0.03)] border border-border-subtle/20 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl shadow-inner border border-primary/10">
                📝
              </div>
              <p className="font-bold text-xl text-on-surface mb-2 tracking-tight">No jobs posted yet.</p>
              <p className="text-sm font-medium text-on-surface-variant mb-6">Create a job to find workers near you.</p>
              <Link href="/jobs/post">
                <button className="px-6 py-3 bg-primary text-on-primary rounded-[16px] font-label-md font-bold shadow-[0_4px_12px_rgba(93,64,55,0.2)] border border-white/10 hover:bg-primary-container active:scale-[0.98] transition-all">
                  Post a Job Now
                </button>
              </Link>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job._id} className="bg-surface-container-lowest rounded-[32px] shadow-[0px_8px_32px_rgba(0,0,0,0.04)] border border-border-subtle/20 overflow-hidden flex flex-col transition-all">
                
                {/* Job Card Header */}
                <div className="p-6 sm:p-8 cursor-pointer hover:bg-surface-variant/10 transition-colors" onClick={() => toggleExpand(job._id)}>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-headline-md text-[22px] leading-snug font-bold text-on-surface tracking-tight pr-2">{job.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`font-label-sm font-bold px-3 py-1.5 rounded-[10px] uppercase tracking-wider border ${
                        job.status === 'open' ? 'bg-status-green/10 text-status-green border-status-green/20' : 
                        job.status === 'filled' ? 'bg-primary/10 text-primary border-primary/20' : 
                        'bg-surface-variant text-on-surface-variant border-border-subtle'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-surface-variant/40 border border-border-subtle/50 text-primary font-label-sm font-bold px-3 py-1 rounded-full capitalize">
                      {job.trade}
                    </span>
                    <span className="text-on-surface-variant font-label-sm font-bold px-3 py-1 rounded-full bg-surface-variant/30 border border-border-subtle/30">
                      ₹{job.budget}
                    </span>
                    {job.urgency === 'emergency' && (
                      <span className="bg-error/10 text-error font-label-sm font-bold px-3 py-1 rounded-full border border-error/20 uppercase tracking-wider">
                        Urgent
                      </span>
                    )}
                  </div>

                  <p className="text-on-surface-variant font-body-md line-clamp-2">{job.description}</p>
                  
                  <div className="mt-6 flex justify-between items-center pt-5 border-t border-border-subtle/30">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shadow-inner">
                        {job.applicants.length}
                      </div>
                      <span className="text-sm font-bold text-on-surface-variant">Applicants</span>
                    </div>
                    <span className={`text-on-surface-variant font-bold transition-transform duration-300 ${expandedJobId === job._id ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </div>
                </div>

                {/* Applicants List (Collapsible) */}
                {expandedJobId === job._id && (
                  <div className="bg-surface-variant/20 border-t border-border-subtle/30 p-6 sm:p-8 animate-in slide-in-from-top-2 fade-in duration-200">
                    <h4 className="font-bold text-on-surface mb-4">Worker Applications</h4>
                    
                    {job.applicants.length === 0 ? (
                      <p className="text-on-surface-variant text-sm font-medium py-4 text-center">No one has applied to this job yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {job.applicants.map((app) => (
                          <div key={app._id} className="bg-white p-5 rounded-[24px] shadow-sm border border-border-subtle/40 flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:shadow-md hover:border-primary/30">
                            
                            <Avatar 
                              name={app.workerId.name || 'Worker'} 
                              photoUrl={app.workerId.profilePhoto} 
                              isVerified={app.workerId.isVerified} 
                              size="lg" 
                              className="flex-shrink-0"
                            />
                            
                            <div className="flex-grow flex flex-col">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-bold text-on-surface text-lg">{app.workerId.name}</h5>
                                <span className="bg-status-gold/10 text-status-gold text-[10px] font-bold px-2 py-0.5 rounded-full border border-status-gold/20 uppercase tracking-wider">
                                  Score: {app.workerId.trustScore || 0}
                                </span>
                              </div>
                              <p className="text-sm text-on-surface-variant font-medium line-clamp-2 italic mb-1">
                                "{app.message || "I am interested in this job and can complete it quickly."}"
                              </p>
                              <span className="text-xs text-on-surface-variant/60 font-medium">
                                Applied: {new Date(app.appliedAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="sm:ml-auto mt-2 sm:mt-0 flex-shrink-0">
                              {job.status === 'open' ? (
                                <button 
                                  onClick={() => handleHire(job._id, app.workerId._id)}
                                  disabled={hiringJobId === job._id}
                                  className="w-full sm:w-auto px-6 py-3 bg-primary text-on-primary rounded-[14px] font-label-md font-bold shadow-[0_4px_12px_rgba(93,64,55,0.2)] hover:bg-primary-container active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                                >
                                  {hiringJobId === job._id ? 'Hiring...' : 'Accept & Hire'}
                                </button>
                              ) : (
                                <span className="px-4 py-2 bg-surface-variant text-on-surface-variant rounded-full text-sm font-bold border border-border-subtle opacity-70">
                                  {job.status === 'filled' && (job as any).selectedWorker === app.workerId._id ? 'Hired' : 'Job Closed'}
                                </span>
                              )}
                            </div>
                            
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
