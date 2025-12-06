'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
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
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-400 font-medium text-sm rounded-2xl px-4 py-3 mb-8">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl animate-pulse" />
            ))
          ) : filteredEvents.length === 0 ? (
            <div className="md:col-span-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
              <p className="font-bold text-white text-lg">Aucun evenement pour le moment</p>
              <p className="text-gray-400 text-sm mt-2">Revenez vite, de nouvelles pepites arrivent</p>
            </div>
          ) : (
            filteredEvents.map((evt) => {
              const href = getEventHref(evt);
              const card = (
                <div className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-glass hover:shadow-glass-lg hover:scale-[1.02] hover:bg-white/10 transition-all duration-300 ease-out relative flex flex-col group">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      {typeof evt.category === 'string' ? evt.category : ''}
                    </span>
                  </div>

                  <div className="h-48 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <img 
                      src={evt.imageUrl || (evt as any).image || (Array.isArray(evt.images) ? evt.images[0] : undefined) || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop'} 
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-auto">
                      <p className="text-orange-400 font-bold text-xs uppercase tracking-wide mb-2 flex items-center">
                        <Calendar size={12} className="mr-1.5" /> {new Date(evt.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                      <h3 className="text-xl font-bold text-white leading-tight mb-2 group-hover:text-orange-400 transition-colors">
                        {evt.title}
                      </h3>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-400">
                        <MapPin size={14} className="mr-1.5 text-gray-500" /> {evt.location}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-orange-500 transition-all duration-300">
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
      </div>
    </section>
  );
};

export default UpcomingEvents;