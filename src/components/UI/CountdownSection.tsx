'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, ArrowRight, Clock } from 'lucide-react';
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

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl flex items-center justify-center mb-2 hover:scale-105 transition-transform duration-300">
        <span className="text-3xl sm:text-4xl font-black text-white">{value.toString().padStart(2, '0')}</span>
      </div>
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <section className="relative w-full py-16 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-purple-600/10 to-blue-600/20 pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 lg:p-12 shadow-glass-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center py-2 px-4 rounded-full bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 text-orange-400 text-sm font-bold mb-6">
                <Clock className="w-4 h-4 mr-2" />
                Evenement de l'annee
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                {event.title}
              </h2>
              <p className="text-xl md:text-2xl bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent font-bold mb-8">
                {event.location}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <div className="flex items-center bg-white/5 backdrop-blur-xl px-4 py-2.5 rounded-full border border-white/10">
                  <Calendar className="w-5 h-5 mr-2 text-orange-400" strokeWidth={2} />
                  <span className="font-medium text-white">{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center bg-white/5 backdrop-blur-xl px-4 py-2.5 rounded-full border border-white/10">
                  <MapPin className="w-5 h-5 mr-2 text-orange-400" strokeWidth={2} />
                  <span className="font-medium text-white">{event.location}</span>
                </div>
              </div>

              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(event)}
                  className="inline-flex bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-8 rounded-full hover:scale-105 active:scale-95 transition-all duration-300 items-center shadow-glow text-lg group"
                >
                  Voir le detail <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                </button>
              ) : (
                <Link
                  href={eventHref}
                  className="inline-flex bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-8 rounded-full hover:scale-105 active:scale-95 transition-all duration-300 items-center shadow-glow text-lg group"
                >
                  Reserver ma place <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                </Link>
              )}
              {error && (
                <div className="mt-4 text-sm font-medium text-red-400">
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="grid grid-cols-4 gap-3 sm:gap-5 p-6 sm:p-8 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-glass">
                <TimeUnit value={timeLeft.days} label="Jours" />
                <TimeUnit value={timeLeft.hours} label="Heures" />
                <TimeUnit value={timeLeft.minutes} label="Min" />
                <TimeUnit value={timeLeft.seconds} label="Sec" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CountdownSection;