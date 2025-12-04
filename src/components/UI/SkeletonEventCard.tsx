import React from 'react';

const SkeletonEventCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 h-full animate-pulse">
      {/* Image Skeleton */}
      <div className="h-48 bg-slate-200 w-full"></div>
      
      <div className="p-5 space-y-4">
        {/* Date & Category */}
        <div className="flex justify-between items-center">
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
          <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
          <div className="h-6 w-1/2 bg-slate-200 rounded"></div>
        </div>

        {/* Location */}
        <div className="h-4 w-1/2 bg-slate-200 rounded"></div>

        {/* Price & Button */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-50 mt-4">
          <div className="h-5 w-20 bg-slate-200 rounded"></div>
          <div className="h-10 w-28 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonEventCard;