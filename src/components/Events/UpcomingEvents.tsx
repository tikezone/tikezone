'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, MapPin, ArrowRight, Star, Sparkles } from 'lucide-react';
import { Link } from '../../lib/safe-navigation';
import { CategoryId, Event } from '../../types';
import { fetchEvents } from '../../services/eventService';

type FeaturedEvent = Event & { image?: string; categoryId?: CategoryId };
type Props = {
  onSelect?: (event: Event) => void;
};

const UpcomingEvents: React.FC<Props> = ({ onSelect }) => {
  const [featured, setFeatured] = useState<FeaturedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchEvents(1, 'all', '', 'all', 'all', { featured: true, verified: true });
        if (!cancelled) {
          setFeatured(res.data.slice(0, 3));
        }
      } catch (e) {
        if (!cancelled) {
          setError('Impossible de charger les événements en vedette.');
          setFeatured([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEvents = useMemo(() => featured, [featured]);

  const getEventHref = (evt: FeaturedEvent) => {
    if (evt.slug) return `/events/${evt.slug}`;
    if (evt.id !== undefined && evt.id !== null) return `/events/${String(evt.id)}`;
    return null;
  };

  const cardColors = [
    'from-brand-100 to-pink-100',
    'from-yellow-100 to-orange-100',
    'from-cyan-100 to-blue-100',
  ];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-white via-yellow-50 to-orange-50 border-b-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border-3 border-black rounded-full shadow-[4px_4px_0_rgba(0,0,0,1)] mb-4">
                <Star size={18} className="text-yellow-500 fill-current" />
                <span className="text-sm font-black uppercase tracking-wide">Sélection du moment</span>
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 font-display">
                À ne pas manquer
              </h2>
            </div>
            <Link href="/explore" className="hidden sm:flex items-center gap-2 px-5 py-3 bg-white border-3 border-black rounded-xl font-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-[5px_5px_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
              Voir tout l'agenda <ArrowRight size={18} strokeWidth={3} />
            </Link>
          </div>
          {error && (
            <div className="bg-amber-100 border-3 border-black text-amber-800 font-bold text-sm rounded-xl px-4 py-3 shadow-[3px_3px_0_rgba(0,0,0,1)]">
              ⚠️ {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-gradient-to-br from-slate-100 to-slate-50 border-4 border-black rounded-3xl animate-pulse shadow-[5px_5px_0_rgba(0,0,0,0.1)]"></div>
            ))
          ) : filteredEvents.length === 0 ? (
            <div className="md:col-span-3 bg-white border-4 border-dashed border-slate-300 rounded-3xl p-10 text-center">
              <div className="text-5xl mb-4">🎭</div>
              <p className="font-black text-slate-700 text-xl">Aucun événement pour le moment</p>
              <p className="text-slate-500 font-bold text-sm mt-2">Revenez vite, de nouvelles pépites arrivent !</p>
            </div>
          ) : (
            filteredEvents.map((evt, index) => {
              const href = getEventHref(evt);
              const card = (
                <div className={`h-full bg-gradient-to-br ${cardColors[index % cardColors.length]} rounded-3xl border-4 border-black overflow-hidden shadow-[6px_6px_0_rgba(0,0,0,1)] hover:shadow-[8px_8px_0_rgba(0,0,0,1)] hover:-translate-y-2 transition-all duration-300 relative flex flex-col`}
                  style={{ transform: `rotate(${index % 2 === 0 ? 1 : -1}deg)` }}
                >
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-yellow-300 text-black text-xs font-black px-3 py-1.5 rounded-lg border-2 border-black uppercase shadow-[2px_2px_0_rgba(0,0,0,1)] inline-block">
                      {typeof evt.category === 'string' ? evt.category : 'Événement'}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 z-10">
                    <div className="w-10 h-10 bg-white border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0_rgba(0,0,0,1)]">
                      <Star size={18} className="text-yellow-500 fill-current" />
                    </div>
                  </div>

                  <div className="h-48 overflow-hidden border-b-4 border-black relative">
                    <img 
                      src={evt.imageUrl || (evt as any).image || (Array.isArray(evt.images) ? evt.images[0] : undefined) || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop'} 
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>

                  <div className="p-5 flex-1 flex flex-col bg-white">
                    <div className="mb-auto">
                      <div className="flex items-center gap-2 text-brand-600 font-black text-xs uppercase tracking-wide mb-2">
                        <Calendar size={14} strokeWidth={3} />
                        {new Date(evt.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <h3 className="text-xl font-black text-slate-900 font-display leading-tight mb-2 group-hover:text-brand-600 transition-colors">
                        {evt.title}
                      </h3>
                    </div>

                    <div className="mt-4 pt-4 border-t-3 border-dashed border-slate-200 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        <MapPin size={16} strokeWidth={3} className="text-brand-500" />
                        {evt.location}
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)]">
                        <ArrowRight size={18} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </div>
              );

              if (onSelect) {
                return (
                  <button key={evt.id ?? evt.title} type="button" onClick={() => onSelect(evt)} className="group block h-full text-left">
                    {card}
                  </button>
                );
              }

              return href ? (
                <Link key={evt.id ?? evt.title} href={href} className="group block h-full">
                  {card}
                </Link>
              ) : (
                <div key={evt.id ?? evt.title} className="group block h-full cursor-default">
                  {card}
                </div>
              );
            })
          )}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link href="/explore">
            <button className="w-full py-4 bg-white border-4 border-black rounded-2xl font-black shadow-[4px_4px_0_rgba(0,0,0,1)] uppercase text-sm active:translate-y-1 active:shadow-none transition-all hover:bg-yellow-100">
              Voir tout l'agenda
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
