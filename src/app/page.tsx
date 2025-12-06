'use client';

import { useState } from 'react';
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
      <div className="min-h-screen bg-black flex flex-col font-sans">
        <Header />
        <EventDetail event={selectedEvent} onBack={handleBack} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black pointer-events-none" />
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      
      <div className="relative z-10">
        <Header />

        <section className="relative h-[60vh] sm:h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover scale-105"
            >
              <source src="/tikezone.mp4" type="video/mp4" />
            </video>
          </div>

          <div className="relative z-20 max-w-4xl mx-auto px-6 text-center w-full">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
              Vivez des moments{' '}
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                inoubliables
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
              Decouvrez les meilleurs evenements autour de vous
            </p>
            
            <div className="flex justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-full text-lg shadow-glow hover:shadow-glow-lg hover:scale-105 active:scale-95 transition-all duration-300 ease-out">
                Decouvrir les evenements
              </button>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-20" />
        </section>

        <main className="flex-grow relative">
          <UpcomingEvents onSelect={handleEventSelect} />

          <section className="py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <BentoGrid onSelect={handleEventSelect} />
            </div>
          </section>

          <CountdownSection onSelect={handleEventSelect} />

          <section className="py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 sm:p-6 shadow-glass">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
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

        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="group p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-glass hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-300 ease-out text-center">
                <div className="text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-3">100%</div>
                <h3 className="font-bold text-white text-lg mb-2">Securise</h3>
                <p className="text-gray-400 text-sm">Paiements cryptes et tickets authentifies</p>
              </div>
              <div className="group p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-glass hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-300 ease-out text-center">
                <div className="text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent mb-3">24/7</div>
                <h3 className="font-bold text-white text-lg mb-2">Support Client</h3>
                <p className="text-gray-400 text-sm">Une equipe dediee pour vous aider</p>
              </div>
              <div className="group p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-glass hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-300 ease-out text-center">
                <div className="text-5xl font-black bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent mb-3">+500</div>
                <h3 className="font-bold text-white text-lg mb-2">Evenements</h3>
                <p className="text-gray-400 text-sm">Le plus large choix en Afrique</p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}