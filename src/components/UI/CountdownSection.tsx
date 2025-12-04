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

  const eventHref = event.slug ? `/events/${event.slug}` : event.id ? `/events/${String(event.id)}` : '/explore';

  const TimeUnit = ({ value, label, color }: { value: number; label: string; color: string }) => (
    <div className="flex flex-col items-center">
      <div className={`w-16 h-16 sm:w-20 sm:h-20 ${color} border-2 border-black rounded-2xl flex items-center justify-center mb-2 shadow-pop transition-transform hover:-translate-y-1`}>
        <span className="text-3xl sm:text-4xl font-black text-slate-900 font-display">{value.toString().padStart(2, '0')}</span>
      </div>
      <span className="text-xs font-black text-slate-900 bg-white px-2 py-1 rounded border-2 border-black shadow-pop-sm uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <section className="relative w-full py-16 lg:py-24 overflow-hidden mt-8 mb-8 bg-blue-600 border-y-4 border-black">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full border-4 border-black"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-pink-400 rotate-12 border-4 border-black"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rotate-45 border-4 border-black"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <span className="inline-block py-2 px-4 rounded-xl bg-yellow-400 text-black border-2 border-black shadow-pop-sm text-sm font-black uppercase tracking-widest mb-6 transform -rotate-2">
              <Clock className="inline-block w-4 h-4 mr-2" />
              Evenement de l'annee
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-6 leading-tight drop-shadow-[4px_4px_0_rgba(0,0,0,1)] stroke-black">
              {event.title} <br />
              <span className="text-yellow-300 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">{event.location}</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-white mb-10">
              <div className="flex items-center bg-black/20 px-4 py-2 rounded-xl border-2 border-black/10 backdrop-blur-sm">
                <Calendar className="w-6 h-6 mr-2 text-yellow-400" strokeWidth={2.5} />
                <span className="font-bold text-lg">{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center bg-black/20 px-4 py-2 rounded-xl border-2 border-black/10 backdrop-blur-sm">
                <MapPin className="w-6 h-6 mr-2 text-yellow-400" strokeWidth={2.5} />
                <span className="font-bold text-lg">{event.location}</span>
              </div>
            </div>

            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(event)}
                className="inline-flex bg-white text-slate-900 font-black py-4 px-8 rounded-2xl border-2 border-black shadow-pop hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all items-center mx-auto lg:mx-0 text-lg group"
              >
                Voir le détail <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
              </button>
            ) : (
              <Link
                href={eventHref}
                className="inline-flex bg-white text-slate-900 font-black py-4 px-8 rounded-2xl border-2 border-black shadow-pop hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all items-center mx-auto lg:mx-0 text-lg group"
              >
                Reserver ma place <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
              </Link>
            )}
            {error && (
              <div className="mt-4 text-sm font-bold text-amber-200">
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="grid grid-cols-4 gap-3 sm:gap-5 p-6 bg-white/10 backdrop-blur-md rounded-3xl border-4 border-white/20 shadow-xl">
              <TimeUnit value={timeLeft.days} label="Jours" color="bg-pink-300" />
              <TimeUnit value={timeLeft.hours} label="Heures" color="bg-green-300" />
              <TimeUnit value={timeLeft.minutes} label="Min" color="bg-brand-300" />
              <TimeUnit value={timeLeft.seconds} label="Sec" color="bg-yellow-300" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CountdownSection;
