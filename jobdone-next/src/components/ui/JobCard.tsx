import React from 'react';

interface JobCardProps {
  title: string;
  trade: string;
  budget: number;
  distance?: number;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  onApply: () => void;
}

export default function JobCard({ title, trade, budget, distance, urgency, onApply }: JobCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-900 text-lg leading-tight">{title}</h3>
        {urgency === 'emergency' && (
          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-md ml-2 flex-shrink-0 uppercase">
            Urgent
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-md font-medium capitalize">
          {trade}
        </span>
        {distance !== undefined && (
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium">
            {Math.round(distance)}m away
          </span>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-auto pt-3 border-t">
        <div className="text-gray-900 font-black text-xl">
          ₹{budget}
        </div>
        <button 
          onClick={onApply}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-xl transition-colors shadow-sm active:scale-95"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
