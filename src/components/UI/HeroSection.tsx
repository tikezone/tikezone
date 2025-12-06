'use client';

import React, { useState } from 'react';
import { Link } from '../../lib/safe-navigation';
import { Search, MapPin, Calendar, Sparkles, ArrowRight, Ticket, Music, Users, Zap } from 'lucide-react';

const HeroSection: React.FC = () => {
  const [searchEvent, setSearchEvent] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchDate, setSearchDate] = useState('');

  return (
    <section className="relative overflow-hidden border-b-4 border-black">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-100 via-orange-100 to-yellow-100" />
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full border-4 border-black opacity-60 animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute top-32 right-20 w-16 h-16 bg-brand-300 rounded-2xl border-4 border-black opacity-50 animate-pulse rotate-12" />
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-cyan-300 rounded-full border-3 border-black opacity-40 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-green-300 rounded-lg border-3 border-black opacity-50 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 right-10 w-14 h-14 bg-purple-300 rounded-full border-3 border-black opacity-40 animate-bounce" style={{ animationDuration: '2s' }} />
        
        <svg className="absolute -bottom-10 left-0 right-0 h-24 w-full" preserveAspectRatio="none" viewBox="0 0 1200 120">
          <path d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z" fill="currentColor" className="text-yellow-50/50" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-3 border-black rounded-full shadow-[4px_4px_0_rgba(0,0,0,1)] mb-6 animate-bounce" style={{ animationDuration: '2s' }}>
              <Sparkles size={18} className="text-yellow-500" />
              <span className="text-sm font-black uppercase tracking-wide">La billetterie #1 en Afrique</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-black text-slate-900 leading-tight mb-6">
              Tes sorties,<br />
              ton flow.<br />
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">Tes tickets</span>
                <span className="absolute -bottom-2 left-0 right-0 h-4 bg-yellow-300 -skew-x-3 -z-10" />
              </span>
              <br />
              <span className="text-3xl sm:text-4xl lg:text-5xl text-slate-600">en 3 clics.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-700 font-bold mb-8 max-w-xl mx-auto lg:mx-0">
              Découvre, réserve et scanne tes tickets d'événements partout en Côte d'Ivoire. 🇨🇮
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white border-4 border-black rounded-2xl text-lg font-black uppercase tracking-wide shadow-[6px_6px_0_rgba(0,0,0,1)] hover:shadow-[8px_8px_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200"
              >
                <Search size={22} strokeWidth={3} />
                Découvrir les événements
              </Link>
              <Link
                href="/publish"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 border-4 border-black rounded-2xl text-lg font-black uppercase tracking-wide shadow-[6px_6px_0_rgba(0,0,0,1)] hover:shadow-[8px_8px_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:bg-yellow-100 transition-all duration-200"
              >
                <Sparkles size={22} strokeWidth={3} />
                Créer mon événement
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0_rgba(0,0,0,1)] transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-4 h-4 bg-red-400 rounded-full border-2 border-black" />
                <div className="w-4 h-4 bg-yellow-400 rounded-full border-2 border-black" />
                <div className="w-4 h-4 bg-green-400 rounded-full border-2 border-black" />
                <span className="ml-auto text-xs font-black text-slate-400 uppercase">Recherche</span>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Search size={20} strokeWidth={3} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Événement ou artiste..."
                    aria-label="Rechercher un événement ou un artiste"
                    value={searchEvent}
                    onChange={(e) => setSearchEvent(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-3 border-black rounded-xl font-bold text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0_rgba(0,0,0,1)] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <MapPin size={18} strokeWidth={3} className="text-brand-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="Ville..."
                      aria-label="Ville ou lieu"
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border-3 border-black rounded-xl font-bold text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-0 focus:shadow-[3px_3px_0_rgba(0,0,0,1)] transition-all"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Calendar size={18} strokeWidth={3} className="text-purple-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="Date..."
                      aria-label="Date de l'événement"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border-3 border-black rounded-xl font-bold text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-0 focus:shadow-[3px_3px_0_rgba(0,0,0,1)] transition-all"
                    />
                  </div>
                </div>

                <Link
                  href={`/explore?q=${searchEvent}&city=${searchCity}&date=${searchDate}`}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white border-3 border-black rounded-xl font-black uppercase tracking-wide shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
                >
                  <Search size={20} strokeWidth={3} />
                  Rechercher
                  <ArrowRight size={20} strokeWidth={3} />
                </Link>
              </div>
            </div>

            <div className="hidden lg:block absolute -bottom-8 -left-8 bg-gradient-to-br from-yellow-200 to-orange-200 border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0_rgba(0,0,0,1)] transform -rotate-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl border-3 border-black flex items-center justify-center">
                  <Ticket size={24} className="text-white" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">+50K</div>
                  <div className="text-xs font-bold text-slate-600 uppercase">Tickets vendus</div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block absolute -top-4 -right-4 bg-gradient-to-br from-green-200 to-emerald-200 border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0_rgba(0,0,0,1)] transform rotate-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl border-3 border-black flex items-center justify-center">
                  <Users size={24} className="text-white" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">+200</div>
                  <div className="text-xs font-bold text-slate-600 uppercase">Organisateurs</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t-3 border-black/10">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {[
              { icon: <Music size={24} />, label: 'Concerts', color: 'from-brand-100 to-pink-100' },
              { icon: <Zap size={24} />, label: 'Festivals', color: 'from-yellow-100 to-orange-100' },
              { icon: <Users size={24} />, label: 'Soirées', color: 'from-purple-100 to-indigo-100' },
              { icon: <Sparkles size={24} />, label: 'Et plus...', color: 'from-cyan-100 to-blue-100' },
            ].map((cat, i) => (
              <Link
                key={i}
                href={`/explore?category=${cat.label.toLowerCase()}`}
                className={`flex items-center gap-3 px-5 py-3 bg-gradient-to-r ${cat.color} border-3 border-black rounded-xl font-bold text-slate-900 shadow-[3px_3px_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-all`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
