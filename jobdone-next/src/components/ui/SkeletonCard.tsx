export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden mb-6 animate-pulse">
      <div className="flex items-center p-4 space-x-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
      <div className="px-4 pb-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="w-full aspect-square bg-gray-200"></div>
      <div className="p-4 flex items-center justify-between">
        <div className="flex space-x-4">
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
        </div>
        <div className="w-24 h-10 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
}
