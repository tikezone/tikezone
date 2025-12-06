'use client';

import { useState } from 'react';
import { Link } from '../lib/safe-navigation';
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
import HeroSection from '../components/UI/HeroSection';
import HowItWorks from '../components/UI/HowItWorks';
import ForOrganizers from '../components/UI/ForOrganizers';
import TrustSecurity from '../components/UI/TrustSecurity';
import MobileExperience from '../components/UI/MobileExperience';
import Testimonials from '../components/UI/Testimonials';
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
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 flex flex-col font-sans">
        <AnnouncementBar />
        <Header />
        <EventDetail event={selectedEvent} onBack={handleBack} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 flex flex-col font-sans">
      <AnnouncementBar />
      <Header />
      
      <HeroSection />

      <main className="flex-grow">
        <section className="py-10 sm:py-16 bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="inline-flex items-center px-4 py-1.5 bg-gradient-to-r from-brand-100 to-orange-100 border-3 border-black rounded-full text-brand-700 text-xs font-black uppercase tracking-wider mb-3 shadow-[3px_3px_0_rgba(0,0,0,1)]">
                🔥 Les événements à ne pas manquer
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-display">
                Explorer les événements
              </h2>
            </div>

            <div className="bg-white border-4 border-black rounded-3xl p-4 sm:p-6 shadow-[6px_6px_0_rgba(0,0,0,1)] mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                <div className="lg:col-span-3">
                  <SearchBar onSearch={setSearchQuery} value={searchQuery} placeholder="Rechercher un événement, un artiste..." />
                </div>
                <div className="lg:col-span-1">
                  <CategoriesBar activeCategory={activeCategory} onSelectCategory={setActiveCategory} compact />
                </div>
              </div>
            </div>

            <EventsGrid selectedCategory={activeCategory} searchQuery={searchQuery} onEventSelect={handleEventSelect} />
          </div>
        </section>

        <UpcomingEvents onSelect={handleEventSelect} />

        <section className="py-10 sm:py-16 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="inline-flex items-center px-4 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 border-3 border-black rounded-full text-purple-700 text-xs font-black uppercase tracking-wider mb-3 shadow-[3px_3px_0_rgba(0,0,0,1)]">
                ⭐ À la une
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">
                Les temps forts
              </h2>
            </div>
            <BentoGrid onSelect={handleEventSelect} />
          </div>
        </section>

        <CountdownSection onSelect={handleEventSelect} />

        <HowItWorks />

        <ForOrganizers />

        <TrustSecurity />

        <MobileExperience />

        <Testimonials />
      </main>

      <Footer />
    </div>
  );
}
