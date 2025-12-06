'use client';

import React, { useState } from 'react';
import { Search, MapPin, Calendar } from 'lucide-react';

interface HeroSearchBarProps {
  onSearch: (query: string, city: string, date: string) => void;
}

const HeroSearchBar: React.FC<HeroSearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, city, date);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="bg-white border-3 border-black rounded-3xl shadow-pop-lg p-2 sm:p-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3">
          <div className="sm:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" strokeWidth={2.5} />
            </div>
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3 sm:py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-sm font-bold"
              placeholder="Evenement, artiste..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="sm:col-span-3 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-slate-400" strokeWidth={2.5} />
            </div>
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3 sm:py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-sm font-bold"
              placeholder="Ville"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="sm:col-span-3 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-slate-400" strokeWidth={2.5} />
            </div>
            <input
              type="date"
              className="w-full pl-12 pr-4 py-3 sm:py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-sm font-bold"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="sm:col-span-1">
            <button
              type="submit"
              className="w-full h-full min-h-[48px] bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-2xl border-2 border-black shadow-cartoon hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 flex items-center justify-center group"
            >
              <Search className="h-5 w-5 group-hover:scale-110 transition-transform" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default HeroSearchBar;
