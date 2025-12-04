
'use client';

import React from 'react';
import { 
  Music, LayoutGrid, GraduationCap, Trophy, Globe, Ticket, Tent, Microscope, 
  Theater, BookOpen, Utensils, Briefcase, Palette, Baby, Gamepad2, Coffee, 
  Sun, Heart, UserCheck, Star
} from 'lucide-react';

const CATEGORIES = [
  // Official TIKEZONE Types
  { id: 'concert', label: 'Concert', icon: Music, color: 'bg-pink-300' },
  { id: 'soiree', label: 'Soirée', icon: LayoutGrid, color: 'bg-purple-300' },
  { id: 'formation', label: 'Formation', icon: GraduationCap, color: 'bg-blue-300' },
  { id: 'sport', label: 'Sport', icon: Trophy, color: 'bg-orange-300' },
  { id: 'tourisme', label: 'Tourisme', icon: Globe, color: 'bg-green-300' },
  { id: 'festival', label: 'Festival', icon: Tent, color: 'bg-yellow-300' },
  { id: 'science', label: 'Science', icon: Microscope, color: 'bg-cyan-300' },
  { id: 'culture', label: 'Culture', icon: Theater, color: 'bg-red-300' },
  { id: 'religieux', label: 'Religieux', icon: BookOpen, color: 'bg-indigo-300' },
  { id: 'autre', label: 'Autre', icon: Ticket, color: 'bg-slate-300' },
  
  // International Types (Extended)
  { id: 'food', label: 'Gastronomie', icon: Utensils, color: 'bg-orange-200' },
  { id: 'business', label: 'Business', icon: Briefcase, color: 'bg-slate-400' },
  { id: 'mode', label: 'Mode', icon: Palette, color: 'bg-pink-200' },
  { id: 'famille', label: 'Famille', icon: Baby, color: 'bg-green-200' },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, color: 'bg-violet-400' },
  { id: 'afterwork', label: 'Afterwork', icon: Coffee, color: 'bg-amber-200' },
  { id: 'beach', label: 'Beach Party', icon: Sun, color: 'bg-yellow-200' },
  { id: 'charity', label: 'Caritatif', icon: Heart, color: 'bg-red-200' },
  { id: 'expo', label: 'Exposition', icon: Star, color: 'bg-teal-200' },
  { id: 'masterclass', label: 'Masterclass', icon: UserCheck, color: 'bg-blue-200' },
];

const CategorySelection = ({ 
  selected, 
  onSelect 
}: { 
  selected: string, 
  onSelect: (id: string) => void 
}) => (
  <div className="space-y-6 animate-in slide-in-from-right duration-500 h-full flex flex-col">
    <div className="text-center mb-4 flex-shrink-0">
      <h3 className="text-2xl font-black font-display text-slate-900 mb-2">Quel type d'événement ?</h3>
      <p className="text-slate-500 font-bold text-sm">Choisissez la catégorie qui correspond le mieux.</p>
    </div>
    
    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-4">
        {CATEGORIES.map((cat) => {
            const isSelected = selected === cat.id;
            return (
            <button
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                type="button"
                className={`
                p-3 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 group
                ${isSelected 
                    ? `border-black ${cat.color} shadow-pop scale-[1.02]` 
                    : 'border-slate-200 bg-white hover:border-black hover:shadow-pop-sm'}
                `}
            >
                <div className={`w-10 h-10 rounded-full border-2 border-black flex items-center justify-center bg-white shadow-sm group-hover:scale-110 transition-transform`}>
                <cat.icon size={20} className="text-black" strokeWidth={2.5} />
                </div>
                <span className={`font-black text-xs uppercase leading-tight ${isSelected ? 'text-black' : 'text-slate-600'}`}>
                {cat.label}
                </span>
            </button>
            );
        })}
        </div>
    </div>
  </div>
);

export default CategorySelection;
