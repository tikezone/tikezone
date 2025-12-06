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
      <Header />

      <section className="relative z-30 h-[350px] sm:h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden border-b-4 border-black">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div
            className="absolute inset-0 z-10 opacity-20"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '4px 4px' }}
          ></div>

          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/tikezone.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-black text-white mb-4 sm:mb-6 tracking-tight drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
            Vivez des moments <br />
            <span className="text-yellow-400 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">inoubliables</span>
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-white font-bold mb-6 sm:mb-10 max-w-2xl mx-auto drop-shadow-[2px_2px_0_rgba(0,0,0,1)] px-2">
            Decouvrez les meilleurs evenements autour de vous. Concerts, festivals et plus encore sur Tikezone.
          </p>
        </div>
      </section>

      <AnnouncementBar />

      <main className="flex-grow">
        <UpcomingEvents onSelect={handleEventSelect} />

        <section className="py-8 sm:py-12 bg-gradient-to-r from-yellow-50 via-orange-50 to-pink-50 border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <BentoGrid onSelect={handleEventSelect} />
          </div>
        </section>

        <CountdownSection onSelect={handleEventSelect} />

        <section className="py-8 sm:py-12 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-t-4 border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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
