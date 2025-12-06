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
import AnnouncementBar from '../components/UI/AnnouncementBar';
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

        <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden">
          {/* Video Background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/tikezone.mp4" type="video/mp4" />
          </video>

          {/* Overlay: Dark veil */}
          <div className="absolute inset-0 bg-black/40 z-[1]" />
          
          {/* Overlay: Gradient top to bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black z-[2]" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6">
            {/* Main Title - Massive */}
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter drop-shadow-2xl mb-6 animate-fade-in-up">
              <span className="text-white">TIKE</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">ZONE</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-200 font-light mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Vivez des moments inoubliables. Découvrez les meilleurs événements autour de vous.
            </p>
            
            {/* CTA Button */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <button className="px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-full text-lg shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all duration-300 ease-out border border-orange-400/30">
                Découvrir les événements
              </button>
            </div>
          </div>

          {/* Bottom fade to black */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-[3]" />
        </section>

        <AnnouncementBar />

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