'use client';

import { useState } from 'react';
import AnnouncementBar from '../components/UI/AnnouncementBar';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import SearchBar from '../components/UI/SearchBar';
import CategoriesBar from '../components/UI/CategoriesBar';
import EventsGrid from '../components/Events/EventsGrid';
import BentoGrid from '../components/Events/BentoGrid';
import UpcomingEvents from '../components/Events/UpcomingEvents';
import EventDetail from '../components/Events/EventDetail';
import CountdownSection from '../components/UI/CountdownSection';
import { CategoryId, Event } from '../types';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSelectedEvent(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (selectedEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-pink-50 to-yellow-50 flex flex-col font-sans">
        <AnnouncementBar />
        <Header />
        <EventDetail event={selectedEvent} onBack={handleBack} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-pink-50 to-yellow-50 flex flex-col font-sans">
      <AnnouncementBar />
      <Header />

      <section className="relative z-30 min-h-[400px] sm:min-h-[450px] md:min-h-[550px] flex items-center justify-center overflow-hidden border-b-4 border-black bg-slate-900">
        <div className="absolute inset-0 w-full h-full">
          <div 
            className="absolute inset-0 opacity-40"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          ></div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] md:w-[1000px] md:h-[1000px]">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 border-[8px] sm:border-[12px] border-black shadow-[0_0_0_4px_#000,8px_8px_0_0_rgba(0,0,0,0.3)] animate-[spin_20s_linear_infinite]">
            <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 border-[6px] sm:border-[8px] border-black"></div>
            <div className="absolute inset-[35%] rounded-full bg-slate-900 border-[4px] sm:border-[6px] border-black flex items-center justify-center">
              <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-white border-2 border-black"></div>
            </div>
            <div className="absolute inset-[8%] rounded-full border-2 border-black/20"></div>
            <div className="absolute inset-[12%] rounded-full border-2 border-black/20"></div>
            <div className="absolute inset-[20%] rounded-full border-2 border-black/20"></div>
            <div className="absolute inset-[25%] rounded-full border-2 border-black/20"></div>
            <div className="absolute inset-[30%] rounded-full border-2 border-black/20"></div>
          </div>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-3xl border-4 border-black p-6 sm:p-8 md:p-10 shadow-[8px_8px_0_0_rgba(0,0,0,1)] max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black text-white mb-3 sm:mb-4 tracking-tight">
              Vivez des moments <br />
              <span className="text-yellow-400">inoubliables</span>
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-slate-200 font-bold mb-0 max-w-xl mx-auto">
              Decouvrez les meilleurs evenements autour de vous. Concerts, festivals et plus encore sur Tikezone.
            </p>
          </div>
        </div>
      </section>

      <main className="flex-grow">
        <UpcomingEvents onSelect={handleEventSelect} />

        <section className="py-8 sm:py-12 bg-gradient-to-r from-yellow-50 via-orange-50 to-pink-50 border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 font-display uppercase tracking-tight">A la une</h2>
            </div>
            <BentoGrid onSelect={handleEventSelect} />
          </div>
        </section>

        <CountdownSection onSelect={handleEventSelect} />

        <section className="py-8 sm:py-12 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-t-4 border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center px-3 py-1 bg-brand-200 border-2 border-brand-600 rounded-full text-brand-800 text-xs font-black uppercase tracking-wider mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  Agenda
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 font-display uppercase tracking-tight">Evenements a venir</h2>
              </div>
            </div>

            <div className="bg-yellow-100 border-3 border-black rounded-2xl p-3 sm:p-4 shadow-pop">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 items-center">
                <div className="lg:col-span-2">
                  <SearchBar onSearch={setSearchQuery} value={searchQuery} placeholder="Rechercher un evenement, un lieu..." />
                </div>
                <div className="lg:col-span-1">
                  <CategoriesBar activeCategory={activeCategory} onSelectCategory={setActiveCategory} compact />
                </div>
              </div>
            </div>

            <EventsGrid selectedCategory={activeCategory} searchQuery={searchQuery} onEventSelect={handleEventSelect} />
          </div>
        </section>
      </main>

      <section className="bg-gradient-to-r from-brand-100 via-orange-100 to-yellow-100 border-t-4 border-black py-8 sm:py-12 border-b-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 text-center">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-green-100 to-emerald-50 border-3 border-black rounded-2xl shadow-pop hover:-translate-y-1 hover:rotate-1 transition-all duration-200">
              <div className="text-green-600 font-black text-3xl sm:text-4xl mb-2 font-display">100%</div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg uppercase">Sécurisé</h3>
              <p className="text-slate-700 text-xs sm:text-sm mt-1 font-bold">Paiements cryptés et tickets authentifiés.</p>
            </div>
            <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-100 to-cyan-50 border-3 border-black rounded-2xl shadow-pop hover:-translate-y-1 hover:-rotate-1 transition-all duration-200">
              <div className="text-blue-600 font-black text-3xl sm:text-4xl mb-2 font-display">24/7</div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg uppercase">Support Client</h3>
              <p className="text-slate-700 text-xs sm:text-sm mt-1 font-bold">Une équipe dédiée pour vous aider.</p>
            </div>
            <div className="p-4 sm:p-6 bg-gradient-to-br from-yellow-100 to-amber-50 border-3 border-black rounded-2xl shadow-pop hover:-translate-y-1 hover:rotate-1 transition-all duration-200">
              <div className="text-orange-500 font-black text-3xl sm:text-4xl mb-2 font-display">+500</div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg uppercase">Évènements</h3>
              <p className="text-slate-700 text-xs sm:text-sm mt-1 font-bold">Le plus large choix en Afrique.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
