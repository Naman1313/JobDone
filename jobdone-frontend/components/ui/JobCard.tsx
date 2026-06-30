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
    <div className="bg-surface-container-lowest p-5 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-headline-md text-[18px] leading-snug font-bold text-on-surface">{title}</h3>
        {urgency === 'emergency' && (
          <span className="bg-error-container text-on-error-container font-label-sm px-2 py-1 rounded-md ml-2 flex-shrink-0 uppercase tracking-widest">
            Urgent
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-surface-warm border border-border-subtle text-on-surface-variant font-label-sm px-3 py-1 rounded-full capitalize">
          {trade}
        </span>
        {distance !== undefined && (
          <span className="bg-surface-container text-on-surface-variant font-label-sm px-3 py-1 rounded-full">
            {Math.round(distance)}m away
          </span>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-auto pt-4 border-t border-border-subtle">
        <div className="text-on-surface font-headline-md font-bold">
          ₹{budget}
        </div>
        <button 
          onClick={onApply}
          className="bg-primary text-on-primary font-label-lg px-6 py-3 rounded-lg shadow-sm hover:bg-primary-container active:scale-95 transition-all"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
