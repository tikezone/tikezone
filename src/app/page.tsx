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
import HeroSearchBar from '../components/UI/HeroSearchBar';
import { Shield, Headphones, Zap, QrCode, Lock, Users, Ticket, PartyPopper, Music, Star } from 'lucide-react';
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

  const handleHeroSearch = (query: string, city: string, date: string) => {
    let combined = query;
    if (city) combined += ` ${city}`;
    setSearchQuery(combined);
    const eventsSection = document.getElementById('events-section');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (selectedEvent) {
    return (
      <div className="min-h-screen bg-cartoon-cream flex flex-col font-sans">
        <Header />
        <EventDetail event={selectedEvent} onBack={handleBack} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cartoon-cream flex flex-col font-sans">
      <Header />

      <section className="relative min-h-[500px] sm:min-h-[550px] md:min-h-[600px] flex items-center justify-center overflow-hidden border-b-3 border-black bg-gradient-to-br from-brand-500 via-brand-600 to-purple-700">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 z-10"></div>
          <div
            className="absolute inset-0 z-5 opacity-10"
            style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
          ></div>
          
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          >
            <source src="/tikezone.mp4" type="video/mp4" />
          </video>

          <div className="absolute top-10 left-10 w-20 h-20 bg-cartoon-yellow rounded-full border-3 border-black opacity-60 animate-float"></div>
          <div className="absolute bottom-20 right-10 w-16 h-16 bg-cartoon-pink rounded-full border-3 border-black opacity-50 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-cartoon-green rounded-full border-2 border-black opacity-40 animate-float" style={{ animationDelay: '0.5s' }}></div>
        </div>

        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full py-12">
          <div className="inline-flex items-center px-4 py-2 bg-cartoon-yellow border-2 border-black rounded-full text-black text-xs sm:text-sm font-black uppercase tracking-wider mb-6 shadow-cartoon animate-bounce-slow">
            <PartyPopper className="w-4 h-4 mr-2" />
            La billetterie #1 en Afrique
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black text-white mb-4 sm:mb-6 tracking-tight leading-tight">
            Trouvez votre <br className="hidden sm:block" />
            <span className="relative inline-block">
              <span className="relative z-10 text-cartoon-yellow">prochain ticket</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 8C50 2 150 2 198 8" stroke="black" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-bold mb-8 sm:mb-10 max-w-2xl mx-auto px-2">
            Concerts, festivals, spectacles... Reservez vos places en quelques clics!
          </p>

          <HeroSearchBar onSearch={handleHeroSearch} />

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <span className="inline-flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-xs font-bold">
              <Music className="w-3 h-3 mr-1.5" /> Concerts
            </span>
            <span className="inline-flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-xs font-bold">
              <Star className="w-3 h-3 mr-1.5" /> Festivals
            </span>
            <span className="inline-flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-xs font-bold">
              <Ticket className="w-3 h-3 mr-1.5" /> Spectacles
            </span>
          </div>
        </div>
      </section>

      <main className="flex-grow">
        <UpcomingEvents onSelect={handleEventSelect} />

        <section className="py-10 sm:py-16 bg-white border-b-3 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <BentoGrid onSelect={handleEventSelect} />
          </div>
        </section>

        <section id="events-section" className="py-10 sm:py-16 bg-gradient-to-br from-slate-50 to-slate-100 border-b-3 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="bg-white border-3 border-black rounded-3xl p-4 sm:p-5 shadow-cartoon-lg">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                <div className="lg:col-span-2">
                  <SearchBar onSearch={setSearchQuery} value={searchQuery} placeholder="Rechercher un evenement, un lieu..." />
                </div>
                <div className="lg:col-span-2">
                  <CategoriesBar activeCategory={activeCategory} onSelectCategory={setActiveCategory} compact />
                </div>
              </div>
            </div>

            <EventsGrid selectedCategory={activeCategory} searchQuery={searchQuery} onEventSelect={handleEventSelect} />
          </div>
        </section>

        <section className="py-12 sm:py-20 bg-gradient-to-br from-cartoon-cream via-white to-cartoon-yellow/20 border-b-3 border-black overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-14">
              <div className="inline-flex items-center px-4 py-2 bg-cartoon-green border-2 border-black rounded-full text-black text-xs font-black uppercase tracking-wider mb-4 shadow-cartoon">
                <Shield className="w-4 h-4 mr-2" /> Securite & Confiance
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-slate-900 mb-4">
                Pourquoi choisir Tikezone?
              </h2>
              <p className="text-slate-600 font-bold text-lg max-w-2xl mx-auto">
                Une plateforme fiable et securisee pour tous vos evenements
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="group p-6 bg-white border-3 border-black rounded-3xl shadow-pop hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200">
                <div className="w-14 h-14 bg-cartoon-green border-2 border-black rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <Lock className="w-7 h-7 text-black" strokeWidth={2.5} />
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-2">100% Securise</h3>
                <p className="text-slate-600 text-sm font-medium">Paiements cryptes SSL et transactions protegees.</p>
              </div>

              <div className="group p-6 bg-white border-3 border-black rounded-3xl shadow-pop hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200">
                <div className="w-14 h-14 bg-cartoon-blue border-2 border-black rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                  <QrCode className="w-7 h-7 text-black" strokeWidth={2.5} />
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-2">Tickets Uniques</h3>
                <p className="text-slate-600 text-sm font-medium">QR codes authentifies impossible a falsifier.</p>
              </div>

              <div className="group p-6 bg-white border-3 border-black rounded-3xl shadow-pop hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200">
                <div className="w-14 h-14 bg-cartoon-orange border-2 border-black rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <Headphones className="w-7 h-7 text-black" strokeWidth={2.5} />
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-2">Support 24/7</h3>
                <p className="text-slate-600 text-sm font-medium">Equipe dediee disponible a tout moment.</p>
              </div>

              <div className="group p-6 bg-white border-3 border-black rounded-3xl shadow-pop hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200">
                <div className="w-14 h-14 bg-cartoon-pink border-2 border-black rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                  <Zap className="w-7 h-7 text-black" strokeWidth={2.5} />
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-2">Achat Rapide</h3>
                <p className="text-slate-600 text-sm font-medium">Reservation en moins de 2 minutes.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-3 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-cartoon-yellow border-2 border-black rounded-full text-black text-xs font-black uppercase tracking-wider mb-6 shadow-cartoon">
                  <Users className="w-4 h-4 mr-2" /> Pour les Organisateurs
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white mb-6 leading-tight">
                  Gerez vos evenements <span className="text-cartoon-yellow">facilement</span>
                </h2>
                <p className="text-slate-300 text-lg font-medium mb-8">
                  Creez, vendez et scannez vos tickets en toute simplicite. Tableau de bord complet pour suivre vos ventes en temps reel.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-cartoon-green border-2 border-black rounded-xl flex items-center justify-center shrink-0">
                      <Ticket className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-white font-bold">Creation d'evenement en 5 minutes</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-cartoon-blue border-2 border-black rounded-xl flex items-center justify-center shrink-0">
                      <QrCode className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-white font-bold">Scanner de tickets integre</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-cartoon-pink border-2 border-black rounded-xl flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-white font-bold">Paiements instantanes sur votre compte</span>
                  </div>
                </div>

                <a href="/publish" className="inline-flex items-center px-8 py-4 bg-cartoon-yellow text-black font-black text-lg rounded-2xl border-3 border-black shadow-pop hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 uppercase tracking-wide">
                  Creer mon evenement
                </a>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-brand-500 to-purple-600 rounded-3xl border-3 border-black p-6 sm:p-8 shadow-pop-xl">
                  <div className="bg-white rounded-2xl border-2 border-black p-4 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-cartoon-yellow rounded-xl border-2 border-black"></div>
                      <div>
                        <div className="h-3 w-24 bg-slate-200 rounded"></div>
                        <div className="h-2 w-16 bg-slate-100 rounded mt-1"></div>
                      </div>
                    </div>
                    <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                      <span className="text-slate-400 font-bold text-sm">Apercu Dashboard</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-cartoon-green/20 rounded-xl p-3 text-center border-2 border-black/20">
                      <div className="text-2xl font-black text-white">847</div>
                      <div className="text-xs font-bold text-white/70">Tickets</div>
                    </div>
                    <div className="bg-cartoon-blue/20 rounded-xl p-3 text-center border-2 border-black/20">
                      <div className="text-2xl font-black text-white">12M</div>
                      <div className="text-xs font-bold text-white/70">CFA</div>
                    </div>
                    <div className="bg-cartoon-pink/20 rounded-xl p-3 text-center border-2 border-black/20">
                      <div className="text-2xl font-black text-white">98%</div>
                      <div className="text-xs font-bold text-white/70">Satisf.</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-cartoon-yellow rounded-full border-2 border-black animate-bounce-slow"></div>
                <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-cartoon-pink rounded-full border-2 border-black animate-float"></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
