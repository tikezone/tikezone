import React from 'react';

const SkeletonEventCard: React.FC = () => {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden h-full animate-pulse">
      <div className="h-48 bg-white/10 w-full" />
      
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 w-24 bg-white/10 rounded-full" />
          <div className="h-6 w-16 bg-white/10 rounded-full" />
        </div>

        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-white/10 rounded-full" />
          <div className="h-5 w-1/2 bg-white/10 rounded-full" />
        </div>

        <div className="h-4 w-1/2 bg-white/10 rounded-full" />

        <div className="pt-4 flex items-center justify-between border-t border-white/10 mt-4">
          <div className="h-5 w-20 bg-white/10 rounded-full" />
          <div className="h-10 w-10 bg-white/10 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonEventCard;