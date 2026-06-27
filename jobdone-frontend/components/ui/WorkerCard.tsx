import React from 'react';
import TrustBadge from './TrustBadge';
import AvailabilityToggle from './AvailabilityToggle';

interface WorkerCardProps {
  photo?: string;
  name: string;
  trade: string;
  rating?: number;
  trustScore: number;
  distance?: number;
  availability: 'available' | 'busy' | 'offline';
  onBook: () => void;
}

export default function WorkerCard({
  photo, name, trade, rating, trustScore, distance, availability, onBook
}: WorkerCardProps) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className="relative w-16 h-16 rounded-full bg-gray-200 flex-shrink-0">
        {photo ? (
          <img src={photo} alt={name} className="w-full h-full object-cover rounded-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xl rounded-full">
            {name[0]}
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-gray-900 leading-tight">{name}</h3>
            <p className="text-sm text-gray-500 capitalize">{trade}</p>
          </div>
          <TrustBadge score={trustScore} />
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col space-y-1">
            <AvailabilityToggle status={availability} />
            {distance !== undefined && (
              <span className="text-xs text-gray-400">{Math.round(distance)}m away</span>
            )}
          </div>
          <button 
            onClick={onBook}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
