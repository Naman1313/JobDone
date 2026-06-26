"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Job {
  _id: string;
  title: string;
  trade: string;
  budget: number;
  urgency: string;
  distance: number;
  createdAt: string;
}

export default function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [trade, setTrade] = useState('');
  const [radius, setRadius] = useState(5000); // 5km default
  const [error, setError] = useState('');

  const fetchJobs = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString(),
        ...(trade && { trade })
      });
      
      const token = localStorage.getItem('token'); // Mock auth token retrieval
      
      const res = await fetch(`http://localhost:5000/api/jobs?${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchJobs(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.warn("Geolocation blocked, using default location (Mumbai)", err);
          fetchJobs(19.0760, 72.8777);
        }
      );
    } else {
      fetchJobs(19.0760, 72.8777);
    }
  }, [trade, radius]); // Refetch when filters change

  const handleApply = async (jobId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: "I am interested in this job." })
      });
      const data = await res.json();
      if(data.success) {
        alert("Successfully applied!");
      } else {
        alert("Failed: " + data.message);
      }
    } catch (err) {
      alert("Error applying to job");
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white p-4 sticky top-0 z-10 shadow-sm border-b">
        <h1 className="text-xl font-bold text-gray-900">Job Board</h1>
        <p className="text-sm text-gray-500">Jobs matching your skills</p>
      </header>

      {/* Filter Bar */}
      <div className="bg-white p-4 mb-4 shadow-sm flex flex-col space-y-3">
        <select 
          className="w-full p-3 border rounded-xl bg-gray-50 text-gray-700 outline-none focus:ring-2 focus:ring-orange-500"
          value={trade}
          onChange={(e) => setTrade(e.target.value)}
        >
          <option value="">All Trades</option>
          <option value="plumber">Plumber</option>
          <option value="electrician">Electrician</option>
          <option value="carpenter">Carpenter</option>
          <option value="painter">Painter</option>
        </select>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 w-24">Radius: {radius / 1000}km</span>
          <input 
            type="range" 
            min="1000" max="50000" step="1000" 
            value={radius} 
            onChange={(e) => setRadius(Number(e.target.value))}
            className="flex-1 accent-orange-500"
          />
        </div>
      </div>

      {/* Job List */}
      <main className="px-4 space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500 animate-pulse">Finding jobs near you...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm">
            <span className="text-4xl block mb-2">🔍</span>
            No jobs found in this area.
          </div>
        ) : (
          jobs.map(job => (
            <div key={job._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{job.title}</h3>
                {job.urgency === 'emergency' && (
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-md ml-2 flex-shrink-0">
                    URGENT
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-md font-medium capitalize">
                  {job.trade}
                </span>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium">
                  {Math.round(job.distance)}m away
                </span>
              </div>
              
              <div className="flex justify-between items-center mt-auto pt-3 border-t">
                <div className="text-gray-900 font-bold text-lg">
                  ₹{job.budget}
                </div>
                <button 
                  onClick={() => handleApply(job._id)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-xl transition-colors shadow-sm active:scale-95"
                >
                  Apply
                </button>
              </div>
            </div>
          ))
        )}
      </main>
      
      {/* Client Post FAB */}
      <Link href="/jobs/post">
        <button className="fixed bottom-6 right-4 lg:right-1/3 bg-orange-500 text-white w-14 h-14 rounded-full shadow-lg text-2xl font-bold flex items-center justify-center hover:bg-orange-600 hover:scale-105 transition-all">
          +
        </button>
      </Link>
    </div>
  );
}
