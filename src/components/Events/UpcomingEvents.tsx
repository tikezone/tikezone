'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, MapPin, ArrowRight, Star } from 'lucide-react';
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
          setError('Impossible de charger les evenements en vedette.');
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

  return (
    <section className="py-12 bg-white border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
            <div>
              <div className="inline-flex items-center px-3 py-1 bg-brand-100 border-2 border-brand-500 rounded-full text-brand-700 text-xs font-black uppercase tracking-wider mb-2 shadow-[2px_2px_0px_0px_rgba(225,29,72,1)]">
                <Star size={12} className="mr-1 fill-brand-700" />
                Selection du moment
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 font-display uppercase tracking-tight">
                A ne pas manquer
              </h2>
            </div>
            <Link href="/explore" className="hidden sm:flex items-center font-black text-slate-900 hover:text-brand-600 transition-colors group">
              Voir tout l'agenda <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
            </Link>
          </div>
          {error && (
            <div className="bg-amber-50 border-2 border-amber-300 text-amber-800 font-bold text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-100 border-2 border-slate-200 rounded-3xl animate-pulse"></div>
            ))
          ) : filteredEvents.length === 0 ? (
            <div className="md:col-span-3 bg-white border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center">
              <p className="font-black text-slate-700 text-lg">Aucun evenement pour le moment.</p>
              <p className="text-slate-500 font-medium text-sm mt-2">Revenez vite, de nouvelles pepites arrivent.</p>
            </div>
          ) : (
            filteredEvents.map((evt) => {
              const href = getEventHref(evt);
              const card = (
                <div className="h-full bg-slate-50 rounded-3xl border-4 border-black overflow-hidden shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all duration-300 relative flex flex-col">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded-lg border-2 border-black uppercase shadow-sm transform -rotate-2 group-hover:rotate-0 transition-transform inline-block">
                      {typeof evt.category === 'string' ? evt.category : ''}
                    </span>
                  </div>

                  <div className="h-48 overflow-hidden border-b-4 border-black relative">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                     <img 
                       src={evt.imageUrl || (evt as any).image || (Array.isArray(evt.images) ? evt.images[0] : undefined) || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop'} 
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col bg-white">
                    <div className="mb-auto">
                      <p className="text-brand-600 font-black text-xs uppercase tracking-wide mb-1 flex items-center">
                        <Calendar size={12} className="mr-1.5" /> {new Date(evt.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                      <h3 className="text-xl font-black text-slate-900 font-display uppercase leading-tight mb-2 group-hover:text-brand-600 transition-colors">
                        {evt.title}
                      </h3>
                    </div>

                    <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-200 flex justify-between items-center">
                      <div className="flex items-center text-xs font-bold text-slate-500">
                        <MapPin size={14} className="mr-1 text-black" /> {evt.location}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-brand-500 transition-colors border-2 border-black">
                        <ArrowRight size={14} strokeWidth={3} />
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

        <div className="mt-8 text-center sm:hidden">
          <Link href="/explore">
            <button className="w-full py-4 bg-white border-4 border-black rounded-2xl font-black shadow-pop-sm uppercase text-sm active:translate-y-1 active:shadow-none transition-all hover:bg-slate-50">
              Voir tout l'agenda
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
