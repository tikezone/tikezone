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
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-500 group-focus-within:text-orange-500 transition-colors" strokeWidth={2} />
        </div>
        <input
          type="text"
          className="block w-full pl-14 pr-6 py-4 bg-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl leading-5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:bg-white/10 transition-all duration-300 text-sm font-medium"
          placeholder={placeholder || "Rechercher un evenement, un artiste..."}
          value={value}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SearchBar;