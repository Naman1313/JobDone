import React from 'react';
import { MoreHorizontal, Bot, MapPin, Clock, Banknote, Navigation, Users, ArrowRight, Send, MessageSquare, Bookmark, Share2, CheckCircle } from 'lucide-react';

interface JobCardProps {
  title: string;
  description: string;
  trade: string;
  budget: string | number;
  duration?: string;
  location?: string;
  distance?: string | number;
  applicantsCount?: number;
  aiMatchScore?: number;
  company: {
    name: string;
    logo?: string;
    isVerified?: boolean;
  };
  createdAt: string;
  onApply: () => void;
}

export default function JobCard({ 
  title, 
  description, 
  trade, 
  budget, 
  duration = "1 day",
  location = "Mumbai, MH",
  distance, 
  applicantsCount = 84,
  aiMatchScore = 99,
  company, 
  createdAt, 
  onApply 
}: JobCardProps) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow mb-4">
      
      {/* Header: Company & Meta */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-400 font-bold text-lg">{company.name.charAt(0)}</div>
            )}
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-1 leading-tight">
              {company.name}
              {company.isVerified !== false && <CheckCircle size={14} className="text-blue-500 fill-blue-500/20" />}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 font-medium">
              <span className="uppercase">{createdAt}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-sm font-semibold">{trade}</span>
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-1">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Title & AI Match */}
      <div className="mb-3">
        <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">{title}</h2>
        {aiMatchScore && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-blue-100 rounded-lg text-blue-600 text-sm font-bold shadow-sm">
            <Bot size={16} />
            {aiMatchScore}% AI Match
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-2">
        {description}
      </p>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Budget */}
        <div className="bg-gray-50/80 rounded-xl p-3 flex items-start gap-3">
          <div className="text-green-600 mt-0.5 shrink-0"><Banknote size={18} /></div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Budget</div>
            <div className="text-sm font-bold text-gray-900">{typeof budget === 'number' ? `₹${budget.toLocaleString()}` : budget}</div>
          </div>
        </div>
        {/* Duration */}
        <div className="bg-gray-50/80 rounded-xl p-3 flex items-start gap-3">
          <div className="text-orange-500 mt-0.5 shrink-0"><Clock size={18} /></div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Duration</div>
            <div className="text-sm font-bold text-gray-900">{duration}</div>
          </div>
        </div>
        {/* Location */}
        <div className="bg-gray-50/80 rounded-xl p-3 flex items-start gap-3">
          <div className="text-blue-500 mt-0.5 shrink-0"><MapPin size={18} /></div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Location</div>
            <div className="text-sm font-bold text-gray-900">{location}</div>
          </div>
        </div>
        {/* Distance */}
        <div className="bg-gray-50/80 rounded-xl p-3 flex items-start gap-3">
          <div className="text-purple-500 mt-0.5 shrink-0"><Navigation size={18} /></div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Distance</div>
            <div className="text-sm font-bold text-gray-900">{distance ? `${distance}km away` : 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Footer Top: Applicants & View Client */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold">
          <Users size={16} />
          {applicantsCount} APPLICANTS
        </div>
        <button className="flex items-center gap-1 text-blue-700 text-sm font-bold hover:text-blue-800 transition-colors">
          VIEW CLIENT <ArrowRight size={16} />
        </button>
      </div>

      {/* Footer Bottom: Actions */}
      <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
        <button 
          onClick={onApply}
          className="flex-1 bg-[#0a66c2] hover:bg-[#004182] text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
        >
          <Send size={18} className="rotate-45 -mt-1" /> Apply Now
        </button>
        <button className="w-12 h-12 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
          <MessageSquare size={20} />
        </button>
        <button className="w-12 h-12 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors">
          <Bookmark size={20} />
        </button>
        <button className="w-12 h-12 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors">
          <Share2 size={20} />
        </button>
      </div>

    </div>
  );
}
