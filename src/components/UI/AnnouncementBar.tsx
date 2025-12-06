'use client';

import React, { useEffect, useState } from 'react';

interface Announcement {
  id: number;
  text: string;
  color: string;
}

const AnnouncementBar: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/announcements');
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data.announcements || []);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };
    fetchAnnouncements();
  }, []);

  if (announcements.length === 0) {
    return null;
  }

  const getColorClass = (color: string) => {
    return color === 'orange' ? 'text-orange-400' : 'text-white';
  };

  return (
    <div className="relative w-full z-30 h-10 bg-black border-y border-white/10 flex items-center overflow-hidden select-none">
      <div className="animate-marquee whitespace-nowrap flex items-center gap-16 min-w-full">
        {announcements.map((ann, idx) => (
          <span key={ann.id} className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${getColorClass(ann.color)}`}>
            {idx === 0 ? '⚡' : '•'} {ann.text}
          </span>
        ))}
        {announcements.map((ann, idx) => (
          <span key={`dup-${ann.id}`} className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${getColorClass(ann.color)}`}>
            {idx === 0 ? '⚡' : '•'} {ann.text}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AnnouncementBar;
