'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, ArrowRight, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Event } from '../../types';
import { fetchEvents } from '../../services/eventService';

type Props = {
  onSelect?: (event: Event) => void;
};

const CountdownSection: React.FC<Props> = ({ onSelect }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetchEvents(1, 'all', '', 'all', 'all', { eventOfYear: true, verified: true });
        if (!cancelled) {
          setEvent(res.data[0] ?? null);
        }
      } catch (e) {
        if (!cancelled) setError("Impossible de charger l'evenement en avant.");
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!event?.date) return;
    const target = new Date(event.date);
    if (Number.isNaN(target.getTime())) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [event]);

  if (!event) {
    return null;
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const eventHref = event.slug ? `/events/${event.slug}` : event.id ? `/events/${String(event.id)}` : '/';

  const TimeUnit = ({ value, label, gradient }: { value: number; label: string; gradient: string }) => (
    <div className="flex flex-col items-center group">
      <div className={`relative w-20 h-20 sm:w-24 sm:h-24 ${gradient} rounded-2xl flex items-center justify-center mb-3 shadow-2xl transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1`}>
        <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <span className="text-4xl sm:text-5xl font-black text-white font-display drop-shadow-lg">{value.toString().padStart(2, '0')}</span>
      </div>
      <span className="text-xs sm:text-sm font-bold text-white/60 uppercase tracking-widest">{label}</span>
    </div>
  );

  return (
    <section className="relative w-full py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-950 via-brand-950 to-purple-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/5 rounded-full blur-[200px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-sm font-bold uppercase tracking-wider mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              Evenement de l'annee
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-6 leading-tight">
              {event.title}
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                <Calendar className="w-5 h-5 text-brand-400" />
                <span className="font-bold text-white">{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                <MapPin className="w-5 h-5 text-brand-400" />
                <span className="font-bold text-white">{event.location}</span>
              </div>
            </div>

            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(event)}
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-black rounded-2xl transition-all duration-300 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105"
              >
                Reserver ma place
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <Link
                href={eventHref}
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-black rounded-2xl transition-all duration-300 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105"
              >
                Reserver ma place
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            
            {error && (
              <div className="mt-6 text-sm font-bold text-red-400">
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="relative p-8 sm:p-10 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 border border-white/20 rounded-full">
                  <Clock className="w-4 h-4 text-brand-400" />
                  <span className="text-white/80 text-sm font-bold">Compte a rebours</span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 sm:gap-6">
                <TimeUnit value={timeLeft.days} label="Jours" gradient="bg-gradient-to-br from-brand-500 to-brand-600" />
                <TimeUnit value={timeLeft.hours} label="Heures" gradient="bg-gradient-to-br from-purple-500 to-purple-600" />
                <TimeUnit value={timeLeft.minutes} label="Min" gradient="bg-gradient-to-br from-blue-500 to-cyan-500" />
                <TimeUnit value={timeLeft.seconds} label="Sec" gradient="bg-gradient-to-br from-yellow-500 to-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CountdownSection;
