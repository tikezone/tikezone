
'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  value?: string;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, value, placeholder }) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto z-30">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-black transition-colors" strokeWidth={3} />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-6 py-4 bg-white border-2 border-black rounded-full leading-5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-black shadow-pop transition-all text-sm sm:text-base font-bold hover:-translate-y-1 hover:shadow-pop-lg focus:-translate-y-1 focus:shadow-pop-lg"
          placeholder={placeholder || "Rechercher un evenement, un artiste..."}
          value={value}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SearchBar;
