'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, MapPin, ArrowRight, Sparkles } from 'lucide-react';
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
    <>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm rounded-2xl px-4 py-3 mb-8 backdrop-blur-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-[420px] bg-slate-800/50 border border-white/5 rounded-3xl animate-pulse"></div>
          ))
        ) : filteredEvents.length === 0 ? (
          <div className="md:col-span-3 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
            <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="font-bold text-white/70 text-lg">Aucun evenement pour le moment.</p>
            <p className="text-white/40 text-sm mt-2">Revenez vite, de nouvelles pepites arrivent.</p>
          </div>
        ) : (
          filteredEvents.map((evt, index) => {
            const href = getEventHref(evt);
            const card = (
              <div 
                className="group h-full bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden hover:border-brand-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-500/10 flex flex-col"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 opacity-60"></div>
                  <img 
                    src={evt.imageUrl || (evt as any).image || (Array.isArray(evt.images) ? evt.images[0] : undefined) || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop'} 
                    alt={evt.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="inline-flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-bold uppercase tracking-wider">
                      {typeof evt.category === 'string' ? evt.category : ''}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 z-20 w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-white/50 text-sm mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-brand-400" />
                      <span>{new Date(evt.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-brand-400" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black text-white font-display leading-tight mb-4 group-hover:text-brand-400 transition-colors line-clamp-2">
                    {evt.title}
                  </h3>

                  <div className="mt-auto pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      {evt.price !== undefined && evt.price !== null && (
                        <span className="text-white font-black text-lg">
                          {evt.price === 0 ? 'Gratuit' : `${evt.price.toLocaleString()} FCFA`}
                        </span>
                      )}
                      <span className="text-brand-400 font-bold text-sm group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Voir <ArrowRight className="w-4 h-4" />
                      </span>
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
    </>
  );
};

export default UpcomingEvents;
