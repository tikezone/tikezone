import React from 'react';

const AnnouncementBar: React.FC = () => {
  return (
    <div className="relative w-full z-30 h-10 bg-black border-y border-white/10 flex items-center overflow-hidden select-none">
      <div className="animate-marquee whitespace-nowrap flex items-center gap-16 min-w-full">
        <span className="text-sm font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2">
          ⚡ Flash: -20% sur le concert Magic System ! 🇨🇮
        </span>
        <span className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
          • Nouveau : Payez avec Wave & Orange Money 💸
        </span>
        <span className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
          • Tickets bientôt épuisés pour la Finale CAN ! ⚽️
        </span>
        <span className="text-sm font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2">
          • TIKEZONE : Le N°1 du Ticket en Côte d'Ivoire 🔥
        </span>
        <span className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
          • Info : Parking VIP disponible au Sofitel 🚗
        </span>

        {/* Duplication pour la boucle infinie fluide */}
        <span className="text-sm font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2">
          ⚡ Flash: -20% sur le concert Magic System ! 🇨🇮
        </span>
        <span className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
          • Nouveau : Payez avec Wave & Orange Money 💸
        </span>
        <span className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
          • Tickets bientôt épuisés pour la Finale CAN ! ⚽️
        </span>
        <span className="text-sm font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2">
          • TIKEZONE : Le N°1 du Ticket en Côte d'Ivoire 🔥
        </span>
        <span className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
          • Info : Parking VIP disponible au Sofitel 🚗
        </span>
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
