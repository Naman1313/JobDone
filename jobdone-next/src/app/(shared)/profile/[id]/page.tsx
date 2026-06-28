"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Edit3, Share2, MoreVertical, CheckCircle, Star, 
  MapPin, Shield, BrainCircuit, Briefcase, Award, TrendingUp,
  MessageSquare, UserPlus, Image as ImageIcon, Video, Calendar
} from 'lucide-react';

export default function WorkerProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);

  // In a real app, fetch data based on params.id
  // Mocking the data for the UI representation
  const worker = {
    name: "Arjun Sharma",
    trade: "Professional Electrician & Smart Home Specialist",
    experience: "8+ years of expertise in industrial and residential projects.",
    rating: 4.9,
    reviews: 124,
    isVerified: true,
    avatar: "https://i.pravatar.cc/150?u=arjun",
    dna: {
      trustScore: 98,
      aiMatch: 95,
      experienceYears: 8,
      radiusKm: 25,
      estEarnings: "₹45,000+"
    },
    skills: ["Smart Home Wiring", "Industrial HVAC", "Solar Panels", "Circuit Repair"],
    timeline: [
      { date: "AUG 2026", title: "Earned Platinum Badge", desc: "Maintained a 4.9 rating over 100+ verified jobs to earn JobDone's highest honor." },
      { date: "JUN 2026", title: "Advanced HVAC Training", desc: "Certified by SkillIndia for industrial HVAC repairs & maintenance." },
      { date: "JAN 2025", title: "Joined JobDone", desc: "Started journey as an independent verified contractor." }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-30 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-blue-600">Worker Profile</h1>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Edit3 size={20} /></button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Share2 size={20} /></button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><MoreVertical size={20} /></button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto">
        {/* Profile Info Section */}
        <div className="bg-white px-4 py-8 flex flex-col items-center text-center rounded-b-3xl shadow-sm">
          <div className="relative">
            <div className="w-28 h-28 rounded-full p-1 border-2 border-dashed border-gray-300">
              <img src={worker.avatar} alt={worker.name} className="w-full h-full rounded-full object-cover" />
            </div>
            {worker.isVerified && (
              <div className="absolute bottom-1 right-1 bg-white rounded-full p-0.5">
                <CheckCircle className="text-blue-600 w-7 h-7" fill="white" />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-black text-gray-900 mt-4 tracking-tight">{worker.name}</h2>
          
          <div className="flex items-center justify-center gap-3 mt-2">
            {worker.isVerified && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                Verified Worker
              </span>
            )}
            <div className="flex items-center text-sm font-bold text-gray-700">
              <Star className="text-blue-600 w-4 h-4 mr-1" fill="currentColor" />
              {worker.rating} <span className="text-gray-400 ml-1 font-normal">({worker.reviews} reviews)</span>
            </div>
          </div>

          <p className="text-gray-600 mt-4 px-4 text-sm leading-relaxed max-w-md">
            {worker.trade} with {worker.experience}
          </p>

          <div className="flex items-center justify-center gap-3 mt-6 w-full max-w-xs">
            <button 
              onClick={() => setIsFollowing(!isFollowing)}
              className={`flex-1 py-2.5 rounded-full font-bold text-sm transition-colors flex items-center justify-center gap-2 ${isFollowing ? 'bg-gray-100 text-gray-700' : 'bg-blue-700 hover:bg-blue-800 text-white shadow-md shadow-blue-200'}`}
            >
              {isFollowing ? <CheckCircle size={18} /> : <UserPlus size={18} />}
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button onClick={() => router.push(`/chat?user=${params.id}`)} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-full font-bold text-sm transition-colors shadow-md shadow-blue-200 flex items-center justify-center gap-2">
              <MessageSquare size={18} /> Message
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6 mt-2">
          
          {/* Worker DNA Card */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <BrainCircuit size={100} />
            </div>
            
            <h3 className="text-blue-700 font-bold flex items-center gap-2 mb-6">
              <Shield size={18} /> Worker DNA
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 relative z-10">
              <div>
                <p className="text-[10px] font-black tracking-wider text-gray-500 uppercase mb-1">Trust Score</p>
                <p className="text-xl font-black text-gray-900">{worker.dna.trustScore}<span className="text-sm text-gray-500">/100</span></p>
              </div>
              <div>
                <p className="text-[10px] font-black tracking-wider text-gray-500 uppercase mb-1">AI Match</p>
                <p className="text-xl font-black text-blue-600 flex items-center gap-1">
                  <BrainCircuit size={16} /> {worker.dna.aiMatch}%
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black tracking-wider text-gray-500 uppercase mb-1">Experience</p>
                <p className="text-xl font-black text-gray-900">{worker.dna.experienceYears} Yrs</p>
              </div>
              <div>
                <p className="text-[10px] font-black tracking-wider text-gray-500 uppercase mb-1">Radius</p>
                <p className="text-xl font-black text-gray-900">{worker.dna.radiusKm} km</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-[10px] font-black tracking-wider text-gray-500 uppercase mb-1">Est. Monthly Earnings</p>
                <p className="text-xl font-black text-green-600">{worker.dna.estEarnings}</p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 bg-blue-700 hover:bg-blue-800 text-white h-12 rounded-xl font-bold shadow-md shadow-blue-200 transition-colors flex items-center justify-center">
              Hire Me
            </button>
            <button onClick={() => router.push(`/chat?user=${params.id}`)} className="flex-1 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 h-12 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
              <MessageSquare size={18} /> Message
            </button>
          </div>

          {/* Skills */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <Award className="text-blue-600" /> Skills & Expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {worker.skills.map((skill, idx) => (
                <span key={idx} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:border-blue-300 hover:text-blue-700 transition-colors cursor-default">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Portfolio Placeholder */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                <Briefcase className="text-blue-600" /> Portfolio
              </h3>
              <button className="text-blue-600 font-bold text-sm hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-square bg-gray-200 rounded-2xl relative overflow-hidden group cursor-pointer">
                <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80" alt="Work 1" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ImageIcon className="text-white" size={24} />
                </div>
              </div>
              <div className="aspect-square bg-gray-200 rounded-2xl relative overflow-hidden group cursor-pointer">
                <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&q=80" alt="Work 2" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Video className="text-white" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Career Timeline */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
              <TrendingUp className="text-blue-600" /> Career Timeline
            </h3>
            
            <div className="relative border-l-2 border-blue-100 ml-3 space-y-8">
              {worker.timeline.map((item, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${idx === 0 ? 'bg-blue-600' : 'bg-blue-200'}`}></div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar size={10} /> {item.date}
                  </p>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
