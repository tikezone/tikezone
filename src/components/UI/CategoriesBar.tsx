
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
      return <Music size={size} strokeWidth={2.5} />;
    case 'globe':
      return <Globe size={size} strokeWidth={2.5} />;
    case 'party':
      return <GlassWater size={size} strokeWidth={2.5} />;
    case 'learn':
      return <GraduationCap size={size} strokeWidth={2.5} />;
    case 'trophy':
      return <Trophy size={size} strokeWidth={2.5} />;
    case 'plane':
      return <Plane size={size} strokeWidth={2.5} />;
    case 'tent':
      return <Tent size={size} strokeWidth={2.5} />;
    case 'science':
      return <Cpu size={size} strokeWidth={2.5} />;
    case 'church':
      return <Church size={size} strokeWidth={2.5} />;
    default:
      return <LayoutGrid size={size} strokeWidth={2.5} />;
  }
};

const CategoriesBar: React.FC<CategoriesBarProps> = ({ activeCategory, onSelectCategory, compact }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleCategoryClick = (id: CategoryId) => {
    if (onSelectCategory) {
      onSelectCategory(id);
    } else {
      router.push(id === 'all' ? '/explore' : `/explore?category=${id}`);
    }
  };

  return (
    <div
      className={`w-full transition-all duration-300 ${
        compact ? 'bg-transparent' : 'border-b-2 border-black bg-yellow-50 sticky top-16 z-40 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={scrollRef}
          className={`flex items-center space-x-3 overflow-x-auto no-scrollbar ${compact ? 'py-2' : 'py-4'}`}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`
                  flex items-center whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border-2 border-black
                  ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-none translate-x-[2px] translate-y-[2px]'
                      : 'bg-white text-slate-900 shadow-pop-sm hover:-translate-y-0.5 hover:shadow-pop hover:bg-white'
                  }
                `}
              >
                <span className={`mr-2 ${isActive ? 'text-white' : 'text-slate-900'}`}>{getIcon(cat.iconName, 18)}</span>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoriesBar;
