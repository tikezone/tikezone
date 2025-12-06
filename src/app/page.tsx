'use client';

import { useState, useEffect } from 'react';
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
import { Sparkles, Shield, Headphones, Ticket, ArrowDown, Search } from 'lucide-react';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
        <Header />
        <EventDetail event={selectedEvent} onBack={handleBack} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans overflow-x-hidden">
      <Header />

      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/60 to-slate-950 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600/20 via-transparent to-purple-600/20 z-10"></div>
          
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

        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/30 rounded-full blur-[100px] animate-pulse_glow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse_glow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[150px] animate-pulse_glow" style={{ animationDelay: '2s' }}></div>

        <div className={`relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/90 text-sm font-bold mb-8 animate-bounce_subtle">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            La billetterie #1 en Afrique
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black text-white mb-6 tracking-tight leading-[1.1]">
            Vivez des moments
            <span className="block bg-gradient-to-r from-brand-400 via-yellow-400 to-brand-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient_shift">
              inoubliables
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-white/70 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
            Concerts, festivals, spectacles... Reservez vos places pour les meilleurs evenements pres de chez vous.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button 
              onClick={() => document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-black rounded-2xl transition-all duration-300 shadow-glow hover:shadow-glow-lg hover:scale-105 flex items-center gap-3"
            >
              <Search className="w-5 h-5" />
              Decouvrir les evenements
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl"></div>
            </button>
            <button 
              onClick={() => document.getElementById('countdown-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105"
            >
              Evenement de l'annee
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-4xl font-black text-white mb-1">500+</div>
              <div className="text-xs sm:text-sm text-white/50 font-medium">Evenements</div>
            </div>
            <div className="text-center border-x border-white/10">
              <div className="text-2xl sm:text-4xl font-black text-white mb-1">50K+</div>
              <div className="text-xs sm:text-sm text-white/50 font-medium">Utilisateurs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-4xl font-black text-white mb-1">99%</div>
              <div className="text-xs sm:text-sm text-white/50 font-medium">Satisfaction</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce_subtle">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
               onClick={() => document.getElementById('featured-section')?.scrollIntoView({ behavior: 'smooth' })}>
            <ArrowDown className="w-5 h-5 text-white/70" />
          </div>
        </div>
      </section>

      <main className="flex-grow relative z-10">
        <section id="featured-section" className="relative py-16 sm:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.05),transparent_70%)]"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-brand-500/10 border border-brand-500/30 rounded-full text-brand-400 text-xs font-bold uppercase tracking-wider mb-4">
                Selection premium
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white mb-4">
                A ne pas manquer
              </h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto">
                Les evenements les plus attendus du moment
              </p>
            </div>
            <UpcomingEvents onSelect={handleEventSelect} />
          </div>
        </section>

        <section className="relative py-16 sm:py-24 bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-brand-500/5"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-bold uppercase tracking-wider mb-4">
                A la une
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white mb-4">
                Temps forts
              </h2>
            </div>
            <BentoGrid onSelect={handleEventSelect} />
          </div>
        </section>

        <div id="countdown-section">
          <CountdownSection onSelect={handleEventSelect} />
        </div>

        <section id="events-section" className="relative py-16 sm:py-24 bg-gradient-to-b from-slate-950 to-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.05),transparent_60%)]"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">
                Catalogue complet
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white mb-4">
                Tous les evenements
              </h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
                Trouvez l'experience parfaite pour vous
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6 mb-10 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                <div className="lg:col-span-2">
                  <SearchBar onSearch={setSearchQuery} value={searchQuery} placeholder="Rechercher un evenement, un artiste, un lieu..." />
                </div>
                <div className="lg:col-span-1">
                  <CategoriesBar activeCategory={activeCategory} onSelectCategory={setActiveCategory} compact />
                </div>
              </div>
            </div>

            <EventsGrid selectedCategory={activeCategory} searchQuery={searchQuery} onEventSelect={handleEventSelect} />
          </div>
        </section>

        <section className="relative py-20 sm:py-28 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px]"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white mb-4">
                Pourquoi Tikezone ?
              </h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto">
                Une experience de billetterie unique en Afrique
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="group relative p-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl hover:border-green-500/30 transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-black text-white mb-2 font-display">100%</div>
                  <h3 className="font-black text-white text-xl mb-3">Securise</h3>
                  <p className="text-white/50 leading-relaxed">Paiements cryptes et tickets authentifies par QR code unique.</p>
                </div>
              </div>

              <div className="group relative p-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Headphones className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-black text-white mb-2 font-display">24/7</div>
                  <h3 className="font-black text-white text-xl mb-3">Support Client</h3>
                  <p className="text-white/50 leading-relaxed">Une equipe dediee disponible a tout moment pour vous accompagner.</p>
                </div>
              </div>

              <div className="group relative p-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl hover:border-yellow-500/30 transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Ticket className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-black text-white mb-2 font-display">+500</div>
                  <h3 className="font-black text-white text-xl mb-3">Evenements</h3>
                  <p className="text-white/50 leading-relaxed">Le plus large catalogue d'evenements en Afrique de l'Ouest.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-20 sm:py-28 bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white mb-6">
              Pret a vivre des moments exceptionnels ?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Rejoignez des milliers d'utilisateurs qui font confiance a Tikezone pour leurs sorties.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-8 py-4 bg-white text-brand-600 font-black rounded-2xl hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-xl"
              >
                Commencer maintenant
              </button>
              <button 
                onClick={() => document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-300"
              >
                Explorer le catalogue
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
