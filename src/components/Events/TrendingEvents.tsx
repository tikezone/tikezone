'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, ArrowRight, Flame } from 'lucide-react';
import { Link } from '../../lib/safe-navigation';
import { Event } from '../../types';
import { fetchEvents } from '../../services/eventService';

type Props = {
  onSelect?: (event: Event) => void;
};

const TrendingEvents: React.FC<Props> = ({ onSelect }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchEvents(1, 'all', '', 'all', 'all', { trending: true });
        if (!cancelled) {
          setEvents(res.data.slice(0, 6));
        }
      } catch (e) {
        if (!cancelled) {
          setError('Impossible de charger les evenements en tendance.');
          setEvents([]);
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

  const getEventHref = (evt: Event) => {
    if (evt.slug) return `/events/${evt.slug}`;
    if (evt.id !== undefined && evt.id !== null) return `/events/${String(evt.id)}`;
    return null;
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  const formatPrice = (price?: number) => {
    if (!price || price === 0) return 'GRATUIT';
    return new Intl.NumberFormat('fr-FR').format(price) + ' F';
  };

  if (!loading && events.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl">
              <Flame size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">En Tendance</h2>
              <p className="text-gray-400 text-sm">Les evenements les plus populaires du moment</p>
            </div>
          </div>
          <Link 
            href="/events" 
            className="hidden sm:flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors font-medium"
          >
            Voir tout <ArrowRight size={18} />
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-400 font-medium text-sm rounded-2xl px-4 py-3 mb-8">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl animate-pulse" />
            ))
          ) : (
            events.map((evt) => {
              const href = getEventHref(evt);
              const imageUrl = evt.imageUrl || (evt as any).image || (Array.isArray(evt.images) ? evt.images[0] : undefined) || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop';
              
              const card = (
                <div className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-glass hover:shadow-glass-lg hover:scale-[1.02] hover:bg-white/10 transition-all duration-300 ease-out relative flex flex-col group">
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                      <Flame size={12} /> Tendance
                    </span>
                  </div>

                  <div className="h-48 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <img 
                      src={imageUrl} 
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="mb-auto">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/10 backdrop-blur-xl text-white text-xs font-medium px-2 py-1 rounded-full">
                          {typeof evt.category === 'string' ? evt.category : ''}
                        </span>
                        <span className="text-orange-400 font-bold text-xs flex items-center">
                          <Calendar size={12} className="mr-1" /> {formatDate(evt.date)}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white leading-tight mb-2 group-hover:text-orange-400 transition-colors line-clamp-2">
                        {evt.title}
                      </h3>
                      <p className="text-gray-400 text-sm flex items-center">
                        <MapPin size={14} className="mr-1.5 text-gray-500" /> {evt.location}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                      <div className="text-orange-400 font-bold">
                        {formatPrice(evt.price)}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-red-500 group-hover:to-orange-500 transition-all duration-300">
                        <ArrowRight size={16} className="text-white" strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                </div>
              );

              if (onSelect) {
                return (
                  <button key={evt.id ?? evt.title} type="button" onClick={() => onSelect(evt)} className="group block h-full text-left active:scale-95 transition-transform duration-200">
                    {card}
                  </button>
                );
              }

              return href ? (
                <Link key={evt.id ?? evt.title} href={href} className="group block h-full active:scale-95 transition-transform duration-200">
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

        <div className="sm:hidden mt-6 text-center">
          <Link 
            href="/events" 
            className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors font-medium"
          >
            Voir tous les evenements <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingEvents;
