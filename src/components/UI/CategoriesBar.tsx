'use client';

import { useRef } from 'react';
import { useRouter } from '../../lib/safe-navigation';
import { Music, Globe, GlassWater, GraduationCap, Trophy, Plane, Tent, Cpu, Church, LayoutGrid } from 'lucide-react';
import { Category, CategoryId } from '../../types';

interface CategoriesBarProps {
  activeCategory: CategoryId;
  onSelectCategory?: (id: CategoryId) => void;
  compact?: boolean;
}

const categories: Category[] = [
  { id: 'all', label: 'Tout', iconName: 'grid' },
  { id: 'concert', label: 'Concert', iconName: 'music' },
  { id: 'culture', label: 'Culture', iconName: 'globe' },
  { id: 'soiree', label: 'Soiree', iconName: 'party' },
  { id: 'formation', label: 'Formation', iconName: 'learn' },
  { id: 'sport', label: 'Sport', iconName: 'trophy' },
  { id: 'tourisme', label: 'Tourisme', iconName: 'plane' },
  { id: 'festival', label: 'Festival', iconName: 'tent' },
  { id: 'science', label: 'Science', iconName: 'science' },
  { id: 'religieux', label: 'Religieux', iconName: 'church' },
];

const getIcon = (name: string, size: number) => {
  switch (name) {
    case 'music':
      return <Music size={size} strokeWidth={2} />;
    case 'globe':
      return <Globe size={size} strokeWidth={2} />;
    case 'party':
      return <GlassWater size={size} strokeWidth={2} />;
    case 'learn':
      return <GraduationCap size={size} strokeWidth={2} />;
    case 'trophy':
      return <Trophy size={size} strokeWidth={2} />;
    case 'plane':
      return <Plane size={size} strokeWidth={2} />;
    case 'tent':
      return <Tent size={size} strokeWidth={2} />;
    case 'science':
      return <Cpu size={size} strokeWidth={2} />;
    case 'church':
      return <Church size={size} strokeWidth={2} />;
    default:
      return <LayoutGrid size={size} strokeWidth={2} />;
  }
};

const CategoriesBar: React.FC<CategoriesBarProps> = ({ activeCategory, onSelectCategory, compact }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleCategoryClick = (id: CategoryId) => {
    if (onSelectCategory) {
      onSelectCategory(id);
    } else {
      router.push(id === 'all' ? '/' : `/?category=${id}`);
    }
  };

  return (
    <div className="w-full">
      <div
        ref={scrollRef}
        className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`
                flex items-center whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-glow'
                    : 'bg-white/5 backdrop-blur-xl border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                }
                hover:scale-105 active:scale-95
              `}
            >
              <span className="mr-2">{getIcon(cat.iconName, 16)}</span>
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesBar;