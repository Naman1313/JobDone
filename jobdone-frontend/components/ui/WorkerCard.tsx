import React from 'react';
import TrustBadge from './TrustBadge';
import AvailabilityToggle from './AvailabilityToggle';
import Avatar from './Avatar';

interface WorkerCardProps {
  photo?: string;
  name: string;
  trade: string;
  rating?: number;
  trustScore: number;
  distance?: number;
  availability: 'available' | 'busy' | 'offline';
  isVerified?: boolean;
  onBook: () => void;
  onMessage?: () => void;
}

export default function WorkerCard({
  photo, name, trade, rating, trustScore, distance, availability, isVerified, onBook, onMessage
}: WorkerCardProps) {
  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex items-center space-x-4">
      <div className="relative flex-shrink-0">
        <Avatar 
            name={name || 'User'} 
            photoUrl={photo} 
            isVerified={isVerified} 
            size="lg" 
        />
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h3 className="font-headline-md text-[18px] leading-snug font-bold text-on-surface">{name}</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant capitalize">{trade}</p>
          </div>
          <TrustBadge score={trustScore} />
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col space-y-1">
            <AvailabilityToggle status={availability} />
            {distance !== undefined && (
              <span className="font-label-sm text-[10px] text-on-surface-variant">{Math.round(distance)}m away</span>
            )}
          </div>
          <div className="flex gap-2">
            {onMessage && (
              <button 
                onClick={onMessage}
                className="bg-secondary/10 hover:bg-secondary/20 text-secondary p-2 rounded-lg transition-colors active:scale-95 flex items-center justify-center border border-secondary/20"
                title="Message Worker"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
            )}
            <button 
              onClick={onBook}
              className="bg-primary hover:bg-primary-container text-on-primary px-4 py-2 rounded-lg font-label-lg shadow-sm transition-colors active:scale-95"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
