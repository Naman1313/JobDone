import React from 'react';

interface MediaGridProps {
  mediaUrls: string[];
}

export default function MediaGrid({ mediaUrls }: MediaGridProps) {
  if (!mediaUrls || mediaUrls.length === 0) {
    return <div className="text-center p-4 bg-gray-50 text-gray-400 rounded-xl text-sm">No media uploaded</div>;
  }

  // Layout based on count
  if (mediaUrls.length === 1) {
    return (
      <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100">
        <img src={mediaUrls[0]} alt="Media" className="w-full h-full object-cover" />
      </div>
    );
  }

  if (mediaUrls.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-2 h-48">
        <img src={mediaUrls[0]} alt="Media 1" className="w-full h-full object-cover rounded-l-xl" />
        <img src={mediaUrls[1]} alt="Media 2" className="w-full h-full object-cover rounded-r-xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 h-48">
      <img src={mediaUrls[0]} alt="Media 1" className="w-full h-full object-cover col-span-2 row-span-2 rounded-l-xl" />
      <img src={mediaUrls[1]} alt="Media 2" className="w-full h-full object-cover rounded-tr-xl" />
      {mediaUrls.length > 2 && (
        <div className="relative">
          <img src={mediaUrls[2]} alt="Media 3" className="w-full h-full object-cover rounded-br-xl" />
          {mediaUrls.length > 3 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold rounded-br-xl">
              +{mediaUrls.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
