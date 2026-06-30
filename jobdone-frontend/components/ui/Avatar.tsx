import React from 'react';

interface AvatarProps {
  name: string;
  photoUrl?: string;
  isVerified?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Avatar({ name, photoUrl, isVerified, size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-24 h-24 text-4xl border-4 border-white',
  };

  const badgeClasses = {
    sm: 'w-3 h-3 text-[6px]',
    md: 'w-4 h-4 text-[8px]',
    lg: 'w-5 h-5 text-[10px]',
    xl: 'w-7 h-7 text-[12px] border-2 border-white',
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      <div className={`${sizeClasses[size]} bg-primary-container rounded-full flex items-center justify-center text-on-primary-container font-bold overflow-hidden shadow-sm`}>
        {photoUrl && photoUrl.trim() !== '' ? (
          <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{name?.charAt(0)?.toUpperCase() || 'U'}</span>
        )}
      </div>

      {isVerified && (
        <div className={`absolute bottom-0 right-0 ${badgeClasses[size]} bg-status-gold text-white rounded-full flex items-center justify-center shadow-md border-white ${size !== 'xl' ? 'border' : ''} z-10`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3/4 h-3/4">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}
