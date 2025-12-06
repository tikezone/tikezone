'use client';

import React from 'react';
import { Tag, Sparkles, Zap, Ticket, Star } from 'lucide-react';

const AnnouncementBar: React.FC = () => {
  const announcements = [
    { text: "Bienvenue sur TIKEZONE, la billetterie #1 en Afrique !", icon: <Zap size={16} className="mr-2 text-black fill-yellow-400" />, emoji: '🎉' },
    { text: "Concert Fally Ipupa : Derniers tickets disponibles !", icon: <Ticket size={16} className="mr-2 text-black fill-brand-400" />, emoji: '🎤' },
    { text: "-20% sur tous les festivals avec le code TIKE20", icon: <Tag size={16} className="mr-2 text-black fill-cyan-400" />, emoji: '🔥' },
    { text: "Nouveau : Payez en 3x sans frais", icon: <Sparkles size={16} className="mr-2 text-black fill-yellow-400" />, emoji: '✨' },
  ];

  const content = [...announcements, ...announcements, ...announcements];

  return (
    <div className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 text-black text-xs sm:text-sm py-3 overflow-hidden relative z-[60] border-b-3 border-black font-bold tracking-wide">
      <div className="flex animate-marquee whitespace-nowrap">
        {content.map((item, index) => (
          <div key={index} className="flex items-center mx-6 sm:mx-10">
            <span className="mr-2 text-base">{item.emoji}</span>
            {item.icon}
            <span className="uppercase font-black">{item.text}</span>
            <Star size={12} className="ml-3 text-black fill-white" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBar;
