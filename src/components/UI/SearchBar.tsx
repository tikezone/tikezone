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
    <div className="relative w-full">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-white/40 group-focus-within:text-brand-400 transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl leading-5 text-white placeholder-white/40 focus:outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all duration-300 text-sm font-medium"
          placeholder={placeholder || "Rechercher un evenement, un artiste..."}
          value={value}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SearchBar;
