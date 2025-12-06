
'use client';

import React from 'react';
import { 
  Music, LayoutGrid, GraduationCap, Trophy, Globe, Ticket, Tent, Microscope, 
  Theater, BookOpen, Utensils, Briefcase, Palette, Baby, Gamepad2, Coffee, 
  Sun, Heart, UserCheck, Star
} from 'lucide-react';

const CATEGORIES = [
  { id: 'concert', label: 'Concert', icon: Music, color: 'from-pink-500/30 to-pink-600/10' },
  { id: 'soiree', label: 'Soirée', icon: LayoutGrid, color: 'from-purple-500/30 to-purple-600/10' },
  { id: 'formation', label: 'Formation', icon: GraduationCap, color: 'from-blue-500/30 to-blue-600/10' },
  { id: 'sport', label: 'Sport', icon: Trophy, color: 'from-orange-500/30 to-orange-600/10' },
  { id: 'tourisme', label: 'Tourisme', icon: Globe, color: 'from-green-500/30 to-green-600/10' },
  { id: 'festival', label: 'Festival', icon: Tent, color: 'from-yellow-500/30 to-yellow-600/10' },
  { id: 'science', label: 'Science', icon: Microscope, color: 'from-cyan-500/30 to-cyan-600/10' },
  { id: 'culture', label: 'Culture', icon: Theater, color: 'from-red-500/30 to-red-600/10' },
  { id: 'religieux', label: 'Religieux', icon: BookOpen, color: 'from-indigo-500/30 to-indigo-600/10' },
  { id: 'autre', label: 'Autre', icon: Ticket, color: 'from-gray-500/30 to-gray-600/10' },
  { id: 'food', label: 'Gastronomie', icon: Utensils, color: 'from-orange-400/30 to-orange-500/10' },
  { id: 'business', label: 'Business', icon: Briefcase, color: 'from-slate-500/30 to-slate-600/10' },
  { id: 'mode', label: 'Mode', icon: Palette, color: 'from-pink-400/30 to-pink-500/10' },
  { id: 'famille', label: 'Famille', icon: Baby, color: 'from-green-400/30 to-green-500/10' },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, color: 'from-violet-500/30 to-violet-600/10' },
  { id: 'afterwork', label: 'Afterwork', icon: Coffee, color: 'from-amber-500/30 to-amber-600/10' },
  { id: 'beach', label: 'Beach Party', icon: Sun, color: 'from-yellow-400/30 to-yellow-500/10' },
  { id: 'charity', label: 'Caritatif', icon: Heart, color: 'from-red-400/30 to-red-500/10' },
  { id: 'expo', label: 'Exposition', icon: Star, color: 'from-teal-500/30 to-teal-600/10' },
  { id: 'masterclass', label: 'Masterclass', icon: UserCheck, color: 'from-blue-400/30 to-blue-500/10' },
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
      <h3 className="text-2xl font-black font-display text-white mb-2">Quel type d'événement ?</h3>
      <p className="text-gray-400 font-bold text-sm">Choisissez la catégorie qui correspond le mieux.</p>
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
                p-3 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 group backdrop-blur-xl
                ${isSelected 
                    ? `border-orange-500/50 bg-gradient-to-br ${cat.color} shadow-lg shadow-orange-500/20 scale-[1.02]` 
                    : 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/15'}
                `}
            >
                <div className={`w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-md group-hover:scale-110 transition-transform ${isSelected ? 'bg-white/20' : ''}`}>
                <cat.icon size={20} className="text-white" strokeWidth={2.5} />
                </div>
                <span className={`font-black text-xs uppercase leading-tight ${isSelected ? 'text-white' : 'text-gray-400'}`}>
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
