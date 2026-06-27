import React from 'react';

interface AvailabilityToggleProps {
  status: 'available' | 'busy' | 'offline';
}

export default function AvailabilityToggle({ status }: AvailabilityToggleProps) {
  const colorMap = {
    available: 'bg-green-500',
    busy: 'bg-yellow-500',
    offline: 'bg-gray-400'
  };

  return (
    <div className="flex items-center space-x-1.5">
      <div className={`w-2.5 h-2.5 rounded-full ${colorMap[status]} shadow-sm`} />
      <span className="text-xs font-medium text-gray-600 capitalize">{status}</span>
    </div>
  );
}
